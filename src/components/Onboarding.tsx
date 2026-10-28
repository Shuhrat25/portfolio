"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { LANGS, person, type Lang } from "@/content/profile";
import { address, ui, type Honorific } from "@/content/ui";
import { store, useStore } from "@/lib/store";
import { voice } from "@/lib/voice";
import { beginSession, restartIntro } from "@/lib/yui";

gsap.registerPlugin(useGSAP);

function useReveal() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.from(".reveal", { autoAlpha: 0, y: 16, filter: "blur(8px)", stagger: 0.07, duration: 0.9, ease: "expo.out" });
    },
    { scope: root },
  );
  return root;
}

export function LanguageStep() {
  const root = useReveal();
  const choose = (lang: Lang) => {
    voice.unlock();
    store.set({ lang, phase: "name" });
  };
  return (
    <section ref={root} className="fixed inset-0 z-30 grid place-items-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="reveal hud-label">Yui // core · handshake</p>
        <h1 className="reveal glow-text mt-6 font-display text-2xl font-semibold tracking-wide text-frost sm:text-3xl">{ui.pickLanguage.en}</h1>
        <p className="reveal mt-2 text-sm text-dim">
          {ui.pickLanguage.ru} · {ui.pickLanguage.uz}
        </p>
        <div className="mt-10 grid gap-3">
          {LANGS.map((lang, i) => (
            <button key={lang} type="button" className="reveal btn-core w-full !justify-between !py-4" onClick={() => choose(lang)}>
              <span className="font-sans text-base tracking-normal normal-case">{ui.languageNames[lang]}</span>
              <span className="text-[0.65rem] text-dim">
                0{i + 1} / {lang}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NameStep() {
  const lang = useStore((s) => s.lang);
  const root = useReveal();
  const [name, setName] = useState("");
  const [honorific, setHonorific] = useState<Honorific | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);

  const submit = (skip: boolean) => {
    store.set({
      name: skip ? "" : name.trim().slice(0, 40),
      honorific: skip ? "name" : (honorific ?? "name"),
      returning: false,
    });
    beginSession();
  };

  const options: Honorific[] = ["male", "female", "name"];
  return (
    <section ref={root} className="fixed inset-0 z-30 grid place-items-center px-4">
      <form
        className="holo w-full max-w-md p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <p className="reveal hud-label">02 // {lang}</p>
        <label htmlFor="visitor-name" className="reveal glow-text mt-4 block font-display text-xl font-semibold leading-snug sm:text-2xl">
          {ui.askName[lang]}
        </label>
        <input
          ref={input}
          id="visitor-name"
          className="reveal field mt-6"
          value={name}
          maxLength={40}
          autoComplete="given-name"
          placeholder={ui.namePlaceholder[lang]}
          onChange={(e) => setName(e.target.value)}
        />
        <div role="radiogroup" aria-label={ui.askName[lang]} className="reveal mt-4 grid grid-cols-3 gap-2">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={honorific === o}
              onClick={() => setHonorific(o)}
              className={`border px-2 py-2.5 text-sm transition-colors ${
                honorific === o ? "border-core bg-core/15 text-frost shadow-[0_0_18px_rgba(61,184,255,0.25)]" : "border-[var(--line)] text-dim hover:text-ice"
              }`}
            >
              {ui.honorifics[o][lang]}
            </button>
          ))}
        </div>
        <button type="submit" className="reveal btn-core mt-6 w-full">
          {ui.continue[lang]}
        </button>
        <div className="reveal mt-5 flex items-center justify-between">
          <button type="button" className="btn-ghost" onClick={() => store.set({ phase: "language" })}>
            ← {ui.back[lang]}
          </button>
          <button type="button" className="btn-ghost" onClick={() => submit(true)}>
            {ui.skip[lang]} →
          </button>
        </div>
      </form>
    </section>
  );
}

export function ResumeStep() {
  const lang = useStore((s) => s.lang);
  const name = useStore((s) => s.name);
  const honorific = useStore((s) => s.honorific);
  const root = useReveal();
  const who = address(lang, name, honorific);
  const title = { en: "Welcome back", ru: "С возвращением", uz: "Xush kelibsiz" }[lang];
  const connect = { en: "Connect to Yui", ru: "Подключиться к Юи", uz: "Yui’ga ulanish" }[lang];
  return (
    <section ref={root} className="fixed inset-0 z-30 grid place-items-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="reveal hud-label">Yui // core · session restored</p>
        <h1 className="reveal glow-text mt-6 font-display text-2xl font-semibold sm:text-3xl">
          {title}
          {who ? `, ${who}` : ""}
        </h1>
        <button type="button" className="reveal btn-core mt-10 w-full !py-4" onClick={beginSession}>
          {connect}
        </button>
        <button type="button" className="reveal btn-ghost mt-6" onClick={restartIntro}>
          {ui.restart[lang]}
        </button>
      </div>
    </section>
  );
}

export function BootOverlay() {
  const lang = useStore((s) => s.lang);
  const lines = ui.bootLines[lang];
  const [progress, setProgress] = useState(0);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const started = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - started) / 3400;
      // Eases to 92% on its own; the last stretch waits for the voice module.
      setProgress(Math.min(0.92, 1 - Math.pow(1 - Math.min(t, 1), 3) * 0.98) + (store.get().sceneReady ? 0.03 : 0));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useGSAP(() => gsap.from(root.current, { autoAlpha: 0, duration: 0.6 }), { scope: root });

  const shown = Math.max(1, Math.ceil(progress * lines.length));
  return (
    <section ref={root} className="pointer-events-none fixed inset-x-0 bottom-[5vh] z-30 flex justify-center px-4" aria-live="polite">
      <div className="w-full max-w-xs">
        <ul className="space-y-1 font-mono text-[0.7rem] tracking-[0.18em] uppercase">
          {lines.slice(0, shown).map((l, i) => (
            <li key={l} className={i === shown - 1 ? "caret text-ice" : "text-dim"}>
              {i < shown - 1 ? "✓ " : "› "}
              {l}
            </li>
          ))}
        </ul>
        <div className="mt-4 h-px w-full bg-[var(--line)]">
          <div className="h-px bg-core shadow-[0_0_12px_#3db8ff] transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="mt-2 flex justify-between hud-label">
          <span>{person.name[lang]}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
