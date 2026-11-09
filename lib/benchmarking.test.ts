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
    const report = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Corporate", workflowRuns: 200, activeUsers: 20, verifiedOutputs: 90, draftOutputs: 5, blockedOutputs: 5 }), usage({ practiceGroup: "Litigation" }), usage({ practiceGroup: "Finance", workflowRuns: 150 })], trends });
    expect(report.rows[0].practiceGroup).toBe("Corporate");
    expect(report.rows[0].trendDelta).toBe(4);
    expect(report.rows.find(row => row.practiceGroup === "Litigation")?.trendDelta).toBe(-5);
  });
  it("emits review-gated insights", () => {
    const report = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Corporate", verifiedOutputs: 90, draftOutputs: 5, blockedOutputs: 5 }), usage({ practiceGroup: "Litigation", workflowRuns: 150, verifiedOutputs: 10, draftOutputs: 80, blockedOutputs: 10 }), usage({ practiceGroup: "Finance", workflowRuns: 50 })], trends });
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
  it("bands no group when fewer than three are measured", () => {
    const report = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Corporate", workflowRuns: 200 }), usage({ practiceGroup: "Litigation" }), usage({ practiceGroup: "Employment", activeUsers: 4 })], trends });
    expect(report.rows).toHaveLength(2);
    expect(report.rows.every(row => row.band === null)).toBe(true);
    expect(report.rows.flatMap(row => row.insights).join(" ")).not.toContain("median");
  });
  it("leaves a group with no outputs unbanded and out of the verified median", () => {
    const report = buildPracticeGroupBenchmark({
      usage: [
        usage({ practiceGroup: "Corporate", verifiedOutputs: 90, draftOutputs: 5, blockedOutputs: 5 }),
        usage({ practiceGroup: "Litigation", verifiedOutputs: 30, draftOutputs: 60, blockedOutputs: 10 }),
        usage({ practiceGroup: "Finance", verifiedOutputs: 60, draftOutputs: 30, blockedOutputs: 10 }),
        usage({ practiceGroup: "Employment", verifiedOutputs: 0, draftOutputs: 0, blockedOutputs: 0 }),
      ],
      trends,
    });
    const empty = report.rows.find(row => row.practiceGroup === "Employment")!;
    expect(empty.verifiedShare).toBeNull();
    expect(empty.band).toBeNull();
    expect(empty.insights.join(" ")).not.toContain("median");
    expect(report.internalMedian.verifiedShare).toBe(0.6);
    expect(report.rows.find(row => row.practiceGroup === "Corporate")?.band).not.toBeNull();
  });
  it("suppresses the synthetic Employment group, which has 8 active users", () => {
    const report = buildPracticeGroupBenchmark({ usage: adoptionCockpitReport().practiceGroupUsage, trends: [] });
    expect(report.suppressed.map(s => s.practiceGroup)).toEqual(["Employment"]);
    expect(report.rows.every(row => row.activeUsers >= 10)).toBe(true);
  });
  it("handles empty input and zero denominators", () => {
    // Nothing measured: the medians are unknown, not 0.
    expect(buildPracticeGroupBenchmark({ usage: [], trends: [] }).internalMedian).toEqual({ workflowRuns: null, activeUsers: null, verifiedShare: null });
    const zeroed = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Finance", verifiedOutputs: 0, draftOutputs: 0, blockedOutputs: 0 })], trends: [] });
    expect(zeroed.rows[0].verifiedShare).toBeNull();
    expect(zeroed.rows[0].trendDelta).toBeNull();
  });
});
