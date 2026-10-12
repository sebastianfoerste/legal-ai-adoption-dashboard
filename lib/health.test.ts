import { describe, it, expect } from "vitest";
import { accountHealth } from "./aggregate";
import { getAccounts, getBlockers, getWorkflowUsage } from "./data";
import { computeHealth } from "./health";

describe("computeHealth", () => {
  it("scores a growing, well-utilized account with reviewed output as healthy", () => {
    const r = computeHealth({
      seats: 50,
      activeUsers: 45,
      weeklyActiveUsers: [30, 32, 35, 40, 45],
      openBlockers: [],
      draftOutputs: 10,
      verifiedOutputs: 8,
    });
    // 100 * (0.45 * 0.90 + 0.25 * 0.75 + 0.30 * 0.80) = 83.25
    expect(r.score).toBe(83);
    expect(r.band).toBe("healthy");
    expect(r.unknownComponents).toEqual([]);
  });

  it("scores a declining, low-utilization, blocked account as at_risk", () => {
    const r = computeHealth({
      seats: 40,
      activeUsers: 6,
      weeklyActiveUsers: [20, 15, 10, 8, 6],
      openBlockers: ["high", "high", "medium"],
      draftOutputs: 3,
      verifiedOutputs: 0,
    });
    expect(r.score).toBe(0);
    expect(r.band).toBe("at_risk");
  });

  it("handles zero seats without dividing by zero", () => {
    const r = computeHealth({
      seats: 0,
      activeUsers: 0,
      weeklyActiveUsers: [0, 0],
      openBlockers: [],
    });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(r.score)).toBe(true);
  });

  it("returns a component breakdown that reconstructs the score", () => {
    const r = computeHealth({
      seats: 50,
      activeUsers: 45,
      weeklyActiveUsers: [30, 32, 35, 40, 45],
      openBlockers: ["medium"],
      draftOutputs: 150,
      verifiedOutputs: 128,
    });
    const { utilizationPts, trendPts, reviewedCompletionPts, penalty } = r.breakdown;
    expect(Math.round(utilizationPts + trendPts + (reviewedCompletionPts ?? 0) - penalty)).toBe(
      r.score,
    );
    expect(utilizationPts).toBeCloseTo(40.5, 1); // 100 * 0.45 * 0.9
    expect(reviewedCompletionPts).toBeCloseTo(25.6, 1); // 100 * 0.30 * 128/150
    expect(r.score).toBe(79);
  });

  it("treats missing review data as unknown and rescales the known weights", () => {
    const base = {
      seats: 50,
      activeUsers: 45,
      weeklyActiveUsers: [30, 32, 35, 40, 45],
      openBlockers: [],
    };
    const unknown = computeHealth(base);
    expect(unknown.unknownComponents).toEqual(["reviewedCompletion"]);
    expect(unknown.breakdown.reviewedCompletionPts).toBeNull();
    // (0.45 * 0.90 + 0.25 * 0.75) / 0.70 * 100 = 84.64
    expect(unknown.score).toBe(85);

    // Unknown is not the same as "no output passed review".
    const zero = computeHealth({ ...base, draftOutputs: 20, verifiedOutputs: 0 });
    expect(zero.unknownComponents).toEqual([]);
    expect(zero.breakdown.reviewedCompletionPts).toBe(0);
    expect(zero.score).toBe(59);
  });

  it("applies custom configuration weights and penalties correctly", () => {
    const customConfig = {
      weights: {
        utilization: 1.0,
        trend: 0.0,
        reviewedCompletion: 0.0,
      },
      penalties: {
        highBlocker: 5,
        mediumBlocker: 2,
        lowBlocker: 0,
        maxPenalty: 10,
      },
    };
    const r = computeHealth(
      {
        seats: 50,
        activeUsers: 45, // 90% utilization
        weeklyActiveUsers: [30, 20], // downward trend, but trend weight is 0
        openBlockers: ["high", "medium"], // high (5) + medium (2) = 7 penalty
      },
      customConfig,
    );

    // 100 * 1.0 * 0.9 = 90 base score
    // 90 - 7 = 83 final score
    expect(r.score).toBe(83);
    expect(r.breakdown.utilizationPts).toBe(90);
    expect(r.breakdown.trendPts).toBe(0);
    expect(r.breakdown.penalty).toBe(7);
  });
});

describe("accountHealth", () => {
  it("is computed from usage, reviewed output and blockers only, never from feedback routing", () => {
    for (const account of getAccounts()) {
      const workflows = getWorkflowUsage().filter((w) => w.accountId === account.id);
      const expected = computeHealth({
        seats: account.seats,
        activeUsers: account.activeUsers,
        weeklyActiveUsers: account.weeklyActiveUsers,
        openBlockers: getBlockers()
          .filter((b) => b.accountId === account.id && b.status !== "resolved")
          .map((b) => b.severity),
        draftOutputs: workflows.reduce((sum, w) => sum + w.draftOutputs, 0),
        verifiedOutputs: workflows.reduce((sum, w) => sum + w.verifiedOutputs, 0),
      });
      expect(accountHealth(account.id)).toEqual(expected);
    }
  });

  it("keeps the scenario accounts in the bands the demonstration relies on", () => {
    expect(accountHealth("acct-004")).toMatchObject({ score: 81, band: "healthy" });
    expect(accountHealth("acct-005")).toMatchObject({ score: 67, band: "steady" });
  });
});
