import { useMemo, useState } from 'react';
import { Lock, AlertOctagon, AlertTriangle, Lightbulb } from 'lucide-react';
import { lintRulesBundle } from '@/lib/rules-linter/lint';
import type { LintIssue, LintSeverity } from '@/lib/rules-linter/lint';

const EXAMPLE_RULES = `---
description: Project conventions
globs: **/*.{ts,tsx}
alwaysApply: true
---

# Rules
- Use TypeScript strict mode.
- Never log secrets or API keys.
`;

const EXAMPLE_HOOKS = `{
  "hooks": {
    "postToolUse": "npm run lint"
  }
}`;

const SEV: Record<LintSeverity, { Icon: typeof AlertOctagon; color: string }> = {
  error: { Icon: AlertOctagon, color: 'var(--color-danger)' },
  warning: { Icon: AlertTriangle, color: 'var(--color-warn)' },
  tip: { Icon: Lightbulb, color: 'var(--color-tip)' },
};

export default function RulesLinter() {
  const [rules, setRules] = useState('');
  const [hooks, setHooks] = useState('');
  const [rulesName, setRulesName] = useState('project.mdc');

  const issues = useMemo(
    () => lintRulesBundle({ rules, rulesFilename: rulesName, hooks }),
    [rules, rulesName, hooks],
  );

  const counts = useMemo(() => {
    const c = { error: 0, warning: 0, tip: 0 };
    for (const i of issues) c[i.severity] += 1;
    return c;
  }, [issues]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] px-4 py-2.5 panel">
        <Lock size={15} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
        <p className="font-mono text-xs text-[var(--color-paper-200)]">Linted locally — rules and hooks never uploaded.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-xs text-[var(--color-paper-400)]">Rules file (.mdc)</label>
          <input
            className="input-field mb-2 font-mono text-xs"
            value={rulesName}
            onChange={(e) => setRulesName(e.target.value)}
            aria-label="Rules filename"
          />
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder={EXAMPLE_RULES}
            spellCheck={false}
            rows={12}
            className="input-field font-mono text-xs"
          />
        </div>
        <div>
          <label className="mb-2 block font-mono text-xs text-[var(--color-paper-400)]">hooks.json (optional)</label>
          <textarea
            value={hooks}
            onChange={(e) => setHooks(e.target.value)}
            placeholder={EXAMPLE_HOOKS}
            spellCheck={false}
            rows={14}
            className="input-field font-mono text-xs"
          />
        </div>
      </div>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          setRules(EXAMPLE_RULES);
          setHooks(EXAMPLE_HOOKS);
        }}
      >
        Load example
      </button>

      {issues.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            <span className="text-[var(--color-danger)]">{counts.error} error</span>
            <span className="text-[var(--color-warn)]">{counts.warning} warning</span>
            <span className="text-[var(--color-tip)]">{counts.tip} tip</span>
          </div>
          <ul className="space-y-2">
            {issues.map((issue) => (
              <IssueRow key={`${issue.id}-${issue.title}`} issue={issue} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function IssueRow({ issue }: { issue: LintIssue }) {
  const meta = SEV[issue.severity];
  return (
    <li className="panel flex items-start gap-3 p-4">
      <meta.Icon size={18} style={{ color: meta.color }} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium text-[var(--color-paper-100)]">{issue.title}</p>
        <p className="mt-0.5 text-sm text-[var(--color-paper-400)]">{issue.detail}</p>
      </div>
    </li>
  );
}
