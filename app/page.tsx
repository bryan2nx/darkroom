"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls, RoundedBox, Billboard } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, BrightnessContrast } from "@react-three/postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getPhotos, PHOTO_COUNT } from "./lib/photos";
import {
  useDarkroom,
  STATE_DURATIONS,
  STATE_CAPTION,
  type DarkroomState,
} from "./lib/state";

/**
 * Scene Study 01 — Darkroom. Interactive rooms.xyz-register diorama.
 *
 * Wave 4 · light
 *   - Two lighting modes (darkroom default, room on switch-flip)
 *   - Palette swaps on mode; volumetric cones + bloom crossfade smoothly
 *   - Safelight emits a red spill cone in darkroom mode
 *   - Enlarger beams a visible cone of light during `expose`
 *   - Timer pointer sweeps during timed states
 *   - Subtle wet-shimmer on paper in trays / sink
 *   - Emergence halo blooms behind the photo during `develop`
 */

/* ---------------- Palettes ---------------- */

// Room mode — the natural palette, what the darkroom looks like under
// overhead work lights. This is the "normal" reference.
const ROOM_P = {
  floor: "#6E4A38",
  wallBack: "#F4E4CC",
  wallLeft: "#B04A42",
  counter: "#936440",
  counterTop: "#A88162",
  enlargerBody: "#2A2420",
  enlargerGlow: "#FFE6A0",
  brass: "#D4A84B",
  trayEnamel: "#F2EDE0",
  trayRim: "#2A2420",
  devFluid: "#C28744",
  stopFluid: "#B07E3E",
  fixFluid: "#9E7538",
  safelight: "#C85644",
  safelightBody: "#3A2E26",
  safelightDim: "#88503E",
  wire: "#4A3E34",
  clip: "#D4A84B",
  bottleAmber: "#8A4A1C",
  bottleGreen: "#5A5A2C",
  bottleCap: "#1A1816",
  pageBg: "#3B2920",
  canvasBg: "#3B2920",
  timerBody: "#2A2420",
  timerFace: "#E8DCC4",
  timerHand: "#A63E3A",
  jar: "#D9C9A8",
  tongs: "#2A2420",
  paperBox: "#3E3228",
  paperBoxLid: "#4A3C30",
  negCarrier: "#3C342E",
  negStrip: "#0D0A08",
  contactSheet: "#E8DCC4",
  contactGrid: "#3A2A22",
  pinnedPrint: "#D8C4A8",
  clockFace: "#E8DCC4",
  clockBezel: "#2A2420",
  clockHand: "#2E2924",
  switchPlate: "#E8DCC4",
  switchToggle: "#2E2924",
  outlet: "#E8DCC4",
  outletHole: "#0D0A08",
  sinkWater: "#A8B8BC",
  crate: "#8B6340",
  crateSlat: "#5A3E28",
  binBody: "#443830",
  binRim: "#2E2418",
  testStrip: "#D8C8A8",
  towel: "#B8A888",
  towelFold: "#C8B898",
  dryingPaperBack: "#E8DCC4",
  chipBg: "#2A2520",
  chipText: "#E8DCC4",
  // Wave 5 — lived-in
  ashGlass: "#2A2A2C",
  ashRim: "#181818",
  cigBody: "#E8E2D4",
  cigEmber: "#FFAA44",
  mug: "#E6E0D4",
  mugDark: "#B8AC9C",
  coffee: "#3C2418",
  loupeBody: "#3C3C3C",
  loupeLens: "#080808",
  stoolWheel: "#1A1A1A",
  stoolFrame: "#3C3C3C",
  stoolSeat: "#3E2820",
  paperNews: "#E8E0CC",
  paperNewsBand: "#1E1E1E",
  jacket: "#5A4A30",
  jacketDark: "#3E3320",
  hook: "#6A6A6A",
};

// Darkroom mode — the room under deep-red safelight. Everything is
// soaked in red; "cream" surfaces read pink-rust, wood reads blood-brown,
// shadows go nearly black. This is where the work happens.
const DARK_P: typeof ROOM_P = {
  floor: "#2C120E",
  wallBack: "#6A2A22",
  wallLeft: "#8C2A26",
  counter: "#3E1C14",
  counterTop: "#4E241C",
  enlargerBody: "#1A0908",
  enlargerGlow: "#FFF0B0",
  brass: "#B89040",
  trayEnamel: "#C88A7A",
  trayRim: "#1A0908",
  devFluid: "#8A4520",
  stopFluid: "#7A381A",
  fixFluid: "#6A2E14",
  safelight: "#FF3828",
  safelightBody: "#180806",
  safelightDim: "#923020",
  wire: "#221010",
  clip: "#A87830",
  bottleAmber: "#6A2810",
  bottleGreen: "#4A3820",
  bottleCap: "#100604",
  pageBg: "#0A0404",
  canvasBg: "#0A0404",
  timerBody: "#180A08",
  timerFace: "#C88A7A",
  timerHand: "#FF3828",
  jar: "#A06858",
  tongs: "#180A08",
  paperBox: "#1A0A08",
  paperBoxLid: "#22120E",
  negCarrier: "#2A1410",
  negStrip: "#080202",
  contactSheet: "#C88A7A",
  contactGrid: "#2A100C",
  pinnedPrint: "#B07060",
  clockFace: "#C88A7A",
  clockBezel: "#180A08",
  clockHand: "#2A100C",
  switchPlate: "#C88A7A",
  switchToggle: "#180A08",
  outlet: "#C88A7A",
  outletHole: "#080202",
  sinkWater: "#6A484C",
  crate: "#4A2014",
  crateSlat: "#1C0A06",
  binBody: "#180C0A",
  binRim: "#0C0504",
  testStrip: "#B07060",
  towel: "#6E4030",
  towelFold: "#8A543E",
  dryingPaperBack: "#C88A7A",
  chipBg: "#1A0A08",
  chipText: "#C88A7A",
  // Wave 5 — lived-in (red-drenched)
  ashGlass: "#1A0808",
  ashRim: "#0C0404",
  cigBody: "#C08878",
  cigEmber: "#FFAA44",
  mug: "#C08878",
  mugDark: "#8C5E50",
  coffee: "#2A100C",
  loupeBody: "#2A1818",
  loupeLens: "#060202",
  stoolWheel: "#0C0606",
  stoolFrame: "#2A1818",
  stoolSeat: "#2C100A",
  paperNews: "#A06850",
  paperNewsBand: "#120604",
  jacket: "#3C2414",
  jacketDark: "#28180C",
  hook: "#4A2820",
};

