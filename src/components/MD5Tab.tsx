import React, { useState } from 'react';
import { md5 } from '../utils/md5';
import { useLanguage } from '../i18n/LanguageContext';
import { Copy, FileText, CheckCircle2 } from 'lucide-react';

export function MD5Tab() {
  const { t, lang } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const getMD5Values = () => {
    if (!inputText) {
      return { u32: '', l32: '', u16: '', l16: '' };
    }
    const l32 = md5(inputText);
    const u32 = l32.toUpperCase();
    const l16 = l32.slice(8, 24);
    const u16 = l16.toUpperCase();
    return { u32, l32, u16, l16 };
  };

  const { u32, l32, u16, l16 } = getMD5Values();

  const handleCopy = async (val: string, key: string) => {
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      setCopyStatus(key);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = val;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopyStatus(key);
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
      {/* Left side: Input */}
      <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 select-none">
          <FileText size={16} className="text-slate-500 dark:text-slate-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('md5_input_label')}</h3>
        </div>
        <textarea
          id="md5-input-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('md5_input_placeholder')}
          spellCheck={false}
          className="w-full flex-1 min-h-[300px] lg:min-h-[400px] p-4 bg-[#15191f] dark:bg-[#0f1318] text-slate-200 font-mono text-sm leading-relaxed border-0 outline-none resize-none"
        />
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 text-xs text-slate-500 dark:text-slate-400 font-medium select-none">
          {inputText ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              {lang === 'zh' ? 'MD5 哈希计算已就绪。' : 'MD5 hash calculation ready.'}
            </span>
          ) : (
            lang === 'zh' ? '等待输入原始文本。' : 'Waiting for text input.'
          )}
        </div>
      </div>

      {/* Right side: Results */}
      <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden justify-between">
        <div className="flex flex-col flex-grow">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 select-none">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{lang === 'zh' ? 'MD5 哈希摘要结果' : 'MD5 Hash Digest Results'}</h3>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 p-4">
            {/* 32-bit Upper */}
            <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-shrink-0 min-w-24">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block sm:inline">
                  {t('md5_32_upper')}
                </span>
              </div>
              <div className="flex-grow flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  readOnly
                  placeholder="—"
                  value={u32}
                  id="md5-u32-input"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 rounded-lg outline-none select-all"
                />
                <button
                  onClick={() => handleCopy(u32, 'u32')}
                  disabled={!u32}
                  id="md5-u32-copy-btn"
                  className={`flex items-center gap-1 px-3 py-2 font-semibold text-xs rounded-lg transition-all border shrink-0 ${
                    !u32
                      ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : copyStatus === 'u32'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 cursor-pointer'
                  }`}
                >
                  <Copy size={13} />
                  {copyStatus === 'u32' ? t('copied') : t('copy')}
                </button>
              </div>
            </div>

            {/* 32-bit Lower */}
            <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-shrink-0 min-w-24">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block sm:inline">
                  {t('md5_32_lower')}
                </span>
              </div>
              <div className="flex-grow flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  readOnly
                  placeholder="—"
                  value={l32}
                  id="md5-l32-input"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 rounded-lg outline-none select-all"
                />
                <button
                  onClick={() => handleCopy(l32, 'l32')}
                  disabled={!l32}
                  id="md5-l32-copy-btn"
                  className={`flex items-center gap-1 px-3 py-2 font-semibold text-xs rounded-lg transition-all border shrink-0 ${
                    !l32
                      ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : copyStatus === 'l32'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 cursor-pointer'
                  }`}
                >
                  <Copy size={13} />
                  {copyStatus === 'l32' ? t('copied') : t('copy')}
                </button>
              </div>
            </div>

            {/* 16-bit Upper */}
            <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-shrink-0 min-w-24">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block sm:inline">
                  {t('md5_16_upper')}
                </span>
              </div>
              <div className="flex-grow flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  readOnly
                  placeholder="—"
                  value={u16}
                  id="md5-u16-input"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 rounded-lg outline-none select-all"
                />
                <button
                  onClick={() => handleCopy(u16, 'u16')}
                  disabled={!u16}
                  id="md5-u16-copy-btn"
                  className={`flex items-center gap-1 px-3 py-2 font-semibold text-xs rounded-lg transition-all border shrink-0 ${
                    !u16
                      ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : copyStatus === 'u16'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 cursor-pointer'
                  }`}
                >
                  <Copy size={13} />
                  {copyStatus === 'u16' ? t('copied') : t('copy')}
                </button>
              </div>
            </div>

            {/* 16-bit Lower */}
            <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-shrink-0 min-w-24">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block sm:inline">
                  {t('md5_16_lower')}
                </span>
              </div>
              <div className="flex-grow flex items-center gap-2 min-w-0">
                <input
                  type="text"
                  readOnly
                  placeholder="—"
                  value={l16}
                  id="md5-l16-input"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-200 rounded-lg outline-none select-all"
                />
                <button
                  onClick={() => handleCopy(l16, 'l16')}
                  disabled={!l16}
                  id="md5-l16-copy-btn"
                  className={`flex items-center gap-1 px-3 py-2 font-semibold text-xs rounded-lg transition-all border shrink-0 ${
                    !l16
                      ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : copyStatus === 'l16'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 cursor-pointer'
                  }`}
                >
                  <Copy size={13} />
                  {copyStatus === 'l16' ? t('copied') : t('copy')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 text-xs text-slate-400 dark:text-slate-500 font-mono select-none">
          {t('md5_hint')}
        </div>
      </div>
    </div>
  );
}
