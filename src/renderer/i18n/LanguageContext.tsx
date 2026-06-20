// ============================================================
// MotionPrint — Language Context
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Language, TranslationDict } from './translations';
import { translations } from './translations';

interface LanguageContextType {
  lang: Language;
  t: TranslationDict;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
});

const STORAGE_KEY = 'motionprint-language';

function detectLanguage(): Language {
  // Check stored preference
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
  } catch { /* ignore */ }

  // Detect from navigator
  const navLang = navigator.language.toLowerCase();
  if (navLang.startsWith('zh')) return 'zh';

  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(detectLanguage);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'zh' ? 'en' : 'zh';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const t = translations[lang];

  // Sync document language attribute
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}