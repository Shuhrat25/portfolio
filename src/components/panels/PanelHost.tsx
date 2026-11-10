"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { PANELS, ui, type PanelId } from "@/content/ui";
import { stageInsets } from "@/lib/layout";
import { sfx } from "@/lib/sfx";
import { useStore } from "@/lib/store";
import { useViewport } from "@/lib/use-viewport";
import { narrate, openPanel, stopSpeaking, visitSection } from "@/lib/yui";
import { MenuButton } from "../MenuButton";
import { About, Cardinal, Contacts, Cv, ExperiencePanel, Projects, Skills } from "./content";
import { OrderForm } from "./OrderForm";

gsap.registerPlugin(useGSAP);

const BODY: Record<PanelId, () => React.ReactNode> = {
  about: About,
  experience: ExperiencePanel,
  projects: Projects,
  skills: Skills,
  cardinal: Cardinal,
  cv: Cv,
  contacts: Contacts,
  order: OrderForm,
};

export function PanelHost() {
  const panel = useStore((s) => s.panel);
  const lang = useStore((s) => s.lang);
  const busy = useStore((s) => s.busy);
  const { w, h } = useViewport();
  const insets = stageInsets(w, h, panel !== null, true);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!panel) return;
      gsap.fromTo(
        root.current,
        insets.sheet ? { y: 40, autoAlpha: 0 } : { x: 40, autoAlpha: 0, clipPath: "inset(0 0 100% 0)" },
        { x: 0, y: 0, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: "expo.out" },
      );
      gsap.from(".panel-reveal", { autoAlpha: 0, y: 12, stagger: 0.04, duration: 0.6, delay: 0.15, ease: "expo.out" });
    },
    { scope: root, dependencies: [panel], revertOnUpdate: true },
  );

  useEffect(() => {
    if (panel) sfx.open();
  }, [panel]);

  // Keep the current section's tab visible in the header switcher.
  useEffect(() => {
    root.current?.querySelector('nav [aria-pressed="true"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [panel]);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openPanel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  if (!panel) return null;
  const Body = BODY[panel];
  const index = PANELS.indexOf(panel) + 1;
  const close = () => {
    if (busy !== "thinking") stopSpeaking();
    openPanel(null);
  };

  return (
    <aside
      ref={root}
      aria-label={ui.menu[panel][lang]}
      className={`holo fixed z-30 flex flex-col ${
        insets.sheet ? "inset-x-2 bottom-2 top-auto" : "bottom-6 right-6 top-20"
      }`}
      style={insets.sheet ? { height: insets.bottom - 8 } : { width: insets.right - 56 }}
    >
      <header className="border-b border-[var(--line)] px-5 pb-3 pt-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="hud-label">{`0${index} // ${panel}`}</p>
            <h2 className="glow-text mt-1 font-display text-lg font-semibold tracking-wide sm:text-xl">{ui.menu[panel][lang]}</h2>
          </div>
          <button type="button" onClick={close} className="btn-ghost border border-[var(--line)] px-3 py-1.5" aria-label={ui.close[lang]}>
            ✕
          </button>
        </div>
        <nav className="scroll-thin -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 pb-0.5" aria-label="Sections">
          <MenuButton
            id="tell"
            side="chip"
            className="shrink-0"
            label={busy === "narrating" ? ui.stop[lang] : ui.menu.tell[lang]}
            active={busy === "narrating"}
            onClick={() => (busy === "narrating" ? stopSpeaking() : narrate())}
          />
          {PANELS.map((id) => (
            <MenuButton
              key={id}
              id={id}
              side="chip"
              className="shrink-0"
              label={ui.menu[id][lang]}
              active={id === panel}
              onClick={() => id !== panel && visitSection(id)}
            />
          ))}
        </nav>
      </header>
      <div className="scroll-thin flex-1 overflow-y-auto px-5 py-5">
        <Body />
      </div>
    </aside>
  );
}
