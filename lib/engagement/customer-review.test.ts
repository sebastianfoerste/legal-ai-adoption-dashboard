import { describe, expect, it } from "vitest";
import { GET as downloadReport } from "../../app/insights/report/route";
import { getAccounts } from "../data";
import { buildCustomerReview, type CustomerReview } from "./customer-review";

const review = (accountId: string): CustomerReview => {
  const built = buildCustomerReview(accountId);
  if (!built) throw new Error(`no review for ${accountId}`);
  return built;
};

describe("customer review report", () => {
  it("returns null for an unknown account", () => {
    expect(buildCustomerReview("acct-999")).toBeNull();
  });

  it("contains the seven sections in order", () => {
    const headings = review("acct-005")
      .markdown.split("\n")
      .filter((line) => line.startsWith("## "));
    expect(headings).toEqual([
      "## 1. Objectives",
      "## 2. Adoption trends",
      "## 3. Intervention outcomes",
      "## 4. Quality evidence",
      "## 5. Unresolved problems",
      "## 6. Recommendation: EXPAND",
      "## 7. Owners and next review dates",
    ]);
  });

  it("labels every account's review as synthetic at the top and at the bottom", () => {
    for (const account of getAccounts()) {
      const { markdown, synthetic, externalActionAllowed } = review(account.id);
      const lines = markdown.trim().split("\n");
      expect(lines[0]).toMatch(/^# Synthetic customer review: /);
      expect(lines[2]).toContain("SYNTHETIC SCENARIO");
      expect(lines.at(-1)).toContain("SYNTHETIC SCENARIO");
      expect(lines.at(-1)).toContain("Draft for account-owner review");
      expect(synthetic).toBe(true);
      expect(externalActionAllowed).toBe(false);
    }
  });

  it("evaluates objectives from the measurements", () => {
    expect(review("acct-005").objectives.map((o) => o.status)).toEqual(["met", "met", "met"]);
    const b = review("acct-004").objectives;
    expect(b.map((o) => o.status)).toEqual(["not_met", "not_met", "not_met"]);
    expect(b[0].observed).toContain("45 of 141 (32%)");
  });

  it("reports scenario A: improvement observed, causation assumed, bounded expansion", () => {
    const a = review("acct-005");
    expect(a.expansion.recommendation).toBe("expand");
    expect(a.markdown).toContain("**Assumption, not a finding**");
    expect(a.markdown).toContain("Financial illustration (assumption-based):** about EUR 46,600 per year");
    expect(a.markdown).toContain("[small cohort]");
    expect(a.markdown).toContain("(incomplete)");
    expect(a.markdown).toContain("| Unknown |"); // completions in the first period
    expect(a.evidenceGaps).toContain("Intervention int-002 is delivered but not evaluated.");
  });

  it("reports scenario B: no expansion, with the unresolved problems named", () => {
    const b = review("acct-004");
    expect(b.expansion.recommendation).toBe("adjust");
    expect(b.markdown).toContain("## 6. Recommendation: ADJUST");
    expect(b.markdown).toContain("**Financial illustration:** not calculated.");
    expect(b.unresolved.some((item) => item.includes("int-004 did not achieve"))).toBe(true);
    expect(b.unresolved.some((item) => item.includes("com-002 is 7 days overdue"))).toBe(true);
    expect(b.unresolved.some((item) => item.includes("esc-002"))).toBe(true);
  });

  it("names an owner and a date for every open item", () => {
    for (const account of getAccounts()) {
      const { owners, nextReviewDate } = review(account.id);
      expect(owners[0]).toMatchObject({ item: "Next customer review", date: nextReviewDate });
      expect(owners.every((row) => row.owner.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(row.date))).toBe(true);
    }
    expect(review("acct-005").owners.map((row) => row.owner)).toContain("Specialist C");
  });

  it("states unknown evidence for accounts without measurements", () => {
    const meridian = review("acct-001");
    expect(meridian.expansion.recommendation).toBe("continue");
    expect(meridian.markdown).toContain("Unknown: no period-by-period adoption series is recorded.");
    expect(meridian.markdown).toContain("Unknown: no measurement of time to an acceptable result is recorded.");
    expect(meridian.evidenceGaps).toContain("No measurable objectives are agreed with the customer.");
  });

  it("describes renewal as a decision aid", () => {
    expect(review("acct-003").markdown).toContain("does not predict the renewal outcome");
  });
});

describe("report route", () => {
  it("serves a customer review as a synthetic Markdown download", async () => {
    const response = downloadReport(new Request("http://localhost/insights/report?account=acct-005"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("content-disposition")).toContain(
      "synthetic-customer-review-acct-005.md",
    );
    expect(await response.text()).toContain("# Synthetic customer review: Stadtwerke Musterstadt");
  });

  it("returns 404 for an unknown account", async () => {
    const response = downloadReport(new Request("http://localhost/insights/report?account=nope"));
    expect(response.status).toBe(404);
  });

  it("keeps serving the portfolio report when no account is given", async () => {
    const text = await downloadReport(new Request("http://localhost/insights/report")).text();
    expect(text).toContain("# Synthetic Legal AI Adoption Insights Report");
    expect(text).toContain("## Customer review recommendations");
  });
});

describe("product feedback and evidence in the customer review", () => {
  it("shows status, confidence, owner, missing observations and the next decision", () => {
    const meridian = review("acct-001");
    expect(meridian.productEvidence.map((view) => view.change.id)).toEqual(["chg-001", "chg-005"]);
    expect(meridian.markdown).toContain("### Product feedback and evidence");
    expect(meridian.markdown).toContain(
      "**chg-005 Self-serve usage export.** Decision: deferred, confidence medium. Delivery: deferred. Outcome: no outcome: not released.",
    );
    expect(meridian.markdown).toContain("  - Next decision: Revisit once the audit log is released.");
    expect(meridian.generatedFrom).toContain("data/evidence-loop.json");
  });

  it("does not present a release without a follow-up as a result", () => {
    const ardent = review("acct-003");
    expect(ardent.markdown).toContain("Delivery: released. Outcome: awaiting evidence.");
    expect(ardent.markdown).toContain("Follow-up observation overdue by 3 day(s)");
    // Earlier as-of date: the follow-up is not yet due, and it is still not a result.
    const earlier = buildCustomerReview("acct-003", "2026-07-20");
    expect(earlier?.markdown).toContain("Follow-up observation due 28 Jul 2026.");
  });

  it("keeps product evidence out of the expansion decision", () => {
    const musterstadt = review("acct-005");
    expect(musterstadt.productEvidence.map((view) => view.deliveryStatus)).toEqual(["not_started", "rejected"]);
    expect(musterstadt.expansion.recommendation).toBe("expand");
    expect(musterstadt.expansion.criteria.map((c) => c.key)).not.toContain("product_evidence");
  });
});
