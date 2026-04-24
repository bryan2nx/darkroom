"use client";

import * as THREE from "three";

/**
 * Five placeholder "photographs" drawn procedurally on canvas.
 * Each is a distinct, high-contrast grayscale composition that reads as
 * a photograph at small scale:
 *
 *   0. Interior with window
 *   1. Silhouette figure under bright sky
 *   2. Building facade with windows grid
 *   3. Landscape with tree silhouettes
 *   4. Still life — bowl on table
 *
 * Ships zero bytes — all five are rasterised in the browser on first use
 * and cached. Each exports as a THREE.CanvasTexture ready to be plugged
 * into a shader uniform or a standard material albedo.
 *
 * Swap path: replace drawPhoto<N>() with an `Image` load from
 * /public/photos/<n>.jpg when real Higgsfield or archival images land.
 */

const PW = 512;
const PH = 640;
const NUM = 5;

let cache: THREE.CanvasTexture[] | null = null;

export function getPhotos(): THREE.CanvasTexture[] {
  if (cache) return cache;
  cache = [];
  for (let i = 0; i < NUM; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = PW;
    canvas.height = PH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    drawPhoto(ctx, i);
    addGrain(ctx);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    cache.push(tex);
  }
  return cache;
}

export const PHOTO_COUNT = NUM;

function drawPhoto(ctx: CanvasRenderingContext2D, idx: number) {
  switch (idx) {
    case 0:
      drawInterior(ctx);
      break;
    case 1:
      drawSilhouette(ctx);
      break;
    case 2:
      drawBuilding(ctx);
      break;
    case 3:
      drawLandscape(ctx);
      break;
    case 4:
      drawStillLife(ctx);
      break;
  }
}

function drawInterior(ctx: CanvasRenderingContext2D) {
  // Dark interior room with bright window upper-centre.
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, PW, PH);

  // Window pane gradient
  const wg = ctx.createLinearGradient(0, PH * 0.1, 0, PH * 0.55);
  wg.addColorStop(0, "#e8e8e8");
  wg.addColorStop(0.7, "#9a9a9a");
  wg.addColorStop(1, "#3a3a3a");
  ctx.fillStyle = wg;
  ctx.fillRect(PW * 0.25, PH * 0.12, PW * 0.55, PH * 0.42);

  // Window muntins
  ctx.fillStyle = "#060606";
  ctx.fillRect(PW * 0.25, PH * 0.32, PW * 0.55, 5);
  ctx.fillRect(PW * 0.52, PH * 0.12, 5, PH * 0.42);
  ctx.fillRect(PW * 0.25, PH * 0.12, PW * 0.55, 3);
  ctx.fillRect(PW * 0.25, PH * 0.54, PW * 0.55, 3);

  // Light spill on the floor below the window
  const sp = ctx.createRadialGradient(PW * 0.52, PH * 0.7, 0, PW * 0.52, PH * 0.7, PW * 0.45);
  sp.addColorStop(0, "rgba(180,180,180,0.45)");
  sp.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sp;
  ctx.fillRect(0, PH * 0.55, PW, PH * 0.45);

  // Floor horizon
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, PH * 0.78, PW, PH * 0.05);
}

