import { describe, expect, it } from "vitest";
import healthConfig from "../data/health-config.json";
import { BAND_FLOORS, computeHealth, type HealthInput } from "./health";
import { CHANGE_NOTE, EXPANSION_NOTE, HEALTH_BANDS, explainHealth } from "./health-explain";

const base: HealthInput = {
  seats: 20,
  activeUsers: 15,
  weeklyActiveUsers: [10, 12, 14],
  openBlockers: ["medium", "low"],
  draftOutputs: 40,
  verifiedOutputs: 30,
};

describe("explainHealth", () => {
  it("shows the configured weights and the points that add up to the score", () => {
    const result = computeHealth(base);
    const e = explainHealth(result);
    expect(e.components.map((c) => c.configuredWeight)).toEqual([
      healthConfig.weights.utilization,
      healthConfig.weights.trend,
      healthConfig.weights.reviewedCompletion,
    ]);
    expect(e.rescaled).toBe(false);
    const sum = e.components.reduce((s, c) => s + (c.points ?? 0), 0) - e.penalty.points;
    expect(Math.round(Math.min(100, Math.max(0, sum)))).toBe(result.score);
    expect(e.penalty).toEqual({ points: 8, cap: 40, perBlocker: { high: 12, medium: 6, low: 2 } });
  });

  it("shows an unknown component as unknown, not zero, and rescales the rest to 100", () => {
    const e = explainHealth(computeHealth({ ...base, draftOutputs: undefined, verifiedOutputs: undefined }));
    const reviewed = e.components.find((c) => c.key === "reviewedCompletion");
    expect(reviewed?.points).toBeNull();
    expect(reviewed?.effectiveWeight).toBeNull();
    expect(reviewed?.maxPoints).toBeNull();
    expect(e.rescaled).toBe(true);
    const effective = e.components.reduce((s, c) => s + (c.effectiveWeight ?? 0), 0);
    expect(effective).toBeCloseTo(1);
    expect(e.notes[0]).toMatch(/Reviewed output was not captured/);
  });

  it("reports a change as a number and never attributes it to a component", () => {
    const e = explainHealth(computeHealth(base), 70);
    expect(e.change?.previous).toBe(70);
    expect(e.change?.delta).toBe(e.change!.current - 70);
    expect(CHANGE_NOTE).toMatch(/does not say which component moved/);
    expect(explainHealth(computeHealth(base), null).change).toBeNull();
  });

  it("states that the score does not drive expansion", () => {
    expect(explainHealth(computeHealth(base)).notes).toContain(EXPANSION_NOTE);
  });

  it("lists contiguous bands from 0 to 100 at the formula's cut-offs", () => {
    expect(HEALTH_BANDS.map((b) => [b.from, b.to])).toEqual([[0, 39], [40, 59], [60, 79], [80, 100]]);
    expect(HEALTH_BANDS.map((b) => b.from).slice(1)).toEqual(Object.values(BAND_FLOORS));
  });

  it("matches the band computeHealth assigns", () => {
    const result = computeHealth(base);
    const row = HEALTH_BANDS.find((b) => result.score >= b.from && result.score <= b.to);
    expect(row?.band).toBe(result.band);
  });
});
