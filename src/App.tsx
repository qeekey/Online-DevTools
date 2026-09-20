import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import { JSONTab } from './components/JSONTab';
import { MD5Tab } from './components/MD5Tab';
import { URLEncodeTab } from './components/URLEncodeTab';
import { Base64Tab } from './components/Base64Tab';
import { TimestampTab } from './components/TimestampTab';
import { JWTTab } from './components/JWTTab';
import { useLanguage } from './i18n/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCode,
  Fingerprint,
  Link2,
  Binary,
  Clock,
  KeyRound,
  Wrench,
  Terminal,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AppTab>('json');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const tabsConfig = [
    { id: 'json' as AppTab, label: t('tab_json'), icon: FileCode, desc: t('tab_json_desc') },
    { id: 'jwt' as AppTab, label: t('tab_jwt'), icon: KeyRound, desc: t('tab_jwt_desc') },
    { id: 'md5' as AppTab, label: t('tab_md5'), icon: Fingerprint, desc: t('tab_md5_desc') },
    { id: 'urlencode' as AppTab, label: t('tab_urlencode'), icon: Link2, desc: t('tab_urlencode_desc') },
    { id: 'base64' as AppTab, label: t('tab_base64'), icon: Binary, desc: t('tab_base64_desc') },
    { id: 'timestamp' as AppTab, label: t('tab_timestamp'), icon: Clock, desc: t('tab_timestamp_desc') },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'json':
        return <JSONTab />;
      case 'jwt':
        return <JWTTab />;
      case 'md5':
        return <MD5Tab />;
      case 'urlencode':
        return <URLEncodeTab />;
      case 'base64':
        return <Base64Tab />;
      case 'timestamp':
        return <TimestampTab />;
      default:
        return <JSONTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-100 dark:selection:bg-sky-950 selection:text-sky-900 dark:selection:text-sky-200 transition-colors duration-200">
      {/* Upper gradient header band */}
      <div className="w-full h-1 bg-gradient-to-r from-sky-500 via-amber-500 to-indigo-600"></div>

      {/* Hero Header Section */}
      <header className="max-w-7xl w-full mx-auto px-4 pt-8 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/10">
              <Terminal size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                {t('appTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2.5 py-1.5 rounded-full shadow-xs">
              <Wrench size={12} className="text-slate-500 dark:text-slate-400" />
              {t('privacyBadge')}
            </span>

            {/* Language Selector Switcher */}
            <div
              className="inline-flex items-center rounded-full border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0.5 shadow-xs text-xs font-bold text-slate-600 dark:text-slate-300"
              role="group"
              aria-label={t('langSelect')}
            >
              <div className="flex items-center px-1.5 text-slate-400 dark:text-slate-500">
                <Languages size={13} />
              </div>
              <button
                type="button"
                id="lang-zh-btn"
                onClick={() => setLang('zh')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'zh'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="切换为简体中文"
              >
                中文
              </button>
              <button
                type="button"
                id="lang-en-btn"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Global Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              id="theme-toggle-btn"
              title={isDark ? t('switchToLight') : t('switchToDark')}
              aria-label={isDark ? t('switchToLight') : t('switchToDark')}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer shadow-xs active:scale-95 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            >
              {isDark ? (
                <>
                  <Sun size={14} className="text-amber-400" />
                  <span>{t('lightMode')}</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-sky-600" />
                  <span>{t('darkMode')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Panel Area */}
      <main className="max-w-7xl w-full mx-auto px-4 flex-1 flex flex-col gap-5 pb-16">
        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-thin border-b border-slate-200 dark:border-slate-800">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 font-bold text-xs sm:text-sm transition-all rounded-t-xl whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 border-b-2 border-sky-600 dark:border-sky-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'} />
                {tab.label}

                {/* Animated slider pill background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-600 dark:bg-sky-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Dynamic description of active tool */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-3 shadow-xs text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between gap-3">
          <span>
            <strong className="text-slate-700 dark:text-slate-200">{t('currentTool')}</strong>
            {tabsConfig.find((t) => t.id === activeTab)?.desc}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
            {t('clientOnlyTip')}
          </span>
        </div>

        {/* Tab content wrapper with smooth key anim transitions */}
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer copyright section */}
      <footer className="w-full bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>{t('footerCopyright')}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 dark:hover:text-slate-400 font-medium transition-colors">
              {t('footerTip')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
