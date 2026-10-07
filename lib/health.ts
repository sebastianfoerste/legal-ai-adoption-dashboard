import type { Severity } from "./schema";
import healthConfig from "../data/health-config.json";

export interface HealthInput {
  seats: number;
  activeUsers: number;
  weeklyActiveUsers: number[];
  openBlockers: Severity[];
  /** Draft outputs produced and how many a human reviewer verified. Omit when not captured. */
  draftOutputs?: number;
  verifiedOutputs?: number;
}
export type HealthBand = "at_risk" | "needs_attention" | "steady" | "healthy";
export type HealthComponent = "reviewedCompletion";
export interface HealthBreakdown {
  utilizationPts: number;
  trendPts: number;
  reviewedCompletionPts: number | null; // null = not captured, not zero
  penalty: number; // 0..maxPenalty
}
export interface HealthResult {
  score: number;
  band: HealthBand;
  breakdown: HealthBreakdown;
  unknownComponents: HealthComponent[];
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/**
 * Adoption health: how well the licensed product is used and whether its output survives
 * human review. It is a triage aid. It does not say whether an account should expand and
 * it does not predict renewal; see lib/engagement/expansion.ts and renewal.ts for those.
 *
 * Feedback routed to Product is deliberately not an input: forwarding a complaint is a
 * vendor process step and leaves the customer's outcome unchanged.
 */
export function computeHealth(input: HealthInput, config = healthConfig): HealthResult {
  const utilization = input.seats > 0 ? clamp(input.activeUsers / input.seats, 0, 1) : 0;

  const first = input.weeklyActiveUsers[0] ?? 0;
  const last = input.weeklyActiveUsers[input.weeklyActiveUsers.length - 1] ?? 0;
  const rawTrend = (last - first) / Math.max(first, 1); // growth ratio
  const trendNorm = clamp((rawTrend + 1) / 2, 0, 1);

  const drafts = input.draftOutputs ?? 0;
  const reviewedCompletion =
    drafts > 0 ? clamp((input.verifiedOutputs ?? 0) / drafts, 0, 1) : null;

  // An unknown component is left out and the known weights are rescaled to 100, so a
  // missing measurement neither rewards nor punishes the account.
  const w = config.weights;
  const knownWeight =
    w.utilization + w.trend + (reviewedCompletion === null ? 0 : w.reviewedCompletion);
  const scale = knownWeight > 0 ? 100 / knownWeight : 0;
  const utilizationPts = scale * w.utilization * utilization;
  const trendPts = scale * w.trend * trendNorm;
  const reviewedCompletionPts =
    reviewedCompletion === null ? null : scale * w.reviewedCompletion * reviewedCompletion;
  const base = utilizationPts + trendPts + (reviewedCompletionPts ?? 0);

  const p = config.penalties;
  const penalty = Math.min(
    p.maxPenalty,
    input.openBlockers.reduce(
      (sum, s) =>
        sum + (s === "high" ? p.highBlocker : s === "medium" ? p.mediumBlocker : p.lowBlocker),
      0,
    ),
  );

  const score = Math.round(clamp(base - penalty, 0, 100));

  const band: HealthBand =
    score < 40 ? "at_risk" : score < 60 ? "needs_attention" : score < 80 ? "steady" : "healthy";

  return {
    score,
    band,
    breakdown: { utilizationPts, trendPts, reviewedCompletionPts, penalty },
    unknownComponents: reviewedCompletion === null ? ["reviewedCompletion"] : [],
  };
}
