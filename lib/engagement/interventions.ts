import { REVIEW_AS_OF, daysBetween, formatDate } from "./as-of";
import type { Intervention, Outcome } from "./schema";

export type InterventionStage = "proposed" | "underway" | "completed" | "evaluated";
export const INTERVENTION_STAGES: InterventionStage[] = [
  "proposed",
  "underway",
  "completed",
  "evaluated",
];

export const stageLabel: Record<InterventionStage, string> = {
  proposed: "Proposed",
  underway: "Underway",
  completed: "Completed, not evaluated",
  evaluated: "Evaluated",
};

export const resultLabel: Record<Outcome["result"], string> = {
  achieved: "Expected result achieved",
  partly_achieved: "Expected result partly achieved",
  not_achieved: "Expected result not achieved",
  inconclusive: "Inconclusive",
};

export const attributionLabel: Record<Outcome["attribution"], string> = {
  not_assessed: "Causal effect not assessed",
  plausible_not_established: "Causal effect plausible, not established",
  supported_by_comparison: "Causal effect supported by a comparison group",
};

/**
 * The stage follows the record, not anyone's opinion of it. "Evaluated" needs both an
 * evaluation date and a recorded outcome, so delivering the action alone never gets there.
 */
export function interventionStage(intervention: Intervention): InterventionStage {
  const { startedOn, completedOn, evaluatedOn } = intervention.dates;
  if (evaluatedOn && intervention.outcome) return "evaluated";
  if (completedOn) return "completed";
  if (startedOn) return "underway";
  return "proposed";
}

export type SuccessStatus = "not_evaluated" | Outcome["result"];

export function successStatus(intervention: Intervention): SuccessStatus {
  if (interventionStage(intervention) !== "evaluated" || !intervention.outcome) {
    return "not_evaluated";
  }
  return intervention.outcome.result;
}

export const isSuccessEstablished = (intervention: Intervention): boolean =>
  successStatus(intervention) === "achieved";

export function outcomeStatement(intervention: Intervention): string {
  const stage = interventionStage(intervention);
  const { completedOn, evaluatedOn } = intervention.dates;
  if (stage === "evaluated" && intervention.outcome && evaluatedOn) {
    const { result, attribution } = intervention.outcome;
    return `Evaluated on ${formatDate(evaluatedOn)}: ${resultLabel[result].toLowerCase()}. ${attributionLabel[attribution]}.`;
  }
  if (stage === "completed" && completedOn) {
    return `Action delivered on ${formatDate(completedOn)}. The outcome has not been evaluated, so success is not established.`;
  }
  if (stage === "underway") return "Action underway. No outcome can be stated yet.";
  return "Proposed. Not started.";
}

export type FollowUpStatus =
  | { state: "done" }
  | { state: "not_scheduled" }
  | { state: "scheduled"; dueOn: string; daysUntilDue: number }
  | { state: "overdue"; dueOn: string; daysOverdue: number };

export function followUpStatus(intervention: Intervention, asOf = REVIEW_AS_OF): FollowUpStatus {
  if (interventionStage(intervention) === "evaluated") return { state: "done" };
  const dueOn = intervention.dates.followUpDueOn;
  if (!dueOn) return { state: "not_scheduled" };
  const days = daysBetween(asOf, dueOn);
  return days < 0
    ? { state: "overdue", dueOn, daysOverdue: -days }
    : { state: "scheduled", dueOn, daysUntilDue: days };
}

/** Record-consistency rules that the Zod shape cannot express. Empty means consistent. */
export function validateIntervention(intervention: Intervention): string[] {
  const issues: string[] = [];
  const { proposedOn, startedOn, completedOn, evaluatedOn } = intervention.dates;

  if (!intervention.workflowId && !intervention.practiceGroup) {
    issues.push("names neither an affected workflow nor a practice group");
  }
  if (completedOn && !startedOn) issues.push("is completed without a start date");
  if (startedOn && daysBetween(proposedOn, startedOn) < 0) issues.push("starts before it was proposed");
  if (startedOn && completedOn && daysBetween(startedOn, completedOn) < 0) {
    issues.push("is completed before it started");
  }
  if (Boolean(evaluatedOn) !== Boolean(intervention.outcome)) {
    issues.push("needs both an evaluation date and an outcome, or neither");
  }
  if (intervention.outcome) {
    if (!completedOn) {
      issues.push("has an outcome although the action is not completed");
    } else {
      const observedAfterCompletion = intervention.followUpObservations.some(
        (observation) => daysBetween(completedOn, observation.observedOn) >= 0,
      );
      if (!observedAfterCompletion) {
        issues.push("has an outcome without a follow-up observation after completion");
      }
      if (evaluatedOn && daysBetween(completedOn, evaluatedOn) < 0) {
        issues.push("is evaluated before the action was completed");
      }
    }
  }
  return issues;
}

export interface InterventionSummary {
  total: number;
  byStage: Record<InterventionStage, number>;
  byResult: Record<Outcome["result"], number>;
  followUpsOverdue: number;
}

export function summarizeInterventions(
  interventions: Intervention[],
  asOf = REVIEW_AS_OF,
): InterventionSummary {
  const byStage: Record<InterventionStage, number> = {
    proposed: 0,
    underway: 0,
    completed: 0,
    evaluated: 0,
  };
  const byResult: Record<Outcome["result"], number> = {
    achieved: 0,
    partly_achieved: 0,
    not_achieved: 0,
    inconclusive: 0,
  };
  let followUpsOverdue = 0;
  for (const intervention of interventions) {
    byStage[interventionStage(intervention)] += 1;
    const status = successStatus(intervention);
    if (status !== "not_evaluated") byResult[status] += 1;
    if (followUpStatus(intervention, asOf).state === "overdue") followUpsOverdue += 1;
  }
  return { total: interventions.length, byStage, byResult, followUpsOverdue };
}
