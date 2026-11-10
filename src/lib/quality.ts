// How much 3D this device gets: the full scene, a lighter one, or a CSS core without WebGL.
import { store, type State } from "./store";

export type Quality = State["quality"];

const LEVELS: readonly Quality[] = ["full", "lite", "none"];

type DeviceHints = Navigator & { deviceMemory?: number };

/**
 * True when a WebGL2 context can be created; the probe context is released right away.
 * WebGL1 alone does not count: three.js asks only for WebGL2 and would fail to start.
 */
function canCreateWebGL(attributes?: WebGLContextAttributes) {
  try {
    const gl = document.createElement("canvas").getContext("webgl2", attributes);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

export function detectQuality(): Quality {
  if (typeof window === "undefined") return "full";
  if (!canCreateWebGL()) return "none";
  const nav = navigator as DeviceHints;
  const media = (query: string) => window.matchMedia(query).matches;
  // No hardwareConcurrency rule: Safari reports 4 cores on every iPhone and A-series iPad, which
  // would push capable devices to lite. Slow devices are caught by deviceMemory (Chrome) and by
  // the frame-rate probe below.
  const weak =
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    media("(prefers-reduced-motion: reduce)") ||
    // A software renderer: WebGL works, but only with a "major performance caveat".
    !canCreateWebGL({ failIfMajorPerformanceCaveat: true });
  return weak ? "lite" : "full";
}

/** `?quality=full|lite|none` forces a level for testing and turns the frame-rate check off. */
function urlOverride(): Quality | null {
  const value = new URLSearchParams(window.location.search).get("quality");
  return LEVELS.find((level) => level === value) ?? null;
}

let decided = false;
let pinned = false;

/** Decides the level once per page, before the scene renders for the first time. */
export function initQuality() {
  if (decided || typeof window === "undefined") return;
  decided = true;
  const forced = urlOverride();
  pinned = forced !== null;
  store.set({ quality: forced ?? detectQuality() });
}

/**
 * The frame-rate check found the full scene too heavy: one step down, never back up.
 * False when nothing changed (a forced level, or already below full).
 */
export function downgradeQuality(): boolean {
  if (pinned || store.get().quality !== "full") return false;
  store.set({ quality: "lite" });
  return true;
}

/** The renderer failed to start or crashed: the CSS core takes over for the rest of the visit. */
export function dropToFallback() {
  store.set({ quality: "none" });
}

const WARMUP_S = 1.5;
const WINDOW_S = 4;
const MIN_FPS = 28;

/**
 * Average frame rate over the first seconds of the scene, after shaders have compiled.
 * Hidden tabs and frames after a pause are skipped, so switching tabs never counts as slow.
 */
export class FrameRateProbe {
  private warm = 0;
  private time = 0;
  private frames = 0;
  private done = false;

  /** Feed one frame; true exactly once, when the average says the device is too slow. */
  tick(delta: number): boolean {
    if (this.done || document.hidden || !(delta > 0) || delta > 1) return false;
    if (this.warm < WARMUP_S) {
      this.warm += delta;
      return false;
    }
    this.frames += 1;
    this.time += delta;
    if (this.time < WINDOW_S) return false;
    this.done = true;
    return this.frames / this.time < MIN_FPS;
  }
}
