// ============================================================
// MotionPrint — System Tray
// ============================================================

import { Tray, Menu, nativeImage, MenuItemConstructorOptions } from 'electron';
import { Sampler } from './sampler';

export interface TrayCallbacks {
  onShow: () => void;
  onQuit: () => void;
  sampler: Sampler;
}

let tray: Tray | null = null;

function createTrayIcon() {
  // Create a simple 16x16 tray icon programmatically
  // Using a small colored circle as the icon
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 6;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (dist <= radius) {
        // Inner circle: teal color
        canvas[idx] = 0;     // R
        canvas[idx + 1] = 180; // G
        canvas[idx + 2] = 180; // B
        canvas[idx + 3] = 255; // A
      } else if (dist <= radius + 1) {
        // Border
        canvas[idx] = 0;
        canvas[idx + 1] = 140;
        canvas[idx + 2] = 140;
        canvas[idx + 3] = 255;
      } else {
        // Transparent
        canvas[idx] = 0;
        canvas[idx + 1] = 0;
        canvas[idx + 2] = 0;
        canvas[idx + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

export function createTray(callbacks: TrayCallbacks): void {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('MotionPrint');

  updateTrayMenu(callbacks);

  tray.on('double-click', () => {
    callbacks.onShow();
  });
}

function updateTrayMenu(callbacks: TrayCallbacks): void {
  const status = callbacks.sampler.getStatus();

  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: 'Show MotionPrint',
      click: () => callbacks.onShow(),
    },
    { type: 'separator' },
    {
      label: 'Start Recording',
      enabled: !status.active || status.paused,
      click: async () => {
        if (status.paused) {
          await callbacks.sampler.resume();
        } else {
          await callbacks.sampler.start();
        }
        updateTrayMenu(callbacks);
      },
    },
    {
      label: 'Pause Recording',
      enabled: status.active && !status.paused,
      click: async () => {
        await callbacks.sampler.pause();
        updateTrayMenu(callbacks);
      },
    },
    {
      label: 'Stop Recording',
      enabled: status.active,
      click: async () => {
        await callbacks.sampler.stop();
        updateTrayMenu(callbacks);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit MotionPrint',
      click: () => callbacks.onQuit(),
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  tray!.setContextMenu(menu);
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}