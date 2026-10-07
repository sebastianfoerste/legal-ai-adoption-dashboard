import { describe, expect, it } from "vitest";
import {
  formatRate,
  latestCompletePeriod,
  rate,
  seriesMetrics,
  sustainedUse,
} from "./adoption-trend";
import { getAdoptionSeries } from "./data";
import type { AdoptionSeries } from "./schema";

const AS_OF = "2026-07-31";
const series = (id: string): AdoptionSeries => {
  const found = getAdoptionSeries().find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing fixture ${id}`);
  return found;
};
const aurich = () => seriesMetrics(series("series-aurich-supplier-review"), AS_OF);
const brightmoor = () => seriesMetrics(series("series-brightmoor-spa-draft"), AS_OF);

describe("rate", () => {
  it("returns unknown instead of zero when a side is missing", () => {
    expect(rate(null, 8).value).toBeNull();
    expect(rate(5, null).value).toBeNull();
    expect(formatRate(rate(null, 8))).toBe("Unknown");
  });

  it("returns unknown for a zero denominator and a real zero for a zero numerator", () => {
    expect(rate(0, 0).value).toBeNull();
    expect(rate(0, 8).value).toBe(0);
    expect(formatRate(rate(0, 8))).toBe("0 of 8 (0%)");
  });

  it("carries the small-cohort caveat below ten in the denominator", () => {
    expect(rate(5, 8).caveats).toEqual(["small_cohort"]);
    expect(rate(15, 20).caveats).toEqual([]);
    expect(rate(5, 10).caveats).toEqual([]);
  });

  it("carries the incomplete-period caveat only for known values", () => {
    expect(rate(15, 20, false).caveats).toEqual(["incomplete_period"]);
    expect(rate(null, 20, false).caveats).toEqual([]);
  });
});

describe("denominators", () => {
  it("separates licensed, eligible and active users", () => {
    const stalled = aurich().periods[2];
    expect(stalled.licensedUsers).toBe(10);
    expect(stalled.eligibleUsers).toBe(8);
    expect(stalled.activeUsers).toBe(3);
    expect(stalled.licenceUtilisation).toMatchObject({ numerator: 3, denominator: 10, value: 0.3 });
    expect(stalled.activation).toMatchObject({ numerator: 3, denominator: 8, value: 0.375 });
  });

  it("uses eligible users, not active users, as the repeat-use denominator", () => {
    const stalled = aurich().periods[2];
    // 1 repeat user of 3 active would read 33%; of 8 eligible it is 13%.
    expect(stalled.repeatUse).toMatchObject({ numerator: 1, denominator: 8, value: 0.125 });
  });

  it("uses started workflows as the completion denominator", () => {
    const latest = latestCompletePeriod(brightmoor());
    expect(latest?.completion).toMatchObject({ numerator: 45, denominator: 141 });
    expect(latest?.completion.value).toBeCloseTo(0.319, 3);
  });

  it("measures drop-off against the training cohort", () => {
    const [onboarding, , stalled] = aurich().periods;
    expect(onboarding.dropOffAfterTraining).toMatchObject({ numerator: 1, denominator: 8 });
    expect(stalled.dropOffAfterTraining).toMatchObject({ numerator: 5, denominator: 8, value: 0.625 });
  });

  it("reports no drop-off for a series without a training cohort", () => {
    const noCohort = seriesMetrics({ ...series("series-aurich-supplier-review"), trainingCohort: null }, AS_OF);
    expect(noCohort.periods.every((period) => period.dropOffAfterTraining.value === null)).toBe(true);
  });
});

describe("missing data and reporting periods", () => {
  it("shows uncaptured counts as unknown", () => {
    expect(aurich().periods[0].completion.value).toBeNull();
    const gap = brightmoor().periods[2];
    expect(gap.repeatUse.value).toBeNull();
    expect(gap.dropOffAfterTraining.value).toBeNull();
    expect(gap.activation.value).toBe(0.9);
    expect(brightmoor().unknownCells).toBe(2);
  });

  it("marks the period containing the as-of date as incomplete", () => {
    const periods = aurich().periods;
    const current = periods.at(-1);
    expect(current?.complete).toBe(false);
    expect(current?.repeatUse.caveats).toContain("incomplete_period");
    expect(periods.slice(0, -1).every((period) => period.complete)).toBe(true);
    expect(latestCompletePeriod(aurich())?.end).toBe("2026-07-19");
  });

  it("treats a period as complete only after its last day", () => {
    const onLastDay = seriesMetrics(series("series-aurich-supplier-review"), "2026-07-19");
    expect(onLastDay.periods.at(-1)?.end).toBe("2026-07-19");
    expect(onLastDay.periods.at(-1)?.complete).toBe(false);
  });

  it("leaves out periods that have not begun", () => {
    expect(seriesMetrics(series("series-aurich-supplier-review"), "2026-03-15").periods).toHaveLength(3);
  });
});

describe("sustained use", () => {
  it("is met after three complete periods at or above half of eligible users", () => {
    const result = sustainedUse(aurich());
    expect(result.status).toBe("met");
    expect(result.caveats).toContain("small_cohort");
    expect(result.detail).not.toContain("16 Aug"); // the incomplete period is not counted
  });

  it("is unknown, not met, when a period in the window was not captured", () => {
    const result = sustainedUse(brightmoor());
    expect(result.status).toBe("unknown");
    expect(result.missing).toHaveLength(1);
  });

  it("is not met when a known period is below the threshold, even with gaps elsewhere", () => {
    const stalled = sustainedUse(seriesMetrics(series("series-aurich-supplier-review"), "2026-04-27"));
    expect(stalled.status).toBe("not_met");
  });

  it("is unknown with fewer than three complete periods", () => {
    const early = sustainedUse(seriesMetrics(series("series-brightmoor-spa-draft"), "2026-04-30"));
    expect(early.status).toBe("unknown");
    expect(early.missing[0]).toContain("further complete reporting period");
  });
});

describe("cohort changes", () => {
  it("flags a rate whose eligible group differs from the previous period", () => {
    const source = series("series-brightmoor-spa-draft");
    const changed: AdoptionSeries = {
      ...source,
      periods: source.periods.map((period, index) =>
        index === 3 ? { ...period, eligibleUsers: (period.eligibleUsers as number) + 6 } : period,
      ),
    };
    const { periods } = seriesMetrics(changed, AS_OF);
    expect(periods[2].activation.caveats).not.toContain("cohort_changed");
    expect(periods[3].activation.caveats).toContain("cohort_changed");
    expect(periods[3].repeatUse.caveats).toContain("cohort_changed");
    expect(periods[3].completion.caveats).not.toContain("cohort_changed");
    // The next period differs from the changed one again, so it is flagged as well.
    expect(periods[4].activation.caveats).toContain("cohort_changed");
  });

  it("leaves the unchanged fixtures unflagged", () => {
    const all = [...aurich().periods, ...brightmoor().periods].flatMap((p) => p.activation.caveats);
    expect(all).not.toContain("cohort_changed");
  });
});
