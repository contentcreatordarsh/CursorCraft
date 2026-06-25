import { categorizePattern, parseCursorignore, type PatternCategory } from './parse.ts';

export interface PatternDiffEntry {
  pattern: string;
  category: PatternCategory;
}

export interface CursorignoreDiff {
  onlyLeft: PatternDiffEntry[];
  onlyRight: PatternDiffEntry[];
  shared: PatternDiffEntry[];
  leftCount: number;
  rightCount: number;
}

export function diffCursorignore(leftRaw: string, rightRaw: string): CursorignoreDiff {
  const left = parseCursorignore(leftRaw);
  const right = parseCursorignore(rightRaw);
  const leftSet = new Set(left);
  const rightSet = new Set(right);

  const onlyLeft = left.filter((p) => !rightSet.has(p)).map((pattern) => ({
    pattern,
    category: categorizePattern(pattern),
  }));
  const onlyRight = right.filter((p) => !leftSet.has(p)).map((pattern) => ({
    pattern,
    category: categorizePattern(pattern),
  }));
  const shared = left.filter((p) => rightSet.has(p)).map((pattern) => ({
    pattern,
    category: categorizePattern(pattern),
  }));

  return {
    onlyLeft,
    onlyRight,
    shared,
    leftCount: left.length,
    rightCount: right.length,
  };
}
