import { useState } from 'react';
import { Download, Lock, Package } from 'lucide-react';
import { buildPolicyPackFiles } from '@/lib/policy-pack/generate';
import { downloadZip } from '@/lib/zip';
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
  'mt-1.5 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-ink-950)] px-3 py-2 text-sm text-[var(--color-paper-100)] focus:border-[color-mix(in_srgb,var(--color-paper-50)_22%,transparent)] focus:outline-none';

export default function PolicyPackGenerator() {
  const [answers, setAnswers] = useState<RulesAnswers>(DEFAULT_ANSWERS);

  const set = <K extends keyof RulesAnswers>(key: K, value: RulesAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const downloadPack = () => {
    const files = buildPolicyPackFiles(answers);
    const slug = (answers.framework || answers.language).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadZip(files, `cursorcraft-policy-pack-${slug}.zip`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <form className="panel" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] px-4 py-2.5">
          <Lock size={15} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
          <p className="font-mono text-xs text-[var(--color-paper-200)]">Built locally — zip never uploaded.</p>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <label className={labelCls} htmlFor="pp-language">Primary language</label>
            <select id="pp-language" className={fieldCls} value={answers.language} onChange={(e) => set('language', e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="pp-framework">Framework (optional)</label>
            <input id="pp-framework" className={fieldCls} value={answers.framework} onChange={(e) => set('framework', e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="pp-pm">Package manager</label>
            <select id="pp-pm" className={fieldCls} value={answers.packageManager} onChange={(e) => set('packageManager', e.target.value)}>
              {PACKAGE_MANAGERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className={labelCls}>Security sensitivity</legend>
            <div className="mt-2 space-y-2">
              {SECURITY_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => set('security', lvl.value as SecurityLevel)}
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    answers.security === lvl.value
                      ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                  }`}
                >
                  <span className="font-medium text-[var(--color-paper-100)]">{lvl.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--color-paper-400)]">{lvl.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm text-[var(--color-paper-300)]">
            <input type="checkbox" checked={answers.monorepo} onChange={(e) => set('monorepo', e.target.checked)} />
            Monorepo layout
          </label>
        </div>
      </form>

      <div className="panel flex flex-col justify-center p-8">
        <Package size={32} className="mb-4 text-[var(--color-paper-300)]" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-[var(--color-paper-50)]">Download policy pack (.zip)</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-paper-400)]">
          Includes <code className="font-mono text-[var(--color-syntax-string)]">.cursor/rules/project.mdc</code>,{' '}
          <code className="font-mono text-[var(--color-syntax-string)]">.cursorignore</code>, a team security checklist,
          and a README with next steps.
        </p>
        <ul className="mt-4 space-y-1 font-mono text-xs text-[var(--color-muted)]">
          <li>· .cursor/rules/project.mdc</li>
          <li>· .cursorignore</li>
          <li>· SECURITY-CHECKLIST.md</li>
          <li>· README-POLICY-PACK.md</li>
        </ul>
        <button type="button" onClick={downloadPack} className="btn-primary mt-6 w-fit">
          <Download size={16} aria-hidden="true" />
          Download policy pack
        </button>
      </div>
    </div>
  );
}
