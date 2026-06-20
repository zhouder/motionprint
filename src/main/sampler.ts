// ============================================================
// MotionPrint — Mouse Sampler (Polling-based)
// ============================================================

import { screen } from 'electron';
import { RawSample, CompressedSample, DayStats } from '../shared/types';
import { Storage } from './storage';

// uiohook-napi is a native addon that may not be available
// if it hasn't been rebuilt for Electron's Node.js version.
// We load it dynamically and fall back to polling-only mode.
let uIOhook: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const hook = require('uiohook-napi');
  uIOhook = hook.uIOhook;
} catch {
  console.warn('uiohook-napi not available — clicks and scrolls will not be recorded.');
  console.warn('Run "npm run rebuild" to compile native modules for Electron.');
}

const FLUSH_INTERVAL_MS = 30000;

// ---- Compress sample to storage format ----

function compressSample(s: RawSample): CompressedSample {
  const typeCode = s.type === 'move' ? 0 : s.type === 'click' ? 1 : 2;
  let btnOrDelta = 0;
  if (s.type === 'click' && s.btn) {
    btnOrDelta = s.btn === 'left' ? 1 : s.btn === 'right' ? 2 : 3;
  } else if (s.type === 'scroll' && s.delta !== undefined) {
    btnOrDelta = s.delta;
  }
  return [s.t, s.x, s.y, typeCode, btnOrDelta];
}

// ---- Sampler singleton ----

let samplerInstance: Sampler | null = null;

export function getSampler(storage?: Storage): Sampler {
  if (storage && !samplerInstance) {
    samplerInstance = new Sampler(storage);
  }
  if (!samplerInstance) {
    throw new Error('Sampler not initialized. Call getSampler(storage) first.');
  }
  return samplerInstance;
}

export class Sampler {
  private storage: Storage;
  private active = false;
  private paused = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  // Buffers
  private rawBuffer: RawSample[] = [];
  private compressedBuffer: CompressedSample[] = [];

  // Stats
  private stats: DayStats = {
    totalDistance: 0,
    activeTime: 0,
    clicks: 0,
    scrolls: 0,
    longestPause: 0,
    sampleCount: 0,
  };

  private lastFlushedStats: DayStats = {
    totalDistance: 0,
    activeTime: 0,
    clicks: 0,
    scrolls: 0,
    longestPause: 0,
    sampleCount: 0,
  };

  // Tracking state
  private lastX = -1;
  private lastY = -1;
  private lastMoveTime = 0;
  private lastActivityTime = 0;
  private currentPauseStart = 0;

  // Listeners for IPC push
  private sampleListeners: Array<(sample: RawSample) => void> = [];
  private statsListeners: Array<(stats: DayStats) => void> = [];

  constructor(storage: Storage) {
    this.storage = storage;
  }

  // ---- Listener management ----

  onSample(fn: (sample: RawSample) => void): () => void {
    this.sampleListeners.push(fn);
    return () => {
      this.sampleListeners = this.sampleListeners.filter(l => l !== fn);
    };
  }

  onStats(fn: (stats: DayStats) => void): () => void {
    this.statsListeners.push(fn);
    return () => {
      this.statsListeners = this.statsListeners.filter(l => l !== fn);
    };
  }

  // ---- Recording control ----

  async start(): Promise<void> {
    if (this.active && !this.paused) return;
    this.active = true;
    this.paused = false;
    this.resetTrackingState();
    // Load existing stats from today's data if any
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.storage.getDayData(today);
    if (existing) {
      this.stats = { ...existing.stats };
      this.lastFlushedStats = { ...existing.stats };
    }
    this.startPolling();
    this.startFlushTimer();
    this.startGlobalHook();
  }

  async pause(): Promise<void> {
    this.paused = true;
    this.stopPolling();
  }

  async resume(): Promise<void> {
    if (!this.active || !this.paused) return;
    this.paused = false;
    this.resetTrackingState();
    this.startPolling();
  }

  async stop(): Promise<void> {
    this.active = false;
    this.paused = false;
    this.stopPolling();
    this.stopFlushTimer();
    this.stopGlobalHook();
    await this.flushToDisk();
    this.rawBuffer = [];
    this.compressedBuffer = [];
  }

  getStatus(): { active: boolean; paused: boolean } {
    return { active: this.active, paused: this.paused };
  }

  getCurrentStats(): DayStats {
    return { ...this.stats };
  }

  getBufferedSamples(): RawSample[] {
    return [...this.rawBuffer];
  }

  // ---- Polling ----

  private async startPolling(): Promise<void> {
    if (this.timer) return;
    const settings = await this.storage.getSettings();
    const intervalMs = Math.floor(1000 / settings.samplingRate);

    this.timer = setInterval(() => {
      this.poll();
    }, intervalMs);
  }

  private stopPolling(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => {
      this.flushToDisk();
    }, FLUSH_INTERVAL_MS);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private resetTrackingState(): void {
    this.lastX = -1;
    this.lastY = -1;
    this.lastMoveTime = 0;
    this.lastActivityTime = Date.now();
    this.currentPauseStart = 0;
  }

