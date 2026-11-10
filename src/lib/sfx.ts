"use client";

import { store } from "./store";

const FX_KEY = "yui.fx";
/** Everything is mixed far below Yui's voice. */
const MASTER = 0.08;

type Sound = "hover" | "click" | "open" | "boot" | "message";

/** Shortest gap between two plays of one sound, in ms; also absorbs StrictMode's double effects. */
const GAP: Record<Sound, number> = { hover: 45, click: 40, open: 150, boot: 1500, message: 200 };

type Tone = { type: OscillatorType; from: number; to?: number; at: number; dur: number; gain: number; attack?: number };
type Sweep = { from: number; to: number; at: number; dur: number; gain: number; q: number };

/**
 * Interface sounds, synthesised on the fly (no audio files) in their own AudioContext so
 * they never touch Yui's voice chain. Silent unless the visitor turned FX on, and the
 * context is only created after the page has had a user gesture.
 */
class SfxEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private last: Partial<Record<Sound, number>> = {};

  private context(): AudioContext | null {
    if (!store.get().fx || typeof window === "undefined") return null;
    if (navigator.userActivation?.hasBeenActive === false) return null;
    if (!this.ctx) {
      try {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new Ctx();
      } catch {
        return null;
      }
      // A gentle lowpass on the bus keeps every sound soft, whatever the speakers.
      const soften = this.ctx.createBiquadFilter();
      soften.type = "lowpass";
      soften.frequency.value = 6000;
      this.out = this.ctx.createGain();
      this.out.gain.value = MASTER;
      this.out.connect(soften).connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** The context if this sound may play now, else null. */
  private gate(sound: Sound): AudioContext | null {
    const ctx = this.context();
    if (!ctx) return null;
    const now = performance.now();
    if (now - (this.last[sound] ?? -Infinity) < GAP[sound]) return null;
    this.last[sound] = now;
    return ctx;
  }

  private tone(ctx: AudioContext, { type, from, to, at, dur, gain, attack = 0.004 }: Tone) {
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env).connect(this.out!);
    osc.onended = () => env.disconnect();
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(ctx: AudioContext) {
    if (!this.noiseBuffer) {
      this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuffer;
  }

  /** White noise through a moving bandpass: the "whoosh" of a panel unfolding. */
  private sweep(ctx: AudioContext, { from, to, at, dur, gain, q }: Sweep) {
    const t = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = this.noise(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = q;
    band.frequency.setValueAtTime(from, t);
    band.frequency.exponentialRampToValueAtTime(to, t + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + dur * 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(band).connect(env).connect(this.out!);
    src.onended = () => env.disconnect();
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  /** Pointer over a menu module: a tiny falling blip. */
  hover() {
    const ctx = this.gate("hover");
    if (ctx) this.tone(ctx, { type: "sine", from: 1500, to: 1150, at: 0, dur: 0.045, gain: 0.35 });
  }

  /** Any press: two short rising tones. */
  click() {
    const ctx = this.gate("click");
    if (!ctx) return;
    this.tone(ctx, { type: "triangle", from: 980, to: 1100, at: 0, dur: 0.04, gain: 0.5 });
    this.tone(ctx, { type: "triangle", from: 1480, to: 1660, at: 0.05, dur: 0.06, gain: 0.45 });
  }

  /** A panel opens: filtered noise sweeping up under a soft rising sine. */
  open() {
    const ctx = this.gate("open");
    if (!ctx) return;
    this.sweep(ctx, { from: 500, to: 3500, at: 0.04, dur: 0.32, gain: 1.6, q: 4 });
    this.tone(ctx, { type: "sine", from: 330, to: 880, at: 0.04, dur: 0.28, gain: 0.18, attack: 0.05 });
  }

  /** The core assembles: a rising D minor arpeggio over a quiet pad, about a second long. */
  boot() {
    const ctx = this.gate("boot");
    if (!ctx) return;
    const start = 0.12; // lets the click that started the boot finish first
    this.tone(ctx, { type: "sine", from: 146.8, at: start, dur: 1.25, gain: 0.16, attack: 0.35 });
    this.tone(ctx, { type: "sine", from: 220, at: start, dur: 1.25, gain: 0.1, attack: 0.35 });
    [587.3, 698.5, 880, 1046.5, 1318.5].forEach((f, i, notes) => {
      const at = start + i * 0.13;
      const dur = i === notes.length - 1 ? 0.6 : 0.42;
      this.tone(ctx, { type: "sine", from: f, at, dur, gain: 0.32, attack: 0.012 });
      this.tone(ctx, { type: "triangle", from: f * 2, at, dur: dur * 0.5, gain: 0.05, attack: 0.012 });
    });
  }

  /** A new chat reply: one soft ping with a faint overtone. */
  message() {
    const ctx = this.gate("message");
    if (!ctx) return;
    this.tone(ctx, { type: "sine", from: 1318.5, at: 0, dur: 0.35, gain: 0.4, attack: 0.006 });
    this.tone(ctx, { type: "sine", from: 2637, at: 0, dur: 0.18, gain: 0.08, attack: 0.006 });
  }

  /** Lets the audio device sleep while FX are off. */
  suspend() {
    if (this.ctx?.state === "running") void this.ctx.suspend();
  }
}

export const sfx = new SfxEngine();

/** Turns interface sounds on or off and remembers the choice. */
export function setFx(on: boolean) {
  store.set({ fx: on });
  if (!on) sfx.suspend();
  try {
    localStorage.setItem(FX_KEY, on ? "1" : "0");
  } catch {}
}

/** Restores the saved preference; FX stay off unless the visitor turned them on before. */
export function loadFx() {
  try {
    const saved = localStorage.getItem(FX_KEY);
    if (saved !== null) store.set({ fx: saved === "1" });
  } catch {}
}
