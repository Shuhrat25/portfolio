"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { store, useStore } from "@/lib/store";
import { eggEndsAt } from "@/lib/yui";

// Chat easter-egg overlays: /matrix (glyph rain) and /glitch (signal interference).
// Both play only after a command and switch themselves off; reduced motion skips them.

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED).matches,
    () => true,
  );
}

export function Eggs() {
  const egg = useStore((s) => s.egg);
  const reduced = useReducedMotion();
  // Never leave an egg switched on behind us.
  useEffect(() => () => store.set({ egg: null }), []);
  if (reduced || !egg) return null;
  return egg === "matrix" ? <Matrix /> : <Glitch />;
}

/* ───────────────────────────── /matrix ───────────────────────────── */

const KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CYRILLIC = "БГДЖЗИЙЛПФЦЧШЩЪЫЬЭЮЯ";
const DIGITS = "0123456789";
// Katakana and digits weighted up, as in the film.
const GLYPHS = [...(KATAKANA + KATAKANA + LATIN + CYRILLIC + DIGITS + DIGITS)];
const NEON = "#3ee0ff";
const PINK = "#ff2e88";
const HEAD = "#dff9ff";
const CELL = 20; // px per glyph cell
const TICK = 55; // ms per rain step
const PEAK = 0.85; // keeps the core and HUD readable through the rain
const FADE_IN = 600;
const FADE_OUT = 1000;

type Drop = { y: number; speed: number; glyph: string; pink: boolean };

const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
const drop = (y: number): Drop => ({ y, speed: 0.55 + Math.random() * 0.45, glyph: pick(), pink: false });

/** Glyph rain on a transparent canvas; trails fade with destination-out so the scene shows through. */
class Rain {
  private drops: Drop[] = [];
  private w = 0;
  private h = 0;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private alpha = 0;
  private readonly font: string;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
  ) {
    // JetBrains Mono covers Latin and Cyrillic; katakana falls back to a system CJK font.
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim();
    this.font = `${Math.round(CELL * 0.8)}px ${mono ? `${mono}, ` : ""}"MS Gothic", "Yu Gothic", "Hiragino Sans", "Noto Sans JP", monospace`;
  }

  start() {
    this.resize();
    window.addEventListener("resize", this.resize);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
  }

  private readonly resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    const { ctx } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = this.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    // Staggered just above the top edge, so the screen fills within a second.
    const rows = this.h / CELL;
    this.drops = Array.from({ length: Math.ceil(this.w / CELL) }, () => drop(-Math.random() * rows * 0.5));
  };

  private readonly frame = (now: number) => {
    const dt = Math.min(100, now - this.last);
    this.last = now;
    // Rises gently (also when the egg is extended), follows the deadline down over the last second.
    const target = Math.max(0, Math.min(1, (eggEndsAt() - now) / FADE_OUT)) * PEAK;
    this.alpha = Math.min(target, this.alpha + (dt / FADE_IN) * PEAK);
    this.canvas.style.opacity = this.alpha.toFixed(3);
    this.acc += dt;
    if (this.acc >= TICK) {
      this.acc %= TICK;
      this.step();
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  private step() {
    const { ctx, w, h } = this;
    // Trails fade a little every step (the head glow is off here, or its shadow would erase too).
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    const rows = h / CELL;
    this.drops.forEach((d, i) => {
      const prev = Math.floor(d.y);
      d.y += d.speed;
      const row = Math.floor(d.y);
      if (row === prev) return;
      const x = i * CELL + CELL / 2;
      // The old head settles into the trail colour.
      if (prev >= 0 && prev <= rows) {
        ctx.clearRect(i * CELL, prev * CELL, CELL, CELL);
        ctx.shadowBlur = 0;
        ctx.fillStyle = d.pink ? PINK : NEON;
        ctx.fillText(d.glyph, x, prev * CELL);
      }
      if (row > rows) {
        if (Math.random() < 0.04) Object.assign(d, drop(-Math.random() * 6));
        return;
      }
      if (row < 0) return;
      d.glyph = pick();
      d.pink = Math.random() < 0.035;
      ctx.shadowColor = NEON;
      ctx.shadowBlur = 8;
      ctx.fillStyle = HEAD;
      ctx.fillText(d.glyph, x, row * CELL);
    });
  }
}

/** Over the scene and frame (z-10), under the subtitles (Stage, z-20) and the dock/panels (z-30). */
function Matrix() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rain = new Rain(canvas, ctx);
    rain.start();
    return () => rain.stop();
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[15] h-full w-full opacity-0" />;
}

