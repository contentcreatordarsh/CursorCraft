#!/usr/bin/env node
/**
 * CLI: audit Cursor config files in a repo using the same rules as the web analyzer.
 * Usage: node --experimental-strip-types scripts/audit-cursor-config.mts [--root .] [--fail-on-critical]
 */
import fs from 'node:fs';
import path from 'node:path';
import { audit } from '../src/lib/analyzer/engine.ts';
import type { ConfigInput } from '../src/lib/analyzer/types.ts';

function readIfExists(filePath: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  return fs.readFileSync(filePath, 'utf8');
}

function readRules(root: string): string | undefined {
  const cursorrules = readIfExists(path.join(root, '.cursorrules'));
  if (cursorrules?.trim()) return cursorrules;

  const rulesDir = path.join(root, '.cursor/rules');
  if (!fs.existsSync(rulesDir)) return undefined;

  const parts = fs
    .readdirSync(rulesDir)
    .filter((f) => f.endsWith('.mdc') || f.endsWith('.md'))
    .sort()
    .map((f) => readIfExists(path.join(rulesDir, f)))
    .filter((s): s is string => Boolean(s?.trim()));

  return parts.length > 0 ? parts.join('\n\n---\n\n') : undefined;
}

function collectInput(root: string): ConfigInput {
  return {
    cursorignore: readIfExists(path.join(root, '.cursorignore')),
    rules: readRules(root),
    mcp: readIfExists(path.join(root, '.cursor/mcp.json')),
    settings:
      readIfExists(path.join(root, '.cursor/settings.json')) ??
      readIfExists(path.join(root, 'settings.json')),
    hooks:
      readIfExists(path.join(root, 'hooks.json')) ??
      readIfExists(path.join(root, '.cursor/hooks.json')),
  };
}

const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const root = rootIdx >= 0 ? (args[rootIdx + 1] ?? '.') : '.';
const failOnCritical = args.includes('--fail-on-critical');

const input = collectInput(path.resolve(root));
const result = audit(input);

if (!result.hasInput) {
  console.log('No Cursor config files found (.cursorignore, .cursor/rules, mcp.json, settings, hooks).');
  process.exit(0);
}

console.log(`CursorCraft config audit — ${result.filesProvided} file(s) scanned`);
console.log(`  critical: ${result.counts.critical}  warning: ${result.counts.warning}  tip: ${result.counts.tip}`);
console.log('');

for (const f of result.findings) {
  console.log(`[${f.severity.toUpperCase()}] ${f.title}`);
  console.log(`  ${f.explanation}`);
  console.log(`  Fix: ${f.fix}`);
  console.log('');
}

if (failOnCritical && result.counts.critical > 0) {
  console.error(`Failed: ${result.counts.critical} critical finding(s).`);
  process.exit(1);
}
