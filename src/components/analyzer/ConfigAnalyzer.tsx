import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Lightbulb,
  Upload,
  Sparkles,
  Trash2,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { audit } from '@/lib/analyzer/engine';
import type { ConfigInput, FileKey, Severity } from '@/lib/analyzer/types';
import { EXAMPLE_CONFIG } from '@/lib/analyzer/example';

interface FieldDef {
  key: FileKey;
  label: string;
  filename: string;
  placeholder: string;
  accept: string;
}

const FIELDS: FieldDef[] = [
  {
    key: 'cursorignore',
    label: '.cursorignore',
    filename: '.cursorignore / .ignore',
    placeholder: '# Paste your .cursorignore\n.env\n*.key\nsecrets/\nnode_modules/',
    accept: '.cursorignore,.ignore,.gitignore,text/plain',
  },
  {
    key: 'rules',
    label: 'Rules',
    filename: '.cursor/rules or .cursorrules',
    placeholder: '# Paste your .cursor/rules (or .cursorrules)\nUse TypeScript strict mode...',
    accept: '.mdc,.md,.txt,.cursorrules,text/plain',
  },
  {
    key: 'mcp',
    label: 'mcp.json',
    filename: '.cursor/mcp.json',
    placeholder: '{\n  "mcpServers": {\n    "docs": { "command": "npx", "args": ["-y", "pkg@1.2.3"] }\n  }\n}',
    accept: '.json,application/json',
  },
  {
    key: 'settings',
    label: 'settings.json',
    filename: 'settings.json',
    placeholder: '{\n  "privacyMode": true\n}',
    accept: '.json,application/json',
  },
];

const SEVERITY_META: Record<
  Severity,
  { label: string; Icon: typeof AlertOctagon; color: string; bg: string; border: string }
> = {
  critical: {
    label: 'Critical',
    Icon: AlertOctagon,
    color: 'var(--color-danger)',
    bg: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-danger) 40%, transparent)',
  },
  warning: {
    label: 'Warning',
    Icon: AlertTriangle,
    color: 'var(--color-warn)',
    bg: 'color-mix(in srgb, var(--color-warn) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-warn) 40%, transparent)',
  },
  tip: {
    label: 'Tip',
    Icon: Lightbulb,
    color: 'var(--color-tip)',
    bg: 'color-mix(in srgb, var(--color-tip) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-tip) 40%, transparent)',
  },
};

const emptyInput: ConfigInput = {};