const COUNTER_Y = 0.92;

/* ---------------- Drying line slots ---------------- */

type DrySlot = { x: number; w: number; h: number; tilt: number };

const DRY_SLOTS: DrySlot[] = [
  { x: -0.9, w: 0.18, h: 0.24, tilt: 0.04 },
  { x: -0.45, w: 0.22, h: 0.3, tilt: -0.02 },
  { x: 0.0, w: 0.2, h: 0.26, tilt: 0.02 },
  { x: 0.45, w: 0.19, h: 0.26, tilt: -0.03 },
  { x: 0.9, w: 0.17, h: 0.22, tilt: -0.05 },
];

/* ---------------- Paper pose per state ---------------- */

type Pose = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

function getPose(state: DarkroomState, slotIdx: number): Pose {
  const slot = DRY_SLOTS[Math.min(slotIdx, DRY_SLOTS.length - 1)];
  switch (state) {
    case "setup":
      return { position: new THREE.Vector3(-0.9, 1.0, -1.3), rotation: new THREE.Euler(-Math.PI / 2, 0, 0) };
    case "expose":
      return { position: new THREE.Vector3(-0.9, 0.995, -1.3), rotation: new THREE.Euler(-Math.PI / 2, 0, 0) };
    case "develop":
      return { position: new THREE.Vector3(-0.1, 0.998, -1.3), rotation: new THREE.Euler(-Math.PI / 2, 0, 0) };
    case "stop":
      return { position: new THREE.Vector3(0.3, 0.998, -1.3), rotation: new THREE.Euler(-Math.PI / 2, 0, 0) };
    case "fix":
      return { position: new THREE.Vector3(0.7, 0.998, -1.3), rotation: new THREE.Euler(-Math.PI / 2, 0, 0) };
    case "wash":
      return { position: new THREE.Vector3(1.13, 1.035, -1.3), rotation: new THREE.Euler(-Math.PI / 2, 0, 0) };
    case "dry":
      return { position: new THREE.Vector3(slot.x, 1.6, -1.45), rotation: new THREE.Euler(0, 0, slot.tilt) };
  }
}

/* ---------------- Chunk helper ---------------- */

function Chunk({
  position,
  size,
  color,
  radius = 0.015,
  rotation,
  onClick,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  radius?: number;
  rotation?: [number, number, number];
  onClick?: (e: { stopPropagation: () => void }) => void;
}) {
  return (
    <RoundedBox
      args={size}
      position={position}
      rotation={rotation}
      radius={radius}
      smoothness={2}
      onClick={onClick}
    >
      <meshBasicMaterial color={color} toneMapped={false} />
    </RoundedBox>
  );
}

/* ---------------- Active processing paper ---------------- */

