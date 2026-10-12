import { getAccounts, getBlockers, getFeedback } from "../data";
import type { Account, Blocker } from "../schema";
import { REVIEW_AS_OF } from "./as-of";
import { caveatLabel, seriesMetrics, sustainedUse, type SustainedUse } from "./adoption-trend";
import { checkDeliveryCapacity, type CapacityCheck } from "./capacity";
import {
  getAdoptionSeries,
  getEngagement,
  getEngagements,
  getTeam,
  getValueMeasurements,
} from "./data";
import type { Engagement } from "./schema";
import { assessValue, type ValueAssessment } from "./value";

export type CriterionStatus = "met" | "not_met" | "unknown";
export type CriterionKey =
  | "demonstrated_workflow_value"
  | "sustained_use"
  | "unresolved_blockers"
  | "customer_demand"
  | "sponsor_support"
  | "delivery_capacity";

export const criterionLabel: Record<CriterionKey, string> = {
  demonstrated_workflow_value: "Demonstrated workflow value",
  sustained_use: "Sustained use",
  unresolved_blockers: "No unresolved blocker in the way",
  customer_demand: "Customer demand",
  sponsor_support: "Sponsor support",
  delivery_capacity: "Delivery capacity",
};

export interface Criterion {
  key: CriterionKey;
  label: string;
  status: CriterionStatus;
  evidence: string[];
  missing: string[];
  caveats: string[];
}

export type Recommendation = "expand" | "continue" | "adjust" | "pause";

export const recommendationLabel: Record<Recommendation, string> = {
  expand: "Expand",
  continue: "Continue",
  adjust: "Adjust",
  pause: "Pause",
};

export const recommendationMeaning: Record<Recommendation, string> = {
  expand: "Put the bounded expansion forward for decision.",
  continue: "Continue the current programme and collect the missing evidence. No expansion proposal yet.",
  adjust: "Change the programme before further investment. No expansion proposal.",
  pause: "Pause further rollout and any expansion conversation until the named precondition is restored.",
};

export interface ExpansionInput {
  account: Account;
  engagement: Engagement;
  blockers: Blocker[];
  value: ValueAssessment | null;
  sustained: SustainedUse | null;
  capacity: CapacityCheck;
  feedback: { sharedWithProduct: number; total: number };
}

export interface ExpansionAssessment {
  accountId: string;
  proposedScope: string | null;
  criteria: Criterion[];
  counts: Record<CriterionStatus, number>;
  recommendation: Recommendation;
  reasoning: string[];
  supportingEvidence: string[];
  missingEvidence: string[];
  caveats: string[];
  feedbackNote: string;
  decisionOwner: string;
  humanDecisionRequired: true;
}

/**
 * The decision rule, in order:
 * 1. expand  - all six criteria are met.
 * 2. pause   - sponsor support is not met.
 * 3. adjust  - value, sustained use or the blocker criterion is not met.
 * 4. continue - nothing above failed, but demand or capacity is not met or evidence is missing.
 * Unknown evidence can never produce "expand".
 */
export function decideRecommendation(
  criteria: Pick<Criterion, "key" | "status">[],
): Recommendation {
  const notMet = new Set(criteria.filter((c) => c.status === "not_met").map((c) => c.key));
  if (criteria.every((c) => c.status === "met")) return "expand";
  if (notMet.has("sponsor_support")) return "pause";
  if (
    notMet.has("demonstrated_workflow_value") ||
    notMet.has("sustained_use") ||
    notMet.has("unresolved_blockers")
  ) {
    return "adjust";
  }
  return "continue";
}

function valueCriterion(value: ValueAssessment | null): Omit<Criterion, "key" | "label"> {
  if (!value) {
    return {
      status: "unknown",
      evidence: [],
      missing: ["Baseline and follow-up measurement of time to an acceptable result"],
      caveats: [],
    };
  }
  const status: CriterionStatus =
    value.verdict === "demonstrated"
      ? "met"
      : value.verdict === "not_demonstrated"
        ? "not_met"
        : "unknown";
  return {
    status,
    evidence: [...value.observed, ...value.reasons],
    missing: value.missingEvidence,
    caveats: [value.attribution.statement, ...value.attribution.confounders],
  };
}

