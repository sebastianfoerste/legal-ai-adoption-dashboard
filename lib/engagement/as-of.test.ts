import { describe, expect, it } from "vitest";
import { DEMO_AS_OF, REVIEW_AS_OF, isIsoDate, resolveAsOf } from "./as-of";
import { getInterventions } from "./data";
import { summarizeInterventions } from "./interventions";

describe("as-of date", () => {
  it("defaults to the demo fixture date", () => {
    expect(resolveAsOf(undefined, undefined)).toEqual({
      date: DEMO_AS_OF,
      source: "demo_default",
      rejected: null,
    });
    expect(REVIEW_AS_OF).toBe("2026-07-31");
  });

  it("prefers a valid query value over the environment", () => {
    expect(resolveAsOf("2026-09-01", "2026-08-15")).toMatchObject({ date: "2026-09-01", source: "query" });
    expect(resolveAsOf(["2026-09-02", "2026-09-03"], undefined).date).toBe("2026-09-02");
    expect(resolveAsOf(null, "2026-08-15")).toMatchObject({ date: "2026-08-15", source: "environment" });
  });

  it("ignores a malformed query value and reports it", () => {
    expect(resolveAsOf("yesterday", undefined)).toEqual({
      date: DEMO_AS_OF,
      source: "demo_default",
      rejected: "yesterday",
    });
    expect(resolveAsOf("2026-02-30", undefined).rejected).toBe("2026-02-30");
  });

  it("refuses a malformed environment value", () => {
    expect(() => resolveAsOf(null, "31.07.2026")).toThrow("ADOPTION_AS_OF must be an ISO date");
  });

  it("accepts only real calendar dates", () => {
    expect(isIsoDate("2026-07-31")).toBe(true);
    expect(isIsoDate("2026-7-31")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
  });

  it("changes what is overdue, with the same fixtures", () => {
    const interventions = getInterventions();
    const early = summarizeInterventions(interventions, "2026-01-01").followUpsOverdue;
    const late = summarizeInterventions(interventions, "2027-01-01").followUpsOverdue;
    expect(early).toBe(0);
    expect(late).toBeGreaterThan(summarizeInterventions(interventions, DEMO_AS_OF).followUpsOverdue);
  });
});
