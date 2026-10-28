"use client";

import { useFrame, type RootState } from "@react-three/fiber";
import { useState } from "react";
import * as THREE from "three";
import { cameraDistance, stageInsets } from "@/lib/layout";
import { store } from "@/lib/store";
import { voice } from "@/lib/voice";
import { particleFragment, particleVertex, wireFragment, wireVertex } from "./shaders";

const DEEP = new THREE.Color("#0b4a99");
const ICE = new THREE.Color("#bfe8ff");
const CYAN = new THREE.Color("#3db8ff");
const WHITE = new THREE.Color("#ffffff");
const RING_DEEP = DEEP.clone().multiplyScalar(2.2);

function fibonacciSphere(count: number, scatterMin: number, scatterMax: number) {
  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dir = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions.set([Math.cos(theta) * r, y, Math.sin(theta) * r], i * 3);
    dir.randomDirection().multiplyScalar(scatterMin + Math.random() * (scatterMax - scatterMin));
    scatter.set([dir.x, dir.y, dir.z], i * 3);
    seeds[i] = Math.random();
    sizes[i] = 0.6 + Math.random() * 1.6;
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

function lineMaterial(color: THREE.Color, opacity: number) {
  return new THREE.LineBasicMaterial({ color, opacity, ...additive });
}

type Ring = { object: THREE.LineSegments; material: THREE.LineBasicMaterial; speed: number; base: number };

/**
 * Yui's core, built imperatively: wire lattice + fine mesh + particle shell, a glow sprite
 * and HUD rings. `update` runs every frame and drives everything from the voice level.
 */
class CoreRig {
  readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly spin = new THREE.Group();
  private readonly hud = new THREE.Group();
  private readonly glow: THREE.Sprite;
  private readonly rings: Ring[] = [];
  private readonly lattice: THREE.ShaderMaterial;
  private readonly mesh: THREE.ShaderMaterial;
  private readonly offset = new THREE.Vector2();
  private readonly scale = new THREE.Vector3(1, 1, 1);
  private readonly shared = { uTime: { value: 0 }, uBass: { value: 0 }, uTreble: { value: 0 }, uEnergy: { value: 0 }, uAssemble: { value: 0 } };

  constructor(compact: boolean) {
    const wire = (colorB: THREE.Color) =>
      new THREE.ShaderMaterial({
        vertexShader: wireVertex,
        fragmentShader: wireFragment,
        uniforms: { ...this.shared, uColorA: { value: DEEP }, uColorB: { value: colorB }, uOpacity: { value: 0 } },
        ...additive,
      });
    this.lattice = wire(ICE);
    this.mesh = wire(CYAN);
    this.mesh.wireframe = true;

    const particles = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        ...this.shared,
        uColorA: { value: CYAN },
        uColorB: { value: WHITE },
        uOpacity: { value: 1 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      ...additive,
    });

    const latticeGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1, compact ? 4 : 5));
    this.spin.add(new THREE.Points(fibonacciSphere(compact ? 2600 : 5200, 3.5, 11), particles));
    this.spin.add(new THREE.LineSegments(latticeGeo, this.lattice));
    // Kept coarse on purpose: a denser mesh turns into shimmering moiré under bloom.
    this.spin.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.985, compact ? 6 : 8), this.mesh));

    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), ...additive }));

    const ringSpecs: { geo: THREE.BufferGeometry; color: THREE.Color; base: number; speed: number; tilt: [number, number, number] }[] = [
      { geo: tickRing(1.42, 180, 0.03, 5), color: CYAN, base: 0.45, speed: 0.05, tilt: [0, 0, 0] },
      { geo: arcs(1.62, [[10, 70], [130, 160], [200, 290], [320, 340]]), color: ICE, base: 0.7, speed: -0.12, tilt: [0, 0, 0] },
      { geo: tickRing(1.86, 72, 0.025, 6), color: RING_DEEP, base: 0.45, speed: -0.03, tilt: [0, 0, 0] },
      { geo: arcs(1.22, [[0, 360]]), color: CYAN, base: 0.35, speed: 0.25, tilt: [1.25, 0.3, 0] },
      { geo: arcs(1.3, [[0, 120], [180, 300]]), color: ICE, base: 0.3, speed: -0.18, tilt: [-1.1, -0.5, 0] },
    ];
    for (const spec of ringSpecs) {
      const material = lineMaterial(spec.color, 0);
      const object = new THREE.LineSegments(spec.geo, material);
      const holder = new THREE.Group();
      holder.rotation.set(...spec.tilt);
      holder.add(object);
      this.hud.add(holder);
      this.rings.push({ object, material, speed: spec.speed, base: spec.base });
    }

    this.body.add(this.spin, this.glow, this.hud);
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
    this.mesh.uniforms.uOpacity.value = wire * 0.2;

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

    this.spin.rotation.y += delta * (0.12 + lvl.energy * 0.25);
    this.spin.rotation.x = THREE.MathUtils.lerp(this.spin.rotation.x, -pointer.y * 0.35, delta * 2);
    this.spin.rotation.z = THREE.MathUtils.lerp(this.spin.rotation.z, pointer.x * 0.2, delta * 2);
    this.hud.rotation.x = THREE.MathUtils.lerp(this.hud.rotation.x, -pointer.y * 0.12, delta * 2);
    this.hud.rotation.y = THREE.MathUtils.lerp(this.hud.rotation.y, pointer.x * 0.18, delta * 2);

    const ringFade = THREE.MathUtils.smoothstep(a, 0.85, 1);
    for (const r of this.rings) {
      r.object.rotation.z += delta * r.speed * (1 + lvl.energy * 1.2);
      r.material.opacity = ringFade * r.base * (0.85 + lvl.energy * 0.3);
    }

    // The inner light breathes slowly; speech only swells it a little.
    const g = (0.92 + lvl.bass * 0.3 + Math.sin(t * 0.9) * 0.03) * (0.4 + a * 0.6);
    this.glow.scale.setScalar(g * 1.5);
    this.glow.material.opacity = 0.3 + a * 0.4 + lvl.energy * 0.1;
  }
}

export function Core({ compact }: { compact: boolean }) {
  const [rig] = useState(() => new CoreRig(compact));
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
