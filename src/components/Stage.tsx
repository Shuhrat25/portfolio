"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { PANELS, ui, type PanelId } from "@/content/ui";
import { MOBILE, stageInsets } from "@/lib/layout";
import { MENU_ANGLES } from "@/lib/menu-layout";
import { useStore } from "@/lib/store";
import { useViewport } from "@/lib/use-viewport";
import { voice } from "@/lib/voice";
import { ask, narrate, stopSpeaking, visitSection } from "@/lib/yui";
import { MenuButton } from "./MenuButton";

gsap.registerPlugin(useGSAP);

const ANGLES = MENU_ANGLES;

function useInsets() {
  const { w, h } = useViewport();
  const panel = useStore((s) => s.panel);
  const phase = useStore((s) => s.phase);
  return { w, h, ...stageInsets(w, h, panel !== null, phase === "live") };
}

/** The free area around the core; everything in it is centred on the sphere. */
export function Stage() {
  const { w, h, top, right, bottom } = useInsets();
  const menuVisible = useStore((s) => s.menuVisible);
  // With a panel open the ring of labels no longer fits; the panel header has its own switcher.
  const panelOpen = useStore((s) => s.panel !== null);
  return (
    <div
      className="pointer-events-none fixed left-0 z-20 transition-[right,bottom] duration-700 ease-out-expo"
      style={{ top, right, bottom }}
    >
      {menuVisible && w >= MOBILE && !panelOpen && <RadialMenu w={w - right} h={h - bottom - top} />}
      <Subtitles />
    </div>
  );
}

