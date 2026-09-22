import React, { useState, useEffect } from 'react';
import { TimestampResults } from '../types';
import { Copy, Clock, RefreshCw, Trash2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function TimestampTab() {
  const { t, lang } = useLanguage();
  const [tsInput, setTsInput] = useState('');
  const [tsUnit, setTsUnit] = useState<'s' | 'ms'>('s');

  const [dateInput, setDateInput] = useState('');

  const [results, setResults] = useState<TimestampResults>({
    local: '—',
    utc: '—',
    sec: '—',
    ms: '—',
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');

  const [liveNow, setLiveNow] = useState(new Date());

  // Running clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const padZ = (n: number) => String(n).padStart(2, '0');

  const formatLocal = (d: Date) => {
    return (
      `${d.getFullYear()}-${padZ(d.getMonth() + 1)}-${padZ(d.getDate())} ` +
      `${padZ(d.getHours())}:${padZ(d.getMinutes())}:${padZ(d.getSeconds())}`
    );
  };

  const formatUTC = (d: Date) => {
    return (
      `${d.getUTCFullYear()}-${padZ(d.getUTCMonth() + 1)}-${padZ(d.getUTCDate())} ` +
      `${padZ(d.getUTCHours())}:${padZ(d.getUTCMinutes())}:${padZ(d.getUTCSeconds())} UTC`
    );
  };

  // Set default initial values on component load
  useEffect(() => {
    const initDate = new Date();
    setTsInput(String(Math.floor(initDate.getTime() / 1000)));
    setDateInput(formatLocal(initDate));
    applyResults(initDate.getTime());
    setStatusMessage(lang === 'zh' ? '初始化成功。' : 'Initialized successfully.');
    setStatusType('success');
  }, []);

  const applyResults = (msValue: number) => {
    const d = new Date(msValue);
    setResults({
      local: formatLocal(d),
      utc: formatUTC(d),
      sec: String(Math.floor(msValue / 1000)),
      ms: String(msValue),
    });
  };

  const convertTsToDate = () => {
    const raw = tsInput.trim();
    if (!raw) {
      setStatusMessage(lang === 'zh' ? '请输入时间戳。' : 'Please enter a timestamp.');
      setStatusType('error');
      return;
    }
    if (!/^\d+$/.test(raw)) {
      setStatusMessage(lang === 'zh' ? '时间戳只能包含数字。' : 'Timestamp can only contain digits.');
      setStatusType('error');
      return;
    }
    const msValue = tsUnit === 's' ? Number(raw) * 1000 : Number(raw);
    const d = new Date(msValue);
    if (isNaN(d.getTime())) {
      setStatusMessage(lang === 'zh' ? '时间戳值超出有效范围。' : 'Timestamp value out of valid range.');
      setStatusType('error');
      return;
    }
    applyResults(msValue);
    setStatusMessage(lang === 'zh' ? '时间戳转换成功。' : 'Converted successfully.');
    setStatusType('success');
  };

  const convertDateToTs = () => {
    const raw = dateInput.trim();
    if (!raw) {
      setStatusMessage(lang === 'zh' ? '请输入日期。' : 'Please enter a date.');
      setStatusType('error');
      return;
    }
    // Try to replace slashes and standard conversions
    const normalized = raw.replace(/\//g, '-');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) {
      setStatusMessage(lang === 'zh' ? '日期格式无效，建议使用 2026-07-18 12:00:00。' : 'Invalid date format, e.g. 2026-07-18 12:00:00.');
      setStatusType('error');
      return;
    }
    applyResults(d.getTime());
    setStatusMessage(lang === 'zh' ? '日期转换成功。' : 'Converted successfully.');
    setStatusType('success');
  };

  const handleClearAll = () => {
    setTsInput('');
    setDateInput('');
    setResults({
      local: '—',
      utc: '—',
      sec: '—',
      ms: '—',
    });
    setStatusMessage(null);
    setStatusType('info');
  };

  const handleCopy = async (val: string) => {
    if (val === '—') return;
    try {
      await navigator.clipboard.writeText(val);
      setStatusMessage(t('copied'));
      setStatusType('success');
    } catch {
      // Fallback
      const el = document.createElement('input');
      el.value = val;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setStatusMessage(t('copied'));
      setStatusType('success');
    }
  };

  const setInputToCurrent = () => {
    const now = new Date();
    setTsInput(String(Math.floor(now.getTime() / 1000)));
    setDateInput(formatLocal(now));
    applyResults(now.getTime());
    setStatusMessage(lang === 'zh' ? '已同步为当前最新时间。' : 'Synced to current time.');
    setStatusType('success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
      {/* Left side: Input Forms */}
      <div className="flex flex-col gap-5">
        {/* Form 1: Timestamp to Date */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 select-none">
            <Clock size={16} className="text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('ts_to_date')}</h3>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="text"
              id="ts-input-field"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder={t('ts_input_placeholder')}
              className="flex-1 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 dark:focus:border-sky-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none transition-colors"
            />
            <button
              onClick={convertTsToDate}
              id="ts-to-date-btn"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-sm rounded-lg shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {t('convert')}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="tsUnit"
                  value="s"
                  checked={tsUnit === 's'}
                  onChange={() => setTsUnit('s')}
                  className="w-4 h-4 text-sky-600 border-slate-300 dark:border-slate-600 focus:ring-sky-500 cursor-pointer"
                />
                {t('ts_unit_sec')}
              </label>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="tsUnit"
                  value="ms"
                  checked={tsUnit === 'ms'}
                  onChange={() => setTsUnit('ms')}
                  className="w-4 h-4 text-sky-600 border-slate-300 dark:border-slate-600 focus:ring-sky-500 cursor-pointer"
                />
                {t('ts_unit_ms')}
              </label>
            </div>
            <button
              type="button"
              onClick={setInputToCurrent}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold cursor-pointer"
            >
              {lang === 'zh' ? '填入当前时间戳' : 'Use Current Timestamp'}
            </button>
          </div>
        </div>

        {/* Form 2: Date to Timestamp */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 select-none">
            <Calendar size={16} className="text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('date_to_ts')}</h3>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="text"
              id="date-input-field"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder={lang === 'zh' ? '例如: 2026-07-18 12:00:00' : 'e.g. 2026-07-18 12:00:00'}
              className="flex-1 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-amber-500 dark:focus:border-amber-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg outline-none transition-colors"
            />
            <button
              onClick={convertDateToTs}
              id="date-to-ts-btn"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-sm rounded-lg shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {t('convert')}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium select-none bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {t('current_time')}: <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">{formatLocal(liveNow)}</span>
            </span>
            <button
              onClick={setInputToCurrent}
              id="sync-current-time-btn"
              title={t('sync_now')}
              className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold cursor-pointer shrink-0"
            >
              <RefreshCw size={12} />
              {t('sync_now')}
            </button>
          </div>
        </div>
      </div>

      {/* Right side: Centralized display panel */}
      <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 select-none">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('ts_results_title')}</h3>
          <button
            onClick={handleClearAll}
            id="ts-clear-all-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-semibold text-xs sm:text-sm rounded-lg transition-all active:scale-98 cursor-pointer"
          >
            <Trash2 size={13} />
            {t('clear')}
          </button>
        </div>

        <div className="flex-grow flex flex-col justify-center divide-y divide-slate-100 dark:divide-slate-800 p-5">
          {/* Result 1: Local Time */}
          <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 sm:w-36">
              {t('local_time')}
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <input
                type="text"
                readOnly
                placeholder="—"
                value={results.local}
                id="result-local-input"
                className="flex-1 min-w-0 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 rounded-lg outline-none"
              />
              <button
                onClick={() => handleCopy(results.local)}
                disabled={results.local === '—'}
                id="copy-local-btn"
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all active:scale-98 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t('copy')}
              </button>
            </div>
          </div>

          {/* Result 2: UTC Time */}
          <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 sm:w-36">
              {t('utc_time')}
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <input
                type="text"
                readOnly
                placeholder="—"
                value={results.utc}
                id="result-utc-input"
                className="flex-1 min-w-0 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 rounded-lg outline-none"
              />
              <button
                onClick={() => handleCopy(results.utc)}
                disabled={results.utc === '—'}
                id="copy-utc-btn"
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all active:scale-98 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t('copy')}
              </button>
            </div>
          </div>

          {/* Result 3: Timestamp (s) */}
          <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 sm:w-36">
              {t('timestamp_sec')}
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <input
                type="text"
                readOnly
                placeholder="—"
                value={results.sec}
                id="result-sec-input"
                className="flex-1 min-w-0 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 rounded-lg outline-none"
              />
              <button
                onClick={() => handleCopy(results.sec)}
                disabled={results.sec === '—'}
                id="copy-sec-btn"
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all active:scale-98 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t('copy')}
              </button>
            </div>
          </div>

          {/* Result 4: Timestamp (ms) */}
          <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 sm:w-36">
              {t('timestamp_ms')}
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <input
                type="text"
                readOnly
                placeholder="—"
                value={results.ms}
                id="result-ms-input"
                className="flex-1 min-w-0 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 rounded-lg outline-none"
              />
              <button
                onClick={() => handleCopy(results.ms)}
                disabled={results.ms === '—'}
                id="copy-ms-btn"
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all active:scale-98 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t('copy')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 text-xs font-medium select-none">
          {statusType === 'success' ? (
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : statusType === 'error' ? (
            <AlertCircle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
          ) : (
            <Clock size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          )}
          <span
            className={`truncate ${
              statusType === 'success'
                ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                : statusType === 'error'
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {statusMessage || (lang === 'zh' ? '等待输入。' : 'Waiting for input.')}
          </span>
        </div>
      </div>
    </div>
  );
}
