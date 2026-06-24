export interface MemberSpend {
  name?: string;
  email: string;
  role?: string;
  /** On-demand spend in cents (excludes included usage). */
  spendCents: number;
  /** Total spend in cents (on-demand + included). */
  overallSpendCents: number;
  /** Usage-based premium requests in the cycle. */
  fastPremiumRequests: number;
}

export interface UsageRow {
  email: string;
  date?: number;
  isActive?: boolean;
  mostUsedModel?: string | null;
  composerRequests: number;
  chatRequests: number;
  agentRequests: number;
  cmdkUsages: number;
  totalApplies: number;
  totalAccepts: number;
  totalTabsShown: number;
  totalTabsAccepted: number;
  usageBasedReqs: number;
  apiKeyReqs: number;
  subscriptionIncludedReqs: number;
}

export type Severity = 'critical' | 'warning' | 'tip';

export interface Recommendation {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  /** Optional deep link to the cost guide. */
  ref?: string;
}

export interface Insights {
  hasSpend: boolean;
  hasUsage: boolean;
  totals: {
    totalSpendCents: number;
    onDemandSpendCents: number;
    memberCount: number;
    activeMemberCount: number;
    idleSeatCount: number;
    premiumRequests: number;
  };
  /** Top spenders, descending by overall spend. */
  hotspots: { label: string; email: string; overallSpendCents: number; share: number }[];
  /** Share of total spend held by the top 20% of members. */
  concentrationPct: number;
  /** Members paying for a seat with no recorded activity. */
  idleSeats: { label: string; email: string }[];
  /** Model distribution by weighted request volume. */
  modelMix: { model: string; weight: number; share: number }[];
  /** Aggregate request mix. */
  requestMix: { label: string; value: number }[];
  /** Accept rate across applies (0..1) or null if not enough data. */
  acceptRate: number | null;
  recommendations: Recommendation[];
}

export interface ParseResult {
  ok: boolean;
  error?: string;
  insights?: Insights;
}
