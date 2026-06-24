import { useMemo, useState } from 'react';
import { Copy, Check, RotateCcw, Lock, Download } from 'lucide-react';
import { generate } from '@/lib/rules-generator/generate';
import {
  DEFAULT_ANSWERS,
  LANGUAGES,
  PACKAGE_MANAGERS,
  SECURITY_LEVELS,
  type RulesAnswers,
  type SecurityLevel,
} from '@/lib/rules-generator/types';

const labelCls = 'block font-mono text-xs text-[var(--color-paper-400)]';
const fieldCls =
  'mt-1.5 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] placeholder:text-[var(--color-muted)] focus:border-[color-mix(in_srgb,var(--color-paper-50)_22%,transparent)] focus:outline-none';

export default function RulesGenerator() {
  const [answers, setAnswers] = useState<RulesAnswers>(DEFAULT_ANSWERS);

  const set = <K extends keyof RulesAnswers>(key: K, value: RulesAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const output = useMemo(() => generate(answers), [answers]);

  const reset = () => setAnswers(DEFAULT_ANSWERS);

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      {/* ---- Form ---- */}
      <section aria-label="Project questions" className="flex flex-col">
        <form
          className="panel"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] px-4 py-2.5">
            <Lock size={15} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
            <p className="font-mono text-xs text-[var(--color-paper-200)]">
              Generated in your browser — nothing is uploaded or stored.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <label className={labelCls} htmlFor="rg-language">
                Primary language
              </label>
              <select
                id="rg-language"
                className={fieldCls}
                value={answers.language}
                onChange={(e) => set('language', e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls} htmlFor="rg-framework">
                Framework / runtime <span className="text-[var(--color-paper-400)]">(optional)</span>
              </label>
              <input
                id="rg-framework"
                type="text"
                className={fieldCls}
                placeholder="e.g. Next.js, Django, Spring Boot"
                value={answers.framework}
                onChange={(e) => set('framework', e.target.value)}
                autoComplete="off"
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="rg-pm">
                Package manager
              </label>
              <select
                id="rg-pm"
                className={fieldCls}
                value={answers.packageManager}
                onChange={(e) => set('packageManager', e.target.value)}
              >
                {PACKAGE_MANAGERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls} htmlFor="rg-testing">
                Testing framework <span className="text-[var(--color-paper-400)]">(optional)</span>
              </label>
              <input
                id="rg-testing"
                type="text"
                className={fieldCls}
                placeholder="e.g. Vitest, Pytest, JUnit"
                value={answers.testing}
                onChange={(e) => set('testing', e.target.value)}
                autoComplete="off"
              />
            </div>

            <fieldset>
              <legend className={labelCls}>Repository layout</legend>
              <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Repository layout">
                {[
                  { v: false, label: 'Single package' },
                  { v: true, label: 'Monorepo' },
                ].map((opt) => {
                  const active = answers.monorepo === opt.v;
                  return (
                    <button
                      key={String(opt.v)}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set('monorepo', opt.v)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] text-[var(--color-paper-50)]'
                          : 'border-[var(--color-border)] text-[var(--color-paper-300)] hover:border-[var(--color-border-strong)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className={labelCls}>Security sensitivity</legend>
              <div className="mt-2 space-y-2" role="radiogroup" aria-label="Security sensitivity">
                {SECURITY_LEVELS.map((lvl) => {
                  const active = answers.security === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => set('security', lvl.value as SecurityLevel)}
                      className={`block w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                        active
                          ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                      }`}
                    >
                      <span className="block text-sm font-medium text-[var(--color-paper-100)]">
                        {lvl.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--color-paper-400)]">
                        {lvl.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label className={labelCls} htmlFor="rg-conventions">
                Key conventions <span className="text-[var(--color-paper-400)]">(one per line)</span>
              </label>
              <textarea
                id="rg-conventions"
                rows={4}
                className={`${fieldCls} resize-y font-mono text-[13px] leading-relaxed`}
                placeholder={'Use Tailwind for styling.\nServer components by default.\nNo default exports.'}
                value={answers.conventions}
                onChange={(e) => set('conventions', e.target.value)}
                spellCheck={false}
              />
              <p className="mt-1.5 text-xs text-[var(--color-paper-400)]">
                Leave blank to use sensible defaults for {answers.language}.
              </p>
            </div>

            <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[var(--color-paper-400)] transition-colors hover:text-[var(--color-paper-100)]"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Reset
              </button>
              <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-xs text-[var(--color-tip)]">
                <Check size={14} aria-hidden="true" />
                Live preview
              </span>
            </div>
          </div>
        </form>
      </section>

      {/* ---- Output ---- */}
      <section aria-label="Generated configuration" className="flex flex-col gap-6">
        <CopyBlock
          filename=".cursor/rules/project.mdc"
          code={output.rules}
          downloadName="project.mdc"
          lang="rules"
        />
        <CopyBlock
          filename=".cursorignore"
          code={output.cursorignore}
          downloadName=".cursorignore"
          lang="cursorignore"
        />
        <p className="text-sm text-[var(--color-paper-400)]">
          Save the first block to{' '}
          <code className="font-mono text-[var(--color-syntax-string)]">.cursor/rules/project.mdc</code>{' '}
          and the second to{' '}
          <code className="font-mono text-[var(--color-syntax-string)]">.cursorignore</code> at your repo
          root. Then run them through the{' '}
          <a href="/tools/config-analyzer" className="text-[var(--color-paper-100)] underline">
            Config Analyzer
          </a>{' '}
          to double-check.
        </p>
      </section>
    </div>
  );
}

interface CopyBlockProps {
  filename: string;
  code: string;
  downloadName: string;
  lang: string;
}

function CopyBlock({ filename, code, downloadName, lang }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, '').split('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — fail silently, nothing leaves the page */
    }
  };

  const download = () => {
    // Builds an in-memory blob URL; no network, no storage.
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <figure className="panel">
      <figcaption className="panel-header justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="editor-tab editor-tab-active shrink-0 truncate">{filename}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2 py-1 font-mono text-[0.7rem] text-[var(--color-paper-400)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-paper-100)]"
            aria-label={`Download ${downloadName}`}
          >
            <Download size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2 py-1 font-mono text-[0.7rem] text-[var(--color-paper-400)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-paper-100)]"
            aria-label={`Copy ${filename} to clipboard`}
          >
            {copied ? (
              <Check size={13} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
            ) : (
              <Copy size={13} aria-hidden="true" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </figcaption>
      <div className="flex max-h-[28rem] overflow-auto text-sm">
        <div
          aria-hidden="true"
          className="select-none border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-4 text-right font-mono text-xs leading-[1.6] text-[var(--color-muted)]"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="min-w-0 flex-1 overflow-x-auto py-4 pl-4 pr-6 font-mono text-[13px] leading-[1.6] text-[var(--color-paper-100)]">
          <code data-lang={lang}>{code.replace(/\n$/, '')}</code>
        </pre>
      </div>
    </figure>
  );
}
