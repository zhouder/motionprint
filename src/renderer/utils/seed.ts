// ============================================================
// MotionPrint — Date-based Color Palette Seed
// ============================================================

import type { ColorPalette } from '../../shared/types';

// Simple deterministic hash function (djb2 variant)
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

// Seeded pseudo-random number generator (mulberry32)
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function generatePalette(date: string): ColorPalette {
  const hash = hashString(date);
  const rand = mulberry32(hash);

  const baseHue = Math.floor(rand() * 360);
  const isDark = true; // Always dark backgrounds for better visibility

  // Generate a palette of 12 colors
  const colors: string[] = [];
  for (let i = 0; i < 12; i++) {
    const hue = (baseHue + i * 30 + Math.floor(rand() * 20)) % 360;
    const saturation = 0.5 + rand() * 0.5;
    const lightness = isDark ? 0.4 + rand() * 0.4 : 0.3 + rand() * 0.3;
    colors.push(hslToHex(hue, saturation, lightness));
  }

  const background = isDark
    ? `#${Math.floor(rand() * 4 + 8).toString(16)}${Math.floor(rand() * 4 + 8).toString(16)}${Math.floor(rand() * 4 + 10).toString(16)}`
    : `#${Math.floor(rand() * 20 + 235).toString(16)}${Math.floor(rand() * 20 + 235).toString(16)}${Math.floor(rand() * 20 + 235).toString(16)}`;

  const primary = colors[0];
  const secondary = colors[3];
  const accent = colors[7];
  const surface = isDark ? '#161b22' : '#f0f0f0';
  const text = isDark ? '#e6edf3' : '#1a1a2e';

  return { background, primary, secondary, accent, surface, text, colors };
}