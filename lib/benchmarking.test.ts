import { describe, expect, it } from "vitest";
import { buildPracticeGroupBenchmark, type PracticeGroupTrend } from "./benchmarking";
import type { PracticeGroupUsageSummary } from "./adoption-cockpit";

function usage(overrides: Partial<PracticeGroupUsageSummary> & { practiceGroup: string }): PracticeGroupUsageSummary {
  return { activeUsers: 10, dailyUsageAmongLicensedUsers: 0.4, workflowRuns: 100, reviewTables: 5, draftOutputs: 20, verifiedOutputs: 60, blockedOutputs: 20, ...overrides };
}
const trends: PracticeGroupTrend[] = [{ practiceGroup: "Corporate", weeklyActiveUsers: [8, 9, 12] }, { practiceGroup: "Litigation", weeklyActiveUsers: [14, 11, 9] }];

describe("practice group benchmarking", () => {
  it("computes medians and cohort bands", () => {
    const report = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Corporate", workflowRuns: 200, activeUsers: 20, verifiedOutputs: 90, draftOutputs: 5, blockedOutputs: 5 }), usage({ practiceGroup: "Litigation" }), usage({ practiceGroup: "Employment", workflowRuns: 20, activeUsers: 2, verifiedOutputs: 1, draftOutputs: 9, blockedOutputs: 0 })], trends });
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
  it("handles empty input and zero denominators", () => {
    expect(buildPracticeGroupBenchmark({ usage: [], trends: [] }).internalMedian).toEqual({ workflowRuns: 0, activeUsers: 0, verifiedShare: 0 });
    const zeroed = buildPracticeGroupBenchmark({ usage: [usage({ practiceGroup: "Finance", verifiedOutputs: 0, draftOutputs: 0, blockedOutputs: 0 })], trends: [] });
    expect(zeroed.rows[0].verifiedShare).toBe(0);
  });
});
