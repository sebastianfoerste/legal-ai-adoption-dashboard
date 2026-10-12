import { getAccounts, getBlockers } from "../data";
import { REVIEW_AS_OF, formatDate } from "./as-of";
import {
  caveatLabel,
  formatRate,
  latestCompletePeriod,
  seriesMetrics,
  type Caveat,
  type SeriesMetrics,
} from "./adoption-trend";
import {
  ENGAGEMENT_SOURCE_FILES,
  getAdoptionSeries,
  getEngagement,
  getInterventions,
  getTeam,
  getValueMeasurements,
  specialistLabel,
} from "./data";
import {
  accountExpansion,
  recommendationLabel,
  type ExpansionAssessment,
} from "./expansion";
import {
  followUpStatus,
  interventionStage,
  outcomeStatement,
  stageLabel,
  type InterventionStage,
} from "./interventions";
import { openEscalations, overdueCommitments } from "./manager";
import { accountRenewalAid, reviewPriorityLabel, type RenewalAid } from "./renewal";
import type { Intervention, Objective } from "./schema";
import { assessValue, type ValueAssessment } from "./value";
import { evidenceSummary } from "../evidence/backlog";
import { EVIDENCE_SOURCE_FILE, getEvidenceStore } from "../evidence/data";
import {
  changesForAccount,
  decisionLabel,
  deliveryStatusLabel,
  outcomeStatusLabel,
  viewChanges,
  type ChangeView,
} from "../evidence/loop";

export const SYNTHETIC_NOTICE =
  "SYNTHETIC SCENARIO. The account, people and figures are invented for demonstration. No real client data, no document contents, no vendor integration. Not legal advice.";

export const REVIEW_GATE =
  "Draft for account-owner review. Nothing in this report is sent, booked or changed in another system.";

export interface ObjectiveResult {
  objective: Objective;
  status: "met" | "not_met" | "unknown";
  observed: string;
}

export interface ReviewIntervention {
  intervention: Intervention;
  stage: InterventionStage;
  statement: string;
  owner: string;
  followUp: string;
}

export interface ReviewOwner {
  item: string;
  owner: string;
  date: string;
}

export interface CustomerReview {
  schema: "legal-ai-adoption.customer-review.v1";
  synthetic: true;
  syntheticNotice: string;
  accountId: string;
  accountName: string;
  asOf: string;
  scenario: { label: string; summary: string } | null;
  objectives: ObjectiveResult[];
  adoption: SeriesMetrics[];
  interventions: ReviewIntervention[];
  quality: ValueAssessment[];
  unresolved: string[];
  evidenceGaps: string[];
  /** Changes recorded against problems this account raised, with their evidence and status. */
  productEvidence: ChangeView[];
  expansion: ExpansionAssessment;
  renewal: RenewalAid;
  owners: ReviewOwner[];
  nextReviewDate: string;
  generatedFrom: string[];
  reviewGate: string;
  externalActionAllowed: false;
  markdown: string;
}

