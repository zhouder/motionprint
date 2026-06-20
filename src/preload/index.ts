// ============================================================
// MotionPrint — Preload Script
// ============================================================

import { contextBridge, ipcRenderer } from 'electron';
import type { MotionPrintAPI, DayRecord, DayStats, RawSample, Settings, RecordingStatus } from '../shared/types';

const api: MotionPrintAPI = {
  // Recording control
  startRecording: () => ipcRenderer.invoke('mp:startRecording'),
  pauseRecording: () => ipcRenderer.invoke('mp:pauseRecording'),
  stopRecording: () => ipcRenderer.invoke('mp:stopRecording'),
  getRecordingStatus: (): Promise<RecordingStatus> => ipcRenderer.invoke('mp:getRecordingStatus'),

  // Data access
  getTodayData: (): Promise<DayRecord | null> => ipcRenderer.invoke('mp:getTodayData'),
  getDayData: (date: string): Promise<DayRecord | null> => ipcRenderer.invoke('mp:getDayData', date),
  listAvailableDates: (): Promise<string[]> => ipcRenderer.invoke('mp:listAvailableDates'),
  deleteDay: (date: string) => ipcRenderer.invoke('mp:deleteDay', date),
  clearAll: () => ipcRenderer.invoke('mp:clearAll'),

  // Settings
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('mp:getSettings'),
  updateSettings: (partial: Partial<Settings>) => ipcRenderer.invoke('mp:updateSettings', partial),

  // Export
  exportPNG: (date: string, theme: string, width: number, height: number) =>
    ipcRenderer.invoke('mp:exportPNG', date, theme, width, height),

  // Screen info
  getScreenDPI: (): Promise<number> => ipcRenderer.invoke('mp:getScreenDPI'),

  // Events (main → renderer)
  onNewSample: (callback: (sample: RawSample) => void) => {
    ipcRenderer.invoke('mp:subscribeSamples');
    const handler = (_event: Electron.IpcRendererEvent, sample: RawSample) => callback(sample);
    ipcRenderer.on('mp:newSample', handler);
    return () => {
      ipcRenderer.removeListener('mp:newSample', handler);
      ipcRenderer.invoke('mp:unsubscribeSamples');
    };
  },

  onStatsUpdate: (callback: (stats: DayStats) => void) => {
    ipcRenderer.invoke('mp:subscribeStats');
    const handler = (_event: Electron.IpcRendererEvent, stats: DayStats) => callback(stats);
    ipcRenderer.on('mp:statsUpdate', handler);
    return () => {
      ipcRenderer.removeListener('mp:statsUpdate', handler);
      ipcRenderer.invoke('mp:unsubscribeStats');
    };
  },

  onDayChange: (callback: (date: string) => void) => {
    // Check for day change every 30 seconds
    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      callback(today);
    }, 30000);
    return () => clearInterval(interval);
  },
};

contextBridge.exposeInMainWorld('motionPrint', api);