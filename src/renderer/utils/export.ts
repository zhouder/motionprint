// ============================================================
// MotionPrint — PNG Export Helper
// ============================================================

export const WALLPAPER_SIZES = [
  { label: 'HD', width: 1920, height: 1080 },
  { label: '1440p', width: 2560, height: 1440 },
  { label: '4K', width: 3840, height: 2160 },
  { label: 'UWQHD', width: 3440, height: 1440 },
  { label: '1080×1920', width: 1080, height: 1920 },
  { label: 'Custom', width: 0, height: 0 },
];

export async function exportCanvasToPNG(
  canvas: HTMLCanvasElement,
  theme: string,
  date: string,
  width: number,
  height: number
): Promise<void> {
  // Create offscreen canvas at target resolution
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d')!;

  // Scale and draw
  ctx.drawImage(canvas, 0, 0, width, height);

  // Get blob
  const blob = await new Promise<Blob>((resolve) => {
    offscreen.toBlob((b) => resolve(b!), 'image/png');
  });

  // Trigger download via save dialog
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MotionPrint_${date}_${theme}_${width}x${height}.png`;
  a.click();
  URL.revokeObjectURL(url);
}