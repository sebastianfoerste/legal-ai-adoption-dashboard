import { REVIEW_AS_OF, daysBetween, formatDate } from "./as-of";
import type { AdoptionPeriod, AdoptionSeries } from "./schema";

/** Below this denominator a percentage moves by 10 points or more per person. */
export const SMALL_COHORT_THRESHOLD = 10;
export const SUSTAINED_USE_THRESHOLD = 0.5;
export const SUSTAINED_USE_PERIODS = 3;

export type Caveat = "small_cohort" | "incomplete_period" | "cohort_changed";

export const caveatLabel: Record<Caveat, string> = {
  small_cohort: `Small cohort: fewer than ${SMALL_COHORT_THRESHOLD} in the denominator; read the counts, not the percentage.`,
  incomplete_period: "Incomplete period: counts will still rise and are not comparable with complete periods.",
  cohort_changed:
    "Cohort changed: the number of eligible users differs from the previous period, so the two rates do not describe the same group.",
};

export interface Rate {
  numerator: number | null;
  denominator: number | null;
  /** `null` when either side is not captured or the denominator is zero. Never 0 by default. */
  value: number | null;
  caveats: Caveat[];
}

export function rate(
  numerator: number | null,
  denominator: number | null,
  periodComplete = true,
): Rate {
  const known = numerator !== null && denominator !== null && denominator > 0;
  const caveats: Caveat[] = [];
  if (known && denominator < SMALL_COHORT_THRESHOLD) caveats.push("small_cohort");
  if (known && !periodComplete) caveats.push("incomplete_period");
  return { numerator, denominator, value: known ? numerator / denominator : null, caveats };
}

export function formatRate(r: Rate): string {
  if (r.value === null) return "Unknown";
  return `${r.numerator} of ${r.denominator} (${Math.round(r.value * 100)}%)`;
}

export const METRIC_DEFINITIONS = {
  licensedUsers: "Users holding a seat in the practice group at the end of the period.",
  eligibleUsers:
    "Licensed users whose role includes this workflow. Seats held by people who never do the task are excluded.",
  activeUsers: "Eligible users with at least one run of this workflow in the period.",
  licenceUtilisation: "Active users divided by licensed users.",
  activation: "Active users divided by eligible users.",
  repeatUse:
    "Eligible users with runs in two or more distinct weeks of the period, divided by eligible users. Eligible users are the denominator so that the rate cannot rise while the active group shrinks.",
  completion:
    "Workflows that reached a reviewer-accepted result divided by workflows started in the period.",
  dropOffAfterTraining:
    "Members of the training cohort with no run in the period, divided by the size of the training cohort.",
  reportingPeriod:
    "Four-week periods, Monday to Sunday. A period counts as complete once its last day has passed on the as-of date.",
} as const;

export interface PeriodMetrics {
  start: string;
  end: string;
  label: string;
  phase: AdoptionPeriod["phase"];
  complete: boolean;
  licensedUsers: number | null;
  eligibleUsers: number | null;
  activeUsers: number | null;
  licenceUtilisation: Rate;
  activation: Rate;
  repeatUse: Rate;
  completion: Rate;
  dropOffAfterTraining: Rate;
}

export interface SeriesMetrics {
  series: AdoptionSeries;
  asOf: string;
  periods: PeriodMetrics[];
  unknownCells: number;
}

function periodMetrics(series: AdoptionSeries, period: AdoptionPeriod, asOf: string): PeriodMetrics {
  const complete = daysBetween(period.end, asOf) > 0;
  const cohort = series.trainingCohort;
  // Drop-off only exists for periods that end after the training date.
  const cohortApplies = cohort !== null && daysBetween(cohort.trainedOn, period.end) >= 0;
  const cohortInactive =
    cohortApplies && period.cohortActiveUsers !== null
      ? cohort.size - period.cohortActiveUsers
      : null;
  return {
    start: period.start,
    end: period.end,
    label: `${formatDate(period.start)} to ${formatDate(period.end)}`,
    phase: period.phase,
    complete,
    licensedUsers: period.licensedUsers,
    eligibleUsers: period.eligibleUsers,
    activeUsers: period.activeUsers,
    licenceUtilisation: rate(period.activeUsers, period.licensedUsers, complete),
    activation: rate(period.activeUsers, period.eligibleUsers, complete),
    repeatUse: rate(period.repeatUsers, period.eligibleUsers, complete),
    completion: rate(period.workflowsCompleted, period.workflowsStarted, complete),
    dropOffAfterTraining: rate(cohortInactive, cohortApplies ? cohort.size : null, complete),
  };
}