function sustainedCriterion(sustained: SustainedUse | null): Omit<Criterion, "key" | "label"> {
  if (!sustained) {
    return {
      status: "unknown",
      evidence: [],
      missing: ["Period-by-period repeat use with eligible users as the denominator"],
      caveats: [],
    };
  }
  return {
    status: sustained.status,
    evidence: sustained.status === "unknown" ? [] : [sustained.detail],
    missing: sustained.missing,
    caveats: sustained.caveats.map((caveat) => caveatLabel[caveat]),
  };
}

function blockerCriterion(
  blockers: Blocker[],
  targetGroups: string[],
): Omit<Criterion, "key" | "label"> {
  const open = blockers.filter((blocker) => blocker.status !== "resolved");
  const describe = (blocker: Blocker) =>
    `${blocker.id}: ${blocker.category.replaceAll("_", " ")} (${blocker.severity}, ${blocker.affectedGroups.join(", ")})`;
  // High severity blocks anywhere; medium blocks only where the expansion would land.
  const blocking = open.filter(
    (blocker) =>
      blocker.severity === "high" ||
      (blocker.severity === "medium" &&
        blocker.affectedGroups.some((group) => targetGroups.includes(group))),
  );
  const remaining = open.filter((blocker) => !blocking.includes(blocker));
  if (blocking.length > 0) {
    return {
      status: "not_met",
      evidence: blocking.map((blocker) => `Open: ${describe(blocker)}`),
      missing: [],
      caveats: remaining.map((blocker) => `Also open: ${describe(blocker)}`),
    };
  }
  return {
    status: "met",
    evidence: [
      open.length === 0
        ? "No open blockers."
        : "No open high-severity blocker and none at medium severity in the target groups.",
    ],
    missing: [],
    caveats: remaining.map((blocker) => `Still open: ${describe(blocker)}`),
  };
}

function demandCriterion(demand: Engagement["demand"]): Omit<Criterion, "key" | "label"> {
  if (demand.status === "not_recorded" || !demand.evidence) {
    return {
      status: "unknown",
      evidence: [],
      missing: ["A recorded customer request for more scope or seats"],
      caveats: [],
    };
  }
  return {
    status: demand.status === "requested" ? "met" : "not_met",
    evidence: [demand.evidence],
    missing: [],
    caveats:
      demand.status === "requested"
        ? ["A request shows interest. It is not evidence that the workflow delivers value."]
        : [],
  };
}

function sponsorCriterion(sponsor: Engagement["sponsor"]): Omit<Criterion, "key" | "label"> {
  if (sponsor.status === "active" && sponsor.evidence) {
    return { status: "met", evidence: [sponsor.evidence], missing: [], caveats: [] };
  }
  if (sponsor.status === "disengaged") {
    return {
      status: "not_met",
      evidence: sponsor.evidence ? [sponsor.evidence] : [],
      missing: [],
      caveats: [],
    };
  }
  return {
    status: "unknown",
    evidence: sponsor.evidence ? [sponsor.evidence] : [],
    missing: [
      sponsor.status === "changed_unconfirmed"
        ? "Confirmation of the programme goals by the new sponsor"
        : "A recorded sponsor and the sponsor's current position",
    ],
    caveats: [],
  };
}

