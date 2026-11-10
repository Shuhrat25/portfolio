"use client";

import { narration, sectionLines } from "@/content/narration";
import { cardinal, type Lang, type Project, type ProjectKind } from "@/content/profile";
import { greeting, PANELS, ui, type PanelId } from "@/content/ui";
import { sfx } from "./sfx";
import { forgetVisitor, saveVisitor, store } from "./store";
import { voice } from "./voice";

// Every new action bumps the run id; older async loops notice and quit.
let run = 0;
let chatAbort: AbortController | null = null;

function newRun() {
  run += 1;
  chatAbort?.abort();
  chatAbort = null;
  voice.stop();
  if (store.get().telling) store.set({ telling: null });
  return run;
}

const alive = (id: number) => id === run;

function show(text: string, mode: "audio" | "type" | "stream") {
  store.set({ subtitle: text, subtitleMode: mode, subtitleStartedAt: performance.now() });
}

/** Speak one clip with subtitles. Without audio the text is typed and the core pulses. */
async function say(id: number, text: string, audio: Promise<AudioBuffer | null> | AudioBuffer | null) {
  const buffer = await audio;
  if (!alive(id)) return;
  if (buffer) {
    show(text, "audio");
    await voice.play(buffer);
  } else {
    show(text, "type");
    const ms = Math.min(9000, 600 + text.length * 38);
    voice.pulse(ms);
    await new Promise((r) => setTimeout(r, ms + 400));
  }
}

const voiceFile = (name: string) => `/voice/${store.get().lang}/${name}.mp3`;

/** Pre-generated clip, or live TTS when the file is missing. */
async function scripted(name: string, text: string, signal?: AbortSignal) {
  return (await voice.file(voiceFile(name), signal)) ?? (await voice.tts(text, store.get().lang, signal));
}

const BOOT_MIN_MS = 3400;
const BOOT_MAX_MS = 11000;

/**
 * Called from the click that finishes onboarding (so audio is allowed). The greeting is
 * synthesised while the particles assemble; we go live when both are done, or after a timeout.
 */
export function beginSession() {
  voice.unlock();
  saveVisitor();
  const audio = prepareGreeting();
  store.set({ phase: "boot", menuVisible: false, panel: null, subtitle: "", question: "" });
  const started = performance.now();
  const sceneUp = new Promise<void>((resolve) => {
    const check = () => (store.get().sceneReady && performance.now() - started > BOOT_MIN_MS ? resolve() : setTimeout(check, 100));
    check();
  });
  const voiceUp = audio.then(
    () => undefined,
    () => undefined,
  );
  void Promise.race([Promise.all([sceneUp, voiceUp]), new Promise((r) => setTimeout(r, BOOT_MAX_MS))]).then(() => {
    store.set({ phase: "live" });
    void deliverGreeting(audio);
  });
}

export function restartIntro() {
  newRun();
  forgetVisitor();
  store.set({ phase: "language", returning: false, name: "", honorific: "name", panel: null, menuVisible: false, subtitle: "", question: "", busy: "idle", history: [] });
}

export function switchLanguage(lang: Lang) {
  newRun();
  store.set({ lang, busy: "idle", subtitle: "", question: "" });
  saveVisitor();
}

/** Starts fetching the greeting while the boot animation plays. */
function prepareGreeting(): Promise<AudioBuffer | null> {
  const { lang, name, honorific, returning } = store.get();
  const text = greeting(lang, name, honorific, returning);
  if (!name.trim() && !returning) return scripted("greeting", text);
  return voice.tts(text, lang);
}

export async function deliverGreeting(audio: Promise<AudioBuffer | null>) {
  const id = newRun();
  const { lang, name, honorific, returning } = store.get();
  store.set({ busy: "speaking", question: "" });
  setTimeout(() => store.set({ menuVisible: true }), 1400);
  await say(id, greeting(lang, name, honorific, returning), audio);
  if (alive(id)) store.set({ busy: "idle", menuVisible: true });
}

export function openPanel(panel: PanelId | null, filter?: ProjectKind | "all") {
  store.set((s) => ({ panel, projectFilter: filter ?? (panel === s.panel ? s.projectFilter : "all") }));
}