  private async poll(): Promise<void> {
    if (this.paused || !this.active) return;

    const point = screen.getCursorScreenPoint();
    const now = Date.now();

    // Check for idle: adjust polling rate dynamically
    const settings = await this.storage.getSettings();
    if (this.lastActivityTime > 0 && (now - this.lastActivityTime) > settings.idleThreshold) {
      // Idle: skip some polls to reduce rate
      if (Math.random() > settings.idleSamplingRate / settings.samplingRate) {
        return;
      }
    }

    // Detect click via polling is not possible — clicks are captured via a different mechanism
    // For now we record moves. Clicks will be handled via a Windows-specific hook.
    // We'll use a simple approach: if position hasn't changed, skip
    if (point.x === this.lastX && point.y === this.lastY) {
      // Track pause
      if (this.currentPauseStart === 0) {
        this.currentPauseStart = now;
      }
      return;
    }

    // Position changed — record movement
    const sample: RawSample = {
      t: now,
      x: point.x,
      y: point.y,
      type: 'move',
    };

    this.rawBuffer.push(sample);
    this.stats.sampleCount++;

    // Calculate distance
    if (this.lastX >= 0 && this.lastY >= 0) {
      const dist = Math.hypot(point.x - this.lastX, point.y - this.lastY);
      this.stats.totalDistance += dist;
    }

    // Track active time
    if (this.lastMoveTime > 0) {
      const gap = now - this.lastMoveTime;
      if (gap < 5000) {
        this.stats.activeTime += gap;
      }
    }

    // Track pause
    if (this.currentPauseStart > 0) {
      const pauseDuration = now - this.currentPauseStart;
      if (pauseDuration > this.stats.longestPause) {
        this.stats.longestPause = pauseDuration;
      }
      this.currentPauseStart = 0;
    }

    this.lastX = point.x;
    this.lastY = point.y;
    this.lastMoveTime = now;
    this.lastActivityTime = now;

    // Notify listeners
    for (const listener of this.sampleListeners) {
      try { listener(sample); } catch { /* ignore */ }
    }
    for (const listener of this.statsListeners) {
      try { listener({ ...this.stats }); } catch { /* ignore */ }
    }
  }

  // ---- Manual event injection (for clicks captured via hook) ----

  injectClick(x: number, y: number, btn: 'left' | 'right' | 'middle'): void {
    if (!this.active || this.paused) return;
    const now = Date.now();
    const sample: RawSample = { t: now, x, y, type: 'click', btn };
    this.rawBuffer.push(sample);
    this.stats.clicks++;
    this.stats.sampleCount++;
    this.lastActivityTime = now;

    for (const listener of this.sampleListeners) {
      try { listener(sample); } catch { /* ignore */ }
    }
    for (const listener of this.statsListeners) {
      try { listener({ ...this.stats }); } catch { /* ignore */ }
    }
  }

  injectScroll(x: number, y: number, delta: number): void {
    if (!this.active || this.paused) return;
    const now = Date.now();
    const sample: RawSample = { t: now, x, y, type: 'scroll', delta };
    this.rawBuffer.push(sample);
    this.stats.scrolls++;
    this.stats.sampleCount++;
    this.lastActivityTime = now;

    for (const listener of this.sampleListeners) {
      try { listener(sample); } catch { /* ignore */ }
    }
    for (const listener of this.statsListeners) {
      try { listener({ ...this.stats }); } catch { /* ignore */ }
    }
  }

  // ---- Global mouse hook (clicks + scroll) ----

  private hookActive = false;

  private startGlobalHook(): void {
    if (this.hookActive) return;
    if (!uIOhook) return; // native module not available

    try {
      uIOhook.on('mousedown', (e: any) => {
        if (!this.active || this.paused) return;
        const btn = e.button === 1 ? 'left' : e.button === 2 ? 'right' : 'middle';
        this.injectClick(e.x, e.y, btn as 'left' | 'right' | 'middle');
      });
      uIOhook.on('wheel', (e: any) => {
        if (!this.active || this.paused) return;
        this.injectScroll(e.x, e.y, e.rotation);
      });
      uIOhook.start();
      this.hookActive = true;
    } catch {
      console.warn('Failed to start global mouse hook; clicks and scrolls will not be recorded');
    }
  }

  private stopGlobalHook(): void {
    if (!this.hookActive || !uIOhook) return;
    try {
      uIOhook.stop();
    } catch {
      // ignore
    }
    this.hookActive = false;
  }

  // ---- Flush to disk ----

  private async flushToDisk(): Promise<void> {
    if (this.rawBuffer.length === 0 && this.compressedBuffer.length === 0) return;

    // Compress raw samples
    const newCompressed: CompressedSample[] = this.rawBuffer.map(compressSample);
    this.compressedBuffer.push(...newCompressed);
    this.rawBuffer = [];

    if (this.compressedBuffer.length === 0) return;

    // Compute delta stats since last flush
    const deltaStats: DayStats = {
      totalDistance: this.stats.totalDistance - this.lastFlushedStats.totalDistance,
      activeTime: this.stats.activeTime - this.lastFlushedStats.activeTime,
      clicks: this.stats.clicks - this.lastFlushedStats.clicks,
      scrolls: this.stats.scrolls - this.lastFlushedStats.scrolls,
      longestPause: this.stats.longestPause,
      sampleCount: this.stats.sampleCount - this.lastFlushedStats.sampleCount,
    };
    this.lastFlushedStats = { ...this.stats };

    const today = new Date().toISOString().split('T')[0];
    await this.storage.appendSamples(today, this.compressedBuffer, deltaStats);
    this.compressedBuffer = [];
  }
}