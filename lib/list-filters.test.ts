import { describe, expect, it } from "vitest";
import { getAccounts, getBlockers, getFeedback } from "./data";
import { getInterventions } from "./engagement/data";
import { interventionStage } from "./engagement/interventions";
import {
  LIST_ROUTES,
  describeFilter,
  filterFields,
  listHref,
  matchesBlocker,
  matchesFeedback,
  matchesIntervention,
  parseListFilter,
} from "./list-filters";

const accounts = getAccounts();

describe("parseListFilter", () => {
  it("accepts known values and ignores parameters that are not filters", () => {
    const parsed = parseListFilter("/blockers", { severity: "high", asOf: "2026-07-31" }, accounts);
    expect(parsed).toEqual({ values: { severity: "high" }, rejected: [] });
  });

  it("reports an unknown value instead of filtering to an empty list", () => {
    const parsed = parseListFilter("/feedback", { routing: "shipped", area: "review" }, accounts);
    expect(parsed.values).toEqual({ area: "review" });
    expect(parsed.rejected).toEqual([{ key: "routing", value: "shipped" }]);
  });

  it("rejects an account id the data does not hold", () => {
    expect(parseListFilter("/interventions", { account: "acct-999" }, accounts).rejected).toHaveLength(1);
  });

  it("takes the first of repeated values and skips empty ones", () => {
    expect(parseListFilter("/blockers", { severity: ["low", "high"], category: "" }, accounts).values).toEqual({
      severity: "low",
    });
  });

  it("offers no owner, specialist or sort filter on any list", () => {
    for (const route of LIST_ROUTES) {
      const keys = filterFields(route, accounts).map((f) => f.key);
      expect(keys.some((k) => /owner|specialist|lead|sort|order|rank/i.test(k))).toBe(false);
    }
  });
});

describe("matchers", () => {
  it("filter blockers by severity, category and account together", () => {
    const f = { severity: "high", category: "trust_in_output" };
    const hits = getBlockers().filter((b) => matchesBlocker(b, f));
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((b) => b.severity === "high" && b.category === "trust_in_output")).toBe(true);
  });

  it("filter feedback by routing status", () => {
    const hits = getFeedback().filter((i) => matchesFeedback(i, { routing: "new" }));
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((i) => i.status === "new")).toBe(true);
  });

  it("filter interventions by derived stage", () => {
    const hits = getInterventions().filter((i) => matchesIntervention(i, interventionStage(i), { stage: "completed" }));
    expect(hits.every((i) => interventionStage(i) === "completed")).toBe(true);
  });

  it("match everything when nothing is filtered", () => {
    expect(getBlockers().every((b) => matchesBlocker(b, {}))).toBe(true);
  });
});

describe("listHref and describeFilter", () => {
  it("writes keys in a fixed order so equal filters give equal links", () => {
    expect(listHref("/feedback", { severity: "high", area: "review" })).toBe("/feedback?area=review&severity=high");
    expect(listHref("/feedback", {})).toBe("/feedback");
  });

  it("names the active filters in words", () => {
    const fields = filterFields("/feedback", accounts);
    expect(describeFilter(fields, { routing: "new" })).toBe("Filtered by Routing: New.");
    expect(describeFilter(fields, {})).toBe("No filter: showing everything.");
  });
});
