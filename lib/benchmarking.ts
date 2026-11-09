import type { PracticeGroupUsageSummary, ReviewGate } from "./adoption-cockpit";
import { SMALL_COHORT_THRESHOLD } from "./engagement/adoption-trend";

export type CohortBand = "leading" | "mid" | "lagging";
export type PracticeGroupTrend = { practiceGroup: string; weeklyActiveUsers: number[] };
/** `band` is null when too few groups are measured for a median to compare against. */
/** `verifiedShare` and `trendDelta` are null when not captured (no outputs, no weekly series): Unknown, never 0. A row with an unknown share is not banded. */
export type PracticeGroupBenchmarkRow = { practiceGroup: string; workflowRuns: number; activeUsers: number; verifiedShare: number | null; trendDelta: number | null; band: CohortBand | null; insights: string[] };
export type PracticeGroupBenchmarkReport = {
  schema: "legal-ai-adoption.practice-benchmark.v1";
  /** null when no measured group has the value. */
  internalMedian: { workflowRuns: number | null; activeUsers: number | null; verifiedShare: number | null };
  rows: PracticeGroupBenchmarkRow[];
  /** Groups below the small-cohort threshold: named, never measured, never in the median. */
  suppressed: SuppressedGroup[];
  reviewGate: ReviewGate;
  externalActionAllowed: false;
};

export type SuppressedGroup = { practiceGroup: string; reason: string };

/**
 * A practice group here spans accounts, so a small one could single out the few people in it.
 * Below the small-cohort threshold its figures are suppressed rather than flagged (owner
 * decision, 2026-11-03): the row keeps its name and the reason, and is left out of the
 * medians the other groups are compared with.
 */
export const SUPPRESSION_NOTE = `Groups with fewer than ${SMALL_COHORT_THRESHOLD} active users are named but not measured, and are left out of the medians.`;
/** Below this many measured groups, a group is compared with little more than itself. */
export const MIN_BANDED_GROUPS = 3;
export const UNBANDED_NOTE = `Not banded: fewer than ${MIN_BANDED_GROUPS} groups are measured, too few for a median to compare against.`;

export const isSuppressed = (row: Pick<PracticeGroupUsageSummary, "activeUsers">): boolean =>
  row.activeUsers < SMALL_COHORT_THRESHOLD;

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
/** Verified share of all outputs; null when the group has no outputs, so no share exists. */
function verifiedShareOf(row: PracticeGroupUsageSummary): number | null {
  const total = row.verifiedOutputs + row.draftOutputs + row.blockedOutputs;
  return total > 0 ? row.verifiedOutputs / total : null;
}
const known = (values: (number | null)[]): number[] => values.filter((v): v is number => v !== null);
const atLeast = (value: number | null, floor: number | null): boolean | null =>
  value === null || floor === null ? null : value >= floor;
const BAND_ORDER: Record<CohortBand, number> = { leading: 0, mid: 1, lagging: 2 };

export function buildPracticeGroupBenchmark(input: { usage: PracticeGroupUsageSummary[]; trends: PracticeGroupTrend[] }): PracticeGroupBenchmarkReport {
  const shown = input.usage.filter(row => !isSuppressed(row));
  const suppressed = input.usage
    .filter(isSuppressed)
    .map(row => ({ practiceGroup: row.practiceGroup, reason: `Fewer than ${SMALL_COHORT_THRESHOLD} active users: figures suppressed.` }))
    .sort((a, b) => a.practiceGroup.localeCompare(b.practiceGroup));
  const internalMedian = {
    workflowRuns: median(shown.map(row => row.workflowRuns)),
    activeUsers: median(shown.map(row => row.activeUsers)),
    verifiedShare: median(known(shown.map(verifiedShareOf))),
  };
  const trendByGroup = new Map<string, number>();
  for (const trend of input.trends) {
    if (trend.weeklyActiveUsers.length < 2) continue;
    const delta = trend.weeklyActiveUsers.at(-1)! - trend.weeklyActiveUsers[0];
    trendByGroup.set(trend.practiceGroup, (trendByGroup.get(trend.practiceGroup) ?? 0) + delta);
  }
  const rows = shown.map((row): PracticeGroupBenchmarkRow => {
    const verifiedShare = verifiedShareOf(row);
    const checks = [
      atLeast(row.workflowRuns, internalMedian.workflowRuns),
      atLeast(row.activeUsers, internalMedian.activeUsers),
      atLeast(verifiedShare, internalMedian.verifiedShare),
    ];
    const aboveMedian = checks.filter(Boolean).length;
    // An unknown comparison could go either way, so the row is not banded rather than guessed.
    const band: CohortBand | null =
      shown.length < MIN_BANDED_GROUPS || checks.includes(null)
        ? null
        : aboveMedian === 3 ? "leading" : aboveMedian === 0 ? "lagging" : "mid";
    const trendDelta = trendByGroup.get(row.practiceGroup) ?? null;
    const insights: string[] = [];
    const compared = band !== null;
    const belowVerified = checks[2] === false;
    if (compared && belowVerified) insights.push("Verification rate below internal peer median, schedule a verification clinic before expanding access.");
    if (compared && checks[0] === true && belowVerified) insights.push("High volume with below-median verification, review outputs before treating volume as value.");
    if (trendDelta !== null && trendDelta < 0) insights.push("Weekly active use is declining, pair with an open re-engagement action from the blockers register.");
    return { practiceGroup: row.practiceGroup, workflowRuns: row.workflowRuns, activeUsers: row.activeUsers, verifiedShare, trendDelta, band, insights };
  });
  const bandRank = (band: CohortBand | null) => (band === null ? 0 : BAND_ORDER[band]);
  rows.sort((a, b) => bandRank(a.band) - bandRank(b.band) || b.workflowRuns - a.workflowRuns);
  return {
    schema: "legal-ai-adoption.practice-benchmark.v1", internalMedian, rows, suppressed,
    reviewGate: { requiredReviewer: "account_owner", state: "draft", externalActionAllowed: false, note: "Benchmark bands are drafts from synthetic data. Account-owner review required before any enablement decision." },
    externalActionAllowed: false,
  };
}
