import React, { useState, useRef, useEffect } from 'react';
import { parseJsonValue, getParseErrorLineColumn, findFoldRanges, splitLines } from '../utils/jsonParser';
import { JSONTreeView } from './JSONTreeView';
import { JSONParseError } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Copy, Trash2, AlignLeft, Minimize, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export function JSONTab() {
  const { t, lang } = useLanguage();
  const [rawInput, setRawInput] = useState('');
  const [parsedData, setParsedData] = useState<any>(undefined);
  const [errorState, setErrorState] = useState<JSONParseError | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');

  const [expandTrigger, setExpandTrigger] = useState(0);
  const [collapseTrigger, setCollapseTrigger] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Synchronize scrolling of textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lines = splitLines(rawInput);

  // Update line numbering on resize or scroll changes
  useEffect(() => {
    handleScroll();
  }, [rawInput]);

  // Handler for custom Tab spacing keydowns
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      setRawInput(newVal);

      // Restore selection after rendering
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Perform formatting or compression
  const runTransform = (mode: 'format' | 'compress') => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setStatusMessage(t('json_please_input'));
      setStatusType('error');
      setErrorState(null);
      setParsedData(undefined);
      return;
    }

    try {
      const data = parseJsonValue(trimmed);
      const nextValue = mode === 'format' ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      setRawInput(nextValue);
      setParsedData(data);
      setErrorState(null);
      setStatusMessage(mode === 'format' ? t('json_format_success') : t('json_compress_success'));
      setStatusType('success');
    } catch (err: any) {
      // Synchronize tree view state
      try {
        const fallbackData = JSON.parse(trimmed);
        setParsedData(fallbackData);
      } catch {
        setParsedData(undefined);
      }

      setErrorState(err);
      const lineText = err.line ? `${t('json_line')} ${err.line}` : '';
      const colText = err.column ? `, ${t('json_col')} ${err.column}` : '';
      const location = lineText || colText ? ` (${lineText}${colText})` : '';
      setStatusMessage(`${t('json_syntax_error')}: ${err.message}${location}`);
      setStatusType('error');
    }
  };

  const handleCopy = async () => {
    if (!rawInput.trim()) {
      setStatusMessage(lang === 'zh' ? '没有可复制的内容。' : 'No content to copy.');
      setStatusType('error');
      return;
    }
    try {
      await navigator.clipboard.writeText(rawInput);
      setStatusMessage(t('copied'));
      setStatusType('success');
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setStatusMessage(t('copied'));
        setStatusType('success');
      }
    }
  };

  const handleClear = () => {
    setRawInput('');
    setParsedData(undefined);
    setErrorState(null);
    setStatusMessage(null);
    setStatusType('info');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawInput(val);
    setErrorState(null);

    if (!val.trim()) {
      setParsedData(undefined);
      setStatusMessage(null);
      setStatusType('info');
      return;
    }

    // Try parsing silently to build dynamic tree view
    try {
      const quickParsed = JSON.parse(val);
      setParsedData(quickParsed);
    } catch {
      // Keep existing parsed tree or hide if totally invalid
    }

    setStatusMessage(lang === 'zh' ? '已输入内容，可执行格式化或压缩。' : 'Content ready to format or minify.');
    setStatusType('info');
  };

  // Render precise error indicators inside the snippet container
  const renderErrorSnippet = () => {
    if (!errorState || !errorState.line) return null;
    const errLineIndex = errorState.line - 1;
    const targetLine = lines[errLineIndex];
    if (targetLine === undefined) return null;

    const columnIndex = Math.max((errorState.column || 1) - 1, 0);
    const before = targetLine.slice(0, columnIndex);
    const marked = targetLine[columnIndex] || ' ';
    const after = targetLine.slice(columnIndex + 1);

    return (
      <div className="border-t border-red-950/30 px-4 py-2.5 text-xs text-red-200 bg-red-950/80 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
        <span>{t('json_line')} {errorState.line}: </span>
        <span>{before}</span>
        <span className="bg-red-600 text-white px-0.5 rounded font-bold animate-pulse">{marked}</span>
        <span>{after}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
      {/* Left side: Editor panel */}
      <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-2">
            <button
              onClick={() => runTransform('format')}
              id="json-format-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <AlignLeft size={14} />
              {t('format')}
            </button>
            <button
              onClick={() => runTransform('compress')}
              id="json-compress-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <Minimize size={14} />
              {t('compress')}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              id="json-copy-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-semibold text-xs sm:text-sm rounded-lg transition-all active:scale-98 cursor-pointer"
            >
              <Copy size={13} />
              {t('copy')}
            </button>
            <button
              onClick={handleClear}
              id="json-clear-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-semibold text-xs sm:text-sm rounded-lg transition-all active:scale-98 cursor-pointer"
            >
              <Trash2 size={13} />
              {t('clear')}
            </button>
          </div>
        </div>

        {/* Text Editor Core */}
        <div className="relative flex flex-1 bg-[#15191f] dark:bg-[#0f1318] min-h-[50vh] max-h-[58vh]">
          {/* Custom Sync Line Numbers Bar */}
          <div
            ref={lineNumbersRef}
            className="absolute left-0 top-0 bottom-0 w-12 py-4 select-none border-r border-slate-800 dark:border-slate-800/80 text-slate-500 font-mono text-xs leading-relaxed text-right pr-2 overflow-hidden bg-slate-900/40 dark:bg-slate-950/50"
          >
            {lines.map((_, idx) => (
              <div
                key={idx}
                className={`h-[23.1px] leading-[23.1px] pr-1.5 ${
                  errorState && errorState.line === idx + 1 ? 'text-red-500 font-bold bg-red-950/20' : ''
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            id="json-input-textarea"
            value={rawInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            placeholder={t('json_placeholder')}
            className="w-full h-[50vh] sm:h-[58vh] pl-14 pr-4 py-4 resize-none bg-transparent text-[#e8edf3] font-mono text-xs sm:text-sm leading-relaxed border-0 outline-none overflow-y-auto"
          />
        </div>

        {/* Dynamic Parse Error Snippet */}
        {renderErrorSnippet()}

        {/* Left footer status */}
        <div className="flex items-center justify-between gap-3 p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 text-xs text-slate-500 dark:text-slate-400 font-medium select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            {statusType === 'success' ? (
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : statusType === 'error' ? (
              <AlertCircle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
            ) : (
              <Layers size={14} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />
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
              {statusMessage || t('json_waiting_input')}
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex-shrink-0 border border-slate-200/50 dark:border-slate-700">
            {lang === 'zh' ? 'Tab 键缩进 (2空格)' : 'Tab Indent (2 spaces)'}
          </span>
        </div>
      </div>

      {/* Right side: Tree visualizer */}
      <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-md overflow-hidden min-w-0">
        <div className="flex items-center justify-between gap-3 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm select-none">{t('json_tree_title')}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandTrigger(p => p + 1)}
              id="json-tree-expand-all"
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-bold text-xs sm:text-sm rounded-lg transition-all active:scale-98 cursor-pointer"
            >
              {t('json_expand_all')}
            </button>
            <button
              onClick={() => setCollapseTrigger(p => p + 1)}
              id="json-tree-collapse-all"
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-bold text-xs sm:text-sm rounded-lg transition-all active:scale-98 cursor-pointer"
            >
              {t('json_collapse_all')}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto min-h-[50vh] max-h-[58vh]">
          <JSONTreeView
            data={parsedData}
            expandAllTrigger={expandTrigger}
            collapseAllTrigger={collapseTrigger}
          />
        </div>
      </div>
    </div>
  );
}
