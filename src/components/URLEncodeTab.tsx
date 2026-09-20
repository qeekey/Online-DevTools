import React, { useState, useRef } from 'react';
import { Copy, Trash2, ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function URLEncodeTab() {
  const { t, lang } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'none' | 'encode' | 'decode'>('none');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');

  const outputRef = useRef<HTMLTextAreaElement>(null);

  const handleEncode = () => {
    const val = inputText.trim();
    if (!val) {
      setStatusMessage(lang === 'zh' ? '请输入需要编码的字符串。' : 'Please enter a string to encode.');
      setStatusType('error');
      return;
    }
    try {
      const encoded = encodeURIComponent(val);
      setOutputText(encoded);
      setMode('encode');
      setStatusMessage(lang === 'zh' ? '编码完成。' : 'Encoded successfully.');
      setStatusType('success');
    } catch {
      setStatusMessage(lang === 'zh' ? '编码失败：存在无效字符。' : 'Encode failed: Invalid characters detected.');
      setStatusType('error');
    }
  };

  const handleDecode = () => {
    const val = inputText.trim();
    if (!val) {
      setStatusMessage(lang === 'zh' ? '请输入需要解码的字符串。' : 'Please enter a string to decode.');
      setStatusType('error');
      return;
    }
    try {
      const decoded = decodeURIComponent(val);
      setOutputText(decoded);
      setMode('decode');
      setStatusMessage(lang === 'zh' ? '解码完成。' : 'Decoded successfully.');
      setStatusType('success');
    } catch {
      setStatusMessage(lang === 'zh' ? '解码失败：URL 格式无效，包含非法的百分号编码字符。' : 'Decode failed: Invalid URI malformed format.');
      setStatusType('error');
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setMode('none');
    setStatusMessage(null);
    setStatusType('info');
  };

  const handleCopy = async () => {
    if (!outputText) {
      setStatusMessage(lang === 'zh' ? '没有可复制的内容。' : 'No content to copy.');
      setStatusType('error');
      return;
    }
    try {
      await navigator.clipboard.writeText(outputText);
      setStatusMessage(t('copied'));
      setStatusType('success');
    } catch {
      if (outputRef.current) {
        outputRef.current.select();
        document.execCommand('copy');
        setStatusMessage(t('copied'));
        setStatusType('success');
      }
    }
  };

  const getResultTitle = () => {
    if (mode === 'encode') return lang === 'zh' ? '编码结果 (Encode Result)' : 'Encode Result';
    if (mode === 'decode') return lang === 'zh' ? '解码结果 (Decode Result)' : 'Decode Result';
    return lang === 'zh' ? '结果' : 'Result';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
      {/* Left side: Controls and input */}
      <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-2">
            <button
              onClick={handleEncode}
              id="url-encode-btn"
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all active:scale-98 cursor-pointer"
            >
              {t('encode')}
            </button>
            <button
              onClick={handleDecode}
              id="url-decode-btn"
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all active:scale-98 cursor-pointer"
            >
              {t('decode')}
            </button>
          </div>
          <button
            onClick={handleClear}
            id="url-clear-btn"
            className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-semibold text-xs sm:text-sm rounded-lg transition-all active:scale-98 cursor-pointer"
          >
            <Trash2 size={13} />
            {t('clear')}
          </button>
        </div>

        <textarea
          id="url-input-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('url_input_placeholder')}
          spellCheck={false}
          className="w-full flex-1 min-h-[300px] lg:min-h-[400px] p-4 bg-[#15191f] dark:bg-[#0f1318] text-[#e8edf3] font-mono text-sm leading-relaxed border-0 outline-none resize-none"
        />

        <div className="flex items-center gap-1.5 p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 text-xs font-medium select-none">
          {statusType === 'success' ? (
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : statusType === 'error' ? (
            <AlertCircle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
          ) : (
            <ArrowRightLeft size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
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

      {/* Right side: Results panel */}
      <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 select-none">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{getResultTitle()}</h3>
          <button
            onClick={handleCopy}
            disabled={!outputText}
            id="url-copy-btn"
            className={`flex items-center gap-1 px-3 py-1.5 font-semibold text-xs rounded-lg transition-all border shrink-0 ${
              !outputText
                ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 cursor-pointer'
            }`}
          >
            <Copy size={13} />
            {t('copy')}
          </button>
        </div>

        <textarea
          ref={outputRef}
          id="url-output-textarea"
          value={outputText}
          readOnly
          placeholder={lang === 'zh' ? '转换结果将在此处展示…' : 'Converted result will appear here…'}
          className="w-full flex-1 min-h-[300px] lg:min-h-[400px] p-4 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-sm leading-relaxed border-0 outline-none resize-none"
        />
      </div>
    </div>
  );
}
