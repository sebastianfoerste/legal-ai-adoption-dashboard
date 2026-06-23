import { describe, it, expect } from "vitest";
import { computeHealth } from "./health";

describe("computeHealth", () => {
  it("scores a growing, well-utilized, engaged account as healthy and expansion-ready", () => {
    const r = computeHealth({
      seats: 50,
      activeUsers: 45,
      weeklyActiveUsers: [30, 32, 35, 40, 45],
      openBlockers: [],
      feedbackSharedWithProduct: 8,
      feedbackTotal: 10,
    });
    expect(r.score).toBe(84);
    expect(r.band).toBe("healthy");
    expect(r.expansionReady).toBe(true);
  });

  it("scores a declining, low-utilization, blocked account as at_risk", () => {
    const r = computeHealth({
      seats: 40,
      activeUsers: 6,
      weeklyActiveUsers: [20, 15, 10, 8, 6],
      openBlockers: ["high", "high", "medium"],
      feedbackSharedWithProduct: 0,
      feedbackTotal: 3,
    });
    expect(r.score).toBe(0);
    expect(r.band).toBe("at_risk");
    expect(r.expansionReady).toBe(false);
  });

  it("handles zero seats without dividing by zero", () => {
    const r = computeHealth({
      seats: 0,
      activeUsers: 0,
      weeklyActiveUsers: [0, 0],
      openBlockers: [],
      feedbackSharedWithProduct: 0,
      feedbackTotal: 0,
    });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.expansionReady).toBe(false);
  });

  it("returns a component breakdown that reconstructs the score", () => {
    const r = computeHealth({
      seats: 50,
      activeUsers: 45,
      weeklyActiveUsers: [30, 32, 35, 40, 45],
      openBlockers: [],
      feedbackSharedWithProduct: 8,
      feedbackTotal: 10,
    });
    const { utilizationPts, trendPts, engagementPts, penalty } = r.breakdown;
    expect(Math.round(utilizationPts + trendPts + engagementPts - penalty)).toBe(r.score);
    expect(utilizationPts).toBeCloseTo(45, 1); // 100 * 0.5 * 0.9
  });

  it("applies custom configuration weights and penalties correctly", () => {
    const customConfig = {
      weights: {
        utilization: 1.0,
        trend: 0.0,
        engagement: 0.0
      },
      penalties: {
        highBlocker: 5,
        mediumBlocker: 2,
        lowBlocker: 0,
        maxPenalty: 10
      }
    };
    const r = computeHealth({
      seats: 50,
      activeUsers: 45, // 90% utilization
      weeklyActiveUsers: [30, 20], // downward trend, but trend weight is 0
      openBlockers: ["high", "medium"], // high (5) + medium (2) = 7 penalty
      feedbackSharedWithProduct: 0,
      feedbackTotal: 0
    }, customConfig);

    // 100 * 1.0 * 0.9 = 90 base score
    // 90 - 7 = 83 final score
    expect(r.score).toBe(83);
    expect(r.breakdown.utilizationPts).toBe(90);
    expect(r.breakdown.trendPts).toBe(0);
    expect(r.breakdown.penalty).toBe(7);
  });
});