function ProcessingPaper({ P }: { P: typeof DARK_P }) {
  const photos = useMemo(() => getPhotos(), []);
  const photoIdx = useDarkroom((s) => s.currentPhotoIndex);
  const current = useDarkroom((s) => s.current);
  const completedCount = useDarkroom((s) => s.completedPhotos.length);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const s = useDarkroom.getState();
    const drySlot = Math.min(s.completedPhotos.length, PHOTO_COUNT - 1);
    const pose = getPose(s.current, drySlot);
    g.position.copy(pose.position);
    g.rotation.copy(pose.rotation);
  });

  const visible = current !== "setup";
  const drySlot = Math.min(completedCount, PHOTO_COUNT - 1);
  const initial = getPose(current, drySlot);
  const texture = photos[photoIdx % PHOTO_COUNT];

  return (
    <group
      ref={groupRef}
      visible={visible}
      position={[initial.position.x, initial.position.y, initial.position.z]}
      rotation={[initial.rotation.x, initial.rotation.y, initial.rotation.z]}
    >
      <mesh>
        <boxGeometry args={[0.235, 0.295, 0.006]} />
        <meshBasicMaterial color={P.dryingPaperBack} toneMapped={false} />
      </mesh>
      {current !== "expose" && (
        <mesh position={[0, 0, 0.004]}>
          <planeGeometry args={[0.22, 0.28]} />
          <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ---------------- Committed prints on the drying line ---------------- */

function DryingPrints({ P }: { P: typeof DARK_P }) {
  const photos = useMemo(() => getPhotos(), []);
  const completedPhotos = useDarkroom((s) => s.completedPhotos);

  return (
    <>
      {completedPhotos.map((photoIdx, i) => {
        const slot = DRY_SLOTS[i];
        if (!slot) return null;
        const tex = photos[photoIdx % PHOTO_COUNT];
        return (
          <group
            key={`${i}-${photoIdx}`}
            position={[slot.x, 1.55, -1.45]}
            rotation={[0, 0, slot.tilt]}
          >
            <Chunk
              position={[0, 0.21, 0.015]}
              size={[0.04, 0.05, 0.04]}
              color={P.clip}
              radius={0.008}
            />
            <mesh position={[0, 0.05, 0.018]}>
              <planeGeometry args={[slot.w + 0.02, slot.h + 0.02]} />
              <meshBasicMaterial color={P.dryingPaperBack} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.05, 0.022]}>
              <planeGeometry args={[slot.w, slot.h]} />
              <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/* ---------------- Enlarger glow during expose ---------------- */

function EnlargerGlow({ P }: { P: typeof DARK_P }) {
  const current = useDarkroom((s) => s.current);
  if (current !== "expose") return null;
  return (
    <group position={[-0.9, COUNTER_Y, -1.3]}>
      <Chunk position={[0, 1.02, 0]} size={[0.322, 0.242, 0.422]} color={P.enlargerGlow} />
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.058, 16]} />
        <meshBasicMaterial color={P.enlargerGlow} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshBasicMaterial color={P.enlargerGlow} toneMapped={false} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/* ---------------- Enlarger volumetric beam (cone of light) ----------------
 *
 * A narrow translucent cone projecting from the lens tip down to the
 * baseplate. Active only during `expose`, darkroom-mode only. Safelight
 * atmospherics are handled by the global palette shift + post-processing
 * rather than another geometric cone.
 */

function EnlargerBeam() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!matRef.current) return;
    const s = useDarkroom.getState();
    const isExposing = s.current === "expose";
    const isDark = s.roomMode === "darkroom";
    const target = isExposing && isDark ? 0.22 : 0;
    matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, target, 0.12);
  });

  return (
    <mesh position={[-0.9, 1.315, -1.3]}>
      <coneGeometry args={[0.12, 0.65, 24, 1, true]} />
      <meshBasicMaterial
        ref={matRef}
        color={"#FFF0B0"}
        toneMapped={false}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------- Gralab timer (sweeping pointer) ---------------- */

function TimerTick({ P }: { P: typeof DARK_P }) {
  const handGroupRef = useRef<THREE.Group>(null);
  const faceMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const handGroup = handGroupRef.current;
    const faceMat = faceMatRef.current;
    const s = useDarkroom.getState();

    // Progress 0→1 through the current state's duration.
    const dur = STATE_DURATIONS[s.current] * 1000;
    const elapsed = performance.now() - s.stateStartTime;
    const progress = Math.min(1, elapsed / dur);

    if (handGroup) {
      // Sweep from ~11 o'clock (-0.9 rad) full circle back around.
      // During a state: pointer rotates -2*PI * progress (clockwise face).
      const base = -0.9;
      handGroup.rotation.z = base - progress * Math.PI * 2;
    }

    // Face brightens subtly during timed states, dim in setup.
    if (faceMat) {
      const active = s.current !== "setup" ? 1 : 0.7;
      const target = new THREE.Color(P.timerFace).multiplyScalar(active);
      faceMat.color.lerp(target, 0.08);
    }
  });

  return (
    <group position={[-0.5, COUNTER_Y + 0.02, -1.22]} rotation={[-0.1, 0, 0]}>
      <Chunk position={[0, 0.09, 0]} size={[0.22, 0.17, 0.045]} color={P.timerBody} radius={0.008} />
      <mesh position={[0, 0.1, 0.023]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.005, 32]} />
        <meshBasicMaterial ref={faceMatRef} color={P.timerFace} toneMapped={false} />
      </mesh>
      <group ref={handGroupRef} position={[0, 0.1, 0.028]} rotation={[0, 0, -0.9]}>
        <Chunk position={[0, 0.025, 0]} size={[0.006, 0.05, 0.003]} color={P.timerHand} radius={0.001} />
      </group>
    </group>
  );
}

/* ---------------- Wet-paper shimmer overlay ---------------- */

function WetShimmer() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const s = useDarkroom.getState();
    const wet = ["develop", "stop", "fix", "wash"].includes(s.current);

    if (!matRef.current || !meshRef.current) return;

    // Follow the active paper position.
    const drySlot = Math.min(s.completedPhotos.length, PHOTO_COUNT - 1);
    const pose = getPose(s.current, drySlot);
    meshRef.current.position.copy(pose.position);
    meshRef.current.position.y += 0.002;
    meshRef.current.rotation.copy(pose.rotation);

    // Shimmer: gentle sine pulse in opacity.
    const t = performance.now() * 0.002;
    const base = wet ? 0.14 : 0;
    const pulse = wet ? Math.sin(t) * 0.05 + 0.05 : 0;
    const target = base + pulse;
    matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, target, 0.15);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[0.22, 0.28]} />
      <meshBasicMaterial
        ref={matRef}
        color={"#FFFFFF"}
        toneMapped={false}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------- Emergence halo (during develop) ---------------- */

function EmergenceHalo() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const s = useDarkroom.getState();
    if (!matRef.current || !meshRef.current) return;

    const pose = getPose(s.current, 0);
    meshRef.current.position.copy(pose.position);
    meshRef.current.position.y += 0.001;
    meshRef.current.rotation.copy(pose.rotation);

    // Only during develop. Peaks at mid-duration, fades by end.
    let target = 0;
    if (s.current === "develop") {
      const dur = STATE_DURATIONS.develop * 1000;
      const p = Math.min(1, (performance.now() - s.stateStartTime) / dur);
      // Triangular pulse peaking at p=0.5
      target = (1 - Math.abs(p - 0.5) * 2) * 0.45;
    }
    matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, target, 0.1);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[0.44, 0.52]} />
      <meshBasicMaterial
        ref={matRef}
        color={"#FFB47A"}
        toneMapped={false}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------- Smoke / steam particles ----------------
 *
 * Each particle is a camera-facing billboard with a soft radial-gradient
 * texture (looks like a puff instead of a sphere). Particles rise, drift
 * outward, grow dramatically, and fade. Use for cigarette smoke and
 * coffee steam.
 */

