import { describe, it, expect } from "vitest";
import { recommendAction } from "./actions";
import type { Account, Blocker } from "./schema";
import type { HealthResult } from "./health";

describe("recommendAction", () => {
  const dummyAccount: Account = {
    id: "acct-test",
    name: "Test Law Firm LLP",
    type: "law_firm",
    seats: 10,
    activeUsers: 8,
    weeklyActiveUsers: [5, 6, 7, 8],
    practiceGroups: [
      { name: "Corporate", seats: 5, activeUsers: 4, weeklyActiveUsers: [2, 3, 4], queriesPerWeek: 50 },
      { name: "Litigation", seats: 5, activeUsers: 4, weeklyActiveUsers: [2, 3, 4], queriesPerWeek: 50 }
    ],
    personas: [
      { role: "Partner", count: 2, adoptionRate: 0.5 },
      { role: "Associate", count: 8, adoptionRate: 0.8 }
    ],
    renewalDate: "2026-12-31",
    previousHealthScore: 80
  };

  const dummyHealth: HealthResult = {
    score: 85,
    band: "healthy",
    breakdown: { utilizationPts: 40, trendPts: 25, reviewedCompletionPts: 20, penalty: 0 },
    unknownComponents: [],
  };

  it("recommends citation clinic for trust_in_output blockers", () => {
    const blockers: Blocker[] = [
      {
        id: "blk-1",
        accountId: "acct-test",
        category: "trust_in_output",
        severity: "high",
        status: "open",
        affectedGroups: ["Litigation"],
        reEngagementAction: "Clinic",
        workshopFollowUp: "Check"
      }
    ];

    const action = recommendAction(dummyAccount, blockers, dummyHealth);
    expect(action.title).toBe("Run Citation Grounding Clinic");
    expect(action.deliverable).toBe("90-minute Associate Hands-on");
    expect(action.blockerId).toBe("blk-1");
  });

  it("sorts blockers by severity and addresses the highest severity first", () => {
    const blockers: Blocker[] = [
      {
        id: "blk-low",
        accountId: "acct-test",
        category: "workflow_fit",
        severity: "low",
        status: "open",
        affectedGroups: ["Corporate"],
        reEngagementAction: "Fit",
        workshopFollowUp: "Check"
      },
      {
        id: "blk-high",
        accountId: "acct-test",
        category: "trust_in_output",
        severity: "high",
        status: "open",
        affectedGroups: ["Litigation"],
        reEngagementAction: "Clinic",
        workshopFollowUp: "Check"
      }
    ];

    const action = recommendAction(dummyAccount, blockers, dummyHealth);
    expect(action.title).toBe("Run Citation Grounding Clinic");
    expect(action.blockerId).toBe("blk-high");
  });

  it("recommends stakeholder check-in if account is at risk and has no open blockers", () => {
    const lowHealth: HealthResult = {
      score: 35,
      band: "at_risk",
      breakdown: { utilizationPts: 15, trendPts: 10, reviewedCompletionPts: 10, penalty: 0 },
      unknownComponents: [],
    };

    const action = recommendAction(dummyAccount, [], lowHealth);
    expect(action.title).toBe("Stakeholder Pulse Check");
    expect(action.deliverable).toBe("Adoption Questionnaire");
  });

  const healthyHealth: HealthResult = {
    score: 90,
    band: "healthy",
    breakdown: { utilizationPts: 45, trendPts: 25, reviewedCompletionPts: 20, penalty: 0 },
    unknownComponents: [],
  };

  it("proposes expansion only when the evidence model recommends it", () => {
    const action = recommendAction(dummyAccount, [], healthyHealth, "expand");
    expect(action.title).toBe("Prepare Bounded Expansion Proposal");
    expect(action.deliverable).toBe("Customer Review Report");
  });

  it("treats a low-severity blocker as a caveat on expansion and a higher one as a stop", () => {
    const blocker = (severity: Blocker["severity"]): Blocker => ({
      id: `blk-${severity}`,
      accountId: "acct-test",
      category: "training_gap",
      severity,
      status: "open",
      affectedGroups: ["Corporate"],
      reEngagementAction: "",
      workshopFollowUp: "",
    });
    expect(recommendAction(dummyAccount, [blocker("low")], healthyHealth, "expand").title).toBe(
      "Prepare Bounded Expansion Proposal",
    );
    expect(recommendAction(dummyAccount, [blocker("medium")], healthyHealth, "expand").title).toBe(
      "Schedule prompt Fluency Workshop",
    );
  });

  it("does not propose expansion for a healthy score alone", () => {
    for (const recommendation of [undefined, "continue", "adjust", "pause"] as const) {
      const action = recommendAction(dummyAccount, [], healthyHealth, recommendation);
      expect(action.title).toBe("Maintain Standard Engagement");
    }
  });

  it("recommends standard cadence by default for healthy/steady accounts without blockers", () => {
    const action = recommendAction(dummyAccount, [], dummyHealth);
    expect(action.title).toBe("Maintain Standard Engagement");
    expect(action.deliverable).toBe("60-minute Workshop Agenda");
  });
});
