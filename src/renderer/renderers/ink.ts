// ============================================================
// MotionPrint — Ink Wash Renderer
// ============================================================

import type { RenderContext } from './types';
import { decompressSamplesCached, normalizeToCanvas, computeSpeed, detectStays } from './types';

export function renderInk(ctx: RenderContext): void {
  const { ctx: c, data, palette, width, height } = ctx;

  // Paper-like background
  c.fillStyle = '#0d1117';
  c.fillRect(0, 0, width, height);

  const raw = decompressSamplesCached(data.samples);
  const moves = raw.filter(s => s.type === 'move');
  if (moves.length < 2) return;

  const normalized = normalizeToCanvas(moves, width, height);

  // Draw ink brush strokes
  // Speed → opacity: slow = dark ink (pooling), fast = light ink (dry brush)
  c.lineCap = 'round';
  c.lineJoin = 'round';

  for (let i = 1; i < normalized.length; i++) {
    const prev = normalized[i - 1];
    const curr = normalized[i];
    const speed = computeSpeed(normalized, i);
    const speedNorm = Math.min(speed * 500, 1);

    // Slow = thick, dark (ink pooling); Fast = thin, light (dry brush)
    const lineWidth = 1 + (1 - speedNorm) * 6;
    const alpha = 0.05 + (1 - speedNorm) * 0.5;

    c.strokeStyle = palette.primary;
    c.globalAlpha = alpha;
    c.lineWidth = lineWidth;
    c.beginPath();
    c.moveTo(prev.x, prev.y);
    c.lineTo(curr.x, curr.y);
    c.stroke();

    // Add subtle variation (secondary color)
    if (i % 3 === 0) {
      c.strokeStyle = palette.secondary;
      c.globalAlpha = alpha * 0.3;
      c.lineWidth = lineWidth * 0.5;
      c.beginPath();
      c.moveTo(prev.x + 1, prev.y + 1);
      c.lineTo(curr.x + 1, curr.y + 1);
      c.stroke();
    }
  }
  c.globalAlpha = 1;

  // Draw stays as ink pools
  const stays = detectStays(raw, 3000, 15);
  const stayPoints = normalizeToCanvas(
    stays.map(s => ({ t: s.startTime, x: s.x, y: s.y, type: 'move' as const })),
    width, height
  );
  for (let i = 0; i < stays.length; i++) {
    const sp = stayPoints[i];
    const durationNorm = Math.min(stays[i].duration / 60000, 1);
    const maxRadius = 5 + durationNorm * 35;

    // Ink pool: dark center, fading edges
    const gradient = c.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, maxRadius);
    gradient.addColorStop(0, palette.primary);
    gradient.addColorStop(0.4, palette.primary + 'c0');
    gradient.addColorStop(0.7, palette.primary + '40');
    gradient.addColorStop(1, 'transparent');
    c.fillStyle = gradient;
    c.beginPath();
    c.arc(sp.x, sp.y, maxRadius, 0, Math.PI * 2);
    c.fill();
  }

  // Draw clicks as ink splatters
  const clicks = raw.filter(s => s.type === 'click');
  const clickNorm = normalizeToCanvas(clicks, width, height);
  for (const click of clickNorm) {
    c.fillStyle = palette.accent;
    c.globalAlpha = 0.7;
    // Central dot
    c.beginPath();
    c.arc(click.x, click.y, 3, 0, Math.PI * 2);
    c.fill();
    // Splatter dots
    const splatCount = 5;
    for (let s = 0; s < splatCount; s++) {
      const angle = (s / splatCount) * Math.PI * 2;
      const dist = 5 + (s % 3) * 3;
      c.beginPath();
      c.globalAlpha = 0.4;
      c.arc(
        click.x + Math.cos(angle) * dist,
        click.y + Math.sin(angle) * dist,
        1 + (s % 2),
        0,
        Math.PI * 2
      );
      c.fill();
    }
  }
  c.globalAlpha = 1;

  // Draw scrolls as dry brush texture
  const scrolls = raw.filter(s => s.type === 'scroll');
  const scrollNorm = normalizeToCanvas(scrolls, width, height);
  for (const scroll of scrollNorm) {
    c.strokeStyle = palette.primary;
    c.lineWidth = 1;
    c.globalAlpha = 0.15;
    // Horizontal dry brush strokes
    for (let l = 0; l < 3; l++) {
      c.beginPath();
      c.moveTo(scroll.x - 8, scroll.y + l * 2);
      c.lineTo(scroll.x + 8, scroll.y + l * 2);
      c.stroke();
    }
  }
  c.globalAlpha = 1;
}