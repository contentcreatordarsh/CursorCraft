export type PlanTier = 'pro' | 'teams' | 'enterprise';
export type UsageIntensity = 'light' | 'typical' | 'heavy';

export interface ModelMix {
  auto: number;
  frontier: number;
  max: number;
}

export interface CostEstimateInput {
  seats: number;
  plan: PlanTier;
  modelMix: ModelMix;
  intensity: UsageIntensity;
  /** Percentage of seats with little/no usage (0–50). */
  idleSeatPercent: number;
}

export interface CostEstimateResult {
  planLabel: string;
  seats: number;
  activeSeats: number;
  subscriptionUsd: number;
  overageLowUsd: number;
  overageHighUsd: number;
  totalLowUsd: number;
  totalHighUsd: number;
  notes: string[];
}
