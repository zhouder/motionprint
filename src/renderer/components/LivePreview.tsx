import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { ThemeName, DayRecord } from '../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';
import { generatePalette } from '../utils/seed';
import { renderTheme } from '../renderers';
import { Stats } from './Stats';
import { ThemePicker } from './ThemePicker';

interface IpcState {
  recordingStatus: { active: boolean; paused: boolean };
  todayData: DayRecord | null;
  todayStats: DayStats | null;
  refreshToday: () => Promise<void>;
}

interface Props { ipc: IpcState }

export const LivePreview: React.FC<Props> = ({ ipc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<ThemeName>('terrain');
  const { t } = useLanguage();

  const today = new Date().toISOString().split('T')[0];

  const palette = useMemo(() => {
    if (ipc.todayData && ipc.todayData.samples.length > 0) {
      return generatePalette(today);
    }
    return null;
  }, [today, ipc.todayData?.samples.length]);

  const renderCanvas = useCallback((canvas: HTMLCanvasElement, container: HTMLElement) => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const aspectRatio = 16 / 9;
    let canvasWidth: number;
    let canvasHeight: number;
    if (containerWidth / containerHeight > aspectRatio) {
      canvasHeight = containerHeight;
      canvasWidth = containerHeight * aspectRatio;
    } else {
      canvasWidth = containerWidth;
      canvasHeight = containerWidth / aspectRatio;
    }
    canvas.width = canvasWidth * 2;
    canvas.height = canvasHeight * 2;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    if (ipc.todayData && ipc.todayData.samples.length > 0 && palette) {
      renderTheme(theme, ctx, ipc.todayData, palette, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#484f58';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        ipc.recordingStatus.active ? t.statusEmptyRecording : t.statusEmptyPaused,
        canvasWidth / 2,
        canvasHeight / 2
      );
    }
  }, [ipc.todayData, theme, palette, t, ipc.recordingStatus.active]);

  // Canvas resize + render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    let rafId: number;
    const doRender = () => {
      rafId = requestAnimationFrame(() => renderCanvas(canvas, container));
    };

    const observer = new ResizeObserver(() => doRender());
    observer.observe(container);
    doRender();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [renderCanvas]);

  // Polling
  useEffect(() => {
    ipc.refreshToday();
    const interval = setInterval(() => { ipc.refreshToday(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusDotClass = ipc.recordingStatus.paused ? 'paused' : ipc.recordingStatus.active ? 'recording' : '';
  const statusText = ipc.recordingStatus.paused ? t.statusPaused : ipc.recordingStatus.active ? t.statusRecording : t.statusStopped;

  return (
    <div className="live-wrapper">
      <div className="live-topbar">
        <div className="section-header">
          <h2 className="section-title">{t.liveTitle}</h2>
          <span className="section-date">{today}</span>
        </div>
        <div className="recording-status">
          <div className={`status-dot ${statusDotClass}`} />
          <span>{statusText}</span>
        </div>
        <ThemePicker current={theme} onChange={setTheme} />
      </div>
      <Stats stats={ipc.todayStats} />
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};