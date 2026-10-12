import { REVIEW_AS_OF, daysBetween, formatDate } from "../engagement/as-of";
import { median } from "../engagement/value";
import type {
  Change,
  DeliveryStatus,
  EvidenceStore,
  EvidenceType,
  Observation,
  Problem,
  ResearchQuestion,
  Session,
  TaskResult,
} from "./schema";

export type OutcomeStatus =
  | "supported"
  | "contradicted"
  | "inconclusive"
  | "awaiting_evidence"
  | "not_applicable";

export const outcomeStatusLabel: Record<OutcomeStatus, string> = {
  supported: "Supported",
  contradicted: "Contradicted",
  inconclusive: "Inconclusive",
  awaiting_evidence: "Awaiting evidence",
  not_applicable: "No outcome: not released",
};

export const deliveryStatusLabel: Record<DeliveryStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  released: "Released",
  deferred: "Deferred",
  rejected: "Rejected",
};

export const decisionLabel: Record<Change["decision"]["status"], string> = {
  prioritised: "Prioritised",
  needs_evidence: "Needs evidence",
  deferred: "Deferred",
  rejected: "Rejected",
};

export const evidenceTypeLabel: Record<EvidenceType, string> = {
  past_behaviour: "Past behaviour (interview)",
  observed_task: "Observed task",
  opinion_on_proposal: "Opinion on a proposal",
};

export const problemClassLabel: Record<Problem["class"], string> = {
  quality_control: "Quality or control failure",
  workflow_fit: "Workflow fit",
  convenience: "Convenience",
};

/** A release without an assessed follow-up is an open question, never a success. */
export function outcomeStatus(change: Change): OutcomeStatus {
  if (change.delivery.status !== "released") return "not_applicable";
  return change.outcome?.result ?? "awaiting_evidence";
}

const duplicates = (ids: string[]) => [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];

/**
 * Consistency rules the Zod shape cannot express. Empty means consistent.
 * The delivery rules are the point: a status is only as good as the record behind it.
 */