function evaluateObjective(
  objective: Objective,
  adoption: SeriesMetrics[],
  quality: ValueAssessment[],
): ObjectiveResult {
  const metrics = adoption.find((m) => m.series.workflowId === objective.workflowId);
  const period = metrics ? latestCompletePeriod(metrics) : undefined;
  const followUp = quality.find((v) => v.measurement.workflowId === objective.workflowId)?.followUp;
  const unknown = (what: string): ObjectiveResult => ({
    objective,
    status: "unknown",
    observed: `Unknown: ${what} not captured.`,
  });
  const result = (met: boolean, observed: string): ObjectiveResult => ({
    objective,
    status: met ? "met" : "not_met",
    observed,
  });

  switch (objective.metric) {
    case "repeat_users_min": {
      const repeat = period?.repeatUse;
      if (!period || !repeat || repeat.numerator === null) return unknown("repeat users");
      return result(
        repeat.numerator >= objective.target,
        `${formatRate(repeat)} eligible users in ${period.label}.`,
      );
    }
    case "completion_rate_min": {
      const completion = period?.completion;
      if (!period || !completion || completion.value === null) return unknown("completed workflows");
      return result(
        completion.value >= objective.target,
        `${formatRate(completion)} started workflows completed in ${period.label}.`,
      );
    }
    case "median_minutes_max": {
      // A sum of component medians is not a median, so a summary-only phase stays unknown.
      if (!followUp || followUp.medianActiveMinutes === null) {
        return unknown("per-task follow-up time measurement");
      }
      return result(
        followUp.medianActiveMinutes <= objective.target,
        `Median ${followUp.medianActiveMinutes} active minutes per accepted result (${followUp.timedResults} results, ${followUp.window}).`,
      );
    }
    case "quality_failure_rate_max": {
      if (!followUp || followUp.qualityFailureRate === null) return unknown("quality failures");
      return result(
        followUp.qualityFailureRate <= objective.target,
        `${followUp.qualityFailures} of ${followUp.qualityChecked} checked results (${Math.round(followUp.qualityFailureRate * 100)}%).`,
      );
    }
  }
}

function describeFollowUp(intervention: Intervention, asOf: string): string {
  const status = followUpStatus(intervention, asOf);
  switch (status.state) {
    case "done":
      return "Evaluated.";
    case "not_scheduled":
      return "No follow-up date set.";
    case "scheduled":
      return `Follow-up due ${formatDate(status.dueOn)}.`;
    case "overdue":
      return `Follow-up overdue by ${status.daysOverdue} days (due ${formatDate(status.dueOn)}).`;
  }
}

