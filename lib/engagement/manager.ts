import { getAccounts } from "../data";
import { REVIEW_AS_OF, daysBetween, formatDate } from "./as-of";
import { compareAttention, type Urgency } from "./attention-order";
import {
  assessComplexity,
  checkDeliveryCapacity,
  plannedHours,
  type ComplexityAssessment,
  type ComplexityBand,
} from "./capacity";
import { getEngagements, getInterventions, getTeam, specialistLabel } from "./data";
import { expansionEvidenceFor } from "./expansion";
import {
  followUpStatus,
  summarizeInterventions,
  type InterventionSummary,
} from "./interventions";
import type { CoachingAction, Commitment, Escalation, Specialist } from "./schema";

export type AttentionKind =
  | "open_escalation"
  | "overdue_commitment"
  | "follow_up_overdue"
  | "renewal_window"
  | "sponsor_gap"
  | "value_not_demonstrated"
  | "capacity_gap"
  | "usage_decline";

export const attentionKindLabel: Record<AttentionKind, string> = {
  open_escalation: "Open escalation",
  overdue_commitment: "Overdue commitment",
  follow_up_overdue: "Follow-up overdue",
  renewal_window: "Renewal window",
  sponsor_gap: "Sponsor gap",
  value_not_demonstrated: "Value not demonstrated",
  capacity_gap: "Capacity gap",
  usage_decline: "Usage decline",
};

export const urgencyLabel: Record<Urgency, string> = {
  act_now: "Act now",
  this_week: "This week",
  watch: "Watch",
};

export interface AttentionReason {
  kind: AttentionKind;
  urgency: Urgency;
  detail: string;
  evidenceRef: string;
}

export interface AccountAttention {
  accountId: string;
  accountName: string;
  leadSpecialist: string;
  complexity: ComplexityAssessment;
  daysToRenewal: number;
  reasons: AttentionReason[];
}

export interface OverdueCommitment extends Commitment {
  daysOverdue: number;
}