export default function ConfigAnalyzer() {
  const [input, setInput] = useState<ConfigInput>(emptyInput);
  const [activeTab, setActiveTab] = useState<FileKey>('cursorignore');
  const [hasRun, setHasRun] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => audit(input), [input]);

  const setField = (key: FileKey, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = (key: FileKey) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    if (file.size > 512 * 1024) {
      setFileError('File is larger than 512 KB — paste the relevant part instead.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setField(key, String(reader.result ?? ''));
    };
    reader.onerror = () => setFileError('Could not read that file. Try pasting its contents.');
    // FileReader keeps contents in memory only; nothing is uploaded.
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadExample = () => {
    setInput(EXAMPLE_CONFIG);
    setHasRun(true);
    setFileError(null);
  };

  const clearAll = () => {
    setInput(emptyInput);
    setHasRun(false);
    setFileError(null);
  };

  const runAudit = () => setHasRun(true);

  const filledCount = FIELDS.filter((field) => (input[field.key] ?? '').trim().length > 0).length;
  const showResults = hasRun && result.hasInput;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* ---- Input panel ---- */}
      <section aria-label="Configuration input" className="flex flex-col">
        <div className="rounded-xl border border-[var(--color-ink-700)] bg-[var(--color-ink-900)]">
          {/* assurance bar */}
          <div className="flex items-center gap-2 border-b border-[var(--color-ink-700)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] px-4 py-2.5">
            <Lock size={15} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
            <p className="font-mono text-xs text-[var(--color-paper-200)]">
              Runs entirely in your browser — nothing is uploaded.
            </p>
          </div>

          {/* tabs */}
          <div
            className="flex flex-wrap gap-1 border-b border-[var(--color-ink-700)] p-2"
            role="tablist"
            aria-label="Config files"
          >
            {FIELDS.map((field) => {
              const filled = (input[field.key] ?? '').trim().length > 0;
              const active = activeTab === field.key;
              return (
                <button
                  key={field.key}
                  role="tab"
                  type="button"
                  id={`tab-${field.key}`}
                  aria-selected={active}
                  aria-controls={`panel-${field.key}`}
                  onClick={() => setActiveTab(field.key)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                    active
                      ? 'bg-[var(--color-ink-700)] text-[var(--color-paper-50)]'
                      : 'text-[var(--color-paper-400)] hover:text-[var(--color-paper-100)]'
                  }`}
                >
                  {field.label}
                  {filled && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--color-tip)' }}
                      aria-label="has content"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* active textarea */}
          {FIELDS.map((field) => (
            <div
              key={field.key}
              role="tabpanel"
              id={`panel-${field.key}`}
              aria-labelledby={`tab-${field.key}`}
              hidden={activeTab !== field.key}
              className="p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor={`ta-${field.key}`}
                  className="font-mono text-xs text-[var(--color-paper-400)]"
                >
                  {field.filename}
                </label>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--color-ink-600)] px-2 py-1 font-mono text-[0.7rem] text-[var(--color-paper-300)] transition-colors hover:border-[var(--color-accent-500)] hover:text-white focus-within:outline focus-within:outline-2 focus-within:outline-[var(--color-accent-400)]">
                  <Upload size={12} aria-hidden="true" />
                  Upload
                  <input
                    type="file"
                    className="sr-only"
                    accept={field.accept}
                    onChange={handleUpload(field.key)}
                    ref={field.key === activeTab ? fileInputRef : undefined}
                  />
                </label>
              </div>
              <textarea
                id={`ta-${field.key}`}
                value={input[field.key] ?? ''}
                onChange={(e) => setField(field.key, e.target.value)}
                placeholder={field.placeholder}
                spellCheck={false}
                rows={12}
                className="w-full resize-y rounded-lg border border-[var(--color-ink-700)] bg-[var(--color-ink-950)] p-3 font-mono text-[13px] leading-relaxed text-[var(--color-paper-100)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent-500)] focus:outline-none"
              />
            </div>
          ))}

          {fileError && (
            <p
              role="alert"
              className="mx-3 mb-3 rounded-md border border-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-xs text-[var(--color-danger)]"
            >
              {fileError}
            </p>
          )}

          {/* actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-ink-700)] p-3">
            <button
              type="button"
              onClick={runAudit}
              disabled={filledCount === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] px-4 py-2 text-sm font-medium text-white transition-all hover:from-[var(--color-accent-500)] hover:to-[var(--color-cyan-400)] disabled:pointer-events-none disabled:opacity-50"
            >
              <ShieldCheck size={16} aria-hidden="true" />
              Run audit
            </button>
            <button
              type="button"
              onClick={loadExample}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-ink-600)] px-3 py-2 text-sm text-[var(--color-paper-200)] transition-colors hover:border-[var(--color-accent-500)] hover:text-white"
            >
              <Sparkles size={15} aria-hidden="true" />
              Load example config
            </button>
            {filledCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[var(--color-paper-400)] transition-colors hover:text-[var(--color-danger)]"
              >
                <Trash2 size={15} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---- Results panel ---- */}
      <section aria-label="Audit findings" aria-live="polite" className="flex flex-col">
        {!showResults ? (
          <EmptyState onLoadExample={loadExample} />
        ) : (
          <Results result={result} />
        )}
      </section>
    </div>
  );
}

function EmptyState({ onLoadExample }: { onLoadExample: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-ink-700)] bg-[var(--color-ink-900)]/40 p-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--color-ink-600)] bg-[var(--color-ink-800)] text-[var(--color-accent-400)]">
        <ShieldCheck size={26} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-paper-50)]">No findings yet</h3>
      <p className="mt-2 max-w-xs text-sm text-[var(--color-paper-400)]">
        Paste or upload your Cursor config and run the audit. Or try it instantly with a
        deliberately flawed sample.
      </p>
      <button
        type="button"
        onClick={onLoadExample}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--color-ink-600)] px-4 py-2 text-sm text-[var(--color-paper-200)] transition-colors hover:border-[var(--color-accent-500)] hover:text-white"
      >
        <Sparkles size={15} aria-hidden="true" />
        Load example config
      </button>
    </div>
  );
}

function Results({ result }: { result: ReturnType<typeof audit> }) {
  const { findings, counts } = result;
  const clean = counts.critical === 0 && counts.warning === 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--color-ink-700)] bg-[var(--color-ink-900)]">
      {/* summary */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-ink-700)] p-4">
        <h3 className="mr-auto text-sm font-semibold text-[var(--color-paper-50)]">
          {findings.length} finding{findings.length === 1 ? '' : 's'}
        </h3>
        {(['critical', 'warning', 'tip'] as Severity[]).map((sev) => {
          const meta = SEVERITY_META[sev];
          return (
            <span
              key={sev}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem]"
              style={{ borderColor: meta.border, color: meta.color, background: meta.bg }}
            >
              <meta.Icon size={12} aria-hidden="true" />
              {counts[sev]} {meta.label.toLowerCase()}
            </span>
          );
        })}
      </div>

      {clean && (
        <div className="flex items-center gap-3 border-b border-[var(--color-ink-700)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] px-4 py-3">
          <CheckCircle2 size={18} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
          <p className="text-sm text-[var(--color-paper-200)]">
            No critical or warning issues found. Review the tips below to tighten things further.
          </p>
        </div>
      )}

      <ul className="flex-1 space-y-3 overflow-y-auto p-4">
        {findings.map((finding) => {
          const meta = SEVERITY_META[finding.severity];
          return (
            <li
              key={finding.id}
              className="rounded-lg border p-4"
              style={{ borderColor: meta.border, background: meta.bg }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0" style={{ color: meta.color }}>
                  <meta.Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="font-mono text-[0.65rem] uppercase tracking-wider"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--color-paper-400)]">
                      · {finding.source}
                    </span>
                  </div>
                  <h4 className="mt-1 font-semibold text-[var(--color-paper-50)]">{finding.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-paper-300)]">
                    {finding.explanation}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-paper-200)]">
                    <span
                      className="font-mono text-[0.65rem] uppercase tracking-wider"
                      style={{ color: 'var(--color-accent-400)' }}
                    >
                      Fix:{' '}
                    </span>
                    {finding.fix}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
