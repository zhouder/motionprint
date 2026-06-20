// ============================================================
// MotionPrint — Neon Renderer (Performance Optimized)
// ============================================================

import type { RenderContext } from './types';
import { decompressSamplesCached, normalizeToCanvas, computeSpeed, detectStays } from './types';

export function renderNeon(ctx: RenderContext): void {
  const { ctx: c, data, palette, width, height } = ctx;

  // Dark background
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0a0a0f');
  gradient.addColorStop(1, '#0d0d1a');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  const raw = decompressSamplesCached(data.samples);
  const moves = raw.filter(s => s.type === 'move');
  if (moves.length < 2) return;

  const normalized = normalizeToCanvas(moves, width, height);

  // Draw neon paths — batch glow lines first, then core lines on top
  // This avoids expensive per-segment shadowBlur
  c.lineCap = 'round';
  c.lineJoin = 'round';

  // Pass 1: Thick glow lines (no shadowBlur, just thick semi-transparent colored lines)
  for (let i = 1; i < normalized.length; i++) {
    const prev = normalized[i - 1];
    const curr = normalized[i];
    const speed = computeSpeed(normalized, i);
    const speedNorm = Math.min(speed * 500, 1);

    const colorIdx = Math.floor(speedNorm * (palette.colors.length - 1));
    const color = palette.colors[colorIdx];

    c.strokeStyle = color;
    c.globalAlpha = 0.15;
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(prev.x, prev.y);
    c.lineTo(curr.x, curr.y);
    c.stroke();
  }

  // Pass 2: Thin bright core lines
  for (let i = 1; i < normalized.length; i++) {
    const prev = normalized[i - 1];
    const curr = normalized[i];

    c.strokeStyle = '#ffffff';
    c.globalAlpha = 0.5;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(prev.x, prev.y);
    c.lineTo(curr.x, curr.y);
    c.stroke();
  }

  c.globalAlpha = 1;

  // Draw clicks as electric pulse rings
  const clicks = raw.filter(s => s.type === 'click');
  const clickNorm = normalizeToCanvas(clicks, width, height);

  // Draw click rings — batch all rings of same type together
  for (const click of clickNorm) {
    // Outer ring
    c.strokeStyle = palette.accent;
    c.lineWidth = 1.5;
    c.globalAlpha = 0.25;
    c.beginPath();
    c.arc(click.x, click.y, 25, 0, Math.PI * 2);
    c.stroke();

    // Middle ring
    c.globalAlpha = 0.4;
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(click.x, click.y, 15, 0, Math.PI * 2);
    c.stroke();

    // Inner ring
    c.strokeStyle = '#ffffff';
    c.globalAlpha = 0.6;
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(click.x, click.y, 5, 0, Math.PI * 2);
    c.stroke();
  }
  c.globalAlpha = 1;

  // Draw stays as gradient orbs (no shadowBlur)
  const stays = detectStays(raw, 3000, 15);
  if (stays.length > 0) {
    const stayPoints = normalizeToCanvas(
      stays.map(s => ({ t: s.startTime, x: s.x, y: s.y, type: 'move' as const })),
      width, height
    );
    for (let i = 0; i < stays.length; i++) {
      const sp = stayPoints[i];
      const durationNorm = Math.min(stays[i].duration / 30000, 1);
      const radius = 8 + durationNorm * 25;

      const orbGradient = c.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, radius);
      orbGradient.addColorStop(0, palette.secondary + '80');
      orbGradient.addColorStop(0.5, palette.secondary + '20');
      orbGradient.addColorStop(1, 'transparent');
      c.fillStyle = orbGradient;
      c.beginPath();
      c.arc(sp.x, sp.y, radius, 0, Math.PI * 2);
      c.fill();
    }
  }

  // Draw scrolls as scanning lines
  const scrolls = raw.filter(s => s.type === 'scroll');
  const scrollNorm = normalizeToCanvas(scrolls, width, height);
  for (const scroll of scrollNorm) {
    c.strokeStyle = palette.colors[4];
    c.lineWidth = 1;
    c.globalAlpha = 0.4;
    c.beginPath();
    c.moveTo(scroll.x - 15, scroll.y);
    c.lineTo(scroll.x + 15, scroll.y);
    c.stroke();
  }
  c.globalAlpha = 1;
}