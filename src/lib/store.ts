"use client";

import { useSyncExternalStore } from "react";
import type { Lang, ProjectKind } from "@/content/profile";
import type { Honorific, PanelId } from "@/content/ui";

export type Phase = "init" | "resume" | "language" | "name" | "boot" | "live";
export type ChatMessage = { role: "user" | "model"; text: string };

export type State = {
  phase: Phase;
  lang: Lang;
  name: string;
  honorific: Honorific;
  returning: boolean;
  sceneReady: boolean;
  menuVisible: boolean;
  panel: PanelId | null;
  projectFilter: ProjectKind | "all";
  /** What Yui is saying right now and how to reveal it. */
  subtitle: string;
  subtitleMode: "audio" | "type" | "stream";
  subtitleStartedAt: number;
  question: string;
  busy: "idle" | "thinking" | "speaking" | "narrating";
  muted: boolean;
  history: ChatMessage[];
  /** Menu item under the pointer; the core leans towards it. */
  hover: PanelId | "tell" | null;
  /** Interface sound effects (separate from Yui's voice), off by default. */
  fx: boolean;
  /** Reduced scene for weak devices; "none" when WebGL is unavailable. */
  quality: "full" | "lite" | "none";
  /** Microphone is recording a question. */
  listening: boolean;
  /** Mouse over the core while a click on it would ask by voice. */
  coreHover: boolean;
  /** Chat easter egg currently playing. */
  egg: "matrix" | "glitch" | null;
  /** The project id (or "cardinal") whose "tell me more" story Yui is telling. */
  telling: string | null;
};

const initial: State = {
  phase: "init",
  lang: "en",
  name: "",
  honorific: "name",
  returning: false,
  sceneReady: false,
  menuVisible: false,
  panel: null,
  projectFilter: "all",
  subtitle: "",
  subtitleMode: "type",
  subtitleStartedAt: 0,
  question: "",
  busy: "idle",
  muted: false,
  history: [],
  hover: null,
  fx: false,
  quality: "full",
  listening: false,
  coreHover: false,
  egg: null,
  telling: null,
};

let state = initial;
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<State> | ((s: State) => Partial<State>)) {
    state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Subscribe to one primitive slice of the store. */
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(initial),
  );
}

const VISITOR_KEY = "yui.visitor";

export function saveVisitor() {
  const { lang, name, honorific } = store.get();
  try {
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ lang, name, honorific }));
  } catch {}
}

export function loadVisitor(): { lang: Lang; name: string; honorific: Honorific } | null {
  try {
    const raw = localStorage.getItem(VISITOR_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!["en", "ru", "uz"].includes(v.lang)) return null;
    return { lang: v.lang, name: typeof v.name === "string" ? v.name : "", honorific: ["male", "female", "name"].includes(v.honorific) ? v.honorific : "name" };
  } catch {
    return null;
  }
}

export function forgetVisitor() {
  try {
    localStorage.removeItem(VISITOR_KEY);
  } catch {}
}
