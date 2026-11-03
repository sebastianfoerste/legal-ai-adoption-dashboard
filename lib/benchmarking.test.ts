import { describe, expect, it } from "vitest";
import { SUPPRESSION_NOTE, buildPracticeGroupBenchmark, type PracticeGroupTrend } from "./benchmarking";
import { adoptionCockpitReport } from "./adoption-cockpit";
import type { PracticeGroupUsageSummary } from "./adoption-cockpit";

function usage(overrides: Partial<PracticeGroupUsageSummary> & { practiceGroup: string }): PracticeGroupUsageSummary {
  return { activeUsers: 10, dailyUsageAmongLicensedUsers: 0.4, workflowRuns: 100, reviewTables: 5, draftOutputs: 20, verifiedOutputs: 60, blockedOutputs: 20, ...overrides };
}
const trends: PracticeGroupTrend[] = [{ practiceGroup: "Corporate", weeklyActiveUsers: [8, 9, 12] }, { practiceGroup: "Litigation", weeklyActiveUsers: [14, 11, 9] }];

describe("practice group benchmarking", () => {
  it("computes medians and cohort bands", () => {
    const report = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Corporate", workflowRuns: 200, activeUsers: 20, verifiedOutputs: 90, draftOutputs: 5, blockedOutputs: 5 }), usage({ practiceGroup: "Litigation", activeUsers: 15 }), usage({ practiceGroup: "Employment", workflowRuns: 20, activeUsers: 10, verifiedOutputs: 1, draftOutputs: 9, blockedOutputs: 0 })], trends });
    expect(report.rows.find(row => row.practiceGroup === "Corporate")?.band).toBe("leading");
    expect(report.rows.find(row => row.practiceGroup === "Employment")?.band).toBe("lagging");
    expect(report.internalMedian.workflowRuns).toBe(100);
  });
  it("orders leaders first and computes trend deltas", () => {
    const report = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Corporate", workflowRuns: 200, activeUsers: 20, verifiedOutputs: 90, draftOutputs: 5, blockedOutputs: 5 }), usage({ practiceGroup: "Litigation" })], trends });
    expect(report.rows[0].practiceGroup).toBe("Corporate");
    expect(report.rows[0].trendDelta).toBe(4);
    expect(report.rows[1].trendDelta).toBe(-5);
  });
  it("emits review-gated insights", () => {
    const report = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Corporate", verifiedOutputs: 90, draftOutputs: 5, blockedOutputs: 5 }), usage({ practiceGroup: "Litigation", workflowRuns: 150, verifiedOutputs: 10, draftOutputs: 80, blockedOutputs: 10 })], trends });
    const insights = report.rows.find(row => row.practiceGroup === "Litigation")?.insights.join(" ") ?? "";
    expect(insights).toContain("verification clinic");
    expect(insights).toContain("volume as value");
    expect(insights).toContain("declining");
    expect(report.externalActionAllowed).toBe(false);
  });
  it("suppresses a group below the small-cohort threshold and leaves it out of the medians", () => {
    const report = buildPracticeGroupBenchmark({
      usage: [
        usage({ practiceGroup: "Corporate", workflowRuns: 200, activeUsers: 20 }),
        usage({ practiceGroup: "Litigation", workflowRuns: 100, activeUsers: 10 }),
        usage({ practiceGroup: "Employment", workflowRuns: 5, activeUsers: 9 }),
      ],
      trends,
    });
    expect(report.rows.map(row => row.practiceGroup)).not.toContain("Employment");
    expect(report.suppressed).toEqual([{ practiceGroup: "Employment", reason: "Fewer than 10 active users: figures suppressed." }]);
    expect(report.internalMedian.workflowRuns).toBe(150);
    expect(report.internalMedian.activeUsers).toBe(15);
    expect(JSON.stringify(report.suppressed)).not.toMatch(/\b[59]\b/);
    expect(SUPPRESSION_NOTE).toMatch(/fewer than 10 active users/);
  });
  it("suppresses the synthetic Employment group, which has 8 active users", () => {
    const report = buildPracticeGroupBenchmark({ usage: adoptionCockpitReport().practiceGroupUsage, trends: [] });
    expect(report.suppressed.map(s => s.practiceGroup)).toEqual(["Employment"]);
    expect(report.rows.every(row => row.activeUsers >= 10)).toBe(true);
  });
  it("handles empty input and zero denominators", () => {
    expect(buildPracticeGroupBenchmark({ usage: [], trends: [] }).internalMedian).toEqual({ workflowRuns: 0, activeUsers: 0, verifiedShare: 0 });
    const zeroed = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Finance", verifiedOutputs: 0, draftOutputs: 0, blockedOutputs: 0 })], trends: [] });
    expect(zeroed.rows[0].verifiedShare).toBe(0);
  });
});
