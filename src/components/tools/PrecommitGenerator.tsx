import { useMemo, useState } from 'react';
import { Copy, Check, Lock, Download } from 'lucide-react';
import { generatePrecommitSnippet, type SnippetTarget } from '@/lib/precommit/generate';

const TARGETS: { id: SnippetTarget; label: string; hint: string }[] = [
  { id: 'husky', label: 'Husky pre-commit', hint: '.husky/pre-commit shell script' },
  { id: 'github-action', label: 'GitHub Actions', hint: 'Workflow YAML for PRs touching Cursor config' },
  { id: 'gitlab-ci', label: 'GitLab CI', hint: 'Job snippet for .gitlab-ci.yml' },
];

export default function PrecommitGenerator() {
  const [target, setTarget] = useState<SnippetTarget>('husky');
  const [scanExtended, setScanExtended] = useState(true);
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(
    () => generatePrecommitSnippet(target, { scanExtended }),
    [target, scanExtended],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    const name =
      target === 'husky' ? 'pre-commit' : target === 'github-action' ? 'cursor-config-secrets.yml' : 'gitlab-cursor-secrets.yml';
    const blob = new Blob([snippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <div className="panel p-4">
        <div className="mb-4 flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Lock size={15} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
          <p className="font-mono text-xs text-[var(--color-paper-200)]">Generated locally</p>
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-2 font-mono text-xs text-[var(--color-paper-400)]">Output format</legend>
          {TARGETS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTarget(t.id)}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                target === t.id
                  ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
              }`}
            >
              <span className="font-medium text-[var(--color-paper-100)]">{t.label}</span>
              <span className="mt-0.5 block text-xs text-[var(--color-paper-400)]">{t.hint}</span>
            </button>
          ))}
        </fieldset>
        <label className="mt-4 flex items-start gap-2 text-sm text-[var(--color-paper-300)]">
          <input type="checkbox" checked={scanExtended} onChange={(e) => setScanExtended(e.target.checked)} className="mt-1" />
          Also scan mcp.json and settings.json
        </label>
      </div>

      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-ink-850)] px-3 py-2">
          <span className="font-mono text-xs text-[var(--color-paper-400)]">Generated snippet</span>
          <div className="flex gap-2">
            <button type="button" onClick={copy} className="btn-secondary !py-1 !px-2 text-xs">
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" onClick={download} className="btn-secondary !py-1 !px-2 text-xs">
              <Download size={13} aria-hidden="true" />
              Download
            </button>
          </div>
        </div>
        <pre className="max-h-[28rem] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-[var(--color-paper-200)]">
          <code>{snippet}</code>
        </pre>
      </div>
    </div>
  );
}