export function validateStore(store: EvidenceStore): string[] {
  const issues: string[] = [];
  const questions = new Map(store.researchQuestions.map((q) => [q.id, q]));
  const sessions = new Map(store.sessions.map((s) => [s.id, s]));
  const observations = new Map(store.observations.map((o) => [o.id, o]));
  const problems = new Map(store.problems.map((p) => [p.id, p]));

  for (const [label, ids] of [
    ["research question", store.researchQuestions.map((r) => r.id)],
    ["session", store.sessions.map((r) => r.id)],
    ["observation", store.observations.map((r) => r.id)],
    ["problem", store.problems.map((r) => r.id)],
    ["change", store.changes.map((r) => r.id)],
  ] as const) {
    for (const id of duplicates(ids)) issues.push(`duplicate ${label} id ${id}`);
  }

  for (const session of store.sessions) {
    for (const id of session.questionIds) {
      if (!questions.has(id)) issues.push(`${session.id} names unknown research question ${id}`);
    }
  }

  const seenContent = new Map<string, string>();
  for (const observation of store.observations) {
    const session = sessions.get(observation.sessionId);
    if (!session) issues.push(`${observation.id} names unknown session ${observation.sessionId}`);
    if (!questions.has(observation.questionId)) {
      issues.push(`${observation.id} names unknown research question ${observation.questionId}`);
    } else if (session && !session.questionIds.includes(observation.questionId)) {
      issues.push(`${observation.id} answers ${observation.questionId}, which ${session.id} did not cover`);
    }
    // The same note entered twice would double the evidence behind a problem.
    const key = `${observation.sessionId}|${observation.questionId}|${observation.observed.trim().toLowerCase()}`;
    const first = seenContent.get(key);
    if (first) issues.push(`${observation.id} duplicates ${first}`);
    else seenContent.set(key, observation.id);

    if (observation.taskResult && observation.evidenceType !== "observed_task") {
      issues.push(`${observation.id} carries task measures but is not an observed task`);
    }
    if (observation.taskResult && session && session.taskPackId !== observation.taskResult.taskPackId) {
      issues.push(`${observation.id} reports a task pack its session did not use`);
    }
    if (observation.taskResult && observation.taskResult.acceptable !== (observation.taskResult.minutesToAcceptable !== null)) {
      issues.push(`${observation.id} needs minutes to an acceptable result if and only if one was reached`);
    }
    if (observation.quotation?.permission === "public_approved" && !observation.quotation.approvalRef) {
      issues.push(`${observation.id} marks a quotation as public without an approval reference`);
    }
  }

  for (const problem of store.problems) {
    for (const id of [...problem.supportingObservationIds, ...problem.contradictingObservationIds]) {
      if (!observations.has(id)) issues.push(`${problem.id} names unknown observation ${id}`);
    }
    const both = problem.supportingObservationIds.filter((id) =>
      problem.contradictingObservationIds.includes(id),
    );
    for (const id of both) issues.push(`${problem.id} lists ${id} as both supporting and contradicting`);
  }

  for (const change of store.changes) {
    const { decision, delivery, followUp, outcome } = change;
    const problem = problems.get(change.problemId);
    if (!problem) issues.push(`${change.id} names unknown problem ${change.problemId}`);

    if ((delivery.status === "released") !== (delivery.release !== null)) {
      issues.push(`${change.id}: "released" needs release evidence, and release evidence means released`);
    }
    for (const closed of ["deferred", "rejected"] as const) {
      if ((decision.status === closed) !== (delivery.status === closed)) {
        issues.push(`${change.id}: decision and delivery status disagree on "${closed}"`);
      }
    }
    if ((delivery.status === "in_progress" || delivery.status === "released") && decision.status !== "prioritised") {
      issues.push(`${change.id} is being delivered without a decision to prioritise it`);
    }
    if (delivery.status === "in_progress" || delivery.status === "released") {
      if (!delivery.startedOn) {
        issues.push(`${change.id} is being delivered without a start date`);
      } else if (!change.criteriaRecordedOn || change.acceptanceCriteria.length === 0) {
        issues.push(`${change.id} is being delivered without acceptance criteria`);
      } else if (daysBetween(change.criteriaRecordedOn, delivery.startedOn) < 0) {
        issues.push(`${change.id}: acceptance criteria were recorded after implementation started`);
      }
    }
    if (decision.status === "prioritised" && problem) {
      const types = problem.supportingObservationIds.map((id) => observations.get(id)?.evidenceType);
      if (types.length > 0 && types.every((type) => type === "opinion_on_proposal")) {
        issues.push(`${change.id} is prioritised on opinions about a proposal alone`);
      }
    }
    const criteria = new Set(change.acceptanceCriteria.map((c) => c.id));
    for (const id of delivery.release?.criteriaVerified ?? []) {
      if (!criteria.has(id)) issues.push(`${change.id} verifies unknown criterion ${id}`);
    }

    if (followUp) {
      if (!delivery.release) issues.push(`${change.id} plans a follow-up for a change that is not released`);
      for (const id of [...followUp.baselineObservationIds, ...followUp.followUpObservationIds]) {
        if (!observations.has(id)) issues.push(`${change.id} names unknown observation ${id}`);
      }
      for (const id of followUp.followUpObservationIds) {
        const session = sessions.get(observations.get(id)?.sessionId ?? "");
        if (session && delivery.release && daysBetween(delivery.release.releasedOn, session.heldOn) < 0) {
          issues.push(`${change.id}: follow-up observation ${id} predates the release`);
        }
      }
    }
    if (outcome) {
      if (!delivery.release) {
        issues.push(`${change.id} has an outcome although nothing was released`);
      } else if (!followUp || followUp.followUpObservationIds.length === 0) {
        issues.push(`${change.id} has an outcome without a follow-up observation`);
      } else if (outcome.result !== "inconclusive") {
        const measured = (ids: string[]) => ids.some((id) => observations.get(id)?.taskResult);
        if (!measured(followUp.baselineObservationIds) || !measured(followUp.followUpObservationIds)) {
          issues.push(`${change.id} is "${outcome.result}" without task measures on both sides of the comparison`);
        }
      }
    }
  }
  return issues;
}

export interface TaskSetSummary {
  sessions: number;
  completedUnaided: number;
  completedWithAssistance: number;
  notCompleted: number;
  acceptable: number;
  assistance: number;
  interpretationErrors: number;
  trustConcerns: number;
  /** Median over the sessions that reached an acceptable result. `null` if none did. */
  medianMinutesToAcceptable: number | null;
}

export function summarizeTaskResults(results: TaskResult[]): TaskSetSummary {
  const sum = (pick: (result: TaskResult) => number) => results.reduce((total, r) => total + pick(r), 0);
  const count = (completion: TaskResult["completion"]) =>
    results.filter((r) => r.completion === completion).length;
  return {
    sessions: results.length,
    completedUnaided: count("completed_unaided"),
    completedWithAssistance: count("completed_with_assistance"),
    notCompleted: count("not_completed"),
    acceptable: results.filter((r) => r.acceptable).length,
    assistance: sum((r) => r.assistanceCount),
    interpretationErrors: sum((r) => r.interpretationErrors),
    trustConcerns: sum((r) => r.trustConcerns),
    medianMinutesToAcceptable: median(
      results.flatMap((r) => (r.minutesToAcceptable === null ? [] : [r.minutesToAcceptable])),
    ),
  };
}