export function buildCustomerReview(accountId: string, asOf = REVIEW_AS_OF): CustomerReview | null {
  const account = getAccounts().find((candidate) => candidate.id === accountId);
  const engagement = getEngagement(accountId);
  if (!account || !engagement) return null;

  const adoption = getAdoptionSeries()
    .filter((series) => series.accountId === accountId)
    .map((series) => seriesMetrics(series, asOf));
  const quality = getValueMeasurements()
    .filter((measurement) => measurement.accountId === accountId)
    .map(assessValue);
  const objectives = engagement.objectives.map((objective) =>
    evaluateObjective(objective, adoption, quality),
  );
  const interventions: ReviewIntervention[] = getInterventions()
    .filter((intervention) => intervention.accountId === accountId)
    .map((intervention) => ({
      intervention,
      stage: interventionStage(intervention),
      statement: outcomeStatement(intervention),
      owner: specialistLabel(intervention.assignedSpecialistId),
      followUp: describeFollowUp(intervention, asOf),
    }));
  const productEvidence = changesForAccount(viewChanges(getEvidenceStore(), asOf), accountId);
  const expansion = accountExpansion(accountId, asOf);
  const renewal = accountRenewalAid(accountId, asOf);
  const overdue = overdueCommitments(asOf).filter((c) => c.accountId === accountId);
  const escalations = openEscalations().filter((e) => e.accountId === accountId);
  const openBlockers = getBlockers().filter(
    (blocker) => blocker.accountId === accountId && blocker.status !== "resolved",
  );

  const unresolved = [
    ...openBlockers.map(
      (blocker) =>
        `Open blocker ${blocker.id}: ${blocker.category.replaceAll("_", " ")}, ${blocker.severity} severity, ${blocker.affectedGroups.join(" and ")}.`,
    ),
    ...objectives
      .filter((result) => result.status === "not_met")
      .map((result) => `Objective not met: ${result.objective.statement} Observed: ${result.observed}`),
    ...interventions
      .filter((item) => item.intervention.outcome?.result === "not_achieved")
      .map((item) => `Intervention ${item.intervention.id} did not achieve its expected result: ${item.intervention.outcome?.rationale}`),
    ...overdue.map(
      (commitment) =>
        `Commitment ${commitment.id} is ${commitment.daysOverdue} days overdue (${commitment.ownerLabel}): ${commitment.description}`,
    ),
    ...escalations.map(
      (escalation) => `Escalation ${escalation.id} is open: ${escalation.topic}`,
    ),
  ];

  const evidenceGaps = [
    ...(adoption.length === 0
      ? ["No period-by-period adoption series is recorded for this account."]
      : []),
    ...adoption.flatMap((metrics) => metrics.series.dataNotes),
    ...(quality.length === 0
      ? ["No measurement of time to an acceptable result is recorded for this account."]
      : []),
    ...(engagement.objectives.length === 0 ? ["No measurable objectives are agreed with the customer."] : []),
    ...objectives.filter((result) => result.status === "unknown").map((result) => result.observed),
    ...interventions
      .filter((item) => item.stage === "completed")
      .map((item) => `Intervention ${item.intervention.id} is delivered but not evaluated.`),
    ...expansion.missingEvidence,
  ];

  const owners: ReviewOwner[] = [
    {
      item: "Next customer review",
      owner: `${specialistLabel(engagement.reviewOwnerId)} with ${engagement.customerOwnerRole}`,
      date: engagement.nextReviewDate,
    },
    ...interventions
      .filter((item) => item.stage !== "evaluated")
      .map((item) => ({
        item: `Intervention ${item.intervention.id}: ${item.stage === "proposed" ? "decide and start" : "follow-up observation"}`,
        owner: item.owner,
        date: item.intervention.dates.followUpDueOn ?? item.intervention.expectedResult.byDate,
      })),
    ...getTeam()
      .commitments.filter((c) => c.accountId === accountId && c.status === "open")
      .map((commitment) => ({
        item: `Commitment ${commitment.id}: ${commitment.description}`,
        owner: commitment.ownerLabel,
        date: commitment.dueOn,
      })),
    ...escalations.map((escalation) => ({
      item: `Escalation ${escalation.id}: ${escalation.decisionNeeded}`,
      owner: escalation.decisionOwner,
      date: escalation.dueOn,
    })),
  ];

  const review: Omit<CustomerReview, "markdown"> = {
    schema: "legal-ai-adoption.customer-review.v1",
    synthetic: true,
    syntheticNotice: SYNTHETIC_NOTICE,
    accountId,
    accountName: account.name,
    asOf,
    scenario: engagement.scenario,
    objectives,
    adoption,
    interventions,
    quality,
    unresolved,
    evidenceGaps,
    productEvidence,
    expansion,
    renewal,
    owners,
    nextReviewDate: engagement.nextReviewDate,
    generatedFrom: [
      "data/accounts.json",
      "data/blockers.json",
      ...ENGAGEMENT_SOURCE_FILES,
      EVIDENCE_SOURCE_FILE,
    ],
    reviewGate: REVIEW_GATE,
    externalActionAllowed: false,
  };
  return { ...review, markdown: renderCustomerReviewMarkdown(review) };
}

const bullets = (items: string[], empty: string) =>
  items.length > 0 ? items.map((item) => `- ${item}`) : [`- ${empty}`];

const cell = (text: string, caveats: Caveat[] = []) =>
  caveats.length > 0 ? `${text} [${caveats.map((c) => c.replaceAll("_", " ")).join(", ")}]` : text;

