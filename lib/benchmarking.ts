import type { PracticeGroupUsageSummary, ReviewGate } from "./adoption-cockpit";

export type CohortBand = "leading" | "mid" | "lagging";
export type PracticeGroupTrend = { practiceGroup: string; weeklyActiveUsers: number[] };
export type PracticeGroupBenchmarkRow = { practiceGroup: string; workflowRuns: number; activeUsers: number; verifiedShare: number; trendDelta: number; band: CohortBand; insights: string[] };
export type PracticeGroupBenchmarkReport = {
  schema: "legal-ai-adoption.practice-benchmark.v1";
  internalMedian: { workflowRuns: number; activeUsers: number; verifiedShare: number };
  rows: PracticeGroupBenchmarkRow[];
  reviewGate: ReviewGate;
  externalActionAllowed: false;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function verifiedShareOf(row: PracticeGroupUsageSummary): number {
  const total = row.verifiedOutputs + row.draftOutputs + row.blockedOutputs;
  return total > 0 ? row.verifiedOutputs / total : 0;
}
const BAND_ORDER: Record<CohortBand, number> = { leading: 0, mid: 1, lagging: 2 };

export function buildPracticeGroupBenchmark(input: { usage: PracticeGroupUsageSummary[]; trends: PracticeGroupTrend[] }): PracticeGroupBenchmarkReport {
  const internalMedian = {
    workflowRuns: median(input.usage.map(row => row.workflowRuns)),
    activeUsers: median(input.usage.map(row => row.activeUsers)),
    verifiedShare: median(input.usage.map(verifiedShareOf)),
  };
  const trendByGroup = new Map<string, number>();
  for (const trend of input.trends) {
    if (trend.weeklyActiveUsers.length < 2) continue;
    const delta = trend.weeklyActiveUsers.at(-1)! - trend.weeklyActiveUsers[0];
    trendByGroup.set(trend.practiceGroup, (trendByGroup.get(trend.practiceGroup) ?? 0) + delta);
  }
  const rows = input.usage.map((row): PracticeGroupBenchmarkRow => {
    const verifiedShare = verifiedShareOf(row);
    const aboveMedian = [row.workflowRuns >= internalMedian.workflowRuns, row.activeUsers >= internalMedian.activeUsers, verifiedShare >= internalMedian.verifiedShare].filter(Boolean).length;
    const band: CohortBand = aboveMedian === 3 ? "leading" : aboveMedian === 0 ? "lagging" : "mid";
    const trendDelta = trendByGroup.get(row.practiceGroup) ?? 0;
    const insights: string[] = [];
    if (verifiedShare < internalMedian.verifiedShare) insights.push("Verification rate below internal peer median, schedule a verification clinic before expanding access.");
    if (row.workflowRuns >= internalMedian.workflowRuns && verifiedShare < internalMedian.verifiedShare) insights.push("High volume with below-median verification, review outputs before treating volume as value.");
    if (trendDelta < 0) insights.push("Weekly active use is declining, pair with an open re-engagement action from the blockers register.");
    return { practiceGroup: row.practiceGroup, workflowRuns: row.workflowRuns, activeUsers: row.activeUsers, verifiedShare, trendDelta, band, insights };
  });
  rows.sort((a, b) => BAND_ORDER[a.band] - BAND_ORDER[b.band] || b.workflowRuns - a.workflowRuns);
  return {
    schema: "legal-ai-adoption.practice-benchmark.v1", internalMedian, rows,
    reviewGate: { requiredReviewer: "account_owner", state: "draft", externalActionAllowed: false, note: "Benchmark bands are drafts from synthetic data. Account-owner review required before any enablement decision." },
    externalActionAllowed: false,
  };
}
