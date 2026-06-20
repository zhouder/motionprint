import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ThemeName, DayRecord } from '../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';
import { generatePalette } from '../utils/seed';
import { renderTheme } from '../renderers';
import { ThemePicker } from './ThemePicker';
import { Calendar } from './Calendar';
import { ExportDialog } from './ExportDialog';
import { exportCanvasToPNG } from '../utils/export';

interface IpcState {
  availableDates: string[];
  refreshDates: () => Promise<void>;
  getDayData: (date: string) => Promise<DayRecord | null>;
  deleteDay: (date: string) => Promise<void>;
}

interface Props { ipc: IpcState }

export const Gallery: React.FC<Props> = ({ ipc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<ThemeName>('terrain');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayData, setDayData] = useState<DayRecord | null>(null);
  const [showExport, setShowExport] = useState(false);
  const { t } = useLanguage();

  useEffect(() => { ipc.refreshDates(); }, []);

  const loadDay = useCallback(async (date: string) => {
    setSelectedDate(date);
    const data = await ipc.getDayData(date);
    setDayData(data);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedDate) return;
    await ipc.deleteDay(selectedDate);
    setDayData(null);
    setSelectedDate(null);
    await ipc.refreshDates();
  }, [selectedDate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dayData) return;
    const container = canvas.parentElement;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const aspectRatio = 16 / 9;
    const canvasWidth = containerWidth;
    const canvasHeight = Math.floor(containerWidth / aspectRatio);
    canvas.width = canvasWidth * 2;
    canvas.height = canvasHeight * 2;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    if (dayData.samples.length > 0) {
      const palette = generatePalette(selectedDate || dayData.date);
      renderTheme(theme, ctx, dayData, palette, canvasWidth, canvasHeight);
    }
  }, [dayData, theme, selectedDate]);

  const handleExport = useCallback(async (width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedDate) return;
    await exportCanvasToPNG(canvas, theme, selectedDate, width, height);
    setShowExport(false);
  }, [theme, selectedDate]);

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">{t.galleryTitle}</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        <div>
          <Calendar availableDates={ipc.availableDates} selectedDate={selectedDate} onSelect={loadDay} />
        </div>
        <div>
          {selectedDate && dayData ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="section-date">{selectedDate}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => setShowExport(true)}>{t.galleryExport}</button>
                  <button className="btn btn-danger" onClick={handleDelete}>{t.galleryDelete}</button>
                </div>
              </div>
              <ThemePicker current={theme} onChange={setTheme} />
              <div className="gallery-canvas-container">
                <canvas ref={canvasRef} />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)', fontSize: 14 }}>
              {t.galleryEmpty}
            </div>
          )}
        </div>
      </div>
      {showExport && <ExportDialog onExport={handleExport} onClose={() => setShowExport(false)} />}
    </div>
  );
};