export function renderCustomerReviewMarkdown(review: Omit<CustomerReview, "markdown">): string {
  const lines: string[] = [
    `# Synthetic customer review: ${review.accountName}`,
    "",
    `> ${review.syntheticNotice}`,
    "",
    `As of ${formatDate(review.asOf)}. Next review: ${formatDate(review.nextReviewDate)}.`,
    "",
  ];
  if (review.scenario) lines.push(`**${review.scenario.label}.** ${review.scenario.summary}`, "");

  lines.push("## 1. Objectives", "");
  if (review.objectives.length === 0) {
    lines.push("- No measurable objectives are agreed with the customer.", "");
  } else {
    lines.push("| Objective | Status | Observed |", "| --- | --- | --- |");
    for (const result of review.objectives) {
      lines.push(
        `| ${result.objective.statement} | ${result.status.replace("_", " ")} | ${result.observed} |`,
      );
    }
    lines.push("");
  }

  lines.push("## 2. Adoption trends", "");
  if (review.adoption.length === 0) {
    lines.push("- Unknown: no period-by-period adoption series is recorded.", "");
  }
  for (const metrics of review.adoption) {
    const cohort = metrics.series.trainingCohort;
    lines.push(
      `### ${metrics.series.workflowName} (${metrics.series.practiceGroup})`,
      "",
      "Four-week reporting periods. Activation and repeat use: share of eligible users. Completion: share of started workflows. Drop-off: share of the training cohort with no run in the period." +
        (cohort ? ` Training cohort: ${cohort.size} users, trained ${formatDate(cohort.trainedOn)}.` : ""),
      "",
      "| Period | Licensed | Eligible | Active | Activation | Repeat use | Completed | Drop-off after training |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
    );
    for (const period of metrics.periods) {
      const n = (value: number | null) => (value === null ? "Unknown" : String(value));
      lines.push(
        `| ${period.label}${period.complete ? "" : " (incomplete)"} | ${n(period.licensedUsers)} | ${n(period.eligibleUsers)} | ${n(period.activeUsers)} | ${cell(formatRate(period.activation), period.activation.caveats)} | ${cell(formatRate(period.repeatUse), period.repeatUse.caveats)} | ${cell(formatRate(period.completion), period.completion.caveats)} | ${cell(formatRate(period.dropOffAfterTraining), period.dropOffAfterTraining.caveats)} |`,
      );
    }
    const caveats = [
      ...new Set(
        metrics.periods.flatMap((p) => [
          ...p.activation.caveats,
          ...p.repeatUse.caveats,
          ...p.completion.caveats,
          ...p.dropOffAfterTraining.caveats,
        ]),
      ),
    ];
    lines.push("", ...caveats.map((c) => `- ${caveatLabel[c]}`), ...metrics.series.dataNotes.map((note) => `- Data note: ${note}`), "");
  }

  lines.push("## 3. Intervention outcomes", "");
  if (review.interventions.length === 0) lines.push("- No intervention is recorded.", "");
  for (const item of review.interventions) {
    const { intervention } = item;
    lines.push(
      `### ${intervention.id}: ${stageLabel[item.stage]}`,
      "",
      `- Affected: ${[intervention.practiceGroup, intervention.workflowId].filter(Boolean).join(", ")}`,
      `- Observed problem: ${intervention.observedProblem}`,
      `- Hypothesis: ${intervention.hypothesis}`,
      `- Action: ${intervention.action}`,
      `- Owner: ${item.owner}`,
      `- Expected result: ${intervention.expectedResult.target} by ${formatDate(intervention.expectedResult.byDate)}`,
      `- Status: ${item.statement}`,
      `- Follow-up: ${item.followUp}`,
    );
    if (intervention.outcome) {
      lines.push(
        `- Rationale: ${intervention.outcome.rationale}`,
        `- Confounders: ${intervention.outcome.confounders.join("; ") || "none recorded"}`,
      );
    }
    lines.push("");
  }

  lines.push("## 4. Quality evidence", "");
  if (review.quality.length === 0) {
    lines.push("- Unknown: no measurement of time to an acceptable result is recorded.", "");
  }
  for (const value of review.quality) {
    lines.push(
      `### ${value.measurement.workflowName}`,
      "",
      `Acceptable result: ${value.measurement.acceptableResultDefinition}`,
      "",
      "**Observed**",
      "",
      ...bullets(value.observed, "Nothing comparable observed yet."),
      "",
      ...value.missingEvidence.map((item) => `- Missing: ${item}`),
      "",
      `**Verdict:** value ${value.verdict.replace("_", " ")}. ${value.reasons.join(" ")}`,
      "",
      `Productivity: ${value.productivity.replace("_", " ")}. Quality: ${value.quality.replace("_", " ")}. The two are assessed separately.`,
      "",
      "**Assumption, not a finding**",
      "",
      `- ${value.attribution.statement}`,
      ...value.attribution.confounders.map((item) => `- Concurrent change: ${item}`),
      ...value.caveats.map((item) => `- ${item}`),
      "",
    );
    if (value.financial.status === "illustrated") {
      lines.push(
        `**Financial illustration (assumption-based):** about EUR ${value.financial.annualValueEur?.toLocaleString("en-GB")} per year.`,
        "",
        `- Formula: ${value.financial.formula}`,
        ...value.financial.assumptions.map((item) => `- Assumption: ${item}`),
        "",
      );
    } else {
      lines.push(`**Financial illustration:** not calculated. ${value.financial.reason}`, "");
    }
  }

  lines.push(
    "## 5. Unresolved problems",
    "",
    ...bullets(review.unresolved, "None recorded."),
    "",
    "**Evidence gaps**",
    "",
    ...bullets(review.evidenceGaps, "None recorded."),
    "",
    "### Product feedback and evidence",
    "",
    "A release is not an outcome. Routing an item to Product is not evidence of customer value and does not enter the recommendation below.",
    "",
    ...(review.productEvidence.length === 0
      ? ["- No change record is linked to this account's feedback. Delivery status and outcome are unknown.", ""]
      : review.productEvidence.flatMap((view) => [
          `- **${view.change.id} ${view.change.title}.** Decision: ${decisionLabel[view.change.decision.status].toLowerCase()}, confidence ${view.change.decision.confidence}. Delivery: ${deliveryStatusLabel[view.deliveryStatus].toLowerCase()}. Outcome: ${outcomeStatusLabel[view.outcomeStatus].toLowerCase()}. Owner: ${view.change.ownerRole}.`,
          `  - Evidence: ${evidenceSummary(view)}.`,
          `  - Missing observations: ${view.missingObservations.join(" ") || "none recorded."}`,
          `  - Next decision: ${view.change.nextDecision.question}`,
          "",
        ])),
    `## 6. Recommendation: ${recommendationLabel[review.expansion.recommendation].toUpperCase()}`,
    "",
    ...(review.expansion.proposedScope ? [`Scope under review: ${review.expansion.proposedScope}`, ""] : []),
    ...bullets(review.expansion.reasoning, ""),
    "",
    "| Criterion | Status |",
    "| --- | --- |",
    ...review.expansion.criteria.map(
      (criterion) => `| ${criterion.label} | ${criterion.status.replace("_", " ")} |`,
    ),
    "",
    "**Supporting evidence**",
    "",
    ...bullets(review.expansion.supportingEvidence, "None recorded."),
    "",
    "**Missing evidence**",
    "",
    ...bullets(review.expansion.missingEvidence, "None."),
    "",
    "**Caveats**",
    "",
    ...bullets(review.expansion.caveats, "None."),
    "",
    `- ${review.expansion.feedbackNote}`,
    `- Decision: ${review.expansion.decisionOwner}`,
    "",
    "### Renewal decision aid",
    "",
    `${reviewPriorityLabel[review.renewal.reviewPriority]}. Renewal date ${formatDate(review.renewal.renewalDate)}, in ${review.renewal.daysToRenewal} days. ${review.renewal.disclaimer}`,
    "",
    ...review.renewal.signals.map(
      (signal) => `- ${signal.label} (${signal.bearing}): ${signal.evidence}`,
    ),
    "",
    "## 7. Owners and next review dates",
    "",
    "| Item | Owner | Date |",
    "| --- | --- | --- |",
    ...review.owners.map((row) => `| ${row.item} | ${row.owner} | ${formatDate(row.date)} |`),
    "",
    `Sources: ${review.generatedFrom.join(", ")}.`,
    "",
    `${review.reviewGate} ${review.syntheticNotice}`,
    "",
  );
  return lines.join("\n");
}
