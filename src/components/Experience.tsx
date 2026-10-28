"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { loadVisitor, store, useStore } from "@/lib/store";
import { Eggs } from "./Eggs";
import { Frame, TopBar } from "./Hud";
import { BootOverlay, LanguageStep, NameStep, ResumeStep } from "./Onboarding";
import { PanelHost } from "./panels/PanelHost";
import { Dock, Stage } from "./Stage";

// The WebGL scene starts loading behind the language screen ("hidden loading").
const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

export default function Experience() {
  const phase = useStore((s) => s.phase);
  const lang = useStore((s) => s.lang);

  useEffect(() => {
    const visitor = loadVisitor();
    store.set(visitor ? { ...visitor, returning: true, phase: "resume" } : { phase: "language" });
  }, []);

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
    </main>
  );
}
