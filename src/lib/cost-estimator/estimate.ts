import type { CostEstimateInput, CostEstimateResult, ModelMix, PlanTier, UsageIntensity } from './types.ts';

/** Approximate public list pricing — for planning only, not a quote. */
const PLAN: Record<PlanTier, { label: string; seatUsd: number }> = {
  pro: { label: 'Pro', seatUsd: 20 },
  teams: { label: 'Teams / Business', seatUsd: 40 },
  enterprise: { label: 'Enterprise (estimate)', seatUsd: 60 },
};

const INTENSITY: Record<UsageIntensity, number> = {
  light: 0.45,
  typical: 1,
  heavy: 2.3,
};

function mixWeight(mix: ModelMix): number {
  const total = mix.auto + mix.frontier + mix.max || 1;
  return (mix.auto * 0.55 + mix.frontier * 1.4 + mix.max * 2.8) / total;
}

/** Rough monthly USD range from seats + model mix — no API, no billing data. */
export function estimateCost(input: CostEstimateInput): CostEstimateResult {
  const seats = Math.max(1, Math.min(500, Math.round(input.seats)));
  const idle = Math.max(0, Math.min(50, input.idleSeatPercent));
  const activeSeats = Math.max(1, Math.round(seats * (1 - idle / 100)));

  const plan = PLAN[input.plan];
  const subscriptionUsd = seats * plan.seatUsd;

  const baseOverage = 8 * INTENSITY[input.intensity] * mixWeight(input.modelMix);
  const overageLowUsd = Math.round(activeSeats * baseOverage * 0.65);
  const overageHighUsd = Math.round(activeSeats * baseOverage * 1.35);

  const totalLowUsd = subscriptionUsd + overageLowUsd;
  const totalHighUsd = subscriptionUsd + overageHighUsd;

  const notes = [
    'Estimates only — Cursor pricing and included usage change. Validate against your dashboard or contract.',
    'Subscription covers seat licenses; overage reflects model mix and usage intensity assumptions.',
    idle > 0
      ? `${idle}% idle seats assumed — reclaiming unused seats lowers subscription cost directly.`
      : 'All seats assumed active. Use Usage Insights to find idle seats on your real team.',
  ];

  if (input.modelMix.max > 30) {
    notes.push('High Max-mode share drives the upper range — default to Auto/Composer where possible.');
  }

  return {
    planLabel: plan.label,
    seats,
    activeSeats,
    subscriptionUsd,
    overageLowUsd,
    overageHighUsd,
    totalLowUsd,
    totalHighUsd,
    notes,
  };
}

export function normalizeModelMix(mix: ModelMix): ModelMix {
  const total = mix.auto + mix.frontier + mix.max;
  if (total <= 0) return { auto: 70, frontier: 25, max: 5 };
  const scale = 100 / total;
  const auto = Math.round(mix.auto * scale);
  const frontier = Math.round(mix.frontier * scale);
  return {
    auto,
    frontier,
    max: Math.max(0, 100 - auto - frontier),
  };
}
