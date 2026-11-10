"use client";

import { useEffect, type CSSProperties } from "react";
import { stageInsets } from "@/lib/layout";
import { store, useStore } from "@/lib/store";
import { useViewport } from "@/lib/use-viewport";

// Sizes are in core radii (--d is a diameter), so the rings sit where the WebGL ones would.
// Every motion is a slow rotation; reduced motion stops them (the global rule alone would only
// shorten them, and a ring spinning 0.01 ms per turn lands at a random angle every frame).
const css = `
.yfb { position: relative; width: calc(var(--u) * 2); height: calc(var(--u) * 2); perspective: calc(var(--u) * 9);
  transition: transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 2.4s ease-out; }
.yfb-o { position: absolute; border-radius: 50%; width: calc(var(--u) * var(--d)); height: calc(var(--u) * var(--d));
  left: calc(50% - var(--u) * var(--d) / 2); top: calc(50% - var(--u) * var(--d) / 2); }
.yfb-3d, .yfb-globe, .yfb-axis, .yfb-tilt { position: absolute; inset: 0; transform-style: preserve-3d; }
.yfb-globe { transform: rotateX(-18deg) rotateZ(14deg); }
.yfb-wire { border: 1px solid rgba(61, 184, 255, 0.28); }
.yfb-anim { animation: yfb-spin var(--t) linear infinite; will-change: transform; }
.yfb-rev { animation-direction: reverse; }
.yfb-axis.yfb-anim { animation-name: yfb-turn; }
.yfb-halo { background: radial-gradient(closest-side, rgba(61, 184, 255, 0.16), rgba(11, 74, 153, 0.1) 45%, transparent); }
.yfb-shell {
  background:
    radial-gradient(closest-side, transparent 62%, rgba(61, 184, 255, 0.1) 78%, rgba(191, 232, 255, 0.42) 97%, transparent),
    radial-gradient(closest-side, rgba(11, 74, 153, 0.4), rgba(5, 13, 28, 0.3) 80%, transparent);
  box-shadow: 0 0 calc(var(--u) * 0.4) rgba(61, 184, 255, 0.2);
}
.yfb-dots {
  opacity: 0.5;
  background:
    radial-gradient(circle, rgba(191, 232, 255, 0.85) 0 0.8px, transparent 1.4px) 0 0 / 8px 8px,
    radial-gradient(circle, rgba(61, 184, 255, 0.7) 0 0.7px, transparent 1.2px) 4px 5px / 13px 13px;
  -webkit-mask-image: radial-gradient(closest-side, transparent 55%, #000 85%, #000 96%, transparent);
  mask-image: radial-gradient(closest-side, transparent 55%, #000 85%, #000 96%, transparent);
}
.yfb-light {
  opacity: 0.75;
  background: radial-gradient(closest-side, #fff, rgba(150, 220, 255, 0.75) 18%, rgba(40, 130, 255, 0.22) 45%, transparent);
  animation: yfb-breathe 7s ease-in-out infinite alternate;
}
.yfb-ticks, .yfb-majors { background: repeating-conic-gradient(rgba(61, 184, 255, 0.6) 0 0.45deg, transparent 0.45deg 2deg); }
.yfb-ticks { -webkit-mask-image: var(--ring); mask-image: var(--ring); --ring: radial-gradient(closest-side, transparent calc(100% - var(--u) * 0.04), #000 calc(100% - var(--u) * 0.04)); }
.yfb-majors { background: repeating-conic-gradient(rgba(61, 184, 255, 0.75) 0 0.6deg, transparent 0.6deg 10deg);
  -webkit-mask-image: var(--ring); mask-image: var(--ring); --ring: radial-gradient(closest-side, transparent calc(100% - var(--u) * 0.09), #000 calc(100% - var(--u) * 0.09)); }
.yfb-arcs { border: 1.5px solid transparent; border-top-color: rgba(191, 232, 255, 0.65); border-left-color: rgba(191, 232, 255, 0.22);
  border-bottom-color: rgba(255, 46, 136, 0.45); }
.yfb-dash { border: 1px dashed rgba(36, 110, 215, 0.75); }
.yfb-dash-ice { border: 1px dashed rgba(191, 232, 255, 0.4); }
@keyframes yfb-spin { to { transform: rotate(360deg); } }
@keyframes yfb-turn { to { transform: rotateY(360deg); } }
@keyframes yfb-breathe { from { transform: scale(0.97); } to { transform: scale(1.03); } }
@media (prefers-reduced-motion: reduce) {
  .yfb-anim, .yfb-light { animation: none !important; }
}
`;

