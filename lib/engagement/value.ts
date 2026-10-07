import { formatDate } from "./as-of";
import type { PhaseMeasurement, TaskObservation, ValueMeasurement } from "./schema";

/** Fewer timed, accepted results than this per phase and the medians are not compared. */
export const MIN_SAMPLE = 10;
/** Smaller time differences than this are treated as no change. */
export const MIN_TIME_IMPROVEMENT = 0.1;

export const COMPONENT_SUM_LABEL =
  "Sum of component medians (not an observed median of task totals)";

type Components = { producing: number | null; humanReview: number | null; correction: number | null };

export interface PhaseSummary {
  label: string;
  window: string;
  basis: PhaseMeasurement["basis"];
  /** Distinct attempts started, failed ones included. `null` when only a summary exists. */
  attempts: number | null;
  /** Attempts that reached an accepted result. For a summary: the sampled results. */
  accepted: number;
  abandoned: number | null;
  rejected: number | null;
  acceptanceRate: number | null;
  duplicatesIgnored: number;
  /** Accepted results with production, review and correction all recorded. */
  timedResults: number;
  smallSample: boolean;
  /** Median of each accepted task's own total. `null` for a component summary. */
  medianActiveMinutes: number | null;
  componentMedians: Components;
  /** Only for a component summary, and only ever shown under COMPONENT_SUM_LABEL. */
  componentMedianSum: number | null;
  medianWaitingMinutes: number | null;
  medianElapsedMinutes: number | null;
  elapsedKnown: number;
  /** All active minutes, failed attempts included, divided by accepted results. */
  activeMinutesPerAcceptedResult: number | null;
  qualityFailures: number | null;
  qualityChecked: number;
  qualityFailureRate: number | null;
  reworkedResults: number | null;
  reworkKnown: number;
  reworkRate: number | null;
}

export interface FinancialIllustration {
  status: "illustrated" | "not_calculated";
  annualValueEur: number | null;
  formula: string | null;
  assumptions: string[];
  reason: string | null;
}

export interface ValueAssessment {
  measurement: ValueMeasurement;
  baseline: PhaseSummary;
  followUp: PhaseSummary | null;
  observedChangeMinutes: number | null;
  observedChangeRatio: number | null;
  /** Effort per accepted result. Reported apart from quality so one cannot hide the other. */
  productivity: "improved" | "not_improved" | "unknown";
  quality: "not_worse" | "worse" | "unknown";
  verdict: "demonstrated" | "not_demonstrated" | "unknown";
  observed: string[];
  reasons: string[];
  missingEvidence: string[];
  caveats: string[];
  attribution: {
    status: "not_established" | "supported_by_comparison";
    statement: string;
    confounders: string[];
  };
  financial: FinancialIllustration;
}

const share = (part: number | null, whole: number | null): number | null =>
  part === null || whole === null || whole === 0 ? null : part / whole;

const pct = (value: number) => `${Math.round(value * 100)}%`;

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const known = (values: (number | null)[]): number[] =>
  values.filter((value): value is number => value !== null);

/** A task's own total. `null` unless production, review and correction are all recorded. */
export function taskActiveMinutes(task: TaskObservation): number | null {
  const { producing, humanReview, correction } = task.activeMinutes;
  return producing === null || humanReview === null || correction === null
    ? null
    : producing + humanReview + correction;
}

