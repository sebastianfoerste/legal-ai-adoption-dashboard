import { describe, expect, it } from "vitest";
import { accountHealth } from "../aggregate";
import { getAccounts } from "../data";
import type { Blocker } from "../schema";
import { getEngagement } from "./data";
import {
  accountExpansion,
  assessExpansion,
  decideRecommendation,
  type CriterionKey,
  type CriterionStatus,
  type ExpansionInput,
} from "./expansion";
import { accountRenewalAid } from "./renewal";
import type { Engagement } from "./schema";

const KEYS: CriterionKey[] = [
  "demonstrated_workflow_value",
  "sustained_use",
  "unresolved_blockers",
  "customer_demand",
  "sponsor_support",
  "delivery_capacity",
];
const withStatuses = (overrides: Partial<Record<CriterionKey, CriterionStatus>>) =>
  KEYS.map((key) => ({ key, status: overrides[key] ?? ("met" as CriterionStatus) }));
const statusOf = (accountId: string) =>
  Object.fromEntries(accountExpansion(accountId).criteria.map((c) => [c.key, c.status]));

describe("decideRecommendation", () => {
  it("expands only when all six criteria are met", () => {
    expect(decideRecommendation(withStatuses({}))).toBe("expand");
  });

  it("never expands on unknown evidence", () => {
    for (const key of KEYS) {
      expect(decideRecommendation(withStatuses({ [key]: "unknown" })), key).toBe("continue");
    }
  });

  it("never expands when any criterion is not met", () => {
    for (const key of KEYS) {
      expect(decideRecommendation(withStatuses({ [key]: "not_met" })), key).not.toBe("expand");
    }
  });

  it("pauses when sponsor support is not met, whatever else holds", () => {
    expect(decideRecommendation(withStatuses({ sponsor_support: "not_met" }))).toBe("pause");
    expect(
      decideRecommendation(
        withStatuses({ sponsor_support: "not_met", demonstrated_workflow_value: "not_met" }),
      ),
    ).toBe("pause");
  });

  it("adjusts when value, sustained use or the blocker criterion is not met", () => {
    expect(decideRecommendation(withStatuses({ demonstrated_workflow_value: "not_met" }))).toBe("adjust");
    expect(decideRecommendation(withStatuses({ sustained_use: "not_met" }))).toBe("adjust");
    expect(decideRecommendation(withStatuses({ unresolved_blockers: "not_met" }))).toBe("adjust");
  });

  it("continues when only demand or delivery capacity stands in the way", () => {
    expect(decideRecommendation(withStatuses({ customer_demand: "not_met" }))).toBe("continue");
    expect(decideRecommendation(withStatuses({ delivery_capacity: "not_met" }))).toBe("continue");
  });
});

describe("scenario A: expansion supported", () => {
  const assessment = accountExpansion("acct-005");

  it("recommends a bounded expansion with all six criteria met", () => {
    expect(assessment.recommendation).toBe("expand");
    expect(assessment.counts).toEqual({ met: 6, not_met: 0, unknown: 0 });
    expect(assessment.proposedScope).toContain("one-period pilot");
    expect(assessment.humanDecisionRequired).toBe(true);
  });

  it("still carries the caveats: small cohort, open low blocker, causation assumed", () => {
    const caveats = assessment.caveats.join(" ");
    expect(caveats).toContain("Small cohort");
    expect(caveats).toContain("blk-010");
    expect(caveats).toContain("assumption, not a finding");
  });

  it("is recommended although the health band is only steady", () => {
    expect(accountHealth("acct-005").band).toBe("steady");
  });
});

describe("scenario B: expansion inappropriate", () => {
  const assessment = accountExpansion("acct-004");

  it("recommends adjust for a healthy, heavily used account that asks for more seats", () => {
    expect(accountHealth("acct-004").band).toBe("healthy");
    expect(assessment.recommendation).toBe("adjust");
    expect(statusOf("acct-004")).toEqual({
      demonstrated_workflow_value: "not_met",
      sustained_use: "unknown",
      unresolved_blockers: "not_met",
      customer_demand: "met",
      sponsor_support: "unknown",
      delivery_capacity: "not_met",
    });
  });

  it("lists the supporting and the missing evidence", () => {
    expect(assessment.supportingEvidence).toHaveLength(1);
    expect(assessment.supportingEvidence[0]).toContain("Customer demand");
    expect(assessment.missingEvidence).toEqual([
      "Sustained use: Repeat users for 27 Apr 2026 to 24 May 2026",
      "Sponsor support: Confirmation of the programme goals by the new sponsor",
    ]);
    expect(assessment.caveats.join(" ")).toContain("not evidence that the workflow delivers value");
  });
});

