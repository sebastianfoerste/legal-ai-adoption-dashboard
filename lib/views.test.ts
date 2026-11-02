import { describe, expect, it } from "vitest";
import viewsJson from "../data/views.json";
import { getSavedViews, validateViews } from "./views";

const base = { id: "v", label: "V", description: "D", synthetic: true as const };

describe("saved views", () => {
  it("loads every committed view with a link to its page", () => {
    const views = getSavedViews();
    expect(views.length).toBe(viewsJson.length);
    for (const view of views) expect(view.href.startsWith(view.path)).toBe(true);
    expect(getSavedViews("/feedback").every((v) => v.path === "/feedback")).toBe(true);
  });

  it("refuses a filter key or value the page does not accept", () => {
    expect(() => validateViews([{ ...base, path: "/blockers", query: { routing: "new" } }])).toThrow(/not a filter/);
    expect(() => validateViews([{ ...base, path: "/blockers", query: { severity: "urgent" } }])).toThrow(/not a filter/);
    expect(() => validateViews([{ ...base, path: "/", query: { band: "great" } }])).toThrow(/not a band/);
  });

  it("refuses a view that ranks or assigns people", () => {
    expect(() => validateViews([{ ...base, path: "/interventions", query: { sort: "workload" } }])).toThrow(/ranks or assigns/);
    expect(() => validateViews([{ ...base, path: "/interventions", query: { owner: "spec-a" } }])).toThrow(/ranks or assigns/);
  });

  it("refuses a health-band view presented as an expansion list", () => {
    expect(() =>
      validateViews([{ ...base, label: "Expansion candidates", path: "/", query: { band: "healthy" } }]),
    ).toThrow(/expansion or renewal/);
  });

  it("refuses duplicate ids and records not marked synthetic", () => {
    const view = { ...base, path: "/feedback", query: { routing: "new" } };
    expect(() => validateViews([view, view])).toThrow(/duplicate/);
    expect(() => validateViews([{ ...view, synthetic: false }])).toThrow();
  });
});
