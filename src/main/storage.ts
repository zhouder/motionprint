// ============================================================
// MotionPrint — Storage Layer
// ============================================================

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import {
  DayRecord,
  DayStats,
  CompressedSample,
  Settings,
  DEFAULT_SETTINGS,
} from '../shared/types';

const DATA_DIR_NAME = 'MotionPrint';
const DATA_SUBDIR = 'data';
const SETTINGS_FILE = 'settings.json';

function getDataPath(): string {
  const appData = app.getPath('appData');
  return path.join(appData, DATA_DIR_NAME);
}

function getSettingsPath(): string {
  return path.join(getDataPath(), SETTINGS_FILE);
}

function getDayPath(date: string): string {
  return path.join(getDataPath(), DATA_SUBDIR, `${date}.json`);
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function atomicWrite(filePath: string, data: string): void {
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, data, 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

// ---- Storage singleton ----

let storageInstance: Storage | null = null;

export function getStorage(existing?: Storage): Storage {
  if (existing) {
    storageInstance = existing;
  }
  if (!storageInstance) {
    storageInstance = new Storage();
  }
  return storageInstance;
}

export class Storage {
  private dataPath: string;
  private settings: Settings = { ...DEFAULT_SETTINGS };
  private initialized = false;

  constructor() {
    this.dataPath = getDataPath();
  }

  async init(): Promise<void> {
    ensureDir(this.dataPath);
    ensureDir(path.join(this.dataPath, DATA_SUBDIR));
    await this.loadSettings();
    this.cleanupRetention();
    this.initialized = true;
  }

  // ---- Settings ----

  private async loadSettings(): Promise<void> {
    const settingsPath = getSettingsPath();
    if (fs.existsSync(settingsPath)) {
      try {
        const raw = fs.readFileSync(settingsPath, 'utf-8');
        const loaded = JSON.parse(raw);
        this.settings = { ...DEFAULT_SETTINGS, ...loaded };
      } catch {
        this.settings = { ...DEFAULT_SETTINGS };
      }
    }
  }

  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }

  async updateSettings(partial: Partial<Settings>): Promise<void> {
    this.settings = { ...this.settings, ...partial };
    atomicWrite(getSettingsPath(), JSON.stringify(this.settings, null, 2));
  }

  // ---- Day records ----

  async getDayData(date: string): Promise<DayRecord | null> {
    const filePath = getDayPath(date);
    if (!fs.existsSync(filePath)) return null;
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as DayRecord;
    } catch {
      return null;
    }
  }

  async saveDayData(record: DayRecord): Promise<void> {
    ensureDir(path.join(this.dataPath, DATA_SUBDIR));
    atomicWrite(getDayPath(record.date), JSON.stringify(record, null, 2));
  }

  async appendSamples(date: string, samples: CompressedSample[], stats: DayStats): Promise<void> {
    const existing = await this.getDayData(date);
    if (existing) {
      existing.samples.push(...samples);
      existing.stats.totalDistance += stats.totalDistance;
      existing.stats.activeTime += stats.activeTime;
      existing.stats.clicks += stats.clicks;
      existing.stats.scrolls += stats.scrolls;
      existing.stats.longestPause = Math.max(existing.stats.longestPause, stats.longestPause);
      existing.stats.sampleCount += stats.sampleCount;
      await this.saveDayData(existing);
    } else {
      await this.saveDayData({
        date,
        samples,
        stats,
      });
    }
  }

  async listAvailableDates(): Promise<string[]> {
    const dataDir = path.join(this.dataPath, DATA_SUBDIR);
    ensureDir(dataDir);
    const files = fs.readdirSync(dataDir);
    return files
      .filter(f => f.endsWith('.json') && !f.endsWith('.tmp'))
      .map(f => f.replace('.json', ''))
      .sort()
      .reverse();
  }

  async deleteDay(date: string): Promise<void> {
    const filePath = getDayPath(date);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async clearAll(): Promise<void> {
    const dataDir = path.join(this.dataPath, DATA_SUBDIR);
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.tmp')) {
          fs.unlinkSync(path.join(dataDir, file));
        }
      }
    }
  }

  // ---- Retention ----

  private cleanupRetention(): void {
    if (this.settings.retentionDays <= 0) return;
    const dataDir = path.join(this.dataPath, DATA_SUBDIR);
    if (!fs.existsSync(dataDir)) return;

    const now = Date.now();
    const cutoff = now - this.settings.retentionDays * 24 * 60 * 60 * 1000;

    const files = fs.readdirSync(dataDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const dateStr = file.replace('.json', '');
      const date = new Date(dateStr + 'T00:00:00');
      if (date.getTime() < cutoff) {
        try {
          fs.unlinkSync(path.join(dataDir, file));
        } catch {
          // Ignore errors during cleanup
        }
      }
    }
  }
}