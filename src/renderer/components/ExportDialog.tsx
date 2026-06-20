import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { WALLPAPER_SIZES } from '../utils/export';

interface Props {
  onExport: (width: number, height: number) => void;
  onClose: () => void;
}

export const ExportDialog: React.FC<Props> = ({ onExport, onClose }) => {
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const { t } = useLanguage();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{t.exportTitle}</h2>
        <p>{t.exportPrompt}</p>

        {mode === 'preset' && (
          <div className="export-sizes">
            {WALLPAPER_SIZES.filter(s => s.width > 0).map(size => (
              <button key={size.label} className="export-size-btn" onClick={() => onExport(size.width, size.height)}>
                <div style={{ fontWeight: 600 }}>{size.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{size.width}×{size.height}</div>
              </button>
            ))}
            <button className="export-size-btn" onClick={() => setMode('custom')}>
              <div style={{ fontWeight: 600 }}>{t.exportCustom}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t.exportSetSize}</div>
            </button>
          </div>
        )}

        {mode === 'custom' && (
          <div style={{ margin: '16px 0' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: 13 }}>{t.exportWidth}:</label>
              <input type="number" value={customW} onChange={e => setCustomW(Number(e.target.value))} min={100} max={7680} className="export-input" />
              <label style={{ fontSize: 13 }}>{t.exportHeight}:</label>
              <input type="number" value={customH} onChange={e => setCustomH(Number(e.target.value))} min={100} max={7680} className="export-input" />
            </div>
            <button className="btn btn-primary" onClick={() => onExport(customW, customH)} style={{ width: '100%' }}>
              {t.exportTitle} {customW}×{customH}
            </button>
            <button className="btn" onClick={() => setMode('preset')} style={{ width: '100%', marginTop: 8 }}>
              {t.exportBackToPresets}
            </button>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>{t.exportCancel}</button>
        </div>
      </div>
    </div>
  );
};