function summarizeTasks(
  phase: Extract<PhaseMeasurement, { basis: "task_observations" }>,
): Omit<PhaseSummary, "label" | "window"> {
  // The same attempt recorded twice would count twice in every denominator.
  const seen = new Set<string>();
  const tasks = phase.tasks.filter((task) => (seen.has(task.id) ? false : seen.add(task.id)));
  const accepted = tasks.filter((task) => task.status === "accepted");
  const totals = known(accepted.map(taskActiveMinutes));
  const quality = accepted.filter((task) => task.qualityFailure !== null);
  const rework = accepted.filter((task) => task.reworked !== null);
  const elapsed = known(accepted.map((task) => task.elapsedMinutes));
  // Effort on failed attempts is still effort. Partly recorded tasks count what is recorded.
  const allActive = tasks.reduce(
    (sum, task) =>
      sum + known([task.activeMinutes.producing, task.activeMinutes.humanReview, task.activeMinutes.correction]).reduce((a, b) => a + b, 0),
    0,
  );
  const qualityFailures = quality.filter((task) => task.qualityFailure).length;
  const reworkedResults = rework.filter((task) => task.reworked).length;
  return {
    basis: "task_observations",
    attempts: tasks.length,
    accepted: accepted.length,
    abandoned: tasks.filter((task) => task.status === "abandoned").length,
    rejected: tasks.filter((task) => task.status === "rejected").length,
    acceptanceRate: share(accepted.length, tasks.length),
    duplicatesIgnored: phase.tasks.length - tasks.length,
    timedResults: totals.length,
    smallSample: totals.length < MIN_SAMPLE,
    medianActiveMinutes: median(totals),
    componentMedians: {
      producing: median(known(accepted.map((task) => task.activeMinutes.producing))),
      humanReview: median(known(accepted.map((task) => task.activeMinutes.humanReview))),
      correction: median(known(accepted.map((task) => task.activeMinutes.correction))),
    },
    componentMedianSum: null,
    medianWaitingMinutes: median(known(accepted.map((task) => task.waitingMinutes))),
    medianElapsedMinutes: median(elapsed),
    elapsedKnown: elapsed.length,
    activeMinutesPerAcceptedResult:
      accepted.length === 0 ? null : Math.round(allActive / accepted.length),
    qualityFailures: quality.length === 0 ? null : qualityFailures,
    qualityChecked: quality.length,
    qualityFailureRate: share(qualityFailures, quality.length),
    reworkedResults: rework.length === 0 ? null : reworkedResults,
    reworkKnown: rework.length,
    reworkRate: share(reworkedResults, rework.length),
  };
}

function summarizeComponents(
  phase: Extract<PhaseMeasurement, { basis: "component_summary" }>,
): Omit<PhaseSummary, "label" | "window"> {
  const { producing, humanReview, correction } = phase.medianMinutes;
  return {
    basis: "component_summary",
    attempts: null,
    accepted: phase.sampleSize,
    abandoned: null,
    rejected: null,
    acceptanceRate: null,
    duplicatesIgnored: 0,
    timedResults: phase.sampleSize,
    smallSample: phase.sampleSize < MIN_SAMPLE,
    medianActiveMinutes: null,
    componentMedians: phase.medianMinutes,
    componentMedianSum:
      producing === null || humanReview === null || correction === null
        ? null
        : producing + humanReview + correction,
    medianWaitingMinutes: null,
    medianElapsedMinutes: null,
    elapsedKnown: 0,
    activeMinutesPerAcceptedResult: null,
    qualityFailures: phase.qualityFailures,
    qualityChecked: phase.qualityFailures === null ? 0 : phase.sampleSize,
    qualityFailureRate: share(phase.qualityFailures, phase.sampleSize),
    reworkedResults: phase.reworkedResults,
    reworkKnown: phase.reworkedResults === null ? 0 : phase.sampleSize,
    reworkRate: share(phase.reworkedResults, phase.sampleSize),
  };
}

export function summarizePhase(phase: PhaseMeasurement): PhaseSummary {
  return {
    label: phase.label,
    window: `${formatDate(phase.periodStart)} to ${formatDate(phase.periodEnd)}`,
    ...(phase.basis === "task_observations" ? summarizeTasks(phase) : summarizeComponents(phase)),
  };
}

function financialIllustration(
  measurement: ValueMeasurement,
  verdict: ValueAssessment["verdict"],
  savedMinutes: number | null,
): FinancialIllustration {
  const none = (reason: string): FinancialIllustration => ({
    status: "not_calculated",
    annualValueEur: null,
    formula: null,
    assumptions: [],
    reason,
  });
  if (verdict !== "demonstrated" || savedMinutes === null) {
    return none("No financial figure is calculated unless an improvement in time and quality was observed.");
  }
  const inputs = measurement.financialAssumptions;
  if (!inputs) return none("No cost and volume assumptions are recorded for this workflow.");

  const annualValueEur =
    Math.round(((savedMinutes / 60) * inputs.annualResults * inputs.hourlyCostEur) / 100) * 100;
  return {
    status: "illustrated",
    annualValueEur,
    formula: `${savedMinutes} minutes ÷ 60 × ${inputs.annualResults} results per year × EUR ${inputs.hourlyCostEur} per hour, rounded to the nearest EUR 100`,
    assumptions: [
      `Hourly cost: EUR ${inputs.hourlyCostEur}. ${inputs.hourlyCostBasis}`,
      `Volume: ${inputs.annualResults} results per year. ${inputs.annualResultsBasis}`,
      "The observed difference in median active time per accepted result persists for a full year.",
      "The difference is caused by the workflow change. This is not established (see attribution).",
      "Freed time is redeployed to work of the same hourly value.",
    ],
    reason: null,
  };
}

