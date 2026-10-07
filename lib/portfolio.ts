import { getAccounts, getBlockers } from "./data";
import { accountHealth } from "./aggregate";
import { accountExpansion, type Recommendation } from "./engagement/expansion";
import type { HealthBand } from "./health";

export interface PortfolioSummary {
  total: number;
  byBand: Record<HealthBand, number>;
  /** Review recommendations from the six-criterion evidence model, not from the health band. */
  byRecommendation: Record<Recommendation, number>;
  openHighSeverityBlockers: number;
}

export function portfolioSummary(): PortfolioSummary {
  const accounts = getAccounts();
  const byBand: Record<HealthBand, number> = {
    at_risk: 0,
    needs_attention: 0,
    steady: 0,
    healthy: 0,
  };
  const byRecommendation: Record<Recommendation, number> = {
    expand: 0,
    continue: 0,
    adjust: 0,
    pause: 0,
  };
  for (const a of accounts) {
    byBand[accountHealth(a.id).band] += 1;
    byRecommendation[accountExpansion(a.id).recommendation] += 1;
  }
  const openHighSeverityBlockers = getBlockers().filter(
    (b) => b.status !== "resolved" && b.severity === "high",
  ).length;
  return { total: accounts.length, byBand, byRecommendation, openHighSeverityBlockers };
}
