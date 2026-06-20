import React from 'react';
import type { ThemeName } from '../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';

interface Props { current: ThemeName; onChange: (t: ThemeName) => void; }

export const ThemePicker: React.FC<Props> = ({ current, onChange }) => {
  const { t } = useLanguage();
  const names: ThemeName[] = ['terrain', 'ink', 'neon'];
  const labels: Record<ThemeName, string> = {
    terrain: t.themeTerrain,
    ink: t.themeInk,
    neon: t.themeNeon,
  };

  return (
    <div className="theme-picker">
      {names.map(name => (
        <button key={name} className={`theme-btn ${current === name ? 'active' : ''}`} onClick={() => onChange(name)}>
          {labels[name]}
        </button>
      ))}
    </div>
  );
};