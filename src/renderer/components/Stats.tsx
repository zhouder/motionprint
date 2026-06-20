import React from 'react';
import type { DayStats } from '../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';
import type { TranslationDict } from '../i18n/translations';

interface Props { stats: DayStats | null; }

function formatDistance(pixels: number, t: TranslationDict): string {
  // Mouse coordinates are in DIPs (device-independent pixels at 96 DPI)
  // 96 DIPs = 1 logical inch = 0.0254 meters
  const meters = (pixels / 96) * 0.0254;
  if (meters < 200) {
    const cm = meters * 100;
    return `${cm.toFixed(0)} cm`;
  }
  if (meters < 1000) return `${meters.toFixed(0)} ${t.unitMeters}`;
  return `${(meters / 1000).toFixed(1)} ${t.unitKilometers}`;
}

function formatTime(ms: number, t: TranslationDict): string {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}${t.unitHours} ${minutes}${t.unitMinutes}`;
  return `${minutes}${t.unitMinutes}`;
}

function formatDuration(ms: number, t: TranslationDict): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}${t.unitSeconds}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}${t.unitMinutes}`;
  const hours = Math.floor(minutes / 60);
  return `${hours}${t.unitHours} ${minutes % 60}${t.unitMinutes}`;
}

export const Stats: React.FC<Props> = ({ stats }) => {
  const { t } = useLanguage();

  const labels = [t.statDistance, t.statActiveTime, t.statClicks, t.statScrolls, t.statLongestPause, t.statSamples];
  const values = stats
    ? [formatDistance(stats.totalDistance, t), formatTime(stats.activeTime, t), stats.clicks.toLocaleString(), stats.scrolls.toLocaleString(), formatDuration(stats.longestPause, t), stats.sampleCount.toLocaleString()]
    : ['--', '--', '--', '--', '--', '--'];

  return (
    <div className="stats-grid">
      {labels.map((label, i) => (
        <div className="stat-card" key={label}>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{values[i]}</div>
        </div>
      ))}
    </div>
  );
};