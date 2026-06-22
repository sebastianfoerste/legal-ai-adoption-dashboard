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
});
