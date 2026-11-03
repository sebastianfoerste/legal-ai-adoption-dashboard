import { describe, expect, it } from "vitest";
import { getAccounts, getWorkflowUsage } from "./data";
import {
  LAG_NOT_CAPTURED,
  LAG_SENTENCE,
  PANEL_COUNTS,
  RECORDED_LAG_DAYS,
  commonWeeks,
  countWindow,
  describeCounts,
} from "./count-windows";
import { accountSchema } from "./schema";

const ctx = { asOf: "2026-07-31", weeks: 5 };

describe("the windows match what the data holds", () => {
  it("reads active users as the latest week of the weekly series", () => {
    for (const a of getAccounts()) {
      expect(a.activeUsers).toBe(a.weeklyActiveUsers.at(-1));
      for (const g of a.practiceGroups) expect(g.activeUsers).toBe(g.weeklyActiveUsers.at(-1));
    }
  });

  it("reads workflow runs as the total of the weekly runs", () => {
    for (const w of getWorkflowUsage()) {
      expect(w.runs).toBe(w.weeklyRuns.reduce((s, n) => s + n, 0));
    }
  });

  it("reads persona adoption as the last 30 days, as the schema defines it", () => {
    expect(accountSchema.shape.personas.element.shape.adoptionRate.description).toMatch(/last 30 days/);
  });

  it("records no lag for any count", () => {
    expect(RECORDED_LAG_DAYS).toBeNull();
    expect(LAG_SENTENCE).toBe("Lag not captured.");
  });
});

describe("countWindow", () => {
  it("names the week, the series and the total with the as-of date", () => {
    expect(countWindow("latest_week", ctx).window).toBe("week ending 31 Jul 2026");
    expect(countWindow("weekly_series", ctx).window).toBe("5 weeks ending 31 Jul 2026, oldest first");
    expect(countWindow("series_total", ctx).window).toBe("total over the 5 weeks ending 31 Jul 2026");
    expect(countWindow("trailing_30_days", ctx).window).toBe("30 days to 31 Jul 2026");
    expect(countWindow("first_week", ctx).window).toBe("first week of the 5 weeks ending 31 Jul 2026");
  });

  it("states no window rather than guess one", () => {
    expect(countWindow("not_dated", ctx).window).toBeNull();
    expect(countWindow("weekly_series", { ...ctx, weeks: null }).window).toBeNull();
    expect(countWindow("series_total", { ...ctx, weeks: null }).window).toBeNull();
    expect(countWindow("first_week", { ...ctx, weeks: null }).window).toBeNull();
  });

  it("never reports a lag of 0 when none is recorded", () => {
    for (const items of Object.values(PANEL_COUNTS)) {
      for (const item of items) expect(countWindow(item.source, ctx).lagDays).toBeNull();
    }
  });
});

describe("describeCounts", () => {
  it("joins counts that share a window and states the lag once", () => {
    expect(describeCounts(PANEL_COUNTS.cockpit, ctx)).toBe(
      "Active users: week ending 31 Jul 2026. Workflow runs: total over the 5 weeks ending 31 Jul 2026. " +
        "Review tables, Draft outputs, Verified outputs and Blocked outputs: window not captured. " +
        "Lag not captured for any of these counts.",
    );
  });

  it("gives every panel a window and a lag statement", () => {
    for (const items of Object.values(PANEL_COUNTS)) {
      const text = describeCounts(items, ctx);
      for (const item of items) expect(text).toContain(item.label);
      expect(text.toLowerCase()).toContain(LAG_NOT_CAPTURED);
      expect(text).not.toMatch(/lag 0/);
    }
  });

  it("speaks of one count in the singular", () => {
    expect(describeCounts([{ label: "Period counts", source: "reporting_period" }], ctx)).toBe(
      "Period counts: the dates of each reporting period. Lag not captured for this count.",
    );
  });
});

describe("commonWeeks", () => {
  it("returns the shared length, or null when the series differ", () => {
    expect(commonWeeks([[1, 2, 3], [4, 5, 6]])).toBe(3);
    expect(commonWeeks([[1, 2], [4, 5, 6]])).toBeNull();
    expect(commonWeeks(getWorkflowUsage().map((w) => w.weeklyRuns))).toBe(5);
  });
});