function useSmokeTexture(r: number, g: number, b: number) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
    grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grd.addColorStop(0.35, `rgba(${r},${g},${b},0.55)`);
    grd.addColorStop(0.7, `rgba(${r},${g},${b},0.15)`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [r, g, b]);
}

function Smoke({
  position,
  rgb = [220, 220, 220],
  scale = 1,
  count = 7,
  rise = 0.55,
  speed = 0.3,
  spread = 0.1,
  maxOpacity = 0.7,
}: {
  position: [number, number, number];
  rgb?: [number, number, number];
  scale?: number;
  count?: number;
  rise?: number;
  speed?: number;
  spread?: number;
  maxOpacity?: number;
}) {
  const texture = useSmokeTexture(rgb[0], rgb[1], rgb[2]);
  const wrapperRefs = useRef<Array<THREE.Group | null>>([]);
  const matRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const agesRef = useRef<number[]>(
    Array.from({ length: count }, (_, i) => i / count),
  );

  useFrame(({ camera }, delta) => {
    for (let i = 0; i < count; i++) {
      const wrapper = wrapperRefs.current[i];
      const mat = matRefs.current[i];
      if (!wrapper || !mat) continue;

      agesRef.current[i] += delta * speed;
      if (agesRef.current[i] >= 1) agesRef.current[i] -= 1;
      const t = agesRef.current[i];

      wrapper.position.y = t * rise * scale;
      const driftPhase = t * Math.PI * 2 + i * 0.9;
      wrapper.position.x = Math.sin(driftPhase) * spread * t * scale;
      wrapper.position.z = Math.cos(driftPhase * 0.7) * spread * t * scale;

      const s = (0.4 + t * 2.6) * scale;
      wrapper.scale.setScalar(s);

      // Orient the puff plane to face the (static) orthographic camera.
      wrapper.lookAt(camera.position);

      const op =
        t < 0.15
          ? (t / 0.15) * maxOpacity
          : maxOpacity * (1 - (t - 0.15) / 0.85);
      mat.opacity = op;
    }
  });

  if (!texture) return null;

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            wrapperRefs.current[i] = el as unknown as THREE.Group | null;
          }}
        >
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial
            ref={(el) => {
              matRefs.current[i] = el;
            }}
            map={texture}
            toneMapped={false}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- Switch hint pulse (until first toggle) ---------------- */

