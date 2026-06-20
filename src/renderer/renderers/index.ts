// ============================================================
// MotionPrint — Renderer Registry
// ============================================================

import type { ThemeName } from '../../shared/types';
import type { RenderContext, RendererFn } from './types';
import { renderTerrain } from './terrain';
import { renderInk } from './ink';
import { renderNeon } from './neon';

export const renderers: Record<ThemeName, RendererFn> = {
  terrain: renderTerrain,
  ink: renderInk,
  neon: renderNeon,
};

export function renderTheme(
  theme: ThemeName,
  ctx: CanvasRenderingContext2D,
  data: RenderContext['data'],
  palette: RenderContext['palette'],
  width: number,
  height: number
): void {
  const renderer = renderers[theme];
  if (!renderer) {
    renderers.terrain({ ctx, data, palette, width, height });
    return;
  }
  renderer({ ctx, data, palette, width, height });
}