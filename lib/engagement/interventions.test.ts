import { describe, expect, it } from "vitest";
import { getInterventions } from "./data";
import {
  followUpStatus,
  interventionStage,
  isSuccessEstablished,
  outcomeStatement,
  successStatus,
  summarizeInterventions,
  validateIntervention,
} from "./interventions";
import { interventionSchema, type Intervention } from "./schema";

const byId = (id: string): Intervention => {
  const found = getInterventions().find((intervention) => intervention.id === id);
  if (!found) throw new Error(`missing fixture ${id}`);
  return found;
};

describe("intervention stages", () => {
  it("derives the four stages from the record", () => {
    expect(interventionStage(byId("int-003"))).toBe("proposed");
    expect(interventionStage(byId("int-005"))).toBe("underway");
    expect(interventionStage(byId("int-002"))).toBe("completed");
    expect(interventionStage(byId("int-001"))).toBe("evaluated");
  });

  it("does not treat a completed action as a success", () => {
    const completed = byId("int-002");
    expect(completed.dates.completedOn).not.toBeNull();
    expect(successStatus(completed)).toBe("not_evaluated");
    expect(isSuccessEstablished(completed)).toBe(false);
    expect(outcomeStatement(completed)).toContain("success is not established");
  });

  it("establishes success only for an evaluated intervention that achieved its result", () => {
    expect(isSuccessEstablished(byId("int-001"))).toBe(true);
    // Evaluated, delivered in full, activity went up, and still not a success.
    expect(interventionStage(byId("int-004"))).toBe("evaluated");
    expect(successStatus(byId("int-004"))).toBe("not_achieved");
    expect(isSuccessEstablished(byId("int-004"))).toBe(false);
  });

  it("stays at completed when an evaluation date is set without an outcome", () => {
    const halfEvaluated: Intervention = {
      ...byId("int-002"),
      dates: { ...byId("int-002").dates, evaluatedOn: "2026-08-20" },
    };
    expect(interventionStage(halfEvaluated)).toBe("completed");
    expect(validateIntervention(halfEvaluated)).toContain(
      "needs both an evaluation date and an outcome, or neither",
    );
  });

  it("keeps a causal claim separate from the result", () => {
    const { outcome } = byId("int-001");
    expect(outcome?.result).toBe("achieved");
    expect(outcome?.attribution).toBe("plausible_not_established");
    expect(outcome?.confounders.length).toBeGreaterThan(0);
    expect(outcomeStatement(byId("int-001"))).toContain("not established");
  });
});

describe("intervention record rules", () => {
  it("accepts every synthetic record", () => {
    for (const intervention of getInterventions()) {
      expect(validateIntervention(intervention), intervention.id).toEqual([]);
    }
  });

  it("rejects an outcome with no follow-up observation after completion", () => {
    const source = byId("int-001");
    const noFollowUp: Intervention = { ...source, followUpObservations: [] };
    expect(validateIntervention(noFollowUp)).toContain(
      "has an outcome without a follow-up observation after completion",
    );
    const observedTooEarly: Intervention = {
      ...source,
      followUpObservations: [
        { observedOn: "2026-04-01", summary: "Before completion.", bearing: "supports" },
      ],
    };
    expect(validateIntervention(observedTooEarly)).toContain(
      "has an outcome without a follow-up observation after completion",
    );
  });

  it("rejects an outcome on an action that was never completed", () => {
    const source = byId("int-005");
    const premature: Intervention = {
      ...source,
      dates: { ...source.dates, evaluatedOn: "2026-08-01" },
      outcome: {
        result: "achieved",
        rationale: "Declared early.",
        attribution: "not_assessed",
        confounders: [],
      },
    };
    expect(validateIntervention(premature)).toContain(
      "has an outcome although the action is not completed",
    );
  });

  it("requires an affected workflow or practice group and ordered dates", () => {
    const source = byId("int-003");
    expect(validateIntervention({ ...source, workflowId: null, practiceGroup: null })).toContain(
      "names neither an affected workflow nor a practice group",
    );
    expect(
      validateIntervention({ ...source, dates: { ...source.dates, startedOn: "2026-07-01" } }),
    ).toContain("starts before it was proposed");
  });

  it("refuses unknown keys and records that are not marked synthetic", () => {
    const source = byId("int-001");
    expect(interventionSchema.safeParse({ ...source, clientName: "x" }).success).toBe(false);
    expect(interventionSchema.safeParse({ ...source, synthetic: false }).success).toBe(false);
    expect(interventionSchema.safeParse({ ...source, supportingEvidence: [] }).success).toBe(false);
  });
});

describe("follow-up tracking", () => {
  it("flags a follow-up that is past due and not evaluated", () => {
    expect(followUpStatus(byId("int-006"), "2026-07-31")).toEqual({
      state: "overdue",
      dueOn: "2026-07-24",
      daysOverdue: 7,
    });
    expect(followUpStatus(byId("int-002"), "2026-07-31")).toMatchObject({
      state: "scheduled",
      daysUntilDue: 14,
    });
    expect(followUpStatus(byId("int-003"), "2026-07-31")).toEqual({ state: "not_scheduled" });
    expect(followUpStatus(byId("int-001"), "2026-07-31")).toEqual({ state: "done" });
  });

  it("summarises stages and results without counting completed actions as achieved", () => {
    const summary = summarizeInterventions(getInterventions(), "2026-07-31");
    expect(summary.byStage).toEqual({ proposed: 2, underway: 2, completed: 1, evaluated: 2 });
    expect(summary.byResult).toEqual({
      achieved: 1,
      partly_achieved: 0,
      not_achieved: 1,
      inconclusive: 0,
    });
    expect(summary.followUpsOverdue).toBe(1);
  });
});
