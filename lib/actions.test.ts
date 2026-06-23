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
    expansionReady: false,
    breakdown: { utilizationPts: 40, trendPts: 25, engagementPts: 20, penalty: 0 }
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
      expansionReady: false,
      breakdown: { utilizationPts: 15, trendPts: 10, engagementPts: 10, penalty: 0 }
    };

    const action = recommendAction(dummyAccount, [], lowHealth);
    expect(action.title).toBe("Stakeholder Pulse Check");
    expect(action.deliverable).toBe("Adoption Questionnaire");
  });

  it("recommends expansion proposal if account is healthy and expansion ready", () => {
    const expansionHealth: HealthResult = {
      score: 90,
      band: "healthy",
      expansionReady: true,
      breakdown: { utilizationPts: 45, trendPts: 25, engagementPts: 20, penalty: 0 }
    };

    const action = recommendAction(dummyAccount, [], expansionHealth);
    expect(action.title).toBe("Propose Account Expansion");
    expect(action.deliverable).toBe("30-minute Partner Briefing");
  });

  it("recommends standard cadence by default for healthy/steady accounts without blockers", () => {
    const action = recommendAction(dummyAccount, [], dummyHealth);
    expect(action.title).toBe("Maintain Standard Engagement");
    expect(action.deliverable).toBe("60-minute Workshop Agenda");
  });
});
