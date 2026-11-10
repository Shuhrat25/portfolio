"use client";

import { LANGS, person } from "@/content/profile";
import { ui } from "@/content/ui";
import { setFx, sfx } from "@/lib/sfx";
import { store, useStore } from "@/lib/store";
import { voice } from "@/lib/voice";
import { restartIntro, switchLanguage } from "@/lib/yui";
import { LogoMark } from "./Logo";

export function TopBar() {
  const phase = useStore((s) => s.phase);
  const lang = useStore((s) => s.lang);
  const muted = useStore((s) => s.muted);
  const fx = useStore((s) => s.fx);
  const busy = useStore((s) => s.busy);
  const live = phase === "live";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-3 px-4 pt-4 sm:gap-4 sm:px-6 sm:pt-5">
      {/* Phones are tight: the controls lose 2px of padding to fit the mark, and under 375px the mark steps aside. */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
        <LogoMark size={30} className="h-[26px] w-[26px] shrink-0 max-[375px]:hidden sm:h-[30px] sm:w-[30px]" />
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-core shadow-[0_0_10px_#3db8ff]" : "bg-dim"} ${busy !== "idle" ? "animate-pulse" : ""}`} />
            <span className="font-mono text-[0.72rem] tracking-[0.3em] text-ice">YUI</span>
            <span className="hud-label hidden sm:inline">{`// ${live ? "online" : "standby"}`}</span>
          </div>
          <p className="hud-label mt-1 hidden sm:block">
            {person.name[lang]} · {person.role[lang]}
          </p>
        </div>
      </div>

      {live && (
        <nav className="pointer-events-auto flex items-center gap-1 sm:gap-2" aria-label="Settings">
          <div className="flex border border-[var(--line)]">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={l === lang}
                onClick={() => l !== lang && switchLanguage(l)}
                className={`px-1.5 py-1 font-mono text-[0.65rem] tracking-[0.15em] uppercase transition-colors sm:px-2 ${
                  l === lang ? "bg-core/20 text-frost" : "text-dim hover:text-ice"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="border border-[var(--line)] px-1.5 py-1 font-mono text-[0.65rem] tracking-[0.15em] uppercase text-dim hover:text-ice sm:px-2"
            aria-pressed={!muted}
            onClick={() => {
              voice.setMuted(!muted);
              store.set({ muted: !muted });
            }}
          >
            {muted ? "◌" : "◉"} {ui.sound[lang]}
          </button>
          <button
            type="button"
            className="border border-[var(--line)] px-1.5 py-1 font-mono text-[0.65rem] tracking-[0.15em] uppercase text-dim hover:text-ice sm:px-2"
            title={ui.fxHint[lang]}
            aria-label={`${ui.fx[lang]} · ${ui.fxHint[lang]}`}
            aria-pressed={fx}
            onClick={() => {
              setFx(!fx);
              // The confirmation chirp; turning FX off stays silent.
              if (!fx) sfx.click();
            }}
          >
            {fx ? "◆" : "◇"} {ui.fx[lang]}
          </button>
          <button type="button" className="border border-[var(--line)] px-1.5 py-1 font-mono text-[0.65rem] text-dim hover:text-ice sm:px-2" title={ui.restart[lang]} aria-label={ui.restart[lang]} onClick={restartIntro}>
            ↺
          </button>
        </nav>
      )}
    </header>
  );
}

/** Decorative frame corners and a coordinate readout (hidden once the chat dock takes the bottom). */
export function Frame() {
  const live = useStore((s) => s.phase === "live");
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-10 hidden sm:block">
      <div className="absolute left-4 top-20 h-10 w-px bg-gradient-to-b from-core/60 to-transparent" />
      <div className="absolute right-4 top-20 h-10 w-px bg-gradient-to-b from-core/60 to-transparent" />
      {!live && (
        <>
          <div className="absolute bottom-4 left-6 hud-label !text-[0.6rem]">41.31° N · 69.28° E — Tashkent</div>
          <div className="absolute bottom-4 right-6 hud-label !text-[0.6rem]">Core v1.0 · Gemini link</div>
        </>
      )}
    </div>
  );
}
