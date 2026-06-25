import { useMemo, useState } from 'react';
import { Lock, GitBranch } from 'lucide-react';
import { diffCursorignore } from '@/lib/cursorignore-diff/diff';
import type { PatternCategory } from '@/lib/cursorignore-diff/parse';
import { generateCursorignore } from '@/lib/rules-generator/generate';
import { DEFAULT_ANSWERS, SECURITY_LEVELS, type SecurityLevel } from '@/lib/rules-generator/types';
import { getTemplateById, RULES_TEMPLATES } from '@/lib/rules-templates/data';

type Mode = 'compare' | 'template';

const CATEGORY_STYLE: Record<PatternCategory, string> = {
  secret: 'var(--color-danger)',
  build: 'var(--color-warn)',
  noise: 'var(--color-muted)',
  other: 'var(--color-paper-400)',
};

const EXAMPLE_LEFT = `# Current repo
.env
.env.*
node_modules/
dist/
`;

const EXAMPLE_RIGHT = `# Proposed
.env
.env.*
node_modules/
dist/
secrets/
*.pem
`;

export default function CursorignoreDiff() {
  const [mode, setMode] = useState<Mode>('compare');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [templateId, setTemplateId] = useState('nextjs');
  const [security, setSecurity] = useState<SecurityLevel>('elevated');

  const templateContent = useMemo(() => {
    const tpl = getTemplateById(templateId);
    const answers = tpl?.answers ?? { ...DEFAULT_ANSWERS, security };
    return generateCursorignore({ ...answers, security: tpl ? answers.security : security });
  }, [templateId, security]);

  const rightContent = mode === 'template' ? templateContent : right;
  const leftLabel = mode === 'template' ? 'Your .cursorignore' : 'Left / current';
  const rightLabel = mode === 'template' ? 'Template' : 'Right / proposed';

  const diff = useMemo(() => {
    if (!left.trim() && !rightContent.trim()) return null;
    return diffCursorignore(left, rightContent);
  }, [left, rightContent]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] px-4 py-2.5 panel">
        <Lock size={15} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
        <p className="font-mono text-xs text-[var(--color-paper-200)]">
          Compared entirely in your browser — ignores never leave this page.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('compare')}
          className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${mode === 'compare' ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]' : 'border-[var(--color-border)]'}`}
        >
          Compare two files
        </button>
        <button
          type="button"
          onClick={() => setMode('template')}
          className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${mode === 'template' ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]' : 'border-[var(--color-border)]'}`}
        >
          Compare vs template
        </button>
      </div>

      {mode === 'template' && (
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-[var(--color-paper-400)]">Stack template</label>
            <select
              className="input-field w-auto min-w-[12rem]"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {RULES_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
              <option value="custom">Custom (security level only)</option>
            </select>
          </div>
          {templateId === 'custom' && (
            <div>
              <label className="mb-1 block font-mono text-xs text-[var(--color-paper-400)]">Security level</label>
              <select
                className="input-field w-auto min-w-[10rem]"
                value={security}
                onChange={(e) => setSecurity(e.target.value as SecurityLevel)}
              >
                {SECURITY_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-2 block font-mono text-xs text-[var(--color-paper-400)]">{leftLabel}</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder={EXAMPLE_LEFT}
            spellCheck={false}
            rows={14}
            className="input-field font-mono text-xs"
          />
        </div>
        {mode === 'compare' ? (
          <div>
            <label className="mb-2 block font-mono text-xs text-[var(--color-paper-400)]">{rightLabel}</label>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder={EXAMPLE_RIGHT}
              spellCheck={false}
              rows={14}
              className="input-field font-mono text-xs"
            />
          </div>
        ) : (
          <div>
            <label className="mb-2 block font-mono text-xs text-[var(--color-paper-400)]">{rightLabel}</label>
            <pre className="input-field max-h-[22rem] overflow-auto font-mono text-xs whitespace-pre-wrap">{templateContent}</pre>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => { setLeft(EXAMPLE_LEFT); if (mode === 'compare') setRight(EXAMPLE_RIGHT); }}>
          Load example
        </button>
      </div>

      {diff && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[var(--color-paper-400)]">
            <GitBranch size={14} aria-hidden="true" />
            <span>{diff.leftCount} patterns left · {diff.rightCount} right · {diff.shared.length} shared</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <DiffColumn title={`Only in ${leftLabel}`} entries={diff.onlyLeft} tone="left" />
            <DiffColumn title="Shared" entries={diff.shared} tone="shared" />
            <DiffColumn title={`Only in ${rightLabel}`} entries={diff.onlyRight} tone="right" />
          </div>
        </div>
      )}
    </div>
  );
}

function DiffColumn({
  title,
  entries,
  tone,
}: {
  title: string;
  entries: { pattern: string; category: PatternCategory }[];
  tone: 'left' | 'right' | 'shared';
}) {
  const border =
    tone === 'left'
      ? 'color-mix(in srgb, var(--color-warn) 35%, transparent)'
      : tone === 'right'
        ? 'color-mix(in srgb, var(--color-info) 35%, transparent)'
        : 'var(--color-border)';
  return (
    <div className="panel p-4" style={{ borderColor: border }}>
      <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-paper-300)]">
        {title} ({entries.length})
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">None</p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-auto font-mono text-xs">
          {entries.map((e) => (
            <li key={e.pattern} className="flex items-center gap-2 text-[var(--color-paper-200)]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CATEGORY_STYLE[e.category] }} aria-hidden="true" />
              {e.pattern}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