export function assessExpansion(input: ExpansionInput): ExpansionAssessment {
  const { engagement } = input;
  const parts: Record<CriterionKey, Omit<Criterion, "key" | "label">> = {
    demonstrated_workflow_value: valueCriterion(input.value),
    sustained_use: sustainedCriterion(input.sustained),
    unresolved_blockers: blockerCriterion(
      input.blockers,
      engagement.expansionCase?.targetGroups ?? [],
    ),
    customer_demand: demandCriterion(engagement.demand),
    sponsor_support: sponsorCriterion(engagement.sponsor),
    delivery_capacity: {
      status: input.capacity.status,
      evidence: input.capacity.status === "unknown" ? [] : [input.capacity.detail],
      missing: input.capacity.missing,
      caveats: [],
    },
  };
  const criteria = (Object.keys(parts) as CriterionKey[]).map((key) => ({
    key,
    label: criterionLabel[key],
    ...parts[key],
  }));
  const counts: Record<CriterionStatus, number> = { met: 0, not_met: 0, unknown: 0 };
  for (const criterion of criteria) counts[criterion.status] += 1;

  const recommendation = decideRecommendation(criteria);
  const reasoning = [
    recommendationMeaning[recommendation],
    ...criteria
      .filter((criterion) => criterion.status === "not_met")
      .map((criterion) => `Not met: ${criterion.label.toLowerCase()}.`),
    ...criteria
      .filter((criterion) => criterion.status === "unknown")
      .map((criterion) => `Unknown: ${criterion.label.toLowerCase()}.`),
  ];
  if (recommendation === "expand") {
    reasoning.push("All six criteria are met on the recorded evidence. The caveats below still apply.");
  }

  const { sharedWithProduct, total } = input.feedback;
  return {
    accountId: input.account.id,
    proposedScope: engagement.expansionCase?.proposedScope ?? null,
    criteria,
    counts,
    recommendation,
    reasoning,
    supportingEvidence: criteria
      .filter((criterion) => criterion.status === "met")
      .flatMap((criterion) => criterion.evidence.map((item) => `${criterion.label}: ${item}`)),
    missingEvidence: criteria.flatMap((criterion) =>
      criterion.missing.map((item) => `${criterion.label}: ${item}`),
    ),
    caveats: criteria.flatMap((criterion) =>
      criterion.caveats.map((item) => `${criterion.label}: ${item}`),
    ),
    feedbackNote: `${sharedWithProduct} of ${total} feedback items are routed to Product. Routing is a vendor process step and is not counted as customer value or as expansion evidence.`,
    decisionOwner: "Account owner with the manager; the customer decides on its side.",
    humanDecisionRequired: true,
  };
}

/** Value and usage evidence for the workflow the expansion would build on. */
export function expansionEvidenceFor(accountId: string, asOf = REVIEW_AS_OF) {
  const engagement = getEngagement(accountId);
  const measurements = getValueMeasurements().filter((m) => m.accountId === accountId);
  const allSeries = getAdoptionSeries().filter((s) => s.accountId === accountId);
  const workflowId =
    engagement?.expansionCase?.basedOnWorkflowId ??
    measurements[0]?.workflowId ??
    allSeries[0]?.workflowId;
  const measurement = measurements.find((m) => m.workflowId === workflowId);
  const series = allSeries.find((s) => s.workflowId === workflowId);
  return {
    value: measurement ? assessValue(measurement) : null,
    metrics: series ? seriesMetrics(series, asOf) : null,
  };
}

export function accountExpansion(accountId: string, asOf = REVIEW_AS_OF): ExpansionAssessment {
  const account = getAccounts().find((candidate) => candidate.id === accountId);
  const engagement = getEngagement(accountId);
  if (!account || !engagement) throw new Error(`no engagement record for ${accountId}`);
  const { value, metrics } = expansionEvidenceFor(accountId, asOf);
  const feedback = getFeedback().filter((item) => item.accountId === accountId);
  return assessExpansion({
    account,
    engagement,
    blockers: getBlockers().filter((blocker) => blocker.accountId === accountId),
    value,
    sustained: metrics ? sustainedUse(metrics) : null,
    capacity: checkDeliveryCapacity(engagement, getEngagements(), getTeam().specialists),
    feedback: {
      sharedWithProduct: feedback.filter((item) => item.status === "shared_with_product").length,
      total: feedback.length,
    },
  });
}