export interface FollowUpComparison {
  baseline: TaskSetSummary;
  followUp: TaskSetSummary;
  comparability: string;
  /** Reasons other than the change that could explain a difference. Always shown. */
  caveats: string[];
}

export type FollowUpState =
  | { state: "not_applicable" }
  | { state: "not_planned" }
  | { state: "scheduled"; dueOn: string }
  | { state: "overdue"; dueOn: string; daysOverdue: number }
  | { state: "observed"; sessions: number };

export interface ChangeView {
  change: Change;
  problem: Problem;
  questions: ResearchQuestion[];
  sessions: Session[];
  supporting: Observation[];
  contradicting: Observation[];
  evidenceByType: Record<EvidenceType, number>;
  participants: number;
  deliveryStatus: DeliveryStatus;
  outcomeStatus: OutcomeStatus;
  followUpState: FollowUpState;
  comparison: FollowUpComparison | null;
  unverifiedCriteria: string[];
  missingObservations: string[];
}

function followUpState(change: Change, asOf: string): FollowUpState {
  if (!change.delivery.release) return { state: "not_applicable" };
  const followUp = change.followUp;
  if (!followUp) return { state: "not_planned" };
  if (followUp.followUpObservationIds.length > 0) {
    return { state: "observed", sessions: followUp.followUpObservationIds.length };
  }
  const days = daysBetween(followUp.dueOn, asOf);
  return days > 0
    ? { state: "overdue", dueOn: followUp.dueOn, daysOverdue: days }
    : { state: "scheduled", dueOn: followUp.dueOn };
}

function compare(change: Change, store: EvidenceStore): FollowUpComparison | null {
  const followUp = change.followUp;
  if (!followUp) return null;
  const byId = new Map(store.observations.map((o) => [o.id, o]));
  const sessions = new Map(store.sessions.map((s) => [s.id, s]));
  const pick = (ids: string[]) => ids.flatMap((id) => byId.get(id) ?? []);
  const before = pick(followUp.baselineObservationIds);
  const after = pick(followUp.followUpObservationIds);
  const results = (observations: Observation[]) =>
    observations.flatMap((o) => (o.taskResult ? [o.taskResult] : []));
  if (results(after).length === 0) return null;

  const codes = (observations: Observation[]) =>
    new Set(observations.map((o) => sessions.get(o.sessionId)?.participantCode));
  const returning = [...codes(after)].filter((code) => codes(before).has(code)).length;
  const packs = (observations: Observation[]) =>
    new Set(results(observations).map((r) => r.taskPackId));
  const caveats: string[] = [];
  if (results(before).length === 0) {
    caveats.push("No baseline task was observed, so there is nothing to compare the follow-up with.");
  }
  if (returning > 0) {
    caveats.push(
      `${returning} of ${codes(after).size} follow-up participant(s) also took part in the baseline. Practice with the task type cannot be separated from the change.`,
    );
  }
  if (returning < codes(after).size && results(before).length > 0) {
    caveats.push("Some follow-up participants are new. Differences between people may explain part of the result.");
  }
  if ([...packs(after)].some((pack) => !packs(before).has(pack)) && results(before).length > 0) {
    caveats.push("Baseline and follow-up used different documents. Differences between the tasks may explain part of the result.");
  }
  caveats.push(
    `${results(before).length} baseline and ${results(after).length} follow-up session(s). Read these as cases, not as rates.`,
  );
  return {
    baseline: summarizeTaskResults(results(before)),
    followUp: summarizeTaskResults(results(after)),
    comparability: followUp.comparability,
    caveats: [...caveats, ...(change.outcome?.alternativeExplanations ?? [])],
  };
}

