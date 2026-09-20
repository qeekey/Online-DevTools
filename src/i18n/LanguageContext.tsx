import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'devtools_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') {
      return saved;
    }
    // Check user's browser language preference
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }
    return 'zh';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang === 'zh' ? 'zh-CN' : 'en';
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    }
  }, [lang]);

  const value = useMemo(() => {
    const t = (key: TranslationKey): string => {
      const dict = translations[lang] || translations.zh;
      return (dict as any)[key] || (translations.zh as any)[key] || key;
    };
    return { lang, setLang, t };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
