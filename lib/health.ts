import type { Severity } from "./schema";

export interface HealthInput {
  seats: number;
  activeUsers: number;
  weeklyActiveUsers: number[];
  openBlockers: Severity[];
  feedbackSharedWithProduct: number;
  feedbackTotal: number;
}
export type HealthBand = "at_risk" | "needs_attention" | "steady" | "healthy";
export interface HealthBreakdown {
  utilizationPts: number; // 0..50
  trendPts: number; // 0..30
  engagementPts: number; // 0..20
  penalty: number; // 0..40
}
export interface HealthResult {
  score: number;
  band: HealthBand;
  expansionReady: boolean;
  breakdown: HealthBreakdown;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function computeHealth(input: HealthInput): HealthResult {
  const utilization = input.seats > 0 ? clamp(input.activeUsers / input.seats, 0, 1) : 0;

  const first = input.weeklyActiveUsers[0] ?? 0;
  const last = input.weeklyActiveUsers[input.weeklyActiveUsers.length - 1] ?? 0;
  const rawTrend = (last - first) / Math.max(first, 1); // growth ratio
  const trendNorm = clamp((rawTrend + 1) / 2, 0, 1);

  const engagement =
    input.feedbackTotal > 0
      ? clamp(input.feedbackSharedWithProduct / input.feedbackTotal, 0, 1)
      : 0;

  const utilizationPts = 100 * 0.5 * utilization;
  const trendPts = 100 * 0.3 * trendNorm;
  const engagementPts = 100 * 0.2 * engagement;
  const base = utilizationPts + trendPts + engagementPts;

  const penalty = Math.min(
    40,
    input.openBlockers.reduce(
      (sum, s) => sum + (s === "high" ? 12 : s === "medium" ? 6 : 2),
      0,
    ),
  );

  const score = Math.round(clamp(base - penalty, 0, 100));

  const band: HealthBand =
    score < 40 ? "at_risk" : score < 60 ? "needs_attention" : score < 80 ? "steady" : "healthy";

  const expansionReady = band === "healthy" && utilization > 0.7 && rawTrend > 0;

  return {
    score,
    band,
    expansionReady,
    breakdown: { utilizationPts, trendPts, engagementPts, penalty },
  };
}