function SwitchHint() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!matRef.current) return;
    const s = useDarkroom.getState();
    const shown = !s.hasToggledLights;
    const t = performance.now() * 0.003;
    const pulse = (Math.sin(t) * 0.5 + 0.5) * 0.55;
    const target = shown ? pulse : 0;
    matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, target, 0.1);
  });

  return (
    <mesh position={[-1.48, 1.08, 1.2]}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshBasicMaterial
        ref={matRef}
        color={"#FFE6A0"}
        toneMapped={false}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------- Scene ---------------- */

function Scene() {
  const photos = useMemo(() => getPhotos(), []);
  const advance = useDarkroom((s) => s.advance);
  const current = useDarkroom((s) => s.current);
  const roomMode = useDarkroom((s) => s.roomMode);
  const toggleRoomMode = useDarkroom((s) => s.toggleRoomMode);
  const P = roomMode === "room" ? ROOM_P : DARK_P;
  const pinnedPhoto = photos[2 % photos.length];

  const tap = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    advance();
  };

  const tapOn = (states: DarkroomState[]) =>
    states.includes(current) ? tap : undefined;

  // Toggle the light switch with a satisfying position flip
  const switchToggleRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!switchToggleRef.current) return;
    const s = useDarkroom.getState();
    const targetY = s.roomMode === "room" ? 0.022 : -0.012;
    switchToggleRef.current.position.y = THREE.MathUtils.lerp(
      switchToggleRef.current.position.y,
      targetY,
      0.25,
    );
  });

  return (
    <group>
      {/* Floor + walls */}
      <Chunk position={[0, -0.05, 0]} size={[3, 0.1, 3]} color={P.floor} />
      <Chunk position={[0, 1, -1.55]} size={[3, 2, 0.08]} color={P.wallBack} />
      <Chunk position={[-1.55, 1, 0]} size={[0.08, 2, 3]} color={P.wallLeft} />

      {/* Counter */}
      <group position={[0, 0, -1.3]}>
        <Chunk position={[0, 0.45, 0]} size={[2.6, 0.9, 0.5]} color={P.counter} radius={0.02} />
        <Chunk position={[0, 0.93, 0]} size={[2.6, 0.04, 0.5]} color={P.counterTop} radius={0.02} />
      </group>

      {/* Enlarger — hero tap target during setup + expose */}
      <group position={[-0.9, COUNTER_Y, -1.3]} onClick={tapOn(["setup", "expose"])}>
        <Chunk position={[0, 0.035, 0]} size={[0.42, 0.07, 0.42]} color={P.enlargerBody} />
        <Chunk position={[0, 0.55, -0.17]} size={[0.1, 1.0, 0.1]} color={P.enlargerBody} />
        <Chunk position={[0, 1.02, 0]} size={[0.32, 0.24, 0.42]} color={P.enlargerBody} />
        <Chunk position={[0, 0.82, 0]} size={[0.14, 0.12, 0.14]} color={P.enlargerBody} />
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 16]} />
          <meshBasicMaterial color={P.enlargerBody} toneMapped={false} />
        </mesh>
        <mesh position={[0.065, 0.38, -0.17]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
          <meshBasicMaterial color={P.brass} toneMapped={false} />
        </mesh>
        <Chunk position={[-0.06, 0.18, -0.17]} size={[0.012, 0.3, 0.012]} color={P.wire} radius={0.003} />
      </group>

      {/* Gralab timer with sweeping pointer */}
      <TimerTick P={P} />

      {/* Tongs in jar */}
      <group position={[-0.3, COUNTER_Y + 0.01, -1.15]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.04, 0.045, 0.12, 16]} />
          <meshBasicMaterial color={P.jar} toneMapped={false} />
        </mesh>
        <Chunk position={[-0.012, 0.2, 0]} size={[0.008, 0.17, 0.008]} color={P.tongs} radius={0.002} rotation={[0.05, 0, 0.12]} />
        <Chunk position={[0.008, 0.21, 0.012]} size={[0.008, 0.18, 0.008]} color={P.tongs} radius={0.002} rotation={[-0.12, 0, -0.04]} />
        <Chunk position={[0.016, 0.2, -0.012]} size={[0.008, 0.16, 0.008]} color={P.tongs} radius={0.002} rotation={[0.1, 0, -0.18]} />
      </group>

      {/* Trays — each advances when tapped during its own state */}
      {(
        [
          { x: -0.1, fluid: P.devFluid, heroState: "develop" },
          { x: 0.3, fluid: P.stopFluid, heroState: "stop" },
          { x: 0.7, fluid: P.fixFluid, heroState: "fix" },
        ] as const
      ).map((t, i) => (
        <group
          key={i}
          position={[t.x, COUNTER_Y + 0.025, -1.3]}
          onClick={tapOn([t.heroState as DarkroomState])}
        >
          <Chunk position={[0, 0.02, 0]} size={[0.3, 0.05, 0.38]} color={P.trayEnamel} radius={0.01} />
          <Chunk position={[0, 0.052, 0]} size={[0.3, 0.006, 0.38]} color={P.trayRim} radius={0.003} />
          <mesh position={[0, 0.048, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.27, 0.35]} />
            <meshBasicMaterial color={t.fluid} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Photo paper box */}
      <group position={[-1.1, COUNTER_Y + 0.01, -1.1]} rotation={[0, 0.2, 0]}>
        <Chunk position={[0, 0.03, 0]} size={[0.22, 0.06, 0.28]} color={P.paperBox} radius={0.008} />
        <Chunk position={[0.005, 0.068, -0.005]} size={[0.22, 0.012, 0.28]} color={P.paperBoxLid} radius={0.006} rotation={[0, 0, 0.04]} />
      </group>

      {/* Negative carrier */}
      <group position={[0.55, COUNTER_Y + 0.008, -1.03]} rotation={[0, 0.35, 0]}>
        <Chunk position={[0, 0.005, 0]} size={[0.2, 0.008, 0.06]} color={P.negCarrier} radius={0.002} />
        <Chunk position={[0, 0.011, 0]} size={[0.18, 0.002, 0.04]} color={P.negStrip} radius={0.001} />
      </group>

      {/* Main safelight */}
      <group position={[-1.45, 1.55, -0.2]}>
        <Chunk position={[-0.03, 0, 0]} size={[0.04, 0.32, 0.32]} color={P.safelightBody} />
        <Chunk position={[0.05, 0, 0]} size={[0.06, 0.26, 0.26]} color={P.safelight} />
      </group>
      {/* Secondary dimmer safelight */}
      <group position={[-1.46, 0.7, 0.9]}>
        <Chunk position={[-0.02, 0, 0]} size={[0.03, 0.2, 0.2]} color={P.safelightBody} />
        <Chunk position={[0.04, 0, 0]} size={[0.05, 0.16, 0.16]} color={P.safelightDim} />
      </group>

      {/* Light switch — interactive */}
      <group position={[-1.5, 1.0, 1.2]} onClick={(e) => { e.stopPropagation(); toggleRoomMode(); }}>
        <Chunk position={[0, 0, 0]} size={[0.018, 0.12, 0.08]} color={P.switchPlate} radius={0.004} />
        <group ref={switchToggleRef} position={[0.014, -0.012, 0]}>
          <Chunk position={[0, 0, 0]} size={[0.01, 0.032, 0.016]} color={P.switchToggle} radius={0.002} />
        </group>
      </group>

      {/* Pulsing hint near the switch (until first toggle) */}
      <SwitchHint />

      {/* Power outlet */}
      <group position={[-1.5, 0.25, 1.2]}>
        <Chunk position={[0, 0, 0]} size={[0.018, 0.1, 0.08]} color={P.outlet} radius={0.004} />
        <Chunk position={[0.013, 0.016, -0.015]} size={[0.006, 0.016, 0.005]} color={P.outletHole} radius={0.001} />
        <Chunk position={[0.013, -0.016, -0.015]} size={[0.006, 0.016, 0.005]} color={P.outletHole} radius={0.001} />
        <Chunk position={[0.013, 0.016, 0.015]} size={[0.006, 0.016, 0.005]} color={P.outletHole} radius={0.001} />
        <Chunk position={[0.013, -0.016, 0.015]} size={[0.006, 0.016, 0.005]} color={P.outletHole} radius={0.001} />
      </group>

      {/* Drying line */}
      <mesh position={[0, 1.75, -1.48]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 2.4, 8]} />
        <meshBasicMaterial color={P.wire} toneMapped={false} />
      </mesh>

      {/* Committed drying prints */}
      <group onClick={tapOn(["dry"])}>
        <DryingPrints P={P} />
      </group>

      {/* Contact sheet */}
      <group position={[-0.45, 1.25, -1.5]}>
        <Chunk position={[0, 0, 0]} size={[0.4, 0.52, 0.01]} color={P.contactSheet} radius={0.004} />
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <Chunk
              key={i}
              position={[-0.12 + col * 0.12, 0.18 - row * 0.12, 0.006]}
              size={[0.09, 0.08, 0.004]}
              color={P.contactGrid}
              radius={0.002}
            />
          );
        })}
      </group>

      {/* Pinned test print */}
      <group position={[1.0, 1.25, -1.5]} rotation={[0, 0, 0.05]}>
        <Chunk position={[0, 0, 0]} size={[0.28, 0.34, 0.01]} color={P.pinnedPrint} radius={0.004} />
        <mesh position={[0, 0, 0.007]}>
          <planeGeometry args={[0.24, 0.3]} />
          <meshBasicMaterial map={pinnedPhoto} toneMapped={false} />
        </mesh>
      </group>

      {/* Analog clock */}
      <group position={[-1.05, 1.72, -1.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
          <meshBasicMaterial color={P.clockBezel} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.011]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.004, 32]} />
          <meshBasicMaterial color={P.clockFace} toneMapped={false} />
        </mesh>
        <group position={[0, 0, 0.015]}>
          <Chunk position={[0, 0.022, 0]} size={[0.008, 0.044, 0.003]} color={P.clockHand} radius={0.001} />
        </group>
        <group position={[0, 0, 0.016]} rotation={[0, 0, -0.8]}>
          <Chunk position={[0, 0.036, 0]} size={[0.006, 0.072, 0.003]} color={P.clockHand} radius={0.001} />
        </group>
      </group>

      {/* Bottles */}
      {[
        { x: 0.88, h: 0.3, r: 0.045, color: P.bottleGreen },
        { x: 0.97, h: 0.2, r: 0.055, color: P.bottleAmber },
      ].map((b, i) => (
        <group key={i} position={[b.x, COUNTER_Y + 0.01, -1.3]}>
          <mesh position={[0, b.h / 2, 0]}>
            <cylinderGeometry args={[b.r, b.r, b.h, 16]} />
            <meshBasicMaterial color={b.color} toneMapped={false} />
          </mesh>
          <mesh position={[0, b.h + 0.015, 0]}>
            <cylinderGeometry args={[b.r * 0.55, b.r * 0.55, 0.03, 12]} />
            <meshBasicMaterial color={P.bottleCap} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Wash/sink — hero tap during wash */}
      <group position={[1.13, COUNTER_Y + 0.025, -1.3]} onClick={tapOn(["wash"])}>
        <Chunk position={[0, 0.04, 0]} size={[0.34, 0.09, 0.42]} color={P.trayEnamel} radius={0.012} />
        <Chunk position={[0, 0.087, 0]} size={[0.34, 0.006, 0.42]} color={P.trayRim} radius={0.003} />
        <mesh position={[0, 0.083, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 0.38]} />
          <meshBasicMaterial color={P.sinkWater} toneMapped={false} />
        </mesh>
      </group>

      {/* Trash bin */}
      <group position={[-1.25, 0, -0.2]}>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.22, 20]} />
          <meshBasicMaterial color={P.binBody} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.123, 0.123, 0.012, 20]} />
          <meshBasicMaterial color={P.binRim} toneMapped={false} />
        </mesh>
        <Chunk position={[0.03, 0.3, 0.02]} size={[0.022, 0.14, 0.005]} color={P.testStrip} radius={0.002} rotation={[0.15, 0, 0.35]} />
        <Chunk position={[-0.04, 0.28, -0.02]} size={[0.02, 0.1, 0.005]} color={P.testStrip} radius={0.002} rotation={[-0.1, 0, -0.25]} />
        <Chunk position={[0.02, 0.32, -0.04]} size={[0.024, 0.16, 0.005]} color={P.testStrip} radius={0.002} rotation={[0.05, 0, 0.18]} />
        <Chunk position={[-0.03, 0.26, 0.05]} size={[0.018, 0.08, 0.005]} color={P.testStrip} radius={0.002} rotation={[0.2, 0, -0.3]} />
      </group>

      {/* Towel — kicked off near the stool as part of the break zone */}
      <group position={[-0.1, 0, -0.1]} rotation={[0, 0.35, 0]}>
        <Chunk position={[0, 0.012, 0]} size={[0.22, 0.022, 0.3]} color={P.towel} radius={0.01} />
        <Chunk position={[0.03, 0.034, -0.02]} size={[0.18, 0.02, 0.24]} color={P.towelFold} radius={0.008} rotation={[0, 0.08, 0]} />
      </group>

      {/* Crumpled rejected print — part of the waste zone around the bin */}
      <mesh position={[-0.95, 0.04, -0.05]} rotation={[0.3, 0.5, 0.2]}>
        <dodecahedronGeometry args={[0.04, 0]} />
        <meshBasicMaterial color={P.dryingPaperBack} toneMapped={false} />
      </mesh>

      {/* Reading chair — to the right of the coffee table, facing -X so it
          doesn't occlude the table top from the iso camera */}
      <group position={[1.12, 0, 0.1]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Four legs */}
        {[
          [0.14, 0.14],
          [-0.14, 0.14],
          [0.14, -0.14],
          [-0.14, -0.14],
        ].map(([dx, dz], i) => (
          <mesh key={`leg-${i}`} position={[dx, 0.2, dz]}>
            <boxGeometry args={[0.03, 0.4, 0.03]} />
            <meshBasicMaterial color={P.stoolFrame} toneMapped={false} />
          </mesh>
        ))}
        {/* Seat cushion */}
        <Chunk position={[0, 0.42, 0]} size={[0.34, 0.08, 0.34]} color={P.jacket} radius={0.018} />
        {/* Back cushion */}
        <Chunk position={[0, 0.72, -0.14]} size={[0.34, 0.42, 0.08]} color={P.jacket} radius={0.02} />
        {/* Arm rests */}
        <Chunk position={[0.17, 0.55, 0]} size={[0.06, 0.18, 0.3]} color={P.jacketDark} radius={0.015} />
        <Chunk position={[-0.17, 0.55, 0]} size={[0.06, 0.18, 0.3]} color={P.jacketDark} radius={0.015} />
      </group>

      {/* Coffee table covered in prints — behind the stool, between the
          reading chair and the work area */}
      <group position={[0.55, 0, 0.0]}>
        {/* Table top */}
        <Chunk position={[0, 0.33, 0]} size={[0.55, 0.025, 0.42]} color={P.crate} radius={0.005} />
        {/* Four legs */}
        {[
          [0.24, 0.18],
          [-0.24, 0.18],
          [0.24, -0.18],
          [-0.24, -0.18],
        ].map(([dx, dz], i) => (
          <mesh key={`tl-${i}`} position={[dx, 0.165, dz]}>
            <boxGeometry args={[0.022, 0.33, 0.022]} />
            <meshBasicMaterial color={P.crateSlat} toneMapped={false} />
          </mesh>
        ))}
        {/* Scattered prints on top — overlapping at varied angles */}
        <mesh position={[-0.15, 0.346, 0.08]} rotation={[-Math.PI / 2, 0, 0.35]}>
          <planeGeometry args={[0.16, 0.2]} />
          <meshBasicMaterial map={photos[0]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.02, 0.348, 0.12]} rotation={[-Math.PI / 2, 0, -0.2]}>
          <planeGeometry args={[0.14, 0.18]} />
          <meshBasicMaterial map={photos[3 % photos.length]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.05, 0.35, -0.08]} rotation={[-Math.PI / 2, 0, 0.6]}>
          <planeGeometry args={[0.15, 0.19]} />
          <meshBasicMaterial map={photos[2 % photos.length]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.12, 0.352, -0.12]} rotation={[-Math.PI / 2, 0, -0.5]}>
          <planeGeometry args={[0.13, 0.16]} />
          <meshBasicMaterial map={photos[1 % photos.length]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>

        {/* Coffee mug on the table */}
        <group position={[-0.2, 0.345, -0.12]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.048, 0.04, 0.1, 16]} />
            <meshBasicMaterial color={P.mug} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.098, 0]}>
            <torusGeometry args={[0.043, 0.005, 6, 16]} />
            <meshBasicMaterial color={P.mugDark} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={P.coffee} toneMapped={false} />
          </mesh>
          <mesh position={[0.055, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.021, 0.007, 8, 14, Math.PI]} />
            <meshBasicMaterial color={P.mug} toneMapped={false} />
          </mesh>
        </group>

        {/* Ashtray + smoldering cigarette — front-left corner, diagonally
            opposite from the coffee mug's back-right sweep */}
        <group position={[-0.2, 0.345, 0.15]}>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.06, 0.054, 0.018, 20]} />
            <meshBasicMaterial color={P.ashGlass} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <torusGeometry args={[0.057, 0.003, 6, 20]} />
            <meshBasicMaterial color={P.ashRim} toneMapped={false} />
          </mesh>
          <group rotation={[0, 0.5, 0]}>
            <mesh position={[0.035, 0.024, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, 0.1, 10]} />
              <meshBasicMaterial color={P.cigBody} toneMapped={false} />
            </mesh>
            <mesh position={[0.085, 0.024, 0]}>
              <sphereGeometry args={[0.008, 10, 10]} />
              <meshBasicMaterial color={P.cigEmber} toneMapped={false} />
            </mesh>
          </group>
        </group>

        {/* Rolled newspaper — peeking out from under the print pile */}
        <group position={[0.12, 0.342, 0.14]} rotation={[0, 0.2, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.013, 0.013, 0.18, 14]} />
            <meshBasicMaterial color={P.paperNews} toneMapped={false} />
          </mesh>
          <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0135, 0.0135, 0.004, 12]} />
            <meshBasicMaterial color={P.paperNewsBand} toneMapped={false} />
          </mesh>
          <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0135, 0.0135, 0.004, 12]} />
            <meshBasicMaterial color={P.paperNewsBand} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* Coffee steam — subtle wisp */}
      <Smoke
        position={[0.35, 0.45, -0.12]}
        rgb={[225, 232, 234]}
        scale={0.55}
        count={5}
        speed={0.5}
        rise={0.35}
        spread={0.07}
        maxOpacity={0.3}
      />

      {/* Cigarette smoke — thin trail from the ashtray's new front-left spot */}
      <Smoke
        position={[0.43, 0.38, 0.15]}
        rgb={[210, 200, 188]}
        scale={0.55}
        count={5}
        speed={0.38}
        rise={0.5}
        spread={0.05}
        maxOpacity={0.2}
      />

      {/* Photographer's loupe — paired with the negative carrier */}
      <group position={[0.5, COUNTER_Y + 0.01, -0.97]} rotation={[0, 0.7, 0]}>
        <mesh position={[0, 0.032, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.064, 14]} />
          <meshBasicMaterial color={P.loupeBody} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.066, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.004, 16]} />
          <meshBasicMaterial color={P.loupeLens} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.001, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.004, 16]} />
          <meshBasicMaterial color={P.loupeBody} toneMapped={false} />
        </mesh>
      </group>

      {/* Counter-height stool on wheels — in front of counter */}
      <group position={[-0.3, 0, -0.55]}>
        {/* Star base — 4 radial arms */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
          <mesh key={`arm-${i}`} position={[0, 0.04, 0]} rotation={[0, rot, 0]}>
            <boxGeometry args={[0.012, 0.012, 0.16]} />
            <meshBasicMaterial color={P.stoolFrame} toneMapped={false} />
          </mesh>
        ))}
        {/* Wheels on arm tips */}
        {[
          [0, 0.08],
          [0, -0.08],
          [0.08, 0],
          [-0.08, 0],
        ].map(([dx, dz], i) => (
          <mesh key={`w-${i}`} position={[dx, 0.025, dz]}>
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshBasicMaterial color={P.stoolWheel} toneMapped={false} />
          </mesh>
        ))}
        {/* Column */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.76, 12]} />
          <meshBasicMaterial color={P.stoolFrame} toneMapped={false} />
        </mesh>
        {/* Seat top */}
        <mesh position={[0, 0.82, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.035, 24]} />
          <meshBasicMaterial color={P.stoolSeat} toneMapped={false} />
        </mesh>
      </group>


      {/* Framed print on the left wall — replaces the jacket */}
      <group position={[-1.5, 1.3, 0.3]}>
        {/* Outer wood frame */}
        <Chunk position={[0, 0, 0]} size={[0.02, 0.44, 0.36]} color={P.crate} radius={0.004} />
        {/* Matte border — slightly smaller, cream */}
        <Chunk position={[0.008, 0, 0]} size={[0.008, 0.4, 0.32]} color={P.dryingPaperBack} radius={0.002} />
        {/* Hero photograph */}
        <mesh position={[0.014, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.28, 0.36]} />
          <meshBasicMaterial map={photos[4 % photos.length]} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Lighting overlays — layered on top of the base scene */}
      <EnlargerGlow P={P} />
      <EnlargerBeam />
      <EmergenceHalo />
      <WetShimmer />

      {/* Active processing paper */}
      <ProcessingPaper P={P} />
    </group>
  );
}