export function overdueCommitments(asOf = REVIEW_AS_OF): OverdueCommitment[] {
  return getTeam()
    .commitments.filter((commitment) => commitment.status === "open")
    .map((commitment) => ({ ...commitment, daysOverdue: daysBetween(commitment.dueOn, asOf) }))
    .filter((commitment) => commitment.daysOverdue > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export const openEscalations = (): Escalation[] =>
  getTeam().escalations.filter((escalation) => escalation.status === "open");

function attentionReasons(accountId: string, asOf: string): AttentionReason[] {
  const account = getAccounts().find((candidate) => candidate.id === accountId);
  const engagement = getEngagements().find((candidate) => candidate.accountId === accountId);
  if (!account || !engagement) return [];
  const reasons: AttentionReason[] = [];

  for (const escalation of openEscalations().filter((e) => e.accountId === accountId)) {
    const dueInDays = daysBetween(asOf, escalation.dueOn);
    reasons.push({
      kind: "open_escalation",
      urgency: escalation.severity === "high" || dueInDays <= 7 ? "act_now" : "this_week",
      detail: `${escalation.topic} Decision needed by ${formatDate(escalation.dueOn)}: ${escalation.decisionNeeded}`,
      evidenceRef: escalation.id,
    });
  }
  for (const commitment of overdueCommitments(asOf).filter((c) => c.accountId === accountId)) {
    reasons.push({
      kind: "overdue_commitment",
      urgency: commitment.daysOverdue > 14 ? "act_now" : "this_week",
      detail: `${commitment.ownerLabel} is ${commitment.daysOverdue} days late: ${commitment.description}`,
      evidenceRef: commitment.id,
    });
  }
  for (const intervention of getInterventions().filter((i) => i.accountId === accountId)) {
    const followUp = followUpStatus(intervention, asOf);
    if (followUp.state === "overdue") {
      reasons.push({
        kind: "follow_up_overdue",
        urgency: "this_week",
        detail: `The follow-up observation on ${intervention.id} was due ${followUp.daysOverdue} days ago, so the outcome of the action is unknown.`,
        evidenceRef: intervention.id,
      });
    }
  }

  const daysToRenewal = daysBetween(asOf, account.renewalDate);
  if (daysToRenewal <= 90) {
    reasons.push({
      kind: "renewal_window",
      urgency: daysToRenewal <= 45 ? "act_now" : "this_week",
      detail: `Renewal date in ${daysToRenewal} days (${formatDate(account.renewalDate)}).`,
      evidenceRef: `data/accounts.json#${accountId}`,
    });
  }
  if (engagement.sponsor.status === "disengaged" || engagement.sponsor.status === "changed_unconfirmed") {
    reasons.push({
      kind: "sponsor_gap",
      urgency: engagement.sponsor.status === "disengaged" ? "this_week" : "watch",
      detail: engagement.sponsor.evidence ?? "Sponsor position changed.",
      evidenceRef: `data/engagements.json#${accountId}`,
    });
  }

  const { value } = expansionEvidenceFor(accountId, asOf);
  if (engagement.expansionCase && value?.verdict === "not_demonstrated") {
    reasons.push({
      kind: "value_not_demonstrated",
      urgency: "this_week",
      detail: `Expansion is requested while value is not demonstrated. ${value.reasons.join(" ")}`,
      evidenceRef: value.measurement.id,
    });
  }
  const capacity = checkDeliveryCapacity(engagement, getEngagements(), getTeam().specialists);
  if (capacity.status === "not_met") {
    reasons.push({
      kind: "capacity_gap",
      urgency: "this_week",
      detail: capacity.detail,
      evidenceRef: `data/engagements.json#${accountId}`,
    });
  }

  const weekly = account.weeklyActiveUsers;
  const first = weekly[0];
  const last = weekly[weekly.length - 1];
  if (last < first) {
    reasons.push({
      kind: "usage_decline",
      urgency: first > 0 && (first - last) / first >= 0.3 ? "this_week" : "watch",
      detail: `Weekly active users fell from ${first} to ${last} of ${account.seats} licensed seats.`,
      evidenceRef: `data/accounts.json#${accountId}`,
    });
  }
  return reasons;
}

/** Every account with the recorded reasons it needs attention, most pressing first. */
export function accountAttention(asOf = REVIEW_AS_OF): AccountAttention[] {
  const engagements = getEngagements();
  return getAccounts()
    .flatMap((account) => {
      const engagement = engagements.find((candidate) => candidate.accountId === account.id);
      if (!engagement) return [];
      const lead = engagement.assignments.find((assignment) => assignment.role === "lead");
      return [
        {
          accountId: account.id,
          accountName: account.name,
          leadSpecialist: lead ? specialistLabel(lead.specialistId) : "Unassigned",
          complexity: assessComplexity(engagement.complexity),
          daysToRenewal: daysBetween(asOf, account.renewalDate),
          reasons: attentionReasons(account.id, asOf),
        },
      ];
    })
    .sort((a, b) =>
      compareAttention(
        { urgencies: a.reasons.map((r) => r.urgency), daysToRenewal: a.daysToRenewal },
        { urgencies: b.reasons.map((r) => r.urgency), daysToRenewal: b.daysToRenewal },
      ),
    );
}

export interface SpecialistWorkload {
  specialist: Specialist;
  assignments: {
    accountId: string;
    accountName: string;
    role: "lead" | "support";
    plannedHoursPerWeek: number;
    complexity: ComplexityBand;
  }[];
  plannedHours: number;
  headroomHours: number;
  overCapacity: boolean;
  openCommitments: number;
  overdueCommitments: number;
  openEscalations: number;
  interventions: InterventionSummary;
  coaching: CoachingAction[];
  context: string[];
}

/**
 * Workload per specialist in roster order. This is planning context for the manager, not a
 * ranking: hours are read against capacity and account complexity, never as a score.
 */
export function specialistWorkloads(asOf = REVIEW_AS_OF): SpecialistWorkload[] {
  const team = getTeam();
  const engagements = getEngagements();
  const accounts = getAccounts();
  const overdue = overdueCommitments(asOf);

  return [...team.specialists]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((specialist) => {
      const assignments = engagements.flatMap((engagement) =>
        engagement.assignments
          .filter((assignment) => assignment.specialistId === specialist.id)
          .map((assignment) => ({
            accountId: engagement.accountId,
            accountName:
              accounts.find((account) => account.id === engagement.accountId)?.name ??
              engagement.accountId,
            role: assignment.role,
            plannedHoursPerWeek: assignment.plannedHoursPerWeek,
            complexity: assessComplexity(engagement.complexity).band,
          })),
      );
      const planned = plannedHours(specialist.id, engagements);
      const headroomHours = specialist.weeklyCapacityHours - planned;
      const highComplexity = assignments.filter((a) => a.complexity === "high").length;
      const overdueOwn = overdue.filter((commitment) => commitment.ownerId === specialist.id);

      const context: string[] = [];
      if (highComplexity > 0) {
        context.push(`${highComplexity} high-complexity account(s) in the assignment.`);
      }
      if (headroomHours < 4) {
        context.push(
          `${headroomHours} hours of headroom per week. Late commitments may reflect load before they reflect practice.`,
        );
      }
      if (overdueOwn.length > 0) {
        context.push(
          `${overdueOwn.length} own commitment(s) overdue: ${overdueOwn.map((c) => c.id).join(", ")}.`,
        );
      }

      return {
        specialist,
        assignments,
        plannedHours: planned,
        headroomHours,
        overCapacity: headroomHours < 0,
        openCommitments: team.commitments.filter(
          (commitment) => commitment.ownerId === specialist.id && commitment.status === "open",
        ).length,
        overdueCommitments: overdueOwn.length,
        openEscalations: openEscalations().filter((e) => e.raisedById === specialist.id).length,
        interventions: summarizeInterventions(
          getInterventions().filter((i) => i.assignedSpecialistId === specialist.id),
          asOf,
        ),
        coaching: team.coachingActions.filter((action) => action.specialistId === specialist.id),
        context,
      };
    });
}

export function teamCapacity(asOf = REVIEW_AS_OF) {
  const workloads = specialistWorkloads(asOf);
  const planned = workloads.reduce((sum, w) => sum + w.plannedHours, 0);
  const capacity = workloads.reduce((sum, w) => sum + w.specialist.weeklyCapacityHours, 0);
  return { planned, capacity, headroom: capacity - planned };
}
