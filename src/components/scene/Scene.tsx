"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useState } from "react";
import { store } from "@/lib/store";
import { Core, Dust } from "./Core";

/** Marks the scene ready once shaders are compiled and a few frames have rendered. */
function ReadySignal() {
  useFrame((state) => {
    if (state.clock.elapsedTime > 0.3 && !store.get().sceneReady) store.set({ sceneReady: true });
  });
  return null;
}

export default function Scene() {
  const [compact] = useState(() => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={[1, compact ? 1.5 : 2]}
      camera={{ fov: 42, position: [0, 0, 8], near: 0.1, far: 100 }}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => gl.setClearColor("#02050b")}
    >
      <ReadySignal />
      <Dust count={compact ? 500 : 1100} />
      <Core compact={compact} />
      <EffectComposer multisampling={compact ? 0 : 4}>
        {/* A higher threshold keeps thin moving lines out of the bloom, where they would flicker. */}
        <Bloom mipmapBlur intensity={0.95} luminanceThreshold={0.22} luminanceSmoothing={0.25} radius={0.7} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}
