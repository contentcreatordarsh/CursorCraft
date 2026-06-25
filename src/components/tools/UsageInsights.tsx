import { useMemo, useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  ServerOff,
  AlertOctagon,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { analyze, formatUsd } from '@/lib/usage-insights/analyze';
import type { Insights, Severity } from '@/lib/usage-insights/types';
import { EXAMPLE_JSON } from '@/lib/usage-insights/example';

const CURL_SNIPPET = `# Run this locally. Your API key stays on your machine — it is never sent to this site.
KEY="YOUR_API_KEY"   # cursor.com/dashboard -> Settings -> Admin API Keys

END=$(( $(date +%s) * 1000 ))
START=$(( END - 30*24*60*60*1000 ))

# Read-only: per-user spend for the current billing cycle
SPEND=$(curl -s -X POST https://api.cursor.com/teams/spend \\
  -u "$KEY:" -H "Content-Type: application/json" \\
  -d '{"page":1,"pageSize":1000}')

# Read-only: daily usage metrics (last 30 days)
USAGE=$(curl -s -X POST https://api.cursor.com/teams/daily-usage-data \\
  -u "$KEY:" -H "Content-Type: application/json" \\
  -d "{\\"startDate\\":$START,\\"endDate\\":$END,\\"page\\":1,\\"pageSize\\":1000}")

# Copy the JSON this prints and paste it into the box on the page:
printf '{"spend":%s,"usage":%s}\\n' "$SPEND" "$USAGE"`;

const MODEL_COLORS = [
  'var(--color-paper-300)',
  'var(--color-syntax-keyword)',
  'var(--color-warn)',
  'var(--color-info)',
  'var(--color-tip)',
  'var(--color-danger)',
  'var(--color-muted)',
];

const SEV: Record<Severity, { Icon: LucideIcon; color: string; bg: string; border: string; label: string }> = {
  critical: {
    Icon: AlertOctagon,
    color: 'var(--color-danger)',
    bg: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-danger) 40%, transparent)',
    label: 'Critical',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'var(--color-warn)',
    bg: 'color-mix(in srgb, var(--color-warn) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-warn) 40%, transparent)',
    label: 'Warning',
  },
  tip: {
    Icon: Lightbulb,
    color: 'var(--color-tip)',
    bg: 'color-mix(in srgb, var(--color-tip) 10%, transparent)',
    border: 'color-mix(in srgb, var(--color-tip) 40%, transparent)',
    label: 'Tip',
  },
};