/** Diameter in core radii, plus the turn period in seconds for the rings that rotate. */
const orb = (d: number, seconds?: number, extra?: CSSProperties) => ({ "--d": d, "--t": seconds ? `${seconds}s` : undefined, ...extra }) as CSSProperties;

/**
 * The core without WebGL: layered gradients, a wire globe and slowly turning dashed rings,
 * sized and centred like the 3D core (same free-area rule, same camera framing).
 */
export function Fallback() {
  const { w, h } = useViewport();
  const panelOpen = useStore((s) => s.panel !== null);
  const live = useStore((s) => s.phase === "live");
  const assembled = useStore((s) => s.phase === "boot" || s.phase === "live");
  const { top, right, bottom, sheet } = stageInsets(w, h, panelOpen, live);
  // Pixels per world unit at the distance cameraDistance() puts the camera.
  const unit = Math.min(h / 6.6, w / 4.8);
  // Faint and a little smaller during onboarding, like the dust before the core assembles.
  const scale = (sheet ? 0.6 : panelOpen ? 0.78 : 1) * (assembled ? 1 : 0.86);

  // Nothing to compile or upload: the boot sequence can go on right away.
  useEffect(() => {
    store.set({ sceneReady: true });
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 grid place-items-center transition-[top,right,bottom] duration-700 ease-out-expo"
      style={{ top, right, bottom }}
    >
      <style>{css}</style>
      <div className="yfb" style={{ "--u": `${unit}px`, opacity: assembled ? 1 : 0.4, transform: `scale(${scale})` } as CSSProperties}>
        <i className="yfb-o yfb-halo" style={orb(5.4)} />
        <i className="yfb-o yfb-shell" style={orb(2)} />
        <i className="yfb-o yfb-dots" style={orb(2.04)} />
        <div className="yfb-3d">
          <div className="yfb-globe">
            <div className="yfb-axis yfb-anim" style={orb(2, 60)}>
              {[0, 45, 90, 135].map((a) => (
                <i key={a} className="yfb-o yfb-wire" style={orb(2, undefined, { transform: `rotateY(${a}deg)` })} />
              ))}
              <i className="yfb-o yfb-wire" style={orb(2, undefined, { transform: "rotateX(90deg)" })} />
              {[1, -1].map((side) => (
                <i key={side} className="yfb-o yfb-wire" style={orb(1.64, undefined, { transform: `rotateX(90deg) translateZ(calc(var(--u) * ${0.574 * side}))` })} />
              ))}
            </div>
          </div>
          <div className="yfb-tilt" style={{ transform: "rotateX(72deg) rotateY(17deg)" }}>
            <i className="yfb-o yfb-dash-ice yfb-anim" style={orb(2.44, 45)} />
          </div>
          <div className="yfb-tilt" style={{ transform: "rotateX(-63deg) rotateY(-29deg)" }}>
            <i className="yfb-o yfb-arcs yfb-anim yfb-rev" style={orb(2.6, 70)} />
          </div>
        </div>
        <i className="yfb-o yfb-light" style={orb(1.7)} />
        <i className="yfb-o yfb-ticks yfb-anim" style={orb(2.9, 160)} />
        <i className="yfb-o yfb-majors yfb-anim" style={orb(2.98, 160)} />
        <i className="yfb-o yfb-arcs yfb-anim yfb-rev" style={orb(3.24, 100)} />
        <i className="yfb-o yfb-dash yfb-anim" style={orb(3.72, 220)} />
      </div>
    </div>
  );
}
