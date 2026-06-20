import React, { useState } from 'react';
import { useIpc } from './hooks/useIpc';
import { useLanguage } from './i18n/LanguageContext';
import { PrivacyNotice } from './components/PrivacyNotice';
import { LivePreview } from './components/LivePreview';
import { Gallery } from './components/Gallery';
import { Settings } from './components/Settings';

type Tab = 'live' | 'gallery' | 'settings';

export const AppContent: React.FC = () => {
  const [tab, setTab] = useState<Tab>('live');
  const ipc = useIpc();
  const { t, lang, toggleLang } = useLanguage();

  return (
    <>
      {!ipc.privacyAccepted && (
        <PrivacyNotice onAccept={ipc.acceptPrivacy} />
      )}

      <div className="app-container">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <span className="logo-dot" />
            Motion<span>Print</span>
          </div>
          <div className="sidebar-nav">
            <button
              className={`nav-item ${tab === 'live' ? 'active' : ''}`}
              onClick={() => setTab('live')}
            >
              <span className="nav-icon">◆</span>
              {t.navToday}
            </button>
            <button
              className={`nav-item ${tab === 'gallery' ? 'active' : ''}`}
              onClick={() => setTab('gallery')}
            >
              <span className="nav-icon">▣</span>
              {t.navGallery}
            </button>
            <button
              className={`nav-item ${tab === 'settings' ? 'active' : ''}`}
              onClick={() => setTab('settings')}
            >
              <span className="nav-icon">◎</span>
              {t.navSettings}
            </button>
          </div>

          <div className="sidebar-footer">
            <button className="lang-toggle" onClick={toggleLang} title={lang === 'zh' ? 'Switch to English' : '切换到中文'}>
              {lang === 'zh' ? 'EN' : '中'}
            </button>
          </div>
        </nav>

        <main className="main-content">
          {tab === 'live' && <LivePreview ipc={ipc} />}
          {tab === 'gallery' && <Gallery ipc={ipc} />}
          {tab === 'settings' && <Settings ipc={ipc} />}
        </main>
      </div>
    </>
  );
};