/** Menu click: open the section and say its line. */
export async function visitSection(panel: PanelId) {
  const id = newRun();
  openPanel(panel);
  const text = sectionLines[panel][store.get().lang];
  store.set({ busy: "speaking", question: "" });
  await say(id, text, scripted(`section-${panel}`, text));
  if (alive(id)) store.set({ busy: "idle" });
}

/** "Tell me about him": walks through the story, opening panels as it goes. */
export async function narrate() {
  const id = newRun();
  const lang = store.get().lang;
  store.set({ busy: "narrating", question: "" });
  const clips = narration.map((_, i) => () => scripted(`narration-${i}`, narration[i].text[lang]));
  let next = clips[0]();
  for (let i = 0; i < narration.length; i++) {
    if (!alive(id)) return;
    const step = narration[i];
    const current = next;
    if (i + 1 < clips.length) next = clips[i + 1]();
    if (step.panel) openPanel(step.panel, step.filter ?? "all");
    await say(id, step.text[lang], current);
  }
  if (alive(id)) store.set({ busy: "idle" });
}

/**
 * "Tell me more": a scripted story in one or more clips, each recorded ahead when there is a file.
 * It joins the chat history, so a follow-up question knows what was just told.
 */
async function tell(key: string, title: string, clips: { file: string; text: string }[]) {
  if (clips.length === 0) return;
  const id = newRun();
  const lang = store.get().lang;
  const question = `${ui.tellMore[lang]} · ${title}`;
  store.set((s) => ({
    busy: "speaking",
    question,
    telling: key,
    history: [...s.history, { role: "user" as const, text: question }, { role: "model" as const, text: clips.map((c) => c.text).join(" ") }].slice(-12),
  }));
  let next = scripted(clips[0].file, clips[0].text);
  for (let i = 0; i < clips.length; i++) {
    const current = next;
    if (i + 1 < clips.length) next = scripted(clips[i + 1].file, clips[i + 1].text);
    await say(id, clips[i].text, current);
    if (!alive(id)) return;
  }
  store.set({ busy: "idle", telling: null });
}

export function tellProject(p: Project) {
  if (p.story) void tell(p.id, p.title, [{ file: `project-${p.id}`, text: p.story[store.get().lang] }]);
}

export function tellCardinal() {
  const lang = store.get().lang;
  void tell(
    "cardinal",
    "CARDINAL",
    cardinal.story.map((step, i) => ({ file: `cardinal-${i}`, text: step[lang] })),
  );
}

export function stopSpeaking() {
  newRun();
  store.set({ busy: "idle" });
}

const ACTION = /<<\s*open\s*:\s*([a-z]+)(?:\s*:\s*([a-z0-9]+))?\s*>>/i;
const KINDS: ProjectKind[] = ["3d", "fullstack", "mobile", "contribution"];

/**
 * What the visitor reads: no action tags or markdown. Underscores are only dropped at word
 * edges (markdown emphasis), so handles like @abdurahmonov_shuhrat survive intact.
 */