const attemptsText = (phase: PhaseSummary) =>
  `${phase.accepted} of ${phase.attempts} attempts (${pct(phase.acceptanceRate as number)})`;

/** What is missing or weak in one phase. Mutates the two lists it is given. */
function phaseGaps(phase: PhaseSummary, missingEvidence: string[], caveats: string[]) {
  if (phase.basis === "component_summary") {
    missingEvidence.push(
      `${phase.label}: per-task observations. Only one median per component is recorded, so a median of task totals cannot be computed.`,
    );
    caveats.push(
      `${phase.label}: abandoned and rejected attempts were not captured, so the share of attempts that reached an accepted result is unknown.`,
    );
  } else {
    if (phase.duplicatesIgnored > 0) {
      caveats.push(`${phase.label}: ${phase.duplicatesIgnored} duplicate task record(s) ignored.`);
    }
    const untimed = phase.accepted - phase.timedResults;
    if (untimed > 0) {
      caveats.push(
        `${phase.label}: ${untimed} of ${phase.accepted} accepted results have no complete time record and are left out of the median.`,
      );
    }
    if (phase.medianActiveMinutes === null) {
      missingEvidence.push(`${phase.label}: production, review and correction minutes per task`);
    }
    if (phase.elapsedKnown < phase.accepted) {
      caveats.push(
        `${phase.label}: elapsed and waiting time recorded for ${phase.elapsedKnown} of ${phase.accepted} accepted results.`,
      );
    }
    if (phase.qualityChecked > 0 && phase.qualityChecked < phase.accepted) {
      caveats.push(
        `${phase.label}: quality checked on ${phase.qualityChecked} of ${phase.accepted} accepted results.`,
      );
    }
  }
  if (phase.qualityFailureRate === null) missingEvidence.push(`${phase.label}: quality failures`);
  if (phase.reworkRate === null) caveats.push(`${phase.label}: rework was not captured.`);
  if (phase.smallSample) {
    missingEvidence.push(
      `${phase.label}: at least ${MIN_SAMPLE} timed, accepted results (only ${phase.timedResults} sampled)`,
    );
  }
}

