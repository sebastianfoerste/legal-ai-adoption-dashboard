import { describe, it, expect } from "vitest";
import { portfolioSummary } from "./portfolio";

describe("portfolioSummary", () => {
  it("counts accounts by band and totals high-severity open blockers", () => {
    const s = portfolioSummary();
    const bandTotal =
      s.byBand.at_risk + s.byBand.needs_attention + s.byBand.steady + s.byBand.healthy;
    expect(bandTotal).toBe(s.total);
    expect(s.total).toBeGreaterThanOrEqual(3);
    expect(s.openHighSeverityBlockers).toBeGreaterThanOrEqual(0);
  });

  it("counts one review recommendation per account", () => {
    const s = portfolioSummary();
    const { expand, adjust, pause } = s.byRecommendation;
    expect(expand + s.byRecommendation.continue + adjust + pause).toBe(s.total);
  });
});
