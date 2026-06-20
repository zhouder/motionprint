// ============================================================
// MotionPrint — Terrain Renderer
// ============================================================

import type { RenderContext } from './types';
import { decompressSamplesCached, normalizeToCanvas, detectStays } from './types';

export function renderTerrain(ctx: RenderContext): void {
  const { ctx: c, data, palette, width, height } = ctx;

  c.fillStyle = '#0d1117';
  c.fillRect(0, 0, width, height);

  const raw = decompressSamplesCached(data.samples);
  if (raw.length === 0) return;

  const normalized = normalizeToCanvas(raw, width, height, 20);

  // Build a heatmap grid
  const gridSize = 8;
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);
  const grid = new Float64Array(cols * rows);

  // Count movement through each cell
  for (const pt of normalized) {
    const col = Math.floor(pt.x / gridSize);
    const row = Math.floor(pt.y / gridSize);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      grid[row * cols + col]++;
    }
  }

  // Find max for normalization
  let maxVal = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] > maxVal) maxVal = grid[i];
  }
  if (maxVal === 0) maxVal = 1;

  // Draw terrain as colored cells
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const val = grid[row * cols + col] / maxVal;
      if (val === 0) continue;

      const colorIdx = Math.floor(val * (palette.colors.length - 1));
      const color = palette.colors[colorIdx];

      c.fillStyle = color;
      c.globalAlpha = 0.1 + val * 0.7;
      c.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
    }
  }
  c.globalAlpha = 1;

  // Draw contour lines along movement paths
  const moves = normalized.filter(s => s.type === 'move');
  if (moves.length > 1) {
    c.strokeStyle = palette.text;
    c.lineWidth = 0.5;
    c.globalAlpha = 0.15;
    c.beginPath();
    c.moveTo(moves[0].x, moves[0].y);
    for (let i = 1; i < moves.length; i++) {
      c.lineTo(moves[i].x, moves[i].y);
    }
    c.stroke();
    c.globalAlpha = 1;
  }

  // Draw clicks as peaks
  const clicks = normalized.filter(s => s.type === 'click');
  for (const click of clicks) {
    const gradient = c.createRadialGradient(click.x, click.y, 0, click.x, click.y, 12);
    gradient.addColorStop(0, palette.accent);
    gradient.addColorStop(1, 'transparent');
    c.fillStyle = gradient;
    c.globalAlpha = 0.6;
    c.beginPath();
    c.arc(click.x, click.y, 12, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;

  // Draw stays as plateaus
  const stays = detectStays(raw, 3000, 15);
  const stayPoints = normalizeToCanvas(
    stays.map(s => ({ t: s.startTime, x: s.x, y: s.y, type: 'move' as const })),
    width, height
  );
  for (let i = 0; i < stays.length; i++) {
    const sp = stayPoints[i];
    const durationNorm = Math.min(stays[i].duration / 30000, 1);
    const radius = 8 + durationNorm * 20;

    c.strokeStyle = palette.secondary;
    c.lineWidth = 2;
    c.globalAlpha = 0.4;
    c.strokeRect(sp.x - radius, sp.y - radius, radius * 2, radius * 2);
  }
  c.globalAlpha = 1;

  // Draw scrolls as ridgelines
  const scrolls = normalized.filter(s => s.type === 'scroll');
  for (const scroll of scrolls) {
    c.strokeStyle = palette.primary;
    c.lineWidth = 1.5;
    c.globalAlpha = 0.3;
    c.beginPath();
    c.moveTo(scroll.x - 10, scroll.y);
    c.lineTo(scroll.x + 10, scroll.y);
    c.stroke();
  }
  c.globalAlpha = 1;
}