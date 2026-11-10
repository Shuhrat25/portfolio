"use client";

import { useSyncExternalStore } from "react";
import type { L, Lang } from "@/content/profile";
import { ui } from "@/content/ui";
import { store } from "./store";
import { voice } from "./voice";
import { ask, stopSpeaking } from "./yui";

// Voice questions. The Web Speech API recognises in the browser and shows words as they come.
// Where it is missing or cannot reach its service (Firefox, Brave, Uzbek in Safari), a short
// recording is transcribed by Gemini through /api/transcribe instead.

export type ListenHandlers = {
  /** Words heard so far, shown in the chat input. */
  onInterim?: (text: string) => void;
  /** The session is over; `sent` tells whether a question went to Yui. */
  onEnd?: (sent: boolean) => void;
};

const LOCALES: Record<Lang, string> = { en: "en-US", ru: "ru-RU", uz: "uz-UZ" };
const RECORD_TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm"];
const MAX_RECORD_MS = 12_000;
const SILENCE_MS = 1_500;
const NO_SPEECH_MS = 6_000;
const SPEECH_RMS = 0.015;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

// TypeScript's DOM lib no longer ships SpeechRecognition itself, so only what is used is typed.
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onaudiostart: (() => void) | null;
  onspeechstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function canRecord(): boolean {
  return typeof MediaRecorder !== "undefined" && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

/** Whether this browser can take a spoken question at all. */
export function canListen(): boolean {
  return recognitionCtor() !== null || canRecord();
}

const never = () => () => {};

/** canListen() for components: false while server rendering, so hydration matches. */
export function useCanListen(): boolean {
  return useSyncExternalStore(never, canListen, () => false);
}

// The Dock lends its mic toggle while it is on screen, so a click on the core presses that very
// button: the same handlers, the same words in the input. Without a Dock the core does nothing.
let dockMic: (() => void) | null = null;

/** Dock: lend the mic toggle to the core; the returned function takes it back. */
export function lendMic(toggle: () => void) {
  dockMic = toggle;
  return () => {
    if (dockMic === toggle) dockMic = null;
  };
}

/** Whether a click on the core would ask by voice right now. */
export const coreMicReady = () => dockMic !== null;

/** A click on the core: the Dock's mic button, pressed (start, or stop and send). */
export function pressMicFromCore() {
  dockMic?.();
}

type Session = { stop(): void; cancel(): void };

// Every start bumps the id; callbacks of an older session notice and do nothing.
let session = 0;
let current: Session | null = null;
// Handlers of the session whose microphone is on, so cancelListening() can hand the input back.
let live: ListenHandlers | null = null;
// After a network error (any language) or a language error (that one) recognition is skipped
// for the rest of the visit and the question is recorded right away.
let speechOffline = false;
const speechUnsupported = new Set<Lang>();

/** Call from a click: the browser asks for the microphone, and Yui stops talking. */
export function startListening(lang: Lang, handlers: ListenHandlers = {}) {
  current?.cancel();
  const id = ++session;
  live = handlers;
  stopSpeaking();
  store.set({ listening: true });
  const Ctor = recognitionCtor();
  if (Ctor && !speechOffline && !speechUnsupported.has(lang)) recognize(id, Ctor, lang, handlers);
  else record(id, lang, handlers);
}

/** Second click: stop listening and send what was heard so far. */
export function stopListening() {
  current?.stop();
}

/** Ends the session without sending anything: the Dock is gone, or a section took the screen. */
export function cancelListening() {
  const handlers = live;
  current?.cancel();
  current = null;
  live = null;
  session++; // before the store update, so a transcript still on its way sees it and aborts
  store.set({ listening: false });
  handlers?.onEnd?.(false);
}

/** The microphone is off (a recorded question may still be on its way to the server). */
function micOff(id: number) {
  if (id !== session) return;
  current = null;
  live = null;
  store.set({ listening: false });
}

/** A short line from Yui, typed like her other text-only lines. Skipped if she is already talking. */
function notice(message: L) {
  const { busy, lang } = store.get();
  if (busy === "speaking" || busy === "narrating") return;
  const text = message[lang];
  store.set({ subtitle: text, subtitleMode: "type", subtitleStartedAt: performance.now(), question: "", busy: "idle" });
  voice.pulse(Math.min(6000, 600 + text.length * 38));
}

function recognize(id: number, Ctor: RecognitionCtor, lang: Lang, handlers: ListenHandlers) {
  const rec = new Ctor();
  rec.lang = LOCALES[lang];
  rec.continuous = false; // ends by itself after a pause
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  let heard = "";
  let error = "";
  let byUser = false;
  let cancelled = false;
  const meter = new SideMeter();

  // Recognition has the microphone now, so the meter's own capture needs no second prompt.
  rec.onaudiostart = () => {
    if (!cancelled && id === session) void meter.open();
  };
  // Without a level to read (touch devices) the words themselves swell the core a little.
  rec.onspeechstart = () => {
    if (id === session && !meter.live) voice.pulse(900);
  };
  rec.onresult = (event) => {
    heard = Array.from(event.results, (r) => r[0]?.transcript ?? "")
      .join("")
      .trim();
    if (id !== session) return;
    handlers.onInterim?.(heard);
    if (!meter.live) voice.pulse(700);
  };
  rec.onerror = (event) => {
    error = event.error;
  };
  rec.onend = () => {
    meter.close();
    if (cancelled || id !== session) return;
    if (!heard && (error === "network" || error === "language-not-supported" || error === "service-not-allowed")) {
      if (error === "language-not-supported") speechUnsupported.add(lang);
      else speechOffline = true;
      record(id, lang, handlers);
      return;
    }
    micOff(id);
    handlers.onEnd?.(Boolean(heard));
    if (heard) void ask(heard);
    else if (error === "not-allowed") notice(ui.mic.denied);
    else if (!byUser) notice(ui.mic.failed);
  };

  current = {
    stop: () => {
      byUser = true;
      rec.stop();
    },
    cancel: () => {
      cancelled = true;
      meter.close();
      rec.abort();
    },
  };
  try {
    rec.start();
  } catch {
    meter.close();
    speechOffline = true;
    record(id, lang, handlers);
  }
}

function newAudioContext(): AudioContext {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new Ctx();
}

/** An analyser on `source` that the core reads as the visitor's voice (voice.hear); a quiet room reads as silence. */
function lendLevel(ctx: AudioContext, source: AudioNode): AnalyserNode {
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.5;
  analyser.minDecibels = -85;
  source.connect(analyser); // not to the speakers
  voice.hear(analyser);
  return analyser;
}

// Touch devices never open a second capture: beside recognition it can break it (Android).
// Nor does the CSS core (quality "none"): only the 3D one reads the level.
const sideMeterAllowed = () => store.get().quality !== "none" && window.matchMedia("(pointer: fine)").matches && !/Android/i.test(navigator.userAgent);

/**
 * Web Speech shares no stream, so on desktop a second capture, read only by the core's level
 * meter, runs beside it. Its tracks are always stopped when the session ends, however it ends.
 */
class SideMeter {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private level: AnalyserNode | null = null;
  private opened = false;
  private closed = false;

  get live() {
    return this.level !== null;
  }

  async open() {
    if (this.opened || this.closed || !sideMeterAllowed()) return;
    this.opened = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // The session ended while the capture was starting.
      if (this.closed) return stream.getTracks().forEach((t) => t.stop());
      this.stream = stream;
      this.ctx = newAudioContext();
      this.level = lendLevel(this.ctx, this.ctx.createMediaStreamSource(stream));
      if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
    } catch {
      this.close(); // no meter: recognition events pulse the core instead
    }
  }

  close() {
    this.closed = true;
    if (this.level) voice.unhear(this.level);
    this.level = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}

function record(id: number, lang: Lang, handlers: ListenHandlers) {
  if (!canRecord()) {
    micOff(id);
    handlers.onEnd?.(false);
    notice(ui.mic.failed);
    return;
  }
  const recording = new Recording(id, lang, handlers);
  current = recording;
  void recording.start();
}

/**
 * Fallback recording: microphone → MediaRecorder, ended by a pause after speech, a second click
 * or the 12 s cap, then transcribed on the server. An AnalyserNode watches the input level, and
 * a second one lends it to the core.
 */
class Recording implements Session {
  private readonly id: number;
  private readonly lang: Lang;
  private readonly handlers: ListenHandlers;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private ctx: AudioContext | null = null;
  private level: AnalyserNode | null = null;
  private chunks: Blob[] = [];
  private meter = 0;
  private cap = 0;
  private metering = 0; // when the level meter started reading real input
  private heard = false;
  private quietSince = 0;
  private ending = false;
  private byUser = false;
  private cancelled = false;

  constructor(id: number, lang: Lang, handlers: ListenHandlers) {
    this.id = id;
    this.lang = lang;
    this.handlers = handlers;
  }

  async start() {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (error) {
      // Already ended (stopped while the prompt was open, or replaced): that was handled then.
      if (this.ending || this.id !== session) return;
      micOff(this.id);
      this.handlers.onEnd?.(false);
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      notice(denied ? ui.mic.denied : ui.mic.failed);
      return;
    }
    this.stream = stream;
    // Stopped while the permission prompt was open: end() already dropped it, only the mic is left.
    if (this.ending || this.id !== session) return this.release();

    try {
      const mimeType = RECORD_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 32_000 });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.chunks.push(event.data);
      };
      recorder.onstop = () => void this.upload();
      recorder.start(1000);
      this.recorder = recorder;
    } catch {
      return this.drop(ui.mic.failed);
    }
    this.watch(stream);
    this.cap = window.setTimeout(() => this.end(), MAX_RECORD_MS);
  }

  stop() {
    this.byUser = true;
    this.end();
  }

  cancel() {
    this.cancelled = true;
    this.end();
  }

  private end() {
    if (this.ending) return;
    this.ending = true;
    clearInterval(this.meter);
    clearTimeout(this.cap);
    if (this.recorder && this.recorder.state !== "inactive") this.recorder.stop(); // → upload()
    else this.drop(); // also while the permission prompt is still open: the input is freed now
  }

  /** Ends after ~1.5 s of quiet once speech was heard, or when nothing is said at all. */
  private watch(stream: MediaStream) {
    try {
      const ctx = newAudioContext();
      this.ctx = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser); // not to the speakers
      this.level = lendLevel(ctx, source);
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});
      const samples = new Float32Array(analyser.fftSize);
      this.meter = window.setInterval(() => this.sample(analyser, samples), 100);
    } catch {
      // No level meter: the second click or the time cap ends the recording.
    }
  }

  private sample(analyser: AnalyserNode, samples: Float32Array<ArrayBuffer>) {
    if (this.ctx?.state !== "running") return; // a suspended context reads as silence
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
    const now = performance.now();
    if (!this.metering) this.metering = now;
    if (Math.sqrt(sum / samples.length) > SPEECH_RMS) {
      this.heard = true;
      this.quietSince = now;
    }
    if (this.heard ? now - this.quietSince > SILENCE_MS : now - this.metering > NO_SPEECH_MS) this.end();
  }

  private release() {
    clearInterval(this.meter);
    clearTimeout(this.cap);
    if (this.level) voice.unhear(this.level);
    this.level = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
  }

  /** Ends without sending anything. */
  private drop(message?: L) {
    this.release();
    if (this.cancelled || this.id !== session) return;
    micOff(this.id);
    this.handlers.onEnd?.(false);
    if (message) notice(message);
  }

  private async upload() {
    const blob = new Blob(this.chunks, { type: this.recorder?.mimeType || "audio/webm" });
    this.chunks = [];
    const silent = this.metering > 0 && !this.heard;
    if (this.cancelled || this.id !== session) return this.release();
    // Too short, or only noise and nobody clicked: no request is spent on it.
    if (blob.size < 1000 || (silent && !this.byUser)) return this.drop(this.byUser ? undefined : ui.mic.failed);
    this.release();
    micOff(this.id);

    // Yui stops first: a line of hers ending during the wait would set busy back to idle.
    stopSpeaking();
    store.set({ busy: "thinking", subtitle: "", question: "" });
    const controller = new AbortController();
    // The Stop button, a menu click or a new recording while the transcript is on its way.
    const unsubscribe = store.subscribe(() => {
      if (store.get().busy !== "thinking" || this.id !== session) controller.abort();
    });
    let text = "";
    let status = 0;
    try {
      const body = (await toWav(blob)) ?? blob;
      if (body.size <= MAX_UPLOAD_BYTES) {
        const res = await fetch(`/api/transcribe?lang=${this.lang}`, {
          method: "POST",
          headers: { "content-type": body.type },
          body,
          signal: controller.signal,
        });
        status = res.status;
        const data: { text?: unknown } = res.ok ? await res.json() : {};
        if (typeof data.text === "string") text = data.text.trim();
      }
    } catch {
      // offline, aborted or an unreadable reply
    }
    unsubscribe();
    if (this.id !== session) return;
    if (controller.signal.aborted) return this.handlers.onEnd?.(false);
    this.handlers.onEnd?.(Boolean(text));
    if (text) void ask(text);
    else notice(status === 429 ? ui.rateLimited : ui.mic.failed);
  }
}

/** Re-encodes a recording as 16 kHz mono WAV, a format Gemini documents; null if undecodable. */
async function toWav(blob: Blob): Promise<Blob | null> {
  try {
    // decodeAudioData resamples to the context's rate.
    const audio = await new OfflineAudioContext(1, 1, 16_000).decodeAudioData(await blob.arrayBuffer());
    const pcm = audio.getChannelData(0);
    const view = new DataView(new ArrayBuffer(44 + pcm.length * 2));
    const ascii = (at: number, s: string) => [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
    ascii(0, "RIFF");
    view.setUint32(4, 36 + pcm.length * 2, true);
    ascii(8, "WAVE");
    ascii(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, audio.sampleRate, true);
    view.setUint32(28, audio.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    ascii(36, "data");
    view.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) {
      const s = Math.max(-1, Math.min(1, pcm[i]));
      view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([view.buffer], { type: "audio/wav" });
  } catch {
    return null;
  }
}