describe("portfolio recommendations", () => {
  it("covers all four outcomes across the synthetic accounts", () => {
    const byAccount = Object.fromEntries(
      getAccounts().map((account) => [account.id, accountExpansion(account.id).recommendation]),
    );
    expect(byAccount).toEqual({
      "acct-001": "continue",
      "acct-002": "adjust",
      "acct-003": "pause",
      "acct-004": "adjust",
      "acct-005": "expand",
    });
  });

  it("reports missing measurements as unknown, not as failure", () => {
    expect(statusOf("acct-001")).toMatchObject({
      demonstrated_workflow_value: "unknown",
      sustained_use: "unknown",
      customer_demand: "unknown",
      delivery_capacity: "unknown",
    });
    expect(accountExpansion("acct-001").missingEvidence.length).toBeGreaterThanOrEqual(4);
  });
});

describe("criteria", () => {
  const account = getAccounts().find((a) => a.id === "acct-005")!;
  const engagement = getEngagement("acct-005") as Engagement;
  const base: ExpansionInput = {
    account,
    engagement,
    blockers: [],
    value: null,
    sustained: null,
    capacity: { status: "met", detail: "Hours available.", missing: [] },
    feedback: { sharedWithProduct: 5, total: 5 },
  };
  const blocker = (severity: Blocker["severity"], group: string): Blocker => ({
    id: `blk-${severity}-${group}`,
    accountId: account.id,
    category: "workflow_fit",
    severity,
    status: "open",
    affectedGroups: [group],
    reEngagementAction: "",
    workshopFollowUp: "",
  });
  const blockerStatus = (blockers: Blocker[]) =>
    assessExpansion({ ...base, blockers }).criteria.find((c) => c.key === "unresolved_blockers")?.status;

  it("does not count feedback routed to Product as customer value", () => {
    const allRouted = assessExpansion(base);
    const noneRouted = assessExpansion({ ...base, feedback: { sharedWithProduct: 0, total: 5 } });
    expect(allRouted.recommendation).toBe(noneRouted.recommendation);
    expect(allRouted.criteria).toEqual(noneRouted.criteria);
    expect(allRouted.criteria.find((c) => c.key === "demonstrated_workflow_value")?.status).toBe("unknown");
    expect(allRouted.feedbackNote).toContain("not counted as customer value");
  });

  it("blocks on any high-severity blocker and on medium blockers in the target groups", () => {
    expect(blockerStatus([])).toBe("met");
    expect(blockerStatus([blocker("low", "Employment")])).toBe("met");
    expect(blockerStatus([blocker("medium", "Corporate")])).toBe("met"); // not a target group
    expect(blockerStatus([blocker("medium", "Employment")])).toBe("not_met");
    expect(blockerStatus([blocker("high", "Litigation")])).toBe("not_met");
    expect(blockerStatus([{ ...blocker("high", "Employment"), status: "resolved" }])).toBe("met");
  });

  it("maps sponsor and demand records to met, not met or unknown", () => {
    const status = (patch: Partial<Engagement>, key: CriterionKey) =>
      assessExpansion({ ...base, engagement: { ...engagement, ...patch } }).criteria.find(
        (c) => c.key === key,
      )?.status;
    const sponsor = (s: Engagement["sponsor"]["status"]) =>
      status({ sponsor: { status: s, evidence: "Recorded.", recordedOn: "2026-07-01" } }, "sponsor_support");
    expect(sponsor("active")).toBe("met");
    expect(sponsor("disengaged")).toBe("not_met");
    expect(sponsor("changed_unconfirmed")).toBe("unknown");
    expect(sponsor("not_recorded")).toBe("unknown");
    expect(
      status({ demand: { status: "declined", evidence: "Declined.", recordedOn: "2026-07-01" } }, "customer_demand"),
    ).toBe("not_met");
    expect(
      status({ demand: { status: "not_recorded", evidence: null, recordedOn: null } }, "customer_demand"),
    ).toBe("unknown");
  });
});

describe("renewal decision aid", () => {
  it("lists signals and a review priority without a probability", () => {
    const aid = accountRenewalAid("acct-003");
    expect(aid.daysToRenewal).toBe(30);
    expect(aid.reviewPriority).toBe("review_now");
    expect(aid.disclaimer).toContain("does not predict the renewal outcome");
    expect(JSON.stringify(aid)).not.toMatch(/probab|likelihood|churn/i);
    expect(Object.keys(aid)).not.toContain("score");
  });

  it("keeps unknown signals separate from adverse ones", () => {
    const aid = accountRenewalAid("acct-002");
    expect(aid.reviewPriority).toBe("review_soon");
    expect(aid.adverse).toBe(2);
    expect(aid.unknown).toBe(2);
  });

  it("stays routine for accounts far from renewal", () => {
    expect(accountRenewalAid("acct-005").reviewPriority).toBe("routine");
    expect(accountRenewalAid("acct-004").reviewPriority).toBe("routine");
  });
});
