/** Parse a .cursorignore file into normalized pattern lines. */
export function parseCursorignore(raw: string): string[] {
  const patterns: string[] = [];
  const seen = new Set<string>();

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const pattern = trimmed.replace(/\s+#.*$/, '').trim();
    if (!pattern || seen.has(pattern)) continue;
    seen.add(pattern);
    patterns.push(pattern);
  }

  return patterns.sort((a, b) => a.localeCompare(b));
}

export type PatternCategory = 'secret' | 'build' | 'noise' | 'other';

const SECRET_HINT = /(?:\.env|secret|credential|key|pem|cert|token|vault|password|auth)/i;
const BUILD_HINT = /(?:node_modules|dist|build|target|\.next|coverage|__pycache__|\.turbo)/i;
const NOISE_HINT = /(?:\.log|\.cache|tmp|\.DS_Store|\.idea|\.vscode)/i;

export function categorizePattern(pattern: string): PatternCategory {
  if (SECRET_HINT.test(pattern)) return 'secret';
  if (BUILD_HINT.test(pattern)) return 'build';
  if (NOISE_HINT.test(pattern)) return 'noise';
  return 'other';
}
