import React, { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  availableDates: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export const Calendar: React.FC<Props> = ({ availableDates, selectedDate, onSelect }) => {
  const { t } = useLanguage();
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const dateSet = useMemo(() => new Set(availableDates), [availableDates]);

  const DAY_NAMES = [t.calSun, t.calMon, t.calTue, t.calWed, t.calThu, t.calFri, t.calSat];
  const MONTH_NAMES = [
    t.calJanuary, t.calFebruary, t.calMarch, t.calApril, t.calMay, t.calJune,
    t.calJuly, t.calAugust, t.calSeptember, t.calOctober, t.calNovember, t.calDecember,
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const days: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn" onClick={prevMonth} style={{ padding: '4px 10px' }}>←</button>
        <span style={{ fontWeight: 600 }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button className="btn" onClick={nextMonth} style={{ padding: '4px 10px' }}>→</button>
      </div>
      <div className="calendar-grid">
        {DAY_NAMES.map(d => (<div key={d} className="calendar-header">{d}</div>))}
        {days.map((dateStr, i) => {
          if (dateStr === null) return <div key={`empty-${i}`} className="calendar-day empty" />;
          const hasData = dateSet.has(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dayNum = parseInt(dateStr.split('-')[2], 10);
          return (
            <div
              key={dateStr}
              className={`calendar-day ${hasData ? 'has-data' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(dateStr)}
              title={dateStr}
              style={isToday && !isSelected ? { borderColor: 'var(--accent)' } : undefined}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
};