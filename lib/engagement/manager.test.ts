import { describe, expect, it } from "vitest";
import { compareAttention, type AttentionSortKey } from "./attention-order";
import { assessComplexity, checkDeliveryCapacity } from "./capacity";
import { getEngagement, getEngagements, getTeam } from "./data";
import {
  accountAttention,
  overdueCommitments,
  specialistWorkloads,
  teamCapacity,
} from "./manager";
import type { Engagement } from "./schema";

const AS_OF = "2026-07-31";

describe("commitments and escalations", () => {
  it("counts only open commitments past their due date as overdue", () => {
    const overdue = overdueCommitments(AS_OF);
    expect(overdue.map((c) => [c.id, c.daysOverdue])).toEqual([
      ["com-003", 21],
      ["com-005", 14],
      ["com-002", 7],
    ]);
    expect(overdueCommitments("2026-07-10").map((c) => c.id)).toEqual([]);
  });
});

describe("account complexity", () => {
  it("is a transparent point count with named drivers", () => {
    const brightmoor = assessComplexity((getEngagement("acct-004") as Engagement).complexity);
    expect(brightmoor).toMatchObject({ points: 4, band: "high" });
    expect(brightmoor.drivers).toContain("2 integration(s) in flight");
    expect(assessComplexity((getEngagement("acct-001") as Engagement).complexity).band).toBe("low");
  });
});

describe("delivery capacity", () => {
  const specialists = getTeam().specialists;
  it("is met when the lead specialist can absorb the extra hours", () => {
    const check = checkDeliveryCapacity(getEngagement("acct-005") as Engagement, getEngagements(), specialists);
    expect(check.status).toBe("met");
    expect(check.detail).toContain("16 of 30 assignable hours");
    expect(check.detail).toContain("planning assumptions");
  });

  it("is not met when the expansion would exceed assignable hours", () => {
    const check = checkDeliveryCapacity(getEngagement("acct-004") as Engagement, getEngagements(), specialists);
    expect(check.status).toBe("not_met");
    expect(check.detail).toContain("36 in total");
  });

  it("is unknown without an expansion scope", () => {
    const check = checkDeliveryCapacity(getEngagement("acct-001") as Engagement, getEngagements(), specialists);
    expect(check.status).toBe("unknown");
  });
});

describe("why an account receives attention", () => {
  const attention = accountAttention(AS_OF);
  const reasonsFor = (accountId: string) =>
    attention.find((a) => a.accountId === accountId)?.reasons.map((r) => `${r.kind}:${r.urgency}`);

  it("gives every reason a kind, a detail and an evidence reference", () => {
    for (const account of attention) {
      for (const reason of account.reasons) {
        expect(reason.detail.length).toBeGreaterThan(10);
        expect(reason.evidenceRef).toBeTruthy();
      }
    }
  });

  it("explains the attention on each account", () => {
    expect(reasonsFor("acct-003")).toEqual([
      "open_escalation:act_now",
      "overdue_commitment:act_now",
      "renewal_window:act_now",
      "sponsor_gap:this_week",
      "usage_decline:this_week",
    ]);
    expect(reasonsFor("acct-004")).toEqual([
      "open_escalation:act_now",
      "overdue_commitment:this_week",
      "sponsor_gap:watch",
      "value_not_demonstrated:this_week",
      "capacity_gap:this_week",
    ]);
    expect(reasonsFor("acct-002")).toEqual(["overdue_commitment:this_week", "follow_up_overdue:this_week"]);
    expect(reasonsFor("acct-005")).toEqual([]);
  });

  it("orders accounts by recorded reasons, not by size or activity", () => {
    expect(attention.map((a) => a.accountId)).toEqual([
      "acct-003",
      "acct-004",
      "acct-002",
      "acct-005",
      "acct-001",
    ]);
    // The busiest account by active users (acct-004, 56) is not first; the smallest
    // active base (acct-003, 8) is.
  });
});

describe("attention order", () => {
  const key = (urgencies: AttentionSortKey["urgencies"], daysToRenewal = 200): AttentionSortKey => ({
    urgencies,
    daysToRenewal,
  });

  it("puts act-now reasons ahead of any number of lesser ones", () => {
    expect(compareAttention(key(["act_now"]), key(["this_week", "this_week", "watch"]))).toBeLessThan(0);
  });

  it("puts accounts with reasons ahead of accounts without", () => {
    expect(compareAttention(key(["watch"]), key([]))).toBeLessThan(0);
    expect(compareAttention(key(["watch"], 300), key([], 60))).toBeLessThan(0);
    expect(compareAttention(key(["this_week"]), key([]))).toBeLessThan(0);
  });

  it("is antisymmetric", () => {
    const a = key(["act_now", "watch"], 30);
    const b = key(["this_week"], 90);
    expect(Math.sign(compareAttention(a, b))).toBe(-Math.sign(compareAttention(b, a)));
  });
});

describe("specialist workloads", () => {
  const workloads = specialistWorkloads(AS_OF);

  it("lists specialists in roster order, not ranked by accounts or activity", () => {
    expect(workloads.map((w) => w.specialist.id)).toEqual(["spec-01", "spec-02", "spec-03"]);
    // Specialist B carries the most accounts and is still listed second.
    expect(workloads.map((w) => w.assignments.length)).toEqual([2, 3, 2]);
  });

  it("exposes no rank or score field", () => {
    for (const workload of workloads) {
      expect(Object.keys(workload).join(" ")).not.toMatch(/rank|score|performance/i);
    }
  });

  it("reads planned hours against capacity and complexity", () => {
    const [a, b, c] = workloads;
    expect([a.plannedHours, a.headroomHours]).toEqual([16, 14]);
    expect([b.plannedHours, b.headroomHours]).toEqual([28, 2]);
    expect([c.plannedHours, c.headroomHours]).toEqual([7, 11]);
    expect(b.assignments.find((x) => x.accountId === "acct-004")?.complexity).toBe("high");
    expect(b.context.join(" ")).toContain("may reflect load before they reflect practice");
    expect(teamCapacity(AS_OF)).toEqual({ planned: 51, capacity: 78, headroom: 27 });
  });

  it("ties every coaching action to a recorded intervention", () => {
    const coaching = workloads.flatMap((w) => w.coaching);
    expect(coaching).toHaveLength(3);
    expect(coaching.every((action) => /^int-\d+$/.test(action.evidenceRef))).toBe(true);
  });

  it("does not present completed interventions as achieved results", () => {
    const c = workloads[2];
    expect(c.interventions.byStage.completed).toBe(1);
    expect(c.interventions.byResult.achieved).toBe(0);
  });
});
