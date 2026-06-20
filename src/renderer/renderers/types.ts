// ============================================================
// MotionPrint — Renderer Interface
// ============================================================

import type { DayRecord, ColorPalette, CompressedSample } from '../../shared/types';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  data: DayRecord;
  palette: ColorPalette;
  width: number;
  height: number;
}

export type RendererFn = (ctx: RenderContext) => void;

// ---- Decompress helpers ----

export interface DecompressedSample {
  t: number;
  x: number;
  y: number;
  type: 'move' | 'click' | 'scroll';
  btn?: 'left' | 'right' | 'middle';
  delta?: number;
}

export function decompressSamples(samples: CompressedSample[]): DecompressedSample[] {
  return samples.map(([t, x, y, typeCode, btnOrDelta]) => {
    const type = typeCode === 0 ? 'move' : typeCode === 1 ? 'click' : 'scroll';
    const result: DecompressedSample = { t, x, y, type };
    if (type === 'click') {
      result.btn = btnOrDelta === 1 ? 'left' : btnOrDelta === 2 ? 'right' : 'middle';
    } else if (type === 'scroll') {
      result.delta = btnOrDelta;
    }
    return result;
  });
}

const decompressCache = new WeakMap<CompressedSample[], DecompressedSample[]>();

export function decompressSamplesCached(samples: CompressedSample[]): DecompressedSample[] {
  const cached = decompressCache.get(samples);
  if (cached) return cached;
  const result = decompressSamples(samples);
  decompressCache.set(samples, result);
  return result;
}

// ---- Math helpers ----

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function normalizeToCanvas(
  samples: DecompressedSample[],
  width: number,
  height: number,
  padding = 40
): Array<{ x: number; y: number } & DecompressedSample> {
  if (samples.length === 0) return [];

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of samples) {
    if (s.x < minX) minX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.x > maxX) maxX = s.x;
    if (s.y > maxY) maxY = s.y;
  }

  const dataW = maxX - minX || 1;
  const dataH = maxY - minY || 1;
  const canvasW = width - padding * 2;
  const canvasH = height - padding * 2;
  const scale = Math.min(canvasW / dataW, canvasH / dataH);

  return samples.map(s => ({
    ...s,
    x: (s.x - minX) * scale + padding + (canvasW - dataW * scale) / 2,
    y: (s.y - minY) * scale + padding + (canvasH - dataH * scale) / 2,
  }));
}

// ---- Speed calculation ----

export function computeSpeed(
  samples: Array<{ t: number; x: number; y: number }>,
  index: number
): number {
  if (index <= 0) return 0;
  const prev = samples[index - 1];
  const curr = samples[index];
  const dt = curr.t - prev.t;
  if (dt <= 0) return 0;
  const d = dist(prev.x, prev.y, curr.x, curr.y);
  return d / dt; // pixels per ms
}

// ---- Stay detection ----

export interface StayGroup {
  x: number;
  y: number;
  duration: number;
  startTime: number;
}

export function detectStays(
  samples: DecompressedSample[],
  thresholdMs = 2000,
  radiusPx = 10
): StayGroup[] {
  const stays: StayGroup[] = [];
  let i = 0;
  while (i < samples.length) {
    const anchor = samples[i];
    let j = i;
    while (j < samples.length && samples[j].t - anchor.t < thresholdMs) j++;
    if (j < samples.length && j - i > 0) {
      // Check if points stayed within radius
      let allClose = true;
      for (let k = i; k <= j; k++) {
        if (dist(anchor.x, anchor.y, samples[k].x, samples[k].y) > radiusPx) {
          allClose = false;
          break;
        }
      }
      if (allClose && samples[j].t - anchor.t >= thresholdMs) {
        stays.push({
          x: anchor.x,
          y: anchor.y,
          duration: samples[j].t - anchor.t,
          startTime: anchor.t,
        });
        i = j + 1;
        continue;
      }
    }
    i++;
  }
  return stays;
}