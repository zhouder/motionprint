// ============================================================
// MotionPrint — IPC Handlers
// ============================================================

import { ipcMain, dialog, BrowserWindow, app, screen } from 'electron';
import { Storage } from './storage';
import { Sampler } from './sampler';
import { DayRecord, DayStats, RawSample, Settings } from '../shared/types';

export function registerIpcHandlers(storage: Storage, sampler: Sampler): void {
  // ---- Recording control ----

  ipcMain.handle('mp:startRecording', async () => {
    await sampler.start();
    return { success: true };
  });

  ipcMain.handle('mp:pauseRecording', async () => {
    await sampler.pause();
    return { success: true };
  });

  ipcMain.handle('mp:stopRecording', async () => {
    await sampler.stop();
    return { success: true };
  });

  ipcMain.handle('mp:getRecordingStatus', async () => {
    return sampler.getStatus();
  });

  // ---- Screen info ----

  ipcMain.handle('mp:getScreenDPI', async () => {
    const display = screen.getPrimaryDisplay();
    const { width: pxWidth } = display.bounds;
    const { width: mmWidth } = display.size;
    if (mmWidth === 0) return 96;
    return pxWidth / (mmWidth / 25.4);
  });

  // ---- Data access ----

  ipcMain.handle('mp:getTodayData', async (): Promise<DayRecord | null> => {
    const today = new Date().toISOString().split('T')[0];
    const record = await storage.getDayData(today);
    // Merge with current in-memory samples for live view
    if (record) {
      const buffered = sampler.getBufferedSamples();
      if (buffered.length > 0) {
        const compressed = buffered.map(s => {
          const typeCode = s.type === 'move' ? 0 : s.type === 'click' ? 1 : 2;
          let btnOrDelta = 0;
          if (s.type === 'click' && s.btn) {
            btnOrDelta = s.btn === 'left' ? 1 : s.btn === 'right' ? 2 : 3;
          } else if (s.type === 'scroll' && s.delta !== undefined) {
            btnOrDelta = s.delta;
          }
          return [s.t, s.x, s.y, typeCode, btnOrDelta] as [number, number, number, number, number];
        });
        record.samples = [...record.samples, ...compressed];
        record.stats = sampler.getCurrentStats();
      }
    }
    return record;
  });

  ipcMain.handle('mp:getDayData', async (_event, date: string): Promise<DayRecord | null> => {
    return storage.getDayData(date);
  });

  ipcMain.handle('mp:listAvailableDates', async (): Promise<string[]> => {
    return storage.listAvailableDates();
  });

  ipcMain.handle('mp:deleteDay', async (_event, date: string) => {
    await storage.deleteDay(date);
    return { success: true };
  });

  ipcMain.handle('mp:clearAll', async () => {
    await storage.clearAll();
    return { success: true };
  });

  // ---- Settings ----

  ipcMain.handle('mp:getSettings', async (): Promise<Settings> => {
    return storage.getSettings();
  });

  ipcMain.handle('mp:updateSettings', async (_event, partial: Partial<Settings>) => {
    await storage.updateSettings(partial);

    // Sync auto-start setting
    if ('launchAtStartup' in partial) {
      app.setLoginItemSettings({
        openAtLogin: partial.launchAtStartup ?? false,
        openAsHidden: true,
      });
    }

    return { success: true };
  });

  // ---- Export ----

  ipcMain.handle('mp:exportPNG', async (_event, date: string, theme: string, width: number, height: number) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return '';

    const result = await dialog.showSaveDialog(win, {
      title: 'Export MotionPrint',
      defaultPath: `MotionPrint_${date}_${theme}_${width}x${height}.png`,
      filters: [{ name: 'PNG Image', extensions: ['png'] }],
    });

    if (result.canceled || !result.filePath) return '';

    return result.filePath;
  });

  // ---- Event subscriptions (main → renderer) ----

  ipcMain.handle('mp:subscribeSamples', (event) => {
    const unsub = sampler.onSample((sample: RawSample) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('mp:newSample', sample);
      }
    });
    // Store cleanup reference
    (event.sender as any).__mpSampleUnsub = unsub;
  });

  ipcMain.handle('mp:unsubscribeSamples', (event) => {
    const unsub = (event.sender as any).__mpSampleUnsub;
    if (unsub) unsub();
  });

  ipcMain.handle('mp:subscribeStats', (event) => {
    const unsub = sampler.onStats((stats: DayStats) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('mp:statsUpdate', stats);
      }
    });
    (event.sender as any).__mpStatsUnsub = unsub;
  });

  ipcMain.handle('mp:unsubscribeStats', (event) => {
    const unsub = (event.sender as any).__mpStatsUnsub;
    if (unsub) unsub();
  });
}