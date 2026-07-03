import type { Severity } from "./schema";
import healthConfig from "../data/health-config.json";

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
  utilizationPts: number; // 0..100 * weight
  trendPts: number; // 0..100 * weight
  engagementPts: number; // 0..100 * weight
  penalty: number; // 0..maxPenalty
}
export interface HealthResult {
  score: number;
  band: HealthBand;
  expansionReady: boolean;
  breakdown: HealthBreakdown;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function computeHealth(input: HealthInput, config = healthConfig): HealthResult {
  const utilization = input.seats > 0 ? clamp(input.activeUsers / input.seats, 0, 1) : 0;

  const first = input.weeklyActiveUsers[0] ?? 0;
  const last = input.weeklyActiveUsers[input.weeklyActiveUsers.length - 1] ?? 0;
  const rawTrend = (last - first) / Math.max(first, 1); // growth ratio
  const trendNorm = clamp((rawTrend + 1) / 2, 0, 1);

  const engagement =
    input.feedbackTotal > 0
      ? clamp(input.feedbackSharedWithProduct / input.feedbackTotal, 0, 1)
      : 0;

  const w = config.weights;
  const utilizationPts = 100 * w.utilization * utilization;
  const trendPts = 100 * w.trend * trendNorm;
  const engagementPts = 100 * w.engagement * engagement;
  const base = utilizationPts + trendPts + engagementPts;

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

  const expansionReady = band === "healthy" && utilization > 0.7 && rawTrend > 0;

  return {
    score,
    band,
    expansionReady,
    breakdown: { utilizationPts, trendPts, engagementPts, penalty },
  };
}