function drawSilhouette(ctx: CanvasRenderingContext2D) {
  // Bright overcast sky top, dark ground bottom, single figure mid-left.
  const sg = ctx.createLinearGradient(0, 0, 0, PH * 0.72);
  sg.addColorStop(0, "#f4f4f4");
  sg.addColorStop(1, "#868686");
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, PW, PH * 0.72);

  // Dark foreground
  ctx.fillStyle = "#060606";
  ctx.fillRect(0, PH * 0.72, PW, PH * 0.28);

  // Horizon line subtlety
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, PH * 0.72, PW, 3);

  // Figure silhouette (head + body)
  ctx.fillStyle = "#040404";
  ctx.beginPath();
  ctx.arc(PW * 0.4, PH * 0.46, PW * 0.055, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(PW * 0.35, PH * 0.5, PW * 0.1, PH * 0.22);

  // Faint second figure in distance
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.arc(PW * 0.72, PH * 0.62, PW * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(PW * 0.69, PH * 0.64, PW * 0.06, PH * 0.1);
}

function drawBuilding(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 0, PH * 0.38);
  bg.addColorStop(0, "#bdbdbd");
  bg.addColorStop(1, "#606060");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, PW, PH * 0.38);

  // Main facade
  ctx.fillStyle = "#222222";
  ctx.fillRect(PW * 0.12, PH * 0.14, PW * 0.76, PH * 0.82);

  // Windows grid (5 rows × 4 cols)
  ctx.fillStyle = "#a8a8a8";
  const cols = 4;
  const rows = 5;
  const gw = PW * 0.076;
  const gh = PH * 0.052;
  const xPad = PW * 0.22;
  const yPad = PH * 0.24;
  const xStep = PW * 0.155;
  const yStep = PH * 0.125;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillRect(xPad + x * xStep, yPad + y * yStep, gw, gh);
    }
  }

  // Lit windows (a few)
  ctx.fillStyle = "#f4f4f4";
  const lit: Array<[number, number]> = [
    [1, 0], [3, 1], [0, 2], [2, 3], [3, 4],
  ];
  for (const [cx, cy] of lit) {
    ctx.fillRect(xPad + cx * xStep, yPad + cy * yStep, gw, gh);
  }

  // Shadow bevel on left side
  const sh = ctx.createLinearGradient(PW * 0.12, 0, PW * 0.25, 0);
  sh.addColorStop(0, "rgba(0,0,0,0.7)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh;
  ctx.fillRect(PW * 0.12, PH * 0.14, PW * 0.18, PH * 0.82);
}

function drawLandscape(ctx: CanvasRenderingContext2D) {
  const sg = ctx.createLinearGradient(0, 0, 0, PH * 0.6);
  sg.addColorStop(0, "#d8d8d8");
  sg.addColorStop(1, "#7a7a7a");
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, PW, PH * 0.6);

  // Field
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(0, PH * 0.6, PW, PH * 0.4);

  // Horizon line
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, PH * 0.6, PW, 3);

  // Tree line silhouettes
  ctx.fillStyle = "#050505";
  for (const xt of [0.1, 0.22, 0.36, 0.52, 0.68, 0.83, 0.95]) {
    const baseX = PW * xt;
    const topY = PH * (0.33 + Math.sin(xt * 8) * 0.05);
    const baseY = PH * 0.6;
    const width = PW * 0.045;
    ctx.beginPath();
    ctx.moveTo(baseX - width / 2, baseY);
    ctx.lineTo(baseX, topY);
    ctx.lineTo(baseX + width / 2, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(baseX - 2, baseY - PH * 0.01, 4, PH * 0.02);
  }

  // Fence posts in field
  ctx.fillStyle = "#1a1a1a";
  for (let i = 0; i < 6; i++) {
    const x = PW * (0.2 + i * 0.12);
    ctx.fillRect(x, PH * 0.72, 3, PH * 0.06);
  }
}

function drawStillLife(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 0, PH);
  bg.addColorStop(0, "#707070");
  bg.addColorStop(1, "#151515");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, PW, PH);

  // Table edge
  ctx.fillStyle = "#090909";
  ctx.fillRect(0, PH * 0.72, PW, PH * 0.28);

  // Bowl — top ellipse (opening)
  ctx.fillStyle = "#1e1e1e";
  ctx.beginPath();
  ctx.ellipse(PW * 0.5, PH * 0.58, PW * 0.22, PH * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bowl body
  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.ellipse(PW * 0.5, PH * 0.62, PW * 0.22, PH * 0.09, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillRect(PW * 0.28, PH * 0.62, PW * 0.44, PH * 0.1);

  // Bowl highlight
  ctx.fillStyle = "#b8b8b8";
  ctx.beginPath();
  ctx.ellipse(PW * 0.43, PH * 0.57, PW * 0.06, PH * 0.012, 0, 0, Math.PI * 2);
  ctx.fill();

  // Apple next to bowl
  ctx.fillStyle = "#505050";
  ctx.beginPath();
  ctx.arc(PW * 0.8, PH * 0.68, PW * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9a9a9a";
  ctx.beginPath();
  ctx.arc(PW * 0.78, PH * 0.66, PW * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Shadow under bowl
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.ellipse(PW * 0.5, PH * 0.72, PW * 0.23, PH * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();
}

function addGrain(ctx: CanvasRenderingContext2D) {
  const imageData = ctx.getImageData(0, 0, PW, PH);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 22;
    data[i] = clamp(data[i] + n);
    data[i + 1] = clamp(data[i + 1] + n);
    data[i + 2] = clamp(data[i + 2] + n);
  }
  ctx.putImageData(imageData, 0, 0);
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, v));
}