/* ───────────────────────────── /glitch ───────────────────────────── */

const FILTER_ID = "yui-glitch";
// Quantised noise → displacement per horizontal band; 0.5 means "not shifted", so most bands stay put.
const BANDS = "0.5 0.5 0.12 0.5 0.7 0.5 0.5 0.32 0.5 0.78 0.5 0.4 0.5 0.88 0.5 0.5";

type GlitchNodes = { noise: SVGFETurbulenceElement; shift: SVGFEDisplacementMapElement; red: SVGFEOffsetElement; cyan: SVGFEOffsetElement };

/**
 * Runs the SVG filter over the whole page (<main>) for the length of the egg: horizontal bands
 * slide sideways and the red channel parts from green/blue by a few pixels. Screen-blending the
 * split channels rebuilds the original colours, so nothing gets brighter.
 */
class Interference {
  private raf = 0;
  private next = 0;
  private started = 0;
  private previous = "";

  constructor(
    private readonly target: HTMLElement,
    private readonly nodes: GlitchNodes,
  ) {}

  start() {
    this.previous = this.target.style.filter;
    this.target.style.filter = `url(#${FILTER_ID})`;
    this.started = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.target.style.filter = this.previous;
  }

  private readonly frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    if (now < this.next) return;
    // A new slicing roughly ten times a second; easing in and out at the edges of the egg.
    this.next = now + 70 + Math.random() * 50;
    const env = Math.max(0, Math.min(1, (now - this.started) / 150, (eggEndsAt() - now) / 350));
    const calm = env === 0 || Math.random() < 0.25;
    const { noise, shift, red, cyan } = this.nodes;
    noise.setAttribute("seed", String(1 + Math.floor(Math.random() * 999)));
    noise.setAttribute("baseFrequency", `0.00001 ${(0.012 + Math.random() * 0.04).toFixed(4)}`);
    shift.setAttribute("scale", calm ? "0" : (env * (30 + Math.random() * 50)).toFixed(1));
    const split = env * (1 + Math.random() * 2.5);
    red.setAttribute("dx", split.toFixed(1));
    cyan.setAttribute("dx", (-split * 0.5).toFixed(1));
  };
}

function Glitch() {
  const svg = useRef<SVGSVGElement>(null);
  const noise = useRef<SVGFETurbulenceElement>(null);
  const shift = useRef<SVGFEDisplacementMapElement>(null);
  const red = useRef<SVGFEOffsetElement>(null);
  const cyan = useRef<SVGFEOffsetElement>(null);
  useEffect(() => {
    const target = svg.current?.closest("main");
    if (!target || !noise.current || !shift.current || !red.current || !cyan.current) return;
    const fx = new Interference(target, { noise: noise.current, shift: shift.current, red: red.current, cyan: cyan.current });
    fx.start();
    return () => fx.stop();
  }, []);
  // Zero-sized rather than display:none, which would disable the filter in some browsers.
  return (
    <svg ref={svg} aria-hidden className="pointer-events-none fixed left-0 top-0 h-0 w-0">
      <filter id={FILTER_ID} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence ref={noise} type="fractalNoise" baseFrequency="0.00001 0.03" numOctaves={1} seed={1} result="noise" />
        <feComponentTransfer in="noise" result="bands">
          <feFuncR type="discrete" tableValues={BANDS} />
          <feFuncG type="table" tableValues="0.5 0.5" />
          <feFuncA type="table" tableValues="1 1" />
        </feComponentTransfer>
        <feDisplacementMap ref={shift} in="SourceGraphic" in2="bands" scale={0} xChannelSelector="R" yChannelSelector="G" result="shifted" />
        <feColorMatrix in="shifted" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset ref={red} in="r" dx={0} result="rShift" />
        <feColorMatrix in="shifted" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
        <feOffset ref={cyan} in="gb" dx={0} result="gbShift" />
        <feBlend in="rShift" in2="gbShift" mode="screen" />
      </filter>
    </svg>
  );
}
