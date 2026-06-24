import type {
  Insights,
  MemberSpend,
  ParseResult,
  Recommendation,
  UsageRow,
} from './types';

const COST = '/learn/cost';

function num(v: unknown): number {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0;
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

interface NormalizedInput {
  spend: MemberSpend[];
  usage: UsageRow[];
}

/** Pulls spend + usage arrays out of the many shapes a user might paste. */
function normalize(root: unknown): NormalizedInput {
  const r = (root ?? {}) as Record<string, unknown>;

  // Combined shape: { spend: {...}, usage: {...} }
  const spendSource = (r.spend ?? r) as Record<string, unknown>;
  const usageSource = (r.usage ?? r) as Record<string, unknown>;

  const rawSpend = Array.isArray(spendSource.teamMemberSpend)
    ? (spendSource.teamMemberSpend as unknown[])
    : Array.isArray((r as Record<string, unknown>).teamMemberSpend)
      ? ((r as Record<string, unknown>).teamMemberSpend as unknown[])
      : [];

  const rawUsage = Array.isArray(usageSource.data)
    ? (usageSource.data as unknown[])
    : Array.isArray((r as Record<string, unknown>).data) && !rawSpend.length
      ? ((r as Record<string, unknown>).data as unknown[])
      : Array.isArray(usageSource.data)
        ? (usageSource.data as unknown[])
        : [];

  const spend: MemberSpend[] = rawSpend.map((u) => {
    const o = (u ?? {}) as Record<string, unknown>;
    return {
      name: str(o.name),
      email: str(o.email) ?? 'unknown',
      role: str(o.role),
      spendCents: num(o.spendCents),
      overallSpendCents: num(o.overallSpendCents ?? o.spendCents),
      fastPremiumRequests: num(o.fastPremiumRequests),
    };
  });

  const usage: UsageRow[] = rawUsage.map((u) => {
    const o = (u ?? {}) as Record<string, unknown>;
    return {
      email: str(o.email) ?? 'unknown',
      date: typeof o.date === 'number' ? o.date : undefined,
      isActive: typeof o.isActive === 'boolean' ? o.isActive : undefined,
      mostUsedModel: str(o.mostUsedModel) ?? null,
      composerRequests: num(o.composerRequests),
      chatRequests: num(o.chatRequests),
      agentRequests: num(o.agentRequests),
      cmdkUsages: num(o.cmdkUsages),
      totalApplies: num(o.totalApplies),
      totalAccepts: num(o.totalAccepts),
      totalTabsShown: num(o.totalTabsShown),
      totalTabsAccepted: num(o.totalTabsAccepted),
      usageBasedReqs: num(o.usageBasedReqs),
      apiKeyReqs: num(o.apiKeyReqs),
      subscriptionIncludedReqs: num(o.subscriptionIncludedReqs),
    };
  });

  return { spend, usage };
}

function labelFor(email: string, spend: MemberSpend[]): string {
  const m = spend.find((s) => s.email === email);
  return m?.name ?? email;
}

function computeInsights({ spend, usage }: NormalizedInput): Insights {
  const hasSpend = spend.length > 0;
  const hasUsage = usage.length > 0;

  const totalSpendCents = spend.reduce((n, m) => n + m.overallSpendCents, 0);
  const onDemandSpendCents = spend.reduce((n, m) => n + m.spendCents, 0);
  const premiumRequests = spend.reduce((n, m) => n + m.fastPremiumRequests, 0);

  // Active set: any usage day active, or any premium requests / spend.
  const activeEmails = new Set<string>();
  for (const u of usage) {
    const requests = u.composerRequests + u.chatRequests + u.agentRequests + u.cmdkUsages;
    if (u.isActive === true || requests > 0 || u.totalApplies > 0 || u.totalTabsShown > 0) {
      activeEmails.add(u.email);
    }
  }
  for (const m of spend) {
    if (m.fastPremiumRequests > 0 || m.overallSpendCents > 0) activeEmails.add(m.email);
  }

  const memberEmails = new Set<string>([...spend.map((s) => s.email), ...usage.map((u) => u.email)]);
  const memberCount = memberEmails.size;
  const activeMemberCount = activeEmails.size;

  // Idle seats: known members with zero recorded activity anywhere.
  const idleSeats = [...memberEmails]
    .filter((email) => !activeEmails.has(email))
    .map((email) => ({ label: labelFor(email, spend), email }));

  // Cost hotspots (needs spend).
  const sortedSpend = [...spend].sort((a, b) => b.overallSpendCents - a.overallSpendCents);
  const hotspots = sortedSpend.slice(0, 8).map((m) => ({
    label: m.name ?? m.email,
    email: m.email,
    overallSpendCents: m.overallSpendCents,
    share: totalSpendCents > 0 ? m.overallSpendCents / totalSpendCents : 0,
  }));

  // Concentration: top 20% of members' share of spend.
  const topN = Math.max(1, Math.ceil(sortedSpend.length * 0.2));
  const topSpend = sortedSpend.slice(0, topN).reduce((n, m) => n + m.overallSpendCents, 0);
  const concentrationPct = totalSpendCents > 0 ? (topSpend / totalSpendCents) * 100 : 0;

  // Model mix weighted by request volume that day.
  const modelWeights = new Map<string, number>();
  for (const u of usage) {
    if (!u.mostUsedModel) continue;
    const weight = u.composerRequests + u.chatRequests + u.agentRequests || 1;
    modelWeights.set(u.mostUsedModel, (modelWeights.get(u.mostUsedModel) ?? 0) + weight);
  }
  const totalModelWeight = [...modelWeights.values()].reduce((n, w) => n + w, 0);
  const modelMix = [...modelWeights.entries()]
    .map(([model, weight]) => ({
      model,
      weight,
      share: totalModelWeight > 0 ? weight / totalModelWeight : 0,
    }))
    .sort((a, b) => b.weight - a.weight);

  // Request mix.
  const sum = (key: keyof UsageRow) => usage.reduce((n, u) => n + num(u[key]), 0);
  const requestMix = [
    { label: 'Tab', value: sum('totalTabsAccepted') },
    { label: 'Composer', value: sum('composerRequests') },
    { label: 'Chat', value: sum('chatRequests') },
    { label: 'Agent', value: sum('agentRequests') },
    { label: 'Cmd-K', value: sum('cmdkUsages') },
  ].filter((r) => r.value > 0);

  // Accept rate.
  const applies = sum('totalApplies');
  const accepts = sum('totalAccepts');
  const acceptRate = applies >= 20 ? accepts / applies : null;

  const usageBased = sum('usageBasedReqs');

  const recommendations = buildRecommendations({
    idleCount: idleSeats.length,
    concentrationPct,
    totalSpendCents,
    onDemandSpendCents,
    acceptRate,
    modelMix,
    usageBased,
    premiumRequests,
    hasSpend,
    hasUsage,
  });

  return {
    hasSpend,
    hasUsage,
    totals: {
      totalSpendCents,
      onDemandSpendCents,
      memberCount,
      activeMemberCount,
      idleSeatCount: idleSeats.length,
      premiumRequests,
    },
    hotspots,
    concentrationPct,
    idleSeats,
    modelMix,
    requestMix,
    acceptRate,
    recommendations,
  };
}

function buildRecommendations(ctx: {
  idleCount: number;
  concentrationPct: number;
  totalSpendCents: number;
  onDemandSpendCents: number;
  acceptRate: number | null;
  modelMix: { model: string; share: number }[];
  usageBased: number;
  premiumRequests: number;
  hasSpend: boolean;
  hasUsage: boolean;
}): Recommendation[] {
  const out: Recommendation[] = [];

  if (ctx.idleCount > 0) {
    out.push({
      id: 'idle-seats',
      severity: 'warning',
      title: `Reclaim ${ctx.idleCount} idle seat${ctx.idleCount === 1 ? '' : 's'}`,
      detail: `${ctx.idleCount} member${ctx.idleCount === 1 ? ' has' : 's have'} no recorded activity this period. Reassign or deprovision unused seats to stop paying for them.`,
      ref: COST,
    });
  }

  if (ctx.concentrationPct >= 60 && ctx.hasSpend) {
    out.push({
      id: 'concentration',
      severity: 'tip',
      title: 'Spend is concentrated in a few users',
      detail: `The top 20% of members drive ${Math.round(ctx.concentrationPct)}% of spend. Coach those users on context curation and templatize their workflows — the biggest savings live here.`,
      ref: `${COST}#6-monitor-per-user-and-per-model`,
    });
  }

  if (ctx.totalSpendCents > 0 && ctx.onDemandSpendCents / ctx.totalSpendCents >= 0.4) {
    out.push({
      id: 'on-demand',
      severity: 'warning',
      title: 'High on-demand (usage-based) spend',
      detail: `On-demand usage is ${Math.round((ctx.onDemandSpendCents / ctx.totalSpendCents) * 100)}% of total spend. Set soft spend limits and alerts, and default everyday work to Auto/Composer.`,
      ref: `${COST}#5-set-soft-spend-limits-and-alerts`,
    });
  }

  if (ctx.acceptRate !== null && ctx.acceptRate < 0.5) {
    out.push({
      id: 'accept-rate',
      severity: 'tip',
      title: 'Low suggestion accept rate',
      detail: `Only ${Math.round(ctx.acceptRate * 100)}% of applied changes are accepted. A low accept rate often signals over-broad context — trim what you send the model to raise quality and cut cost.`,
      ref: `${COST}#2-trim-context-the-1-cost-leak`,
    });
  }

  if (ctx.modelMix.length > 1) {
    const topShare = Math.round((ctx.modelMix[0]?.share ?? 0) * 100);
    out.push({
      id: 'model-mix',
      severity: 'tip',
      title: 'Review your model mix',
      detail: `Usage spans ${ctx.modelMix.length} models (top: ${ctx.modelMix[0]?.model} at ${topShare}%). Default to Auto/Composer and reserve Max-tier/frontier models for genuinely hard problems.`,
      ref: `${COST}#3-use-max-mode-sparingly`,
    });
  }

  // Always-on governance nudge.
  out.push({
    id: 'monitor',
    severity: 'tip',
    title: 'Keep monitoring per-user and per-model',
    detail:
      'Re-run this report regularly. Feed what you learn back into team conventions and .cursor/rules so good defaults stick.',
    ref: `${COST}#6-monitor-per-user-and-per-model`,
  });

  const order = { critical: 0, warning: 1, tip: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

export function analyze(raw: string): ParseResult {
  if (!raw || raw.trim().length === 0) {
    return { ok: false, error: 'Paste the JSON output from the curl command above to begin.' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      error: 'That is not valid JSON. Copy the full output of the curl command and paste it here.',
    };
  }
  const normalized = normalize(parsed);
  if (normalized.spend.length === 0 && normalized.usage.length === 0) {
    return {
      ok: false,
      error:
        'No recognizable usage or spend data found. Expecting a "teamMemberSpend" array, a "data" array, or a combined { spend, usage } object.',
    };
  }
  return { ok: true, insights: computeInsights(normalized) };
}

export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