/* ---------------- Pan bounds ---------------- */

const PAN_BOUNDS = {
  x: [-0.7, 0.7] as const,
  y: [0.55, 1.65] as const,
  z: [-0.85, 0.25] as const,
};

/* ---------------- Page ---------------- */

export default function IsoPreview() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const current = useDarkroom((s) => s.current);
  const advance = useDarkroom((s) => s.advance);
  const reverse = useDarkroom((s) => s.reverse);
  const roomMode = useDarkroom((s) => s.roomMode);
  const P = roomMode === "room" ? ROOM_P : DARK_P;

  // Auto-advance according to STATE_DURATIONS
  useEffect(() => {
    const ms = STATE_DURATIONS[current] * 1000;
    const id = setTimeout(() => advance(), ms);
    return () => clearTimeout(id);
  }, [current, advance]);

  const handleChange = () => {
    const c = controlsRef.current;
    if (!c) return;
    c.target.x = Math.max(PAN_BOUNDS.x[0], Math.min(PAN_BOUNDS.x[1], c.target.x));
    c.target.y = Math.max(PAN_BOUNDS.y[0], Math.min(PAN_BOUNDS.y[1], c.target.y));
    c.target.z = Math.max(PAN_BOUNDS.z[0], Math.min(PAN_BOUNDS.z[1], c.target.z));
  };

  return (
    <div
      className="flex min-h-svh flex-col transition-colors duration-700"
      style={{ background: P.pageBg, color: roomMode === "room" ? "#2E1E18" : P.wallBack }}
    >
      <header className="px-6 pt-8 sm:px-10">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-70">
          Scene Study 01
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Darkroom</h1>
      </header>

      <div
        className="relative w-full"
        style={{ touchAction: "none", height: "70svh", minHeight: 480 }}
      >
        <Canvas gl={{ antialias: true }} shadows={false} dpr={[1, 2]}>
          <color attach="background" args={[P.canvasBg]} />
          <OrthographicCamera
            makeDefault
            position={[5, 3.4, 5]}
            zoom={135}
            near={-20}
            far={50}
          />
          <OrbitControls
            ref={controlsRef}
            enableRotate={false}
            enablePan
            enableZoom
            minZoom={80}
            maxZoom={280}
            target={[0, 1.05, -0.3]}
            zoomSpeed={0.8}
            panSpeed={0.7}
            screenSpacePanning
            onChange={handleChange}
            touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
            mouseButtons={{
              LEFT: THREE.MOUSE.PAN,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN,
            }}
          />
          <Scene />
          <EffectComposer>
            <Bloom
              luminanceThreshold={roomMode === "darkroom" ? 0.6 : 0.85}
              luminanceSmoothing={0.4}
              intensity={roomMode === "darkroom" ? 1.3 : 0.3}
              mipmapBlur
            />
            <BrightnessContrast
              brightness={roomMode === "darkroom" ? -0.06 : 0}
              contrast={roomMode === "darkroom" ? 0.18 : 0}
            />
            <Vignette
              offset={roomMode === "darkroom" ? 0.2 : 0.45}
              darkness={roomMode === "darkroom" ? 0.85 : 0.35}
              eskil={false}
            />
          </EffectComposer>
        </Canvas>

        {/* Controls + caption overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-3 px-4">
          <div
            className="max-w-[80%] text-center font-mono text-[11px] uppercase tracking-[0.18em]"
            style={{ color: P.chipText, opacity: 0.85 }}
          >
            {current} · {STATE_CAPTION[current]}
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={reverse}
              aria-label="Previous state"
              className="grid h-11 w-11 place-items-center rounded-full text-lg"
              style={{ background: P.chipBg, color: P.chipText }}
            >
              ←
            </button>
            <button
              onClick={advance}
              aria-label="Next state"
              className="grid h-11 w-11 place-items-center rounded-full text-lg"
              style={{ background: P.chipBg, color: P.chipText }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <footer className="px-6 pb-8 pt-4 font-mono text-[11px] uppercase tracking-[0.18em] opacity-60 sm:px-10">
        Built by{" "}
        <a
          href="https://2nx.co"
          className="underline underline-offset-2 hover:opacity-100"
        >
          2nx.co
        </a>
      </footer>
    </div>
  );
}