export default function UsageInsights() {
  const [raw, setRaw] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);

  const result = useMemo(() => analyze(raw), [raw]);
  const showResults = submitted && result.ok && result.insights;

  const steps = ['Overview', 'Export locally', 'Paste JSON', 'Insights'] as const;

  return (
    <div className="space-y-6">
      {/* Wizard progress */}
      <nav aria-label="Usage insights steps" className="panel p-4">
        <ol className="flex flex-wrap gap-2">
          {steps.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                  step === i
                    ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] text-[var(--color-paper-100)]'
                    : 'border-[var(--color-border)] text-[var(--color-paper-400)] hover:text-[var(--color-paper-200)]'
                }`}
              >
                <StepDot n={i + 1} />
                {label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {step === 0 && (
        <section className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-[color-mix(in_srgb,var(--color-tip)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] p-4">
            <ServerOff size={22} className="mt-0.5 shrink-0" style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
            <div>
              <p className="font-semibold text-[var(--color-paper-50)]">Your API key never touches this site</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-paper-300)]">
                This wizard walks you through exporting read-only team usage from your own terminal,
                then analyzing the JSON here — entirely in your browser.
              </p>
            </div>
          </div>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--color-paper-300)]">
            <li>Create an Admin API key at cursor.com/dashboard → Settings → Admin API Keys</li>
            <li>Copy and run the read-only curl command on your machine</li>
            <li>Paste the printed JSON into step 3</li>
          </ol>
          <button type="button" className="btn-primary" onClick={() => setStep(1)}>
            Start wizard →
          </button>
        </section>
      )}

      {step === 1 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <StepDot n={2} />
            <h2 className="text-lg font-semibold text-[var(--color-paper-50)]">Run this locally to export usage</h2>
          </div>
          <CurlBlock code={CURL_SNIPPET} />
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(0)}>Back</button>
            <button type="button" className="btn-primary" onClick={() => setStep(2)}>I have the JSON →</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <StepDot n={3} />
            <h2 className="text-lg font-semibold text-[var(--color-paper-50)]">Paste the JSON output</h2>
          </div>
          <textarea
            aria-label="Paste exported usage JSON"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              if (submitted) setSubmitted(false);
            }}
            placeholder='Paste the output of the command, e.g. {"spend":{...},"usage":{...}}'
            spellCheck={false}
            rows={8}
            className="input-field"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button
              type="button"
              onClick={() => {
                setSubmitted(true);
                if (raw.trim()) setStep(3);
              }}
              disabled={raw.trim().length === 0}
              className="btn-primary"
            >
              <TrendingUp size={16} aria-hidden="true" />
              Analyze usage
            </button>
            <button
              type="button"
              onClick={() => {
                setRaw(EXAMPLE_JSON);
                setSubmitted(true);
                setStep(3);
              }}
              className="btn-secondary"
            >
              <Sparkles size={15} aria-hidden="true" />
              Load example
            </button>
          </div>
          {submitted && !result.ok && result.error && (
            <p role="alert" className="mt-3 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-sm text-[var(--color-danger)]">
              {result.error}
            </p>
          )}
        </section>
      )}

      {step === 3 && showResults && result.insights && (
        <div className="space-y-4">
          <button type="button" className="btn-secondary" onClick={() => setStep(2)}>← Edit JSON</button>
          <Dashboard insights={result.insights} />
        </div>
      )}

      {step === 3 && submitted && !showResults && (
        <p className="text-sm text-[var(--color-paper-400)]">Run analysis from step 3 with valid JSON to see insights.</p>
      )}
    </div>
  );
}

function StepDot({ n }: { n: number }) {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-ink-850)] font-mono text-xs font-bold text-[var(--color-paper-200)]">
      {n}
    </span>
  );
}

function Dashboard({ insights }: { insights: Insights }) {
  const t = insights.totals;
  return (
    <section className="space-y-6" aria-label="Usage insights">
      <div className="flex items-center gap-2">
        <StepDot n={3} />
        <h2 className="text-lg font-semibold text-[var(--color-paper-50)]">Your insights</h2>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Wallet} label="Total spend" value={formatUsd(t.totalSpendCents)} hint={`${formatUsd(t.onDemandSpendCents)} on-demand`} />
        <Stat icon={Users} label="Active members" value={`${t.activeMemberCount}/${t.memberCount}`} hint="with recorded activity" />
        <Stat
          icon={ServerOff}
          label="Idle seats"
          value={String(t.idleSeatCount)}
          hint="no activity this period"
          tone={t.idleSeatCount > 0 ? 'warn' : 'tip'}
        />
        <Stat icon={Zap} label="Premium requests" value={t.premiumRequests.toLocaleString('en-US')} hint="usage-based, this cycle" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cost hotspots */}
        {insights.hotspots.length > 0 && (
          <Panel title="Cost hotspots" subtitle={`Top spenders · top 20% drive ${Math.round(insights.concentrationPct)}% of spend`}>
            <ul className="space-y-2.5">
              {insights.hotspots.map((h, idx) => (
                <li key={h.email}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-[var(--color-paper-200)]" title={h.email}>
                      {h.label}
                    </span>
                    <span className="shrink-0 font-mono text-[var(--color-paper-100)]">
                      {formatUsd(h.overallSpendCents)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-ink-800)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(2, Math.round((insights.hotspots[0]!.overallSpendCents > 0 ? h.overallSpendCents / insights.hotspots[0]!.overallSpendCents : 0) * 100))}%`,
                        background:
                          idx === 0
                            ? 'var(--color-paper-300)'
                            : 'var(--color-paper-400)',
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {/* Model mix */}
        {insights.modelMix.length > 0 ? (
          <Panel title="Model mix" subtitle="Share of activity by most-used model">
            <Donut data={insights.modelMix.map((m) => ({ label: m.model, value: m.weight }))} />
          </Panel>
        ) : (
          <Panel title="Model mix" subtitle="Share of activity by most-used model">
            <p className="text-sm text-[var(--color-paper-400)]">
              No daily usage data found. Include the <code className="font-mono text-[var(--color-syntax-string)]">usage</code>{' '}
              object (from <code className="font-mono text-[var(--color-syntax-string)]">daily-usage-data</code>) to see your model mix.
            </p>
          </Panel>
        )}
      </div>

      {/* Request mix + idle seats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {insights.requestMix.length > 0 && (
          <Panel title="Request mix" subtitle={insights.acceptRate !== null ? `Apply accept rate: ${Math.round(insights.acceptRate * 100)}%` : 'Activity by feature'}>
            <RequestBars data={insights.requestMix} />
          </Panel>
        )}
        {insights.idleSeats.length > 0 && (
          <Panel title={`Idle premium seats (${insights.idleSeats.length})`} subtitle="No recorded activity this period — candidates to reclaim">
            <ul className="flex flex-wrap gap-2">
              {insights.idleSeats.map((s) => (
                <li
                  key={s.email}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-warn)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-warn)_8%,transparent)] px-3 py-1 text-sm text-[var(--color-paper-200)]"
                  title={s.email}
                >
                  <ServerOff size={13} style={{ color: 'var(--color-warn)' }} aria-hidden="true" />
                  {s.label}
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      {/* Recommendations */}
      <Panel title="Optimization recommendations" subtitle="Tied to the CursorCraft cost guide">
        <ul className="space-y-3">
          {insights.recommendations.map((rec) => {
            const meta = SEV[rec.severity];
            return (
              <li key={rec.id} className="rounded-lg border p-4" style={{ borderColor: meta.border, background: meta.bg }}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0" style={{ color: meta.color }}>
                    <meta.Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[0.65rem] uppercase tracking-wider" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-[var(--color-paper-50)]">{rec.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-paper-300)]">{rec.detail}</p>
                    {rec.ref && (
                      <a href={rec.ref} className="mt-2 inline-block font-mono text-xs text-[var(--color-paper-100)] underline">
                        Read the cost guide →
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone?: 'neutral' | 'warn' | 'tip';
}) {
  const color =
    tone === 'warn' ? 'var(--color-warn)' : tone === 'tip' ? 'var(--color-tip)' : 'var(--color-paper-300)';
  return (
    <div className="rounded-xl border border-[var(--color-ink-700)] bg-[var(--color-ink-900)] p-4">
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color }} aria-hidden="true" />
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-paper-400)]">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--color-paper-50)]">{value}</p>
      <p className="mt-0.5 text-xs text-[var(--color-paper-400)]">{hint}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-ink-700)] bg-[var(--color-ink-900)]/60 p-5">
      <h3 className="text-base font-semibold text-[var(--color-paper-50)]">{title}</h3>
      {subtitle && <p className="mb-4 mt-0.5 text-xs text-[var(--color-paper-400)]">{subtitle}</p>}
      {children}
    </div>
  );
}

function RequestBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-[var(--color-paper-200)]">{d.label}</span>
            <span className="font-mono text-[var(--color-paper-400)]">{d.value.toLocaleString('en-US')}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-ink-800)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(2, Math.round((d.value / max) * 100))}%`, background: 'var(--color-syntax-keyword)' }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((n, d) => n + d.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const seg = {
      color: MODEL_COLORS[i % MODEL_COLORS.length]!,
      dash: frac * c,
      gap: c - frac * c,
      offset: -offset * c,
      pct: Math.round(frac * 100),
      label: d.label,
    };
    offset += frac;
    return seg;
  });
  const summary = data.map((d) => `${d.label} ${Math.round((d.value / total) * 100)}%`).join(', ');

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Model mix: ${summary}`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-ink-800)" strokeWidth="14" />
        {segments.map((s) => (
          <circle
            key={s.label}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            transform="rotate(-90 60 60)"
            strokeLinecap="butt"
          />
        ))}
        <text x="60" y="56" textAnchor="middle" className="fill-[var(--color-paper-50)]" style={{ fontSize: 18, fontWeight: 700 }}>
          {data.length}
        </text>
        <text x="60" y="72" textAnchor="middle" className="fill-[var(--color-paper-400)]" style={{ fontSize: 9 }}>
          models
        </text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
            <span className="truncate text-[var(--color-paper-200)]" title={s.label}>
              {s.label}
            </span>
            <span className="ml-auto font-mono text-xs text-[var(--color-paper-400)]">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CurlBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <figure className="overflow-hidden rounded-xl border border-[var(--color-ink-700)] bg-[var(--color-ink-900)]">
      <figcaption className="flex items-center justify-between border-b border-[var(--color-ink-700)] bg-[var(--color-ink-850)] px-3 py-2">
        <span className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
          </span>
          <span className="ml-1 font-mono text-xs text-[var(--color-paper-300)]">terminal · runs on your machine</span>
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2 py-1 font-mono text-[0.7rem] text-[var(--color-paper-400)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-paper-100)]"
          aria-label="Copy command to clipboard"
        >
          {copied ? <Check size={13} style={{ color: 'var(--color-tip)' }} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[var(--color-paper-200)]">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
