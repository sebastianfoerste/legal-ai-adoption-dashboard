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
    expect(s.expansionReady).toBeGreaterThanOrEqual(0);
  });
});
