import { describe, expect, it } from "vitest";
import { getAccounts, getFeedback } from "./data";
import { DEMO_AS_OF } from "./engagement/as-of";
import { getEvidenceStore } from "./evidence/data";
import { viewChanges } from "./evidence/loop";
import { formatCount, summarizeThemes } from "./feedback-themes";
import { personaSchema, type FeedbackItem } from "./schema";

const views = viewChanges(getEvidenceStore(), DEMO_AS_OF);
const denominators = { accounts: getAccounts().length, personaRoles: personaSchema.shape.role.options.length };
const themes = summarizeThemes(getFeedback(), views, denominators);
const theme = (name: string) => themes.find((t) => t.theme === name)!;

const item = (over: Partial<FeedbackItem>): FeedbackItem => ({
  id: "fb-x",
  origin: { kind: "synthetic_fixture" },
  accountId: "acct-001",
  sourcePersona: "Associate",
  text: "Synthetic.",
  theme: "T",
  productArea: "review",
  severity: "low",
  status: "new",
  ...over,
});

describe("summarizeThemes", () => {
  it("covers every feedback item exactly once", () => {
    const ids = themes.flatMap((t) => t.itemIds);
    expect(ids.sort()).toEqual(getFeedback().map((f) => f.id).sort());
  });

  it("counts accounts and persona roles against their denominators", () => {
    const analytics = theme("Adoption analytics");
    expect(analytics.accountIds).toEqual(["acct-001", "acct-004"]);
    expect(formatCount(analytics.accounts, "accounts")).toBe("2 of 5 accounts");
    expect(analytics.personaRoles).toEqual(["Innovation Lead"]);
    expect(formatCount(analytics.personas, "persona roles")).toBe("1 of 5 persona roles");
  });

  it("counts an account once however many of its users raised the theme", () => {
    const [t] = summarizeThemes(
      [item({ id: "a" }), item({ id: "b", sourcePersona: "Partner" })],
      [],
      denominators,
    );
    expect(t.accounts.count).toBe(1);
    expect(t.personas.count).toBe(2);
  });

  it("lists themes by name, never by how many raised them", () => {
    const names = themes.map((t) => t.theme);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    const unranked = summarizeThemes(
      [item({ id: "1", theme: "Zeta", accountId: "acct-001" }), item({ id: "2", theme: "Zeta", accountId: "acct-002" }), item({ id: "3", theme: "Alpha" })],
      [],
      denominators,
    );
    expect(unranked.map((t) => t.theme)).toEqual(["Alpha", "Zeta"]);
  });

  it("reads delivery only from change records that cite the theme's items", () => {
    const analytics = theme("Adoption analytics");
    expect(analytics.changes.map((c) => [c.changeId, c.deliveryStatus])).toEqual([["chg-005", "deferred"]]);
    expect(analytics.itemsWithoutChange).toEqual([]);
  });

  it("gives a theme no change record covers no delivery status", () => {
    const localization = theme("Localization");
    expect(localization.changes).toEqual([]);
    expect(localization.itemsWithoutChange).toEqual(localization.itemIds);
  });

  it("names the items a linked change record does not cover", () => {
    const trust = theme("Trust and grounding");
    expect(trust.changes.map((c) => c.changeId)).toEqual(["chg-009"]);
    expect(trust.itemsWithoutChange).toEqual(["fb-012"]);
  });

  it("keeps routing as triage counts, apart from delivery", () => {
    const analytics = theme("Adoption analytics");
    expect(analytics.routing).toEqual({ new: 0, triaged: 0, shared_with_product: 2 });
    // Every item is shared with Product, yet the only change record is deferred.
    expect(analytics.changes.every((c) => c.deliveryStatus !== "released")).toBe(true);
  });

  it("does not match theme names against the problems' own theme labels", () => {
    // A problem citing no item ids never links, even if its label equals a theme name.
    const [t] = summarizeThemes([item({ theme: "Hard to onboard associates" })], views, denominators);
    expect(t.changes).toEqual([]);
  });

  it("reports the highest severity raised", () => {
    expect(theme("Trust and grounding").highestSeverity).toBe("high");
  });

  it("folds the generated citation items into one citation theme", () => {
    const citation = theme("Citation and context handling");
    expect(citation.itemIds).toEqual(["fb-001", "fb-gen-20260623_003235-1", "fb-gen-20260623_003235-2"]);
    expect(formatCount(citation.accounts, "accounts")).toBe("2 of 5 accounts");
    expect(citation.changes.map((c) => c.changeId)).toEqual(["chg-001"]);
    // chg-001 cites fb-001 only, so the two folded-in items still have no delivery status.
    expect(citation.itemsWithoutChange).toEqual(["fb-gen-20260623_003235-1", "fb-gen-20260623_003235-2"]);
    expect(themes.some((t) => /hallucination/i.test(t.theme))).toBe(false);
  });
});
