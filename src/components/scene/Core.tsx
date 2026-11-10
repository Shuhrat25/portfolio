"use client";

import { useFrame, type RootState } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import type { PanelId } from "@/content/ui";
import { cameraDistance, stageInsets } from "@/lib/layout";
import { MENU_ANGLES } from "@/lib/menu-layout";
import { store } from "@/lib/store";
import { voice } from "@/lib/voice";
import { particleFragment, particleVertex, wireFragment, wireVertex } from "./shaders";

const DEEP = new THREE.Color("#0b4a99");
const ICE = new THREE.Color("#bfe8ff");
const CYAN = new THREE.Color("#3db8ff");
const WHITE = new THREE.Color("#ffffff");
const RING_DEEP = DEEP.clone().multiplyScalar(2.2);
const PINK = "#ff2e88";

const luma = (c: THREE.Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

/**
 * `hex` lit to the luminance of `ref` (times `gain`). Bloom keys off luminance, so a section hue
 * built this way reads as a colour change, never as a flash. Channels may go a little above 1:
 * the composer renders in half float, so the bloom still sees the full value.
 */
function tone(hex: string, ref: THREE.Color, gain = 1) {
  const c = new THREE.Color(hex);
  const want = luma(ref) * gain;
  c.multiplyScalar(Math.min(want / Math.max(luma(c), 1e-3), 1.6 / Math.max(c.r, c.g, c.b, 1e-3)));
  // Still short (a saturated hue at the cap): lift it towards white by exactly the missing amount.
  const short = want - luma(c);
  if (short > 0) c.addScalar(short);
  return c;
}

/** Every colour of the core: lattice, fine mesh, particles, the three ring tones and the glow. */
const SLOTS = ["latA", "latB", "meshA", "meshB", "dotA", "dotB", "ringCyan", "ringIce", "ringDeep", "glow"] as const;
type Slot = (typeof SLOTS)[number];
type Palette = Record<Slot, THREE.Color>;

const BASE: Palette = {
  latA: DEEP,
  latB: ICE,
  meshA: DEEP,
  meshB: CYAN,
  dotA: CYAN,
  dotB: WHITE,
  ringCyan: CYAN,
  ringIce: ICE,
  ringDeep: RING_DEEP,
  glow: WHITE,
};

/** Sections with their own hue; every other one keeps the base palette. */
const SECTION_PALETTES: Partial<Record<PanelId, Palette>> = {
  // Neon pink, with the lattice rim, the highlights and one ring tone still cyan.
  cardinal: {
    latA: tone("#5c0f46", DEEP),
    latB: tone("#9ff0ff", ICE),
    meshA: tone("#5c0f46", DEEP),
    meshB: tone(PINK, CYAN),
    dotA: tone(PINK, CYAN),
    dotB: tone("#c8f6ff", WHITE),
    ringCyan: tone(PINK, CYAN),
    ringIce: tone("#9ff0ff", ICE),
    ringDeep: tone("#b0207a", RING_DEEP),
    glow: tone("#ffb8dc", WHITE),
  },
  order: {
    latA: tone("#2a1580", DEEP),
    latB: tone("#d9c8ff", ICE),
    meshA: tone("#2a1580", DEEP),
    meshB: tone("#8a4dff", CYAN),
    dotA: tone("#8a4dff", CYAN),
    dotB: tone("#eee6ff", WHITE),
    ringCyan: tone("#8a4dff", CYAN),
    ringIce: tone("#d9c8ff", ICE),
    ringDeep: tone("#4a23b8", RING_DEEP),
    glow: tone("#e2d4ff", WHITE),
  },
  // Whiter and a step brighter: the only palette above the base level, reached as smoothly.
  contacts: {
    latA: tone("#1a5fb0", DEEP, 1.3),
    latB: tone("#eefaff", ICE, 1.18),
    meshA: tone("#1a5fb0", DEEP, 1.3),
    meshB: tone("#8fdcff", CYAN, 1.4),
    dotA: tone("#8fdcff", CYAN, 1.4),
    dotB: WHITE,
    ringCyan: tone("#8fdcff", CYAN, 1.35),
    ringIce: tone("#eefaff", ICE, 1.18),
    ringDeep: tone("#3b8ae6", RING_DEEP, 1.3),
    glow: tone("#f2fbff", WHITE, 1.12),
  },
};

function clonePalette(p: Palette): Palette {
  return Object.fromEntries(SLOTS.map((slot) => [slot, p[slot].clone()])) as Palette;
}

/**
 * What a rebuilt rig (the quality level changed) picks up from the one before it, so the core
 * neither falls apart into dust again nor jumps in place or colour. The live rig writes it every frame.
 */
const carry = { assemble: 0, offset: new THREE.Vector2(), scale: 1, lean: new THREE.Vector2(), tint: clonePalette(BASE) };

function fibonacciSphere(count: number, scatterMin: number, scatterMax: number, sizeScale: number) {
  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dir = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    positions.set([Math.cos(theta) * r, y, Math.sin(theta) * r], i * 3);
    dir.randomDirection().multiplyScalar(scatterMin + Math.random() * (scatterMax - scatterMin));
    scatter.set([dir.x, dir.y, dir.z], i * 3);
    seeds[i] = Math.random();
    sizes[i] = (0.6 + Math.random() * 1.6) * sizeScale;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  return geometry;
}

/** Tick-mark ring like a HUD dial; every `major`-th tick is longer. */
function tickRing(radius: number, count: number, length: number, major: number) {
  const pts: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const len = i % major === 0 ? length * 2.4 : length;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pts.push(c * radius, s * radius, 0, c * (radius + len), s * (radius + len), 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Several arc segments on one circle. */
function arcs(radius: number, segments: [number, number][]) {
  const pts: number[] = [];
  for (const [from, to] of segments) {
    const steps = Math.max(8, Math.round((to - from) / 2));
    for (let i = 0; i < steps; i++) {
      const a0 = THREE.MathUtils.degToRad(from + ((to - from) * i) / steps);
      const a1 = THREE.MathUtils.degToRad(from + ((to - from) * (i + 1)) / steps);
      pts.push(Math.cos(a0) * radius, Math.sin(a0) * radius, 0, Math.cos(a1) * radius, Math.sin(a1) * radius, 0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function glowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(150,220,255,0.75)");
  g.addColorStop(0.45, "rgba(40,130,255,0.22)");
  g.addColorStop(1, "rgba(0,40,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;

/** The material keeps `color` itself (not a copy), so easing the palette recolours it. */
function lineMaterial(color: THREE.Color) {
  const material = new THREE.LineBasicMaterial({ opacity: 0, ...additive });
  material.color = color;
  return material;
}

/** Exponential easing factor: frame-rate independent and never overshoots after a long frame. */
const ease = (rate: number, delta: number) => 1 - Math.exp(-rate * delta);

type Ring = { object: THREE.LineSegments; material: THREE.LineBasicMaterial; speed: number; base: number };

/**
 * Yui's core, built imperatively: wire lattice + fine mesh + particle shell, a glow sprite
 * and HUD rings. `update` runs every frame and drives everything from the voice level, the
 * open section (hue) and the hovered menu item (lean). Lite builds fewer particles, a coarser
 * lattice and no fine mesh.
 */
class CoreRig {
  readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  /** Leans the shell and lattice towards the hovered menu item, on top of the pointer tilt. */
  private readonly tilt = new THREE.Group();
  private readonly spin = new THREE.Group();
  private readonly hud = new THREE.Group();
  private readonly glow: THREE.Sprite;
  private readonly rings: Ring[] = [];
  private readonly lattice: THREE.ShaderMaterial;
  private readonly mesh: THREE.ShaderMaterial | null = null;
  /** Live colours. Uniforms and materials hold these very objects, so easing them is enough. */
  private readonly tint = clonePalette(carry.tint);
  private readonly lean = carry.lean.clone();
  private readonly leanTarget = new THREE.Vector2();
  private readonly offset = carry.offset.clone();
  private readonly scale = new THREE.Vector3(1, 1, 1);
  private readonly shared = { uTime: { value: 0 }, uBass: { value: 0 }, uTreble: { value: 0 }, uEnergy: { value: 0 }, uAssemble: { value: carry.assemble } };
  private holds = 0;

  constructor(compact: boolean, lite: boolean) {
    const t = this.tint;
    const wire = (colorA: THREE.Color, colorB: THREE.Color) =>
      new THREE.ShaderMaterial({
        vertexShader: wireVertex,
        fragmentShader: wireFragment,
        uniforms: { ...this.shared, uColorA: { value: colorA }, uColorB: { value: colorB }, uOpacity: { value: 0 } },
        ...additive,
      });
    this.lattice = wire(t.latA, t.latB);

    const particles = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        ...this.shared,
        uColorA: { value: t.dotA },
        uColorB: { value: t.dotB },
        uOpacity: { value: 1 },
        // Lite renders at dpr 1, so points are sized for that buffer.
        uPixelRatio: { value: lite ? 1 : Math.min(window.devicePixelRatio, 2) },
      },
      ...additive,
    });

    // Lite: about a third of the particles (a little larger, so the shell still reads) and a coarser lattice.
    const count = lite ? (compact ? 900 : 1700) : compact ? 2600 : 5200;
    const latticeGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1, lite ? 3 : compact ? 4 : 5));
    this.spin.add(new THREE.Points(fibonacciSphere(count, 3.5, 11, lite ? 1.25 : 1), particles));
    this.spin.add(new THREE.LineSegments(latticeGeo, this.lattice));
    if (!lite) {
      this.mesh = wire(t.meshA, t.meshB);
      this.mesh.wireframe = true;
      // Kept coarse on purpose: a denser mesh turns into shimmering moiré under bloom.
      this.spin.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.985, compact ? 6 : 8), this.mesh));
    }

    const glowMaterial = new THREE.SpriteMaterial({ map: glowTexture(), ...additive });
    glowMaterial.color = t.glow;
    this.glow = new THREE.Sprite(glowMaterial);

    const ringSpecs: { geo: THREE.BufferGeometry; slot: Slot; base: number; speed: number; tilt: [number, number, number] }[] = [
      { geo: tickRing(1.42, 180, 0.03, 5), slot: "ringCyan", base: 0.45, speed: 0.05, tilt: [0, 0, 0] },
      { geo: arcs(1.62, [[10, 70], [130, 160], [200, 290], [320, 340]]), slot: "ringIce", base: 0.7, speed: -0.12, tilt: [0, 0, 0] },
      { geo: tickRing(1.86, 72, 0.025, 6), slot: "ringDeep", base: 0.45, speed: -0.03, tilt: [0, 0, 0] },
      { geo: arcs(1.22, [[0, 360]]), slot: "ringCyan", base: 0.35, speed: 0.25, tilt: [1.25, 0.3, 0] },
      { geo: arcs(1.3, [[0, 120], [180, 300]]), slot: "ringIce", base: 0.3, speed: -0.18, tilt: [-1.1, -0.5, 0] },
    ];
    for (const spec of ringSpecs) {
      const material = lineMaterial(t[spec.slot]);
      const object = new THREE.LineSegments(spec.geo, material);
      const holder = new THREE.Group();
      holder.rotation.set(...spec.tilt);
      holder.add(object);
      this.hud.add(holder);
      this.rings.push({ object, material, speed: spec.speed, base: spec.base });
    }

    this.tilt.add(this.spin);
    this.body.add(this.tilt, this.glow, this.hud);
    this.body.position.set(this.offset.x, this.offset.y, 0);
    this.body.scale.setScalar(carry.scale);
    this.root.add(this.body);
  }

  update(state: RootState, delta: number) {
    const s = store.get();
    const { camera, size, pointer } = state;
    const t = state.clock.elapsedTime;
    const lvl = voice.sample();
    const u = this.shared;
    u.uTime.value = t;
    u.uBass.value = lvl.bass;
    u.uTreble.value = lvl.treble;
    u.uEnergy.value = lvl.energy;

    // Keep the core and its rings inside the screen on any aspect ratio.
    const persp = camera as THREE.PerspectiveCamera;
    const z = cameraDistance(size.width / size.height);
    if (Math.abs(persp.position.z - z) > 1e-3) {
      persp.position.z = z;
      persp.updateProjectionMatrix();
    }

    // Assembly: scattered dust during onboarding, converges into the core while booting.
    const target = s.phase === "boot" || s.phase === "live" ? 1 : 0;
    const rate = target > u.uAssemble.value ? 0.32 : 0.8;
    u.uAssemble.value = THREE.MathUtils.clamp(u.uAssemble.value + Math.sign(target - u.uAssemble.value) * delta * rate, 0, 1);
    const a = u.uAssemble.value;
    const wire = THREE.MathUtils.smoothstep(a, 0.7, 1);
    this.lattice.uniforms.uOpacity.value = wire * 0.55;
    if (this.mesh) this.mesh.uniforms.uOpacity.value = wire * 0.2;

    // Stay centred in the free area (same rule as the DOM stage).
    const visibleH = 2 * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2)) * persp.position.z;
    const visibleW = visibleH * persp.aspect;
    const inset = stageInsets(size.width, size.height, s.panel !== null, s.phase === "live");
    const k = Math.min(1, delta * 3);
    this.offset.x += (-(inset.right / 2 / size.width) * visibleW - this.offset.x) * k;
    this.offset.y += (((inset.bottom - inset.top) / 2 / size.height) * visibleH - this.offset.y) * k;
    this.body.position.set(this.offset.x, this.offset.y, 0);
    const scale = (inset.sheet ? 0.6 : s.panel ? 0.78 : 1) * (1 + lvl.bass * 0.04);
    this.scale.setScalar(scale);
    this.body.scale.lerp(this.scale, Math.min(1, delta * 4));

    // Section hue: every colour eases to the open section's palette in about a second. The
    // palettes share one luminance and the blend is linear, so the brightness holds through it.
    const palette = (s.panel && SECTION_PALETTES[s.panel]) || BASE;
    const hue = ease(3.5, delta);
    for (const slot of SLOTS) this.tint[slot].lerp(palette[slot], hue);

    // Lean towards the hovered menu item (0° = right, counter-clockwise; world y is up as on
    // screen), easing back when nothing is hovered. Tipping the front towards (x, y) is a
    // rotation about (-y, x, 0); the inner light slides a few percent of the radius that way.
    const deg = s.hover ? MENU_ANGLES[s.hover] : undefined;
    if (deg === undefined) this.leanTarget.set(0, 0);
    else this.leanTarget.set(Math.cos(THREE.MathUtils.degToRad(deg)), Math.sin(THREE.MathUtils.degToRad(deg)));
    this.lean.lerp(this.leanTarget, ease(3, delta));
    const { x: lx, y: ly } = this.lean;
    this.tilt.rotation.set(-ly * 0.14, lx * 0.14, 0);
    this.glow.position.set(lx * 0.045, ly * 0.045, 0);

    this.spin.rotation.y += delta * (0.12 + lvl.energy * 0.25);
    this.spin.rotation.x = THREE.MathUtils.damp(this.spin.rotation.x, -pointer.y * 0.35, 2, delta);
    this.spin.rotation.z = THREE.MathUtils.damp(this.spin.rotation.z, pointer.x * 0.2, 2, delta);
    this.hud.rotation.x = THREE.MathUtils.damp(this.hud.rotation.x, -pointer.y * 0.12 - ly * 0.16, 2, delta);
    this.hud.rotation.y = THREE.MathUtils.damp(this.hud.rotation.y, pointer.x * 0.18 + lx * 0.16, 2, delta);

    const ringFade = THREE.MathUtils.smoothstep(a, 0.85, 1);
    for (const r of this.rings) {
      r.object.rotation.z += delta * r.speed * (1 + lvl.energy * 1.2);
      r.material.opacity = ringFade * r.base * (0.85 + lvl.energy * 0.3);
    }

    // The inner light breathes slowly; speech only swells it a little.
    const g = (0.92 + lvl.bass * 0.3 + Math.sin(t * 0.9) * 0.03) * (0.4 + a * 0.6);
    this.glow.scale.setScalar(g * 1.5);
    this.glow.material.opacity = 0.3 + a * 0.4 + lvl.energy * 0.1;

    carry.assemble = a;
    carry.offset.copy(this.offset);
    carry.scale = this.body.scale.x;
    carry.lean.copy(this.lean);
    for (const slot of SLOTS) carry.tint[slot].copy(this.tint[slot]);
  }

  retain() {
    this.holds += 1;
  }

  /**
   * Frees the GPU side once nothing holds the rig; a StrictMode remount takes it back at once.
   * The delay lets a replacement rig (quality change) compile against the still-cached shader
   * programs first, instead of recompiling them after they were deleted.
   */
  release() {
    this.holds -= 1;
    setTimeout(() => {
      if (this.holds === 0) this.dispose();
    }, 500);
  }

  private dispose() {
    // The sprite's quad geometry is shared by every sprite in three.js, so only its material goes.
    this.root.traverse((object) => {
      if (object instanceof THREE.Points || object instanceof THREE.LineSegments || object instanceof THREE.Mesh) {
        object.geometry.dispose();
        (object.material as THREE.Material).dispose();
      }
    });
    this.glow.material.map?.dispose();
    this.glow.material.dispose();
  }
}

export function Core({ compact, lite }: { compact: boolean; lite: boolean }) {
  const [rig] = useState(() => new CoreRig(compact, lite));
  useEffect(() => {
    rig.retain();
    return () => rig.release();
  }, [rig]);
  useFrame((state, delta) => rig.update(state, delta));
  return <primitive object={rig.root} />;
}

function dustGeometry(count: number) {
  const pos = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    v.randomDirection().multiplyScalar(6 + Math.random() * 20);
    pos.set([v.x, v.y, v.z - 6], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(
    g,
    new THREE.PointsMaterial({ color: "#2a6fd6", size: 0.05, sizeAttenuation: true, opacity: 0.6, ...additive }),
  );
  return { points, update: (delta: number) => void (points.rotation.y += delta * 0.01) };
}

/** Slow distant dust that is always there, even before the core assembles. */
export function Dust({ count }: { count: number }) {
  const [dust] = useState(() => dustGeometry(count));
  useFrame((_, delta) => dust.update(delta));
  return <primitive object={dust.points} />;
}
