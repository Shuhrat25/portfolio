"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ui, type PanelId } from "@/content/ui";
import { LINK_LANG, readDeepLink } from "@/lib/deep-link";
import { loadVisitor, store, useStore } from "@/lib/store";
import { beginDeepLink } from "@/lib/yui";
import { Eggs } from "./Eggs";
import { Frame, TopBar } from "./Hud";
import { BootOverlay, LanguageStep, NameStep, ResumeStep } from "./Onboarding";
import { PanelHost } from "./panels/PanelHost";
import { Dock, Stage } from "./Stage";

// The WebGL scene starts loading behind the language screen ("hidden loading").
const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

/** `section` comes from a /cardinal-style path; ?open= works on the home page too. */
export default function Experience({ section }: { section?: PanelId }) {
  const phase = useStore((s) => s.phase);
  const lang = useStore((s) => s.lang);
  const nameAsk = useStore((s) => s.nameAsk);

  useEffect(() => {
    const visitor = loadVisitor();
    const link = readDeepLink(section);
    if (link) {
      // A shared link skips onboarding: the language comes from the link, the visitor's last
      // visit or defaults to Russian, and the section opens as soon as the core is up.
      store.set({ ...visitor, lang: link.lang ?? visitor?.lang ?? LINK_LANG, returning: visitor !== null });
      beginDeepLink(link.panel, link.kind, visitor === null);
      return;
    }
    store.set(visitor ? { ...visitor, returning: true, phase: "resume" } : { phase: "language" });
  }, [section]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <main className="h-full">
      <Scene />
      <div className="backdrop z-[1]" />
      <div className="scanlines" />
      <Frame />
      <TopBar />
      {phase === "language" && <LanguageStep />}
      {phase === "name" && <NameStep />}
      {phase === "resume" && <ResumeStep />}
      {phase === "boot" && <BootOverlay />}
      {phase === "live" && (
        <>
          <Stage />
          <Dock />
          <PanelHost />
        </>
      )}
      <Eggs />
      {/* Always mounted, so screen readers hear the name card's question when it appears. */}
      <p role="status" className="sr-only">
        {nameAsk ? ui.askName[lang] : ""}
      </p>
    </main>
  );
}