function RadialMenu({ w, h }: { w: number; h: number }) {
  const lang = useStore((s) => s.lang);
  const panel = useStore((s) => s.panel);
  const busy = useStore((s) => s.busy);
  const root = useRef<HTMLDivElement>(null);
  const radius = Math.max(190, Math.min(w * 0.42, h * 0.46, 360));

  useGSAP(
    () => {
      gsap.from(".node", { autoAlpha: 0, scale: 0.6, duration: 0.9, stagger: 0.06, ease: "expo.out", clearProps: "transform" });
      gsap.from(".spoke", { strokeDashoffset: 200, duration: 1.1, stagger: 0.06, ease: "expo.out" });
    },
    { scope: root },
  );

  const items: (PanelId | "tell")[] = ["tell", ...PANELS];
  return (
    <div ref={root} className="absolute left-1/2 top-1/2 h-0 w-0">
      <svg className="pointer-events-none absolute -left-[400px] -top-[400px] h-[800px] w-[800px] overflow-visible" viewBox="-400 -400 800 800" aria-hidden>
        {items.map((id) => {
          const a = (ANGLES[id] * Math.PI) / 180;
          const r0 = radius * 0.62;
          const r1 = radius - 1; // ends at the module's arrow tip
          return (
            <line
              key={id}
              className="spoke"
              x1={Math.cos(a) * r0}
              y1={-Math.sin(a) * r0}
              x2={Math.cos(a) * r1}
              y2={-Math.sin(a) * r1}
              stroke={panel === id ? "rgba(61,184,255,0.8)" : "rgba(61,184,255,0.25)"}
              strokeWidth={1}
              strokeDasharray="200"
            />
          );
        })}
      </svg>
      {items.map((id, i) => {
        const a = (ANGLES[id] * Math.PI) / 180;
        const x = Math.cos(a) * radius;
        const y = -Math.sin(a) * radius;
        // Modules left of the core point right at it (right edge on the anchor) and vice versa.
        const side = id === "tell" ? "top" : Math.cos(a) < 0 ? "left" : "right";
        const place = side === "left" ? "right-0 -translate-y-1/2" : side === "right" ? "left-0 -translate-y-1/2" : "-translate-x-1/2 -translate-y-full";
        const narrating = busy === "narrating";
        return (
          <div key={id} className="absolute" style={{ left: x, top: y }}>
            <div className={`node pointer-events-auto absolute ${place}`}>
              {id === "tell" ? (
                <MenuButton
                  id="tell"
                  side="top"
                  label={narrating ? ui.stop[lang] : ui.menu.tell[lang]}
                  active={narrating}
                  onClick={() => (narrating ? stopSpeaking() : narrate())}
                />
              ) : (
                <MenuButton id={id} side={side} index={`0${i}`} label={ui.menu[id][lang]} active={panel === id} onClick={() => visitSection(id)} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Subtitles() {
  const lang = useStore((s) => s.lang);
  const text = useStore((s) => s.subtitle);
  const mode = useStore((s) => s.subtitleMode);
  const startedAt = useStore((s) => s.subtitleStartedAt);
  const question = useStore((s) => s.question);
  const busy = useStore((s) => s.busy);
  const compact = useStore((s) => s.panel !== null);
  const [shown, setShown] = useState(0);
  const box = useRef<HTMLParagraphElement>(null);

  // Keep the line being spoken in view when the text is taller than the box.
  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  useEffect(() => {
    if (mode === "stream") return;
    let raf = 0;
    const tick = () => {
      const p = mode === "audio" ? voice.progress() : (performance.now() - startedAt) / Math.max(800, text.length * 38);
      setShown(Math.ceil(Math.min(1, p) * text.length));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, mode, startedAt]);

  const visible = mode === "stream" ? text : text.slice(0, shown);
  const typing = busy !== "idle" && (mode === "stream" || shown < text.length);
  if (!visible && !question && busy !== "thinking") return null;

  return (
    <div className="absolute inset-x-0 bottom-3 flex justify-center px-4" aria-live="polite">
      <div className="w-full max-w-2xl text-center">
        {question && <p className="mb-2 line-clamp-2 font-mono text-[0.72rem] tracking-wide text-dim">› {question}</p>}
        {busy === "thinking" && !visible ? (
          <p className="hud-label caret !text-ice">{ui.thinking[lang]}</p>
        ) : (
          <p
            ref={box}
            className={`scroll-thin mx-auto overflow-y-auto leading-relaxed text-frost [text-shadow:0_1px_12px_rgba(2,5,11,0.95)] ${
              compact ? "max-h-[4.6rem] text-[0.9rem]" : "max-h-[6.9rem] text-[0.98rem] sm:text-[1.05rem]"
            } ${typing ? "caret" : ""}`}
          >
            {visible}
          </p>
        )}
      </div>
    </div>
  );
}

/** Bottom dock: chat input, plus menu chips on phones. */
export function Dock() {
  const { w, right, bottom, sheet } = useInsets();
  const lang = useStore((s) => s.lang);
  const menuVisible = useStore((s) => s.menuVisible);
  const busy = useStore((s) => s.busy);
  const panel = useStore((s) => s.panel);
  const [value, setValue] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => gsap.from(root.current, { autoAlpha: 0, y: 24, duration: 0.9, delay: 0.6, ease: "expo.out" }), { scope: root });

  if (sheet) return null;
  const send = () => {
    const q = value.trim();
    if (!q) return;
    setValue("");
    void ask(q);
  };
  return (
    <div ref={root} className="fixed bottom-0 left-0 z-30 flex flex-col justify-end gap-2 px-3 pb-3 sm:px-6 sm:pb-4" style={{ right, height: bottom }}>
      {w < MOBILE && menuVisible && (
        <div className="scroll-thin -mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1">
          <MenuButton
            id="tell"
            side="chip"
            className="shrink-0"
            label={busy === "narrating" ? ui.stop[lang] : ui.menu.tell[lang]}
            active={busy === "narrating"}
            onClick={() => (busy === "narrating" ? stopSpeaking() : narrate())}
          />
          {PANELS.map((id) => (
            <MenuButton key={id} id={id} side="chip" className="shrink-0" label={ui.menu[id][lang]} active={panel === id} onClick={() => visitSection(id)} />
          ))}
        </div>
      )}
      <form
        className="holo mx-auto flex w-full max-w-2xl items-center gap-2 py-1.5 pl-4 pr-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <span className="font-mono text-sm text-core">›</span>
        <input
          className="min-w-0 flex-1 bg-transparent py-2 text-[0.95rem] text-frost placeholder:text-dim/80 focus:outline-none"
          value={value}
          maxLength={600}
          placeholder={ui.chatPlaceholder[lang]}
          aria-label={ui.chatPlaceholder[lang]}
          onChange={(e) => setValue(e.target.value)}
        />
        {busy !== "idle" && (
          <button type="button" className="btn-ghost px-2" onClick={stopSpeaking}>
            {ui.stop[lang]}
          </button>
        )}
        <button type="submit" className="btn-core !px-4 !py-2" disabled={!value.trim()}>
          {ui.send[lang]}
        </button>
      </form>
      <p className="text-center font-mono text-[0.6rem] tracking-wider text-dim/70">{ui.aiNotice[lang]}</p>
    </div>
  );
}
