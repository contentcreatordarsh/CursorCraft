import { useMemo, useState } from 'react';
import { Lock, Wallet, Users } from 'lucide-react';
import { estimateCost, normalizeModelMix } from '@/lib/cost-estimator/estimate';
import type { CostEstimateInput, PlanTier, UsageIntensity } from '@/lib/cost-estimator/types';

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function CostEstimator() {
  const [input, setInput] = useState<CostEstimateInput>({
    seats: 25,
    plan: 'teams',
    modelMix: { auto: 70, frontier: 25, max: 5 },
    intensity: 'typical',
    idleSeatPercent: 10,
  });

  const set = <K extends keyof CostEstimateInput>(key: K, value: CostEstimateInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => estimateCost(input), [input]);

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <form className="panel" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-tip)_8%,transparent)] px-4 py-2.5">
          <Lock size={15} style={{ color: 'var(--color-tip)' }} aria-hidden="true" />
          <p className="font-mono text-xs text-[var(--color-paper-200)]">No API — rough planning range only.</p>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1 block font-mono text-xs text-[var(--color-paper-400)]" htmlFor="ce-seats">Team seats</label>
            <input
              id="ce-seats"
              type="number"
              min={1}
              max={500}
              className="input-field"
              value={input.seats}
              onChange={(e) => set('seats', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-[var(--color-paper-400)]" htmlFor="ce-plan">Plan tier</label>
            <select id="ce-plan" className="input-field" value={input.plan} onChange={(e) => set('plan', e.target.value as PlanTier)}>
              <option value="pro">Pro (~$20/seat)</option>
              <option value="teams">Teams / Business (~$40/seat)</option>
              <option value="enterprise">Enterprise (~$60/seat est.)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-[var(--color-paper-400)]" htmlFor="ce-intensity">Usage intensity</label>
            <select
              id="ce-intensity"
              className="input-field"
              value={input.intensity}
              onChange={(e) => set('intensity', e.target.value as UsageIntensity)}
            >
              <option value="light">Light — occasional tab completion</option>
              <option value="typical">Typical — daily agent + chat</option>
              <option value="heavy">Heavy — agents all day, large context</option>
            </select>
          </div>
          <fieldset>
            <legend className="mb-2 block font-mono text-xs text-[var(--color-paper-400)]">Model mix (%)</legend>
            {(['auto', 'frontier', 'max'] as const).map((key) => (
              <div key={key} className="mt-2">
                <div className="flex justify-between font-mono text-xs text-[var(--color-paper-400)]">
                  <span>{key === 'auto' ? 'Auto / Composer' : key === 'frontier' ? 'Frontier' : 'Max / premium'}</span>
                  <span>{input.modelMix[key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={input.modelMix[key]}
                  onChange={(e) => {
                    const next = { ...input.modelMix, [key]: Number(e.target.value) };
                    set('modelMix', normalizeModelMix(next));
                  }}
                  className="mt-1 w-full accent-[var(--color-paper-300)]"
                />
              </div>
            ))}
          </fieldset>
          <div>
            <label className="mb-1 block font-mono text-xs text-[var(--color-paper-400)]" htmlFor="ce-idle">Idle seats (%)</label>
            <input
              id="ce-idle"
              type="range"
              min={0}
              max={50}
              value={input.idleSeatPercent}
              onChange={(e) => set('idleSeatPercent', Number(e.target.value))}
              className="w-full accent-[var(--color-paper-300)]"
            />
            <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">{input.idleSeatPercent}% seats with little activity</p>
          </div>
        </div>
      </form>

      <div className="panel p-8">
        <Wallet size={28} className="mb-4 text-[var(--color-paper-300)]" aria-hidden="true" />
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-paper-400)]">{result.planLabel} · {result.seats} seats</p>
        <p className="mt-2 text-4xl font-bold text-[var(--color-paper-50)]">
          {formatUsd(result.totalLowUsd)} – {formatUsd(result.totalHighUsd)}
          <span className="ml-2 text-lg font-normal text-[var(--color-paper-400)]">/ month</span>
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Stat label="Subscription" value={formatUsd(result.subscriptionUsd)} />
          <Stat label="Usage overage (est.)" value={`${formatUsd(result.overageLowUsd)} – ${formatUsd(result.overageHighUsd)}`} />
          <Stat label="Active seats" value={String(result.activeSeats)} icon={Users} />
        </div>
        <ul className="mt-6 space-y-2 text-sm text-[var(--color-paper-400)]">
          {result.notes.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-[var(--color-paper-300)]">
          For real spend, use{' '}
          <a href="/tools/usage-insights" className="underline hover:text-[var(--color-paper-100)]">
            Usage Insights
          </a>{' '}
          with exported dashboard data.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Users }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-[var(--color-muted)]">
        {Icon && <Icon size={12} aria-hidden="true" />}
        {label}
      </div>
      <p className="mt-1 font-mono text-sm text-[var(--color-paper-100)]">{value}</p>
    </div>
  );
}