export function seriesMetrics(series: AdoptionSeries, asOf = REVIEW_AS_OF): SeriesMetrics {
  const periods = series.periods
    .filter((period) => daysBetween(period.start, asOf) >= 0) // drop periods that have not begun
    .map((period) => periodMetrics(series, period, asOf));
  // People joining or leaving the eligible group move a rate without any change in behaviour.
  periods.forEach((period, index) => {
    const previous = periods[index - 1];
    if (
      previous &&
      period.eligibleUsers !== null &&
      previous.eligibleUsers !== null &&
      period.eligibleUsers !== previous.eligibleUsers
    ) {
      for (const affected of [period.activation, period.repeatUse]) {
        if (affected.value !== null) affected.caveats.push("cohort_changed");
      }
    }
  });
  const unknownCells = periods.reduce(
    (sum, p) =>
      sum +
      [p.licenceUtilisation, p.activation, p.repeatUse, p.completion, p.dropOffAfterTraining].filter(
        (r) => r.value === null,
      ).length,
    0,
  );
  return { series, asOf, periods, unknownCells };
}

export const latestCompletePeriod = (metrics: SeriesMetrics): PeriodMetrics | undefined =>
  metrics.periods.filter((period) => period.complete).at(-1);

export interface SustainedUse {
  status: "met" | "not_met" | "unknown";
  detail: string;
  missing: string[];
  caveats: Caveat[];
}

/**
 * Sustained use: repeat-use rate at or above the threshold in each of the last three
 * complete periods. A period below the threshold decides the question; an unknown period
 * leaves it open. Incomplete periods are never counted.
 */
export function sustainedUse(metrics: SeriesMetrics): SustainedUse {
  const complete = metrics.periods.filter((period) => period.complete);
  const window = complete.slice(-SUSTAINED_USE_PERIODS);
  const caveats = [...new Set(window.flatMap((period) => period.repeatUse.caveats))];
  const describe = (period: PeriodMetrics) => `${formatRate(period.repeatUse)} in ${period.label}`;

  const below = window.filter(
    (period) => period.repeatUse.value !== null && period.repeatUse.value < SUSTAINED_USE_THRESHOLD,
  );
  if (below.length > 0) {
    return {
      status: "not_met",
      detail: `Repeat use below ${SUSTAINED_USE_THRESHOLD * 100}% of eligible users: ${below.map(describe).join("; ")}.`,
      missing: [],
      caveats,
    };
  }
  if (window.length < SUSTAINED_USE_PERIODS) {
    return {
      status: "unknown",
      detail: `Only ${window.length} complete reporting period(s); ${SUSTAINED_USE_PERIODS} are needed.`,
      missing: [`${SUSTAINED_USE_PERIODS - window.length} further complete reporting period(s)`],
      caveats,
    };
  }
  const unknown = window.filter((period) => period.repeatUse.value === null);
  if (unknown.length > 0) {
    return {
      status: "unknown",
      detail: `Repeat users were not captured for ${unknown.map((period) => period.label).join("; ")}.`,
      missing: unknown.map((period) => `Repeat users for ${period.label}`),
      caveats,
    };
  }
  return {
    status: "met",
    detail: `Repeat use at or above ${SUSTAINED_USE_THRESHOLD * 100}% of eligible users in the last ${SUSTAINED_USE_PERIODS} complete periods: ${window.map(describe).join("; ")}.`,
    missing: [],
    caveats,
  };
}