export function cleanForDisplay(text: string) {
  return text
    .replace(/<<[^>]*>>?/g, "")
    .replace(/<<[^>]*$/, "")
    .replace(/[*#`]/g, "")
    .replace(/(^|\s)_+|_+(?=\s|[.,!?;:)]|$)/g, "$1")
    .trim();
}

/** What Yui says: the same text without URLs, which TTS would spell out character by character. */
export function cleanForSpeech(text: string) {
  return cleanForDisplay(text)
    .replace(/\bhttps?:\/\/\S+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** How long each chat easter egg plays. */
const EGG_MS = { matrix: 7000, glitch: 1400 } as const;
const COMMANDS = ["help", "matrix", "glitch"] as const;
let eggTimer: ReturnType<typeof setTimeout> | undefined;
let eggEnd = 0;

/** When the current egg switches off (performance.now() time); Eggs.tsx fades out towards it. */
export const eggEndsAt = () => eggEnd;

/** Starts an egg (or clears the current one); it always switches itself off. */
function playEgg(egg: keyof typeof EGG_MS | null) {
  clearTimeout(eggTimer);
  eggEnd = egg ? performance.now() + EGG_MS[egg] : 0;
  store.set({ egg });
  if (egg) eggTimer = setTimeout(() => store.set({ egg: null }), EGG_MS[egg]);
}

/** Hidden "/" commands, answered locally: no model call and nothing in the chat history. */
async function command(q: string) {
  const id = newRun();
  const lang = store.get().lang;
  const name = q.slice(1).trim().split(/\s+/)[0].toLowerCase();
  const known = COMMANDS.find((c) => c === name);
  playEgg(known === "matrix" || known === "glitch" ? known : null);
  store.set({ busy: "speaking", question: q });
  await say(id, ui.commands[known ?? "unknown"][lang], null);
  if (alive(id)) store.set({ busy: "idle" });
}

/** Visitor question → streamed Gemini answer, spoken sentence by sentence. */
export async function ask(question: string) {
  const q = question.trim().slice(0, 600);
  if (!q) return;
  if (q.startsWith("/")) return command(q);
  const id = newRun();
  const controller = new AbortController();
  chatAbort = controller;
  const { lang, name, honorific, history } = store.get();
  const messages = [...history, { role: "user" as const, text: q }].slice(-12);
  store.set({ busy: "thinking", question: q, subtitle: "", subtitleMode: "stream" });
  voice.pulse(1200);

  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lang, name, honorific, messages }),
      signal: controller.signal,
    });
  } catch {
    if (alive(id)) fail(id, ui.chatError[lang]);
    return;
  }
  if (!res.ok || !res.body) {
    if (alive(id)) fail(id, (res.status === 429 ? ui.rateLimited : ui.chatError)[lang]);
    return;
  }

  // Sentences are synthesised as soon as they are complete and played in order.
  const queue: { text: string; audio: Promise<AudioBuffer | null> }[] = [];
  let spoken = 0;
  let playing = false;
  let streamDone = false;
  let actionDone = false;
  let raw = "";
  let consumed = 0;

  const pump = async () => {
    if (playing) return;
    playing = true;
    while (alive(id) && spoken < queue.length) {
      const item = queue[spoken++];
      store.set({ busy: "speaking" });
      const buffer = await item.audio;
      if (!alive(id)) break;
      if (buffer) await voice.play(buffer);
    }
    playing = false;
    if (alive(id) && streamDone && spoken >= queue.length) store.set({ busy: "idle" });
  };

  const enqueue = (sentence: string) => {
    const text = cleanForSpeech(sentence);
    if (!text) return;
    queue.push({ text, audio: voice.tts(text, lang, controller.signal) });
    void pump();
  };

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!alive(id)) return;
      if (!raw) sfx.message();
      raw += value;
      voice.pulse(400);
      const match = ACTION.exec(raw);
      if (match && !actionDone) {
        actionDone = true;
        const panel = match[1].toLowerCase() as PanelId;
        const kind = match[2]?.toLowerCase() as ProjectKind | undefined;
        if (PANELS.includes(panel)) openPanel(panel, kind && KINDS.includes(kind) ? kind : "all");
      }
      store.set({ subtitle: cleanForDisplay(raw), subtitleMode: "stream" });
      // The free Gemini TTS tier allows only a few requests per minute, so an answer is voiced in
      // two clips: the first sentence (to start speaking early) and the rest once the stream ends.
      // A boundary is punctuation + space, so "Next.js" stays whole.
      if (consumed === 0) {
        const boundary = /[.!?…]+["»”)]?\s+/g;
        let m: RegExpExecArray | null;
        while ((m = boundary.exec(raw))) {
          const end = m.index + m[0].length;
          if (end >= 40) {
            enqueue(raw.slice(0, end));
            consumed = end;
            break;
          }
        }
      }
    }
  } catch {
    if (alive(id) && !raw) return fail(id, ui.chatError[lang]);
  }
  if (!alive(id)) return;
  enqueue(raw.slice(consumed));
  streamDone = true;
  const answer = cleanForDisplay(raw);
  store.set((s) => ({ history: [...s.history, { role: "user" as const, text: q }, { role: "model" as const, text: answer }].slice(-12) }));
  if (!playing && spoken >= queue.length) store.set({ busy: "idle" });
}

function fail(id: number, message: string) {
  void say(id, message, null).then(() => {
    if (alive(id)) store.set({ busy: "idle" });
  });
  store.set({ busy: "speaking" });
}