function missingObservations(view: Omit<ChangeView, "missingObservations">): string[] {
  const { change, supporting, contradicting, evidenceByType, followUpState: follow } = view;
  const missing: string[] = [];
  if (supporting.length === 0) {
    missing.push("No study observation supports the problem. It rests on account feedback alone.");
  } else if (evidenceByType.observed_task === 0) {
    missing.push("Nobody was observed meeting this problem in a task. The support is reported behaviour or opinion.");
  }
  if (contradicting.length > 0) {
    missing.push(`${contradicting.length} contradicting observation(s) not yet explained.`);
  }
  if (change.decision.status === "prioritised" && change.acceptanceCriteria.length === 0) {
    missing.push("No acceptance criteria recorded.");
  }
  if (view.unverifiedCriteria.length > 0) {
    missing.push(`Not verified at release: ${view.unverifiedCriteria.join("; ")}`);
  }
  switch (follow.state) {
    case "not_planned":
      missing.push("Released without a planned follow-up observation.");
      break;
    case "scheduled":
      missing.push(`Follow-up observation due ${formatDate(follow.dueOn)}.`);
      break;
    case "overdue":
      missing.push(`Follow-up observation overdue by ${follow.daysOverdue} day(s) (due ${formatDate(follow.dueOn)}).`);
      break;
    case "observed":
      if (!view.comparison) missing.push("The follow-up recorded no task measures.");
      else if (view.comparison.baseline.sessions === 0) missing.push("No baseline task to compare the follow-up with.");
      if (!change.outcome) missing.push("Follow-up observed but not assessed.");
      break;
  }
  return missing;
}

export function viewChange(change: Change, store: EvidenceStore, asOf = REVIEW_AS_OF): ChangeView {
  const problem = store.problems.find((candidate) => candidate.id === change.problemId);
  if (!problem) throw new Error(`${change.id} names unknown problem ${change.problemId}`);
  const byId = new Map(store.observations.map((o) => [o.id, o]));
  const pick = (ids: string[]) => ids.flatMap((id) => byId.get(id) ?? []);
  const supporting = pick(problem.supportingObservationIds);
  const contradicting = pick(problem.contradictingObservationIds);
  const cited = [
    ...supporting,
    ...contradicting,
    ...pick(change.followUp?.baselineObservationIds ?? []),
    ...pick(change.followUp?.followUpObservationIds ?? []),
  ];
  const sessionIds = new Set(cited.map((o) => o.sessionId));
  const sessions = store.sessions.filter((s) => sessionIds.has(s.id));
  const questionIds = new Set(cited.map((o) => o.questionId));
  const evidenceByType: Record<EvidenceType, number> = {
    past_behaviour: 0,
    observed_task: 0,
    opinion_on_proposal: 0,
  };
  for (const observation of supporting) evidenceByType[observation.evidenceType] += 1;
  const verified = new Set(change.delivery.release?.criteriaVerified ?? []);

  const view: Omit<ChangeView, "missingObservations"> = {
    change,
    problem,
    questions: store.researchQuestions.filter((q) => questionIds.has(q.id)),
    sessions,
    supporting,
    contradicting,
    evidenceByType,
    participants: new Set(sessions.map((s) => s.participantCode)).size,
    deliveryStatus: change.delivery.status,
    outcomeStatus: outcomeStatus(change),
    followUpState: followUpState(change, asOf),
    comparison: compare(change, store),
    unverifiedCriteria: change.delivery.release
      ? change.acceptanceCriteria.filter((c) => !verified.has(c.id)).map((c) => c.text)
      : [],
  };
  return { ...view, missingObservations: missingObservations(view) };
}

export const viewChanges = (store: EvidenceStore, asOf = REVIEW_AS_OF): ChangeView[] =>
  store.changes.map((change) => viewChange(change, store, asOf));

export interface LoopSummary {
  changes: number;
  byDelivery: Record<DeliveryStatus, number>;
  byOutcome: Record<OutcomeStatus, number>;
  followUpsOverdue: number;
}

export function summarizeLoop(views: ChangeView[]): LoopSummary {
  const byDelivery: Record<DeliveryStatus, number> = {
    not_started: 0,
    in_progress: 0,
    released: 0,
    deferred: 0,
    rejected: 0,
  };
  const byOutcome: Record<OutcomeStatus, number> = {
    supported: 0,
    contradicted: 0,
    inconclusive: 0,
    awaiting_evidence: 0,
    not_applicable: 0,
  };
  for (const view of views) {
    byDelivery[view.deliveryStatus] += 1;
    byOutcome[view.outcomeStatus] += 1;
  }
  return {
    changes: views.length,
    byDelivery,
    byOutcome,
    followUpsOverdue: views.filter((v) => v.followUpState.state === "overdue").length,
  };
}

export const changesForFeedbackItem = (views: ChangeView[], feedbackItemId: string): ChangeView[] =>
  views.filter((view) => view.problem.feedbackItemIds.includes(feedbackItemId));

export const changesForAccount = (views: ChangeView[], accountId: string): ChangeView[] =>
  views.filter((view) => view.problem.accountIds.includes(accountId));
