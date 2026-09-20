import { JSONParseError } from '../types';

export function parseJsonValue(value: string): any {
  try {
    return JSON.parse(value);
  } catch (standardError: any) {
    let normalized: string;
    try {
      normalized = normalizeLooseJson(value);
    } catch (looseError: any) {
      throw decorateParseError(looseError, value);
    }
    try {
      return JSON.parse(normalized);
    } catch (normalizedError: any) {
      throw decorateParseError(normalizedError, value);
    }
  }
}

function normalizeLooseJson(value: string): string {
  let result = '';
  let quote = '';
  let current = '';
  let escaping = false;
  let line = 1;
  let column = 0;
  let quoteStartLine = 1;
  let quoteStartColumn = 1;

  for (const char of value) {
    column += 1;
    if (!quote) {
      if (char === '"' || char === "'") {
        quote = char;
        current = '';
        escaping = false;
        quoteStartLine = line;
        quoteStartColumn = column;
      } else {
        result += char;
      }
      if (char === '\n') {
        line += 1;
        column = 0;
      }
      continue;
    }
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }
    if (char === '\\') {
      current += char;
      escaping = true;
      continue;
    }
    if (char === quote) {
      result += JSON.stringify(current);
      quote = '';
      current = '';
      continue;
    }
    if (char === '\n') {
      const e: any = new Error('字符串引号缺失或中文引号');
      e.line = quoteStartLine;
      e.column = quoteStartColumn;
      throw e;
    }
    current += char;
  }
  if (quote) {
    const e: any = new Error('字符串引号未闭合');
    e.line = quoteStartLine;
    e.column = quoteStartColumn;
    throw e;
  }
  return result;
}

function decorateParseError(error: any, value: string): JSONParseError {
  const missingArrayLocation = getMissingArrayBracketLocation(error, value);
  if (missingArrayLocation) {
    return {
      message: '缺失 [',
      line: missingArrayLocation.line,
      column: missingArrayLocation.column,
    };
  }
  if (isMissingCommaError(error)) {
    const loc = getMissingCommaLocation(error, value);
    return {
      message: '缺少逗号或中文逗号',
      line: loc?.line ?? error.line,
      column: loc?.column ?? error.column,
    };
  }

  const lc = getParseErrorLineColumn(error, value);
  return {
    message: error.message || '未知 JSON 语法错误',
    line: lc?.line ?? error.line,
    column: lc?.column ?? error.column,
  };
}

function getMissingArrayBracketLocation(error: any, value: string) {
  const parserLocation = getParseErrorLineColumn(error, value);
  if (!parserLocation) return null;
  const lines = splitLines(value);
  const errorLineIndex = parserLocation.line - 1;
  const errorLine = lines[errorLineIndex] || '';
  if (!errorLine.trim().startsWith('{')) return null;

  let previousIndex = errorLineIndex - 1;
  while (previousIndex >= 0 && !lines[previousIndex].trim()) previousIndex -= 1;
  if (previousIndex < 0 || !/}\s*,\s*$/.test(lines[previousIndex])) return null;

  let firstObjectIndex = previousIndex;
  while (firstObjectIndex >= 0 && !lines[firstObjectIndex].trim().startsWith('{')) {
    firstObjectIndex -= 1;
  }
  if (firstObjectIndex < 0) return null;

  let propertyIndex = firstObjectIndex - 1;
  while (propertyIndex >= 0 && !lines[propertyIndex].trim()) propertyIndex -= 1;
  while (propertyIndex >= 0) {
    const trimmed = lines[propertyIndex].trim();
    if (/^["'][^"']+["']\s*:\s*$/.test(trimmed)) {
      return { line: propertyIndex + 1, column: lines[propertyIndex].length + 1 };
    }
    if (trimmed.endsWith(',') || trimmed.endsWith('[') || trimmed.endsWith('{')) return null;
    propertyIndex -= 1;
  }
  return null;
}

function isMissingCommaError(error: any): boolean {
  return /Expected ',' or '\}' after property value/i.test(error.message || '');
}

function getMissingCommaLocation(error: any, value: string) {
  const parserLocation = getParseErrorLineColumn(error, value);
  if (!parserLocation) return null;
  const lines = splitLines(value);
  let lineIndex = parserLocation.line - 2;
  while (lineIndex >= 0 && !lines[lineIndex].trim()) lineIndex -= 1;
  if (lineIndex < 0) return parserLocation;
  return { line: lineIndex + 1, column: lines[lineIndex].length + 1 };
}

export function getParseErrorLineColumn(error: any, value: string) {
  const msg = error.message || '';
  const lineMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineMatch) return { line: Number(lineMatch[1]), column: Number(lineMatch[2]) };

  const positionMatch = msg.match(/position\s+(\d+)/i);
  if (!positionMatch) return null;

  const position = Number(positionMatch[1]);
  const before = value.slice(0, position);
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

export function splitLines(value: string): string[] {
  return value ? value.split('\n') : [''];
}

export function findFoldRanges(value: string): Map<number, number> {
  const lines = splitLines(value);
  const ranges = new Map<number, number>();
  const stack: { line: number; char: string }[] = [];
  let quote = '';
  let escaping = false;

  lines.forEach((line, lineIndex) => {
    for (const char of line) {
      if (quote) {
        if (escaping) {
          escaping = false;
        } else if (char === '\\') {
          escaping = true;
        } else if (char === quote) {
          quote = '';
        }
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '{' || char === '[') {
        stack.push({ line: lineIndex, char });
      } else if (char === '}' || char === ']') {
        const open = stack.pop();
        if (open && lineIndex > open.line) {
          ranges.set(open.line, lineIndex);
        }
      }
    }
  });
  return ranges;
}
