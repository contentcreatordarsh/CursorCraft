import { rules } from './rules.ts';
import type { AuditResult, ConfigInput, Finding, Severity } from './types.ts';

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  tip: 2,
};

/** Runs all audit rules against the input, entirely synchronously and in-memory. */
export function audit(input: ConfigInput): AuditResult {
  const findings: Finding[] = [];
  for (const rule of rules) {
    try {
      findings.push(...rule.run(input));
    } catch {
      // A rule failure must never break the whole audit.
    }
  }

  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const counts: Record<Severity, number> = { critical: 0, warning: 0, tip: 0 };
  for (const finding of findings) counts[finding.severity] += 1;

  const provided = [input.cursorignore, input.rules, input.mcp, input.settings, input.hooks].filter(
    (v) => typeof v === 'string' && v.trim().length > 0,
  );

  return {
    findings,
    counts,
    hasInput: provided.length > 0,
    filesProvided: provided.length,
  };
}
