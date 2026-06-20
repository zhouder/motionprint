// ============================================================
// MotionPrint — Shared Types
// ============================================================

// ---- Raw sample from mouse events ----
export interface RawSample {
  t: number;       // timestamp ms
  x: number;       // screen x coordinate
  y: number;       // screen y coordinate
  type: 'move' | 'click' | 'scroll';
  btn?: 'left' | 'right' | 'middle';
  delta?: number;  // scroll delta (positive = up/forward)
}

// ---- Compressed sample for storage (flat array) ----
// [timestamp, x, y, typeCode, btnOrDelta]
// typeCode: 0=move, 1=click, 2=scroll
export type CompressedSample = [number, number, number, number, number];

// ---- Daily statistics ----
export interface DayStats {
  totalDistance: number;   // pixels
  activeTime: number;      // ms
  clicks: number;
  scrolls: number;
  longestPause: number;    // ms
  sampleCount: number;
}

// ---- Full day record ----
export interface DayRecord {
  date: string;                      // "2026-06-20"
  samples: CompressedSample[];
  stats: DayStats;
}

// ---- Theme identifiers ----
export type ThemeName = 'terrain' | 'ink' | 'neon';

export const THEME_NAMES: ThemeName[] = ['terrain', 'ink', 'neon'];

export const THEME_LABELS: Record<ThemeName, string> = {
  terrain: 'Terrain',
  ink: 'Ink Wash',
  neon: 'Neon',
};

// ---- Color palette ----
export interface ColorPalette {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
  // Extended palette for rendering
  colors: string[];
}

// ---- Settings ----
export interface Settings {
  keepRawData: boolean;
  retentionDays: number;       // 0 = forever
  samplingRate: number;        // Hz, default 30
  idleThreshold: number;       // ms, default 60000
  idleSamplingRate: number;    // Hz, default 2
  launchAtStartup: boolean;
  firstRun: boolean;
  currentTheme: ThemeName;
}

export const DEFAULT_SETTINGS: Settings = {
  keepRawData: true,
  retentionDays: 30,
  samplingRate: 30,
  idleThreshold: 60000,
  idleSamplingRate: 2,
  launchAtStartup: false,
  firstRun: true,
  currentTheme: 'terrain',
};

// ---- Recording status ----
export interface RecordingStatus {
  active: boolean;
  paused: boolean;
}

// ---- IPC API (exposed to renderer via preload) ----
export interface MotionPrintAPI {
  // Recording control
  startRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  getRecordingStatus: () => Promise<RecordingStatus>;

  // Data access
  getTodayData: () => Promise<DayRecord | null>;
  getDayData: (date: string) => Promise<DayRecord | null>;
  listAvailableDates: () => Promise<string[]>;
  deleteDay: (date: string) => Promise<void>;
  clearAll: () => Promise<void>;

  // Settings
  getSettings: () => Promise<Settings>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;

  // Export
  exportPNG: (date: string, theme: string, width: number, height: number) => Promise<string>;

  // Screen info
  getScreenDPI: () => Promise<number>;

  // Events (main → renderer)
  onNewSample: (callback: (sample: RawSample) => void) => () => void;
  onStatsUpdate: (callback: (stats: DayStats) => void) => () => void;
  onDayChange: (callback: (date: string) => void) => () => void;
}

// ---- Window API augmentation ----
declare global {
  interface Window {
    motionPrint: MotionPrintAPI;
  }
}