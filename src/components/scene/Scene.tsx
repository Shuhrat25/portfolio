"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Component, useEffect, useState, type ReactNode } from "react";
import { ui } from "@/content/ui";
import { downgradeQuality, dropToFallback, FrameRateProbe, initQuality } from "@/lib/quality";
import { store, useStore } from "@/lib/store";
import { Core, Dust } from "./Core";
import { Fallback } from "./Fallback";

// Decided once, before the first render: without WebGL the Canvas must not even try to start.
initQuality();

/** Marks the scene ready once shaders are compiled and a few frames have rendered. */
function ReadySignal() {
  useFrame((state) => {
    if (state.clock.elapsedTime > 0.3 && !store.get().sceneReady) store.set({ sceneReady: true });
  });
  return null;
}

/** Times the first seconds of the full scene and steps down to lite once if it can't keep up. */
function FrameRateWatch() {
  const [probe] = useState(() => new FrameRateProbe());
  useFrame((state, delta) => {
    if (!probe.tick(delta) || !downgradeQuality()) return;
    // Resize inside the frame, so this frame already draws into the smaller buffer; resizing
    // later (from the dpr prop) would clear the canvas between frames and flash it blank.
    state.setDpr(1);
  });
  return null;
}

/**
 * A renderer that cannot start (context refused, driver limits) or a scene that crashes drops
 * to the CSS core instead of taking the whole page down with it.
 */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    dropToFallback();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type NoticeStep = "wait" | "show" | "fade" | "gone";
const NEXT: Record<Exclude<NoticeStep, "gone">, [NoticeStep, number]> = { wait: ["show", 900], show: ["fade", 6000], fade: ["gone", 900] };

/** One quiet line under the brand, once per visit, when the 3D is reduced on this device. */
function LiteNotice() {
  const lang = useStore((s) => s.lang);
  const due = useStore((s) => s.quality !== "full" && s.phase === "live");
  const [step, setStep] = useState<NoticeStep>("wait");
  // Waits for the live HUD; once shown it runs its course even if the phase changes.
  const idle = step === "wait" && !due;

  useEffect(() => {
    if (step === "gone" || idle) return;
    const [next, ms] = NEXT[step];
    const id = setTimeout(() => setStep(next), ms);
    return () => clearTimeout(id);
  }, [step, idle]);

  if (step === "gone") return null;
  return (
    <p
      role="status"
      className={`hud-label pointer-events-none fixed left-4 top-14 z-40 max-w-[calc(100vw-2rem)] !text-[0.6rem] transition-opacity duration-700 sm:left-8 sm:top-[5.25rem] ${
        step === "show" ? "opacity-100" : "opacity-0"
      }`}
    >
      {step !== "wait" && (
        <>
          <span aria-hidden className="mr-2 text-core">
            ▪
          </span>
          {ui.liteNotice[lang]}
        </>
      )}
    </p>
  );
}

export default function Scene() {
  const [compact] = useState(() => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);
  const quality = useStore((s) => s.quality);
  const lite = quality === "lite";
  return (
    <>
      {quality === "none" ? (
        <Fallback />
      ) : (
        <SceneBoundary>
          <Canvas
            className="!fixed inset-0"
            // Lite: one pixel per CSS pixel and no multisampling.
            dpr={lite ? 1 : [1, compact ? 1.5 : 2]}
            camera={{ fov: 42, position: [0, 0, 8], near: 0.1, far: 100 }}
            gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
            onCreated={({ gl }) => gl.setClearColor("#02050b")}
          >
            <ReadySignal />
            {quality === "full" && <FrameRateWatch />}
            <Dust count={compact ? 500 : 1100} />
            {/* Rebuilt when the level changes; the new rig carries on from the old one's state. */}
            <Core key={quality} compact={compact} lite={lite} />
            <EffectComposer multisampling={compact || lite ? 0 : 4}>
              {/* A higher threshold keeps thin moving lines out of the bloom, where they would flicker. Lite blurs fewer levels. */}
              <Bloom
                mipmapBlur
                intensity={lite ? 0.9 : 0.95}
                luminanceThreshold={0.22}
                luminanceSmoothing={0.25}
                radius={lite ? 0.65 : 0.7}
                levels={lite ? 5 : 8}
              />
              <Vignette offset={0.25} darkness={0.75} />
            </EffectComposer>
          </Canvas>
        </SceneBoundary>
      )}
      <LiteNotice />
    </>
  );
}
