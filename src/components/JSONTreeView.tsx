import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface JSONTreeViewProps {
  data: any;
  expandAllTrigger: number;
  collapseAllTrigger: number;
}

export function JSONTreeView({ data, expandAllTrigger, collapseAllTrigger }: JSONTreeViewProps) {
  const { t } = useLanguage();

  if (data === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-400 dark:text-slate-500 font-sans text-sm">
        {t('json_tree_empty')}
      </div>
    );
  }

  return (
    <div className="p-4 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-100 select-text overflow-auto max-h-[58vh]">
      <ul className="list-none p-0 m-0">
        <TreeNode
          nodeKey="root"
          value={data}
          isLast={true}
          depth={0}
          expandAllTrigger={expandAllTrigger}
          collapseAllTrigger={collapseAllTrigger}
        />
      </ul>
    </div>
  );
}

interface TreeNodeProps {
  key?: string | number;
  nodeKey: string;
  value: any;
  isLast: boolean;
  depth: number;
  expandAllTrigger: number;
  collapseAllTrigger: number;
}

function TreeNode({
  nodeKey,
  value,
  isLast,
  depth,
  expandAllTrigger,
  collapseAllTrigger,
}: TreeNodeProps) {
  const isObj = value !== null && typeof value === 'object';
  const [isOpen, setIsOpen] = useState(true);

  // Synchronize top-level expand/collapse triggers
  useEffect(() => {
    if (expandAllTrigger > 0) {
      setIsOpen(true);
    }
  }, [expandAllTrigger]);

  useEffect(() => {
    if (collapseAllTrigger > 0) {
      setIsOpen(false);
    }
  }, [collapseAllTrigger]);

  const getTypeLabel = (val: any): string => {
    if (Array.isArray(val)) return `Array(${val.length})`;
    if (val === null) return 'null';
    if (typeof val === 'object') return `Object(${Object.keys(val).length})`;
    return typeof val;
  };

  const renderValueNode = (val: any) => {
    if (val === null) {
      return <span className="text-slate-400 dark:text-slate-500 italic">null</span>;
    }
    if (typeof val === 'string') {
      return <span className="text-emerald-600 dark:text-emerald-400 font-medium">"{val}"</span>;
    }
    if (typeof val === 'number') {
      return <span className="text-blue-600 dark:text-blue-400 font-medium">{val}</span>;
    }
    if (typeof val === 'boolean') {
      return <span className="text-amber-600 dark:text-amber-400 font-semibold">{String(val)}</span>;
    }
    return <span className="text-slate-800 dark:text-slate-200">{String(val)}</span>;
  };

  if (isObj) {
    const isArray = Array.isArray(value);
    const keys = isArray ? value.map((_: any, index: number) => String(index)) : Object.keys(value);
    const typeLabel = getTypeLabel(value);

    return (
      <li className="my-1">
        <div
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 py-0.5 px-1 rounded transition-colors group select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span className="text-indigo-900 dark:text-indigo-300 font-bold font-mono">{nodeKey}</span>
          <span className="text-slate-400 dark:text-slate-500">:</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-sans ml-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-medium border border-slate-200/50 dark:border-slate-700/50">
            {typeLabel}
          </span>
        </div>

        {isOpen && (
          <ul className="pl-5 border-l border-slate-150 dark:border-slate-800 ml-2.5 mt-0.5 list-none">
            {keys.map((k: string, idx: number) => {
              const childVal = isArray ? value[Number(k)] : value[k];
              return (
                <TreeNode
                  key={k}
                  nodeKey={k}
                  value={childVal}
                  isLast={idx === keys.length - 1}
                  depth={depth + 1}
                  expandAllTrigger={expandAllTrigger}
                  collapseAllTrigger={collapseAllTrigger}
                />
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  // Simple key-value display
  return (
    <li className="my-1 pl-5 py-0.5 flex items-start gap-1 flex-wrap font-mono">
      <span className="text-indigo-900 dark:text-indigo-300 font-bold">{nodeKey}</span>
      <span className="text-slate-400 dark:text-slate-500">:</span>
      <div className="break-all">{renderValueNode(value)}</div>
      {!isLast && <span className="text-slate-300 dark:text-slate-700">,</span>}
    </li>
  );
}
