"use client";

import type { Lang } from "@/content/profile";
import { store } from "./store";

export type VoiceLevel = { bass: number; treble: number; energy: number };

const VOICE_CACHE = "yui-voice-v1";

async function openVoiceCache(): Promise<Cache | null> {
  try {
    return "caches" in window ? await caches.open(VOICE_CACHE) : null;
  } catch {
    return null; // private mode or blocked storage
  }
}

const words = (text: string) => text.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1);

/**
 * True when the text addresses the visitor by name, also inflected ("Дилноза" → "Дилнозе",
 * "Dilnozaga"): such clips stay out of the server's shared cache.
 */
export function namesVisitor(text: string, name = store.get().name): boolean {
  const stems = words(name).map((w) => (w.length > 3 ? w.slice(0, -1) : w));
  if (stems.length === 0) return false;
  const said = words(text);
  return stems.some((stem) => said.some((w) => (stem.length > 2 ? w.startsWith(stem) : w === stem)));
}

async function digest(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Plays Yui's speech through an AnalyserNode so the core can react to it, like the
 * 3d-audio reference: bass inflates the sphere, treble roughens its surface.
 * The analyser sits before the master gain, so the sphere still moves when sound is muted.
 */
class VoiceEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gain: GainNode | null = null;
  private bins: Uint8Array<ArrayBuffer> = new Uint8Array(256);
  private source: AudioBufferSourceNode | null = null;
  private startedAt = 0;
  private duration = 0;
  private pulseUntil = 0;
  /** The visitor's microphone while they ask by voice (lent by listen.ts); only measured, never played. */
  private input: AnalyserNode | null = null;
  private inputBins: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  /** This frame's readings before the envelope, reused so sampling allocates nothing. */
  private readonly raw: VoiceLevel = { bass: 0, treble: 0, energy: 0 };
  readonly level: VoiceLevel = { bass: 0, treble: 0, energy: 0 };

  /**
   * Must be called from a user gesture (click) so the browser allows audio. Never throws: a
   * browser without Web Audio still gets the visit, only silent (subtitles keep working).
   */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      try {
        this.ctx = new Ctx();
      } catch {
        return;
      }
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.55;
      this.gain = this.ctx.createGain();
      this.analyser.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      this.bins = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean) {
    if (this.gain && this.ctx) this.gain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
  }

  async fromResponse(res: Response): Promise<AudioBuffer | null> {
    if (!res.ok || !this.ctx) return null;
    try {
      return await this.ctx.decodeAudioData(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  /** Live TTS, remembered in the browser's Cache Storage so a phrase is fetched once per visitor. */
  async tts(text: string, lang: Lang, signal?: AbortSignal): Promise<AudioBuffer | null> {
    if (!text.trim()) return null;
    try {
      const store = await openVoiceCache();
      const id = store ? new Request(`/__yui/tts/${await digest(`${lang}\u0000${text}`)}`) : null;
      const saved = store && id ? await store.match(id) : undefined;
      if (saved) return await this.fromResponse(saved);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, lang, personal: namesVisitor(text) }),
        signal,
      });
      if (res.ok && store && id) {
        await store.put(id, new Response(await res.clone().arrayBuffer(), { headers: { "content-type": "audio/wav" } })).catch(() => {});
      }
      return await this.fromResponse(res);
    } catch {
      return null;
    }
  }

  async file(url: string, signal?: AbortSignal): Promise<AudioBuffer | null> {
    try {
      return await this.fromResponse(await fetch(url, { signal }));
    } catch {
      return null;
    }
  }

  /** Resolves when playback ends or is stopped. */
  play(buffer: AudioBuffer): Promise<void> {
    this.stop();
    if (!this.ctx || !this.analyser) return Promise.resolve();
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.analyser);
    this.source = src;
    this.startedAt = this.ctx.currentTime;
    this.duration = buffer.duration;
    return new Promise((resolve) => {
      src.onended = () => {
        if (this.source === src) this.source = null;
        resolve();
      };
      src.start();
    });
  }

  stop() {
    if (this.source) {
      const src = this.source;
      this.source = null;
      try {
        src.stop();
      } catch {}
    }
  }

  get playing() {
    return this.source !== null;
  }

  /** 0..1 progress of the current clip, used to reveal subtitles in sync. */
  progress(): number {
    if (!this.ctx || !this.source || this.duration === 0) return 1;
    return Math.min(1, (this.ctx.currentTime - this.startedAt) / this.duration);
  }

  /** Fake speech energy for text-only moments (typing, no audio). */
  pulse(ms: number) {
    this.pulseUntil = Math.max(this.pulseUntil, performance.now() + ms);
  }

  /** While the visitor speaks, the core moves with their voice the way it moves with Yui's. */
  hear(analyser: AnalyserNode) {
    this.input = analyser;
    if (this.inputBins.length !== analyser.frequencyBinCount) this.inputBins = new Uint8Array(analyser.frequencyBinCount);
  }

  /** That microphone is closing. A newer one lent in the meantime stays. */
  unhear(analyser: AnalyserNode) {
    if (this.input === analyser) this.input = null;
  }

  /** Folds one spectrum into `raw`: bass is the loudest bin of the lower half, treble the upper half's mean. */
  private measure(analyser: AnalyserNode, bins: Uint8Array<ArrayBuffer>) {
    analyser.getByteFrequencyData(bins);
    const n = bins.length;
    const half = n >> 1;
    let bass = 0;
    let treble = 0;
    let energy = 0;
    for (let i = 0; i < n; i++) {
      const v = bins[i] / 255;
      energy += v;
      if (i < half) bass = Math.max(bass, v);
      else treble += v;
    }
    const raw = this.raw;
    raw.bass = Math.max(raw.bass, bass);
    raw.treble = Math.max(raw.treble, Math.min(1, (treble / (n - half)) * 4));
    raw.energy = Math.max(raw.energy, energy / n);
  }

  /** Called once per frame by the 3D scene. */
  sample(): VoiceLevel {
    const raw = this.raw;
    raw.bass = raw.treble = raw.energy = 0;
    if (this.analyser && this.source) this.measure(this.analyser, this.bins);
    if (this.input) this.measure(this.input, this.inputBins);
    let { bass, treble, energy } = raw;
    // Text-only speech: a slow, soft swell instead of fast flashing.
    const now = performance.now();
    if (now < this.pulseUntil) {
      const swell = 0.5 + 0.5 * Math.sin(now / 420);
      bass = Math.max(bass, 0.12 + swell * 0.16);
      treble = Math.max(treble, 0.15 + swell * 0.2);
      energy = Math.max(energy, 0.06 + swell * 0.06);
    }
    // Envelope: rise reasonably fast, fall slowly, so syllables don't strobe.
    const follow = (current: number, target: number) => current + (target - current) * (target > current ? 0.16 : 0.05);
    this.level.bass = follow(this.level.bass, bass);
    this.level.treble = follow(this.level.treble, treble);
    this.level.energy = follow(this.level.energy, energy);
    return this.level;
  }
}

export const voice = new VoiceEngine();
