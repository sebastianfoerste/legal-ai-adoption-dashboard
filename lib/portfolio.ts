import { getAccounts, getBlockers } from "./data";
import { accountHealth } from "./aggregate";
import type { HealthBand } from "./health";

export interface PortfolioSummary {
  total: number;
  byBand: Record<HealthBand, number>;
  expansionReady: number;
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
  let expansionReady = 0;
  for (const a of accounts) {
    const h = accountHealth(a.id);
    byBand[h.band] += 1;
    if (h.expansionReady) expansionReady += 1;
  }
  const openHighSeverityBlockers = getBlockers().filter(
    (b) => b.status !== "resolved" && b.severity === "high",
  ).length;
  return { total: accounts.length, byBand, expansionReady, openHighSeverityBlockers };
}
