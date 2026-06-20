import React, { useState, useEffect } from 'react';
import type { Settings as SettingsType } from '../../shared/types';
import { useLanguage } from '../i18n/LanguageContext';

interface IpcState {
  settings: SettingsType | null;
  updateSettings: (partial: Partial<SettingsType>) => Promise<void>;
  refreshDates: () => Promise<void>;
  clearAll: () => Promise<void>;
}

interface Props { ipc: IpcState }

export const Settings: React.FC<Props> = ({ ipc }) => {
  const [localSettings, setLocalSettings] = useState<Partial<SettingsType>>({});
  const [saved, setSaved] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (ipc.settings) setLocalSettings({ ...ipc.settings });
  }, [ipc.settings]);

  const update = async (key: keyof SettingsType, value: unknown) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    await ipc.updateSettings({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearAll = async () => {
    if (window.confirm(t.settingsConfirmDelete)) {
      await ipc.clearAll();
      await ipc.refreshDates();
    }
  };

  if (!ipc.settings) return null;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">{t.settingsTitle}</h2>
        {saved && <span style={{ color: 'var(--success)', fontSize: 13 }}>{t.settingsSaved}</span>}
      </div>

      <div className="settings-section">
        <h3>{t.settingsRecording}</h3>
        <div className="settings-row">
          <label>{t.settingsSamplingRate}</label>
          <select value={localSettings.samplingRate ?? ipc.settings.samplingRate} onChange={e => update('samplingRate', Number(e.target.value))}>
            <option value={10}>10 Hz</option>
            <option value={20}>20 Hz</option>
            <option value={30}>30 Hz</option>
            <option value={60}>60 Hz</option>
          </select>
        </div>
        <div className="settings-row">
          <label>{t.settingsIdleThreshold}</label>
          <input type="number" value={Math.floor((localSettings.idleThreshold ?? ipc.settings.idleThreshold) / 1000)} onChange={e => update('idleThreshold', Number(e.target.value) * 1000)} min={10} max={600} />
        </div>
        <div className="settings-row">
          <label>{t.settingsIdleSamplingRate}</label>
          <select value={localSettings.idleSamplingRate ?? ipc.settings.idleSamplingRate} onChange={e => update('idleSamplingRate', Number(e.target.value))}>
            <option value={1}>1 Hz</option>
            <option value={2}>2 Hz</option>
            <option value={5}>5 Hz</option>
          </select>
        </div>
        <div className="settings-row">
          <label>{t.settingsLaunchAtStartup}</label>
          <input type="checkbox" checked={localSettings.launchAtStartup ?? ipc.settings.launchAtStartup} onChange={e => update('launchAtStartup', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
        </div>
      </div>

      <div className="settings-section">
        <h3>{t.settingsDataRetention}</h3>
        <div className="settings-row">
          <label>{t.settingsKeepRawData}</label>
          <input type="checkbox" checked={localSettings.keepRawData ?? ipc.settings.keepRawData} onChange={e => update('keepRawData', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
        </div>
        <div className="settings-row">
          <label>{t.settingsRetentionPeriod}</label>
          <input type="number" value={localSettings.retentionDays ?? ipc.settings.retentionDays} onChange={e => update('retentionDays', Number(e.target.value))} min={0} max={365} />
        </div>
      </div>

      <div className="settings-section">
        <h3>{t.settingsDangerZone}</h3>
        <div className="settings-row">
          <label>{t.settingsDeleteAllData}</label>
          <button className="btn btn-danger" onClick={handleClearAll}>{t.settingsClearAll}</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t.settingsAbout}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {t.settingsAboutText}
        </p>
      </div>
    </div>
  );
};