export function assessValue(measurement: ValueMeasurement): ValueAssessment {
  const baseline = summarizePhase(measurement.baseline);
  const followUp = measurement.followUp ? summarizePhase(measurement.followUp) : null;

  const observed: string[] = [];
  const reasons: string[] = [];
  const missingEvidence: string[] = [];
  const caveats: string[] = [];

  let observedChangeMinutes: number | null = null;
  let observedChangeRatio: number | null = null;
  let productivity: ValueAssessment["productivity"] = "unknown";
  let quality: ValueAssessment["quality"] = "unknown";
  let verdict: ValueAssessment["verdict"] = "unknown";

  if (!followUp) {
    missingEvidence.push("Follow-up measurement of time to an acceptable result");
  } else {
    phaseGaps(baseline, missingEvidence, caveats);
    phaseGaps(followUp, missingEvidence, caveats);

    const before = baseline.medianActiveMinutes;
    const after = followUp.medianActiveMinutes;
    if (before !== null && after !== null) {
      observedChangeMinutes = after - before;
      observedChangeRatio = before > 0 ? observedChangeMinutes / before : null;
      observed.push(
        `Median active time per accepted result, with production, review and correction summed per task: ${before} minutes (${baseline.timedResults} results) before, ${after} minutes (${followUp.timedResults} results) after.`,
      );
    } else if (baseline.componentMedianSum !== null && followUp.componentMedianSum !== null) {
      observed.push(
        `${COMPONENT_SUM_LABEL}: ${baseline.componentMedianSum} minutes (${baseline.accepted} results) before, ${followUp.componentMedianSum} minutes (${followUp.accepted} results) after. Indicative only.`,
      );
    }
    if (baseline.acceptanceRate !== null && followUp.acceptanceRate !== null) {
      observed.push(
        `Attempts that reached an accepted result: ${attemptsText(baseline)} before, ${attemptsText(followUp)} after. The rest were abandoned or rejected.`,
      );
    }
    if (
      baseline.activeMinutesPerAcceptedResult !== null &&
      followUp.activeMinutesPerAcceptedResult !== null
    ) {
      observed.push(
        `Active minutes per accepted result, effort on failed attempts included: ${baseline.activeMinutesPerAcceptedResult} before, ${followUp.activeMinutesPerAcceptedResult} after.`,
      );
    }
    if (baseline.medianElapsedMinutes !== null && followUp.medianElapsedMinutes !== null) {
      observed.push(
        `Median elapsed time, waiting included: ${baseline.medianElapsedMinutes} minutes before, ${followUp.medianElapsedMinutes} minutes after. Waiting is not effort and does not enter the verdict.`,
      );
    }
    if (baseline.qualityFailureRate !== null && followUp.qualityFailureRate !== null) {
      observed.push(
        `Quality failures: ${baseline.qualityFailures} of ${baseline.qualityChecked} (${pct(baseline.qualityFailureRate)}) before, ${followUp.qualityFailures} of ${followUp.qualityChecked} (${pct(followUp.qualityFailureRate)}) after.`,
      );
    }
    if (baseline.reworkRate !== null && followUp.reworkRate !== null) {
      observed.push(
        `Rework: ${baseline.reworkedResults} of ${baseline.reworkKnown} (${pct(baseline.reworkRate)}) before, ${followUp.reworkedResults} of ${followUp.reworkKnown} (${pct(followUp.reworkRate)}) after.`,
      );
    }

    if (missingEvidence.length === 0 && observedChangeRatio !== null) {
      const faster = observedChangeRatio <= -MIN_TIME_IMPROVEMENT;
      const acceptanceHeld =
        (followUp.acceptanceRate as number) >= (baseline.acceptanceRate as number);
      const failuresNotWorse =
        (followUp.qualityFailureRate as number) <= (baseline.qualityFailureRate as number);
      const reworkNotWorse =
        baseline.reworkRate === null ||
        followUp.reworkRate === null ||
        followUp.reworkRate <= baseline.reworkRate;
      if (!faster) {
        reasons.push(
          `Time to an acceptable result did not fall by at least ${pct(MIN_TIME_IMPROVEMENT)}.`,
        );
      }
      if (!acceptanceHeld) reasons.push("A smaller share of attempts reached an accepted result.");
      if (!failuresNotWorse) reasons.push("The quality-failure rate rose.");
      if (!reworkNotWorse) reasons.push("The rework rate rose.");
      productivity = faster && acceptanceHeld ? "improved" : "not_improved";
      quality = failuresNotWorse && reworkNotWorse ? "not_worse" : "worse";
      verdict = reasons.length === 0 ? "demonstrated" : "not_demonstrated";
      if (verdict === "demonstrated") {
        reasons.push(
          "Time fell, at least as many attempts were accepted, and neither quality failures nor rework increased.",
        );
      }
    }
  }

  if (measurement.preToolEstimate) {
    caveats.push(
      `Reference without the tool: ${measurement.preToolEstimate.minutes} minutes. ${measurement.preToolEstimate.basis}`,
    );
  }

  const comparison = measurement.comparisonGroup;
  const attribution: ValueAssessment["attribution"] = comparison
    ? {
        status: "supported_by_comparison",
        statement: `A comparison group supports a causal reading: ${comparison.description}`,
        confounders: measurement.concurrentChanges,
      }
    : {
        status: "not_established",
        statement:
          "This is a before-and-after observation without a comparison group. That the intervention caused the change is an assumption, not a finding.",
        confounders: measurement.concurrentChanges,
      };

  return {
    measurement,
    baseline,
    followUp,
    observedChangeMinutes,
    observedChangeRatio,
    productivity,
    quality,
    verdict,
    observed,
    reasons,
    missingEvidence,
    caveats,
    attribution,
    financial: financialIllustration(
      measurement,
      verdict,
      observedChangeMinutes === null ? null : -observedChangeMinutes,
    ),
  };
}
