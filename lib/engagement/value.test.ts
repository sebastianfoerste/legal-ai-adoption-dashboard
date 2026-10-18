import { describe, expect, it } from "vitest";
import { getValueMeasurements } from "./data";
import type { PhaseMeasurement, TaskObservation, ValueMeasurement } from "./schema";
import { COMPONENT_SUM_LABEL, assessValue, median, summarizePhase, taskActiveMinutes } from "./value";

const measurement = (id: string): ValueMeasurement => {
  const found = getValueMeasurements().find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing fixture ${id}`);
  return found;
};
const musterstadt = () => measurement("vm-musterstadt-supplier-review");
const brightmoor = () => measurement("vm-brightmoor-spa-draft");
const hanseatic = () => measurement("vm-hanseatic-dpa-review");

type TaskPhase = Extract<PhaseMeasurement, { basis: "task_observations" }>;
const tasksOf = (phase: PhaseMeasurement | null): TaskPhase => {
  if (!phase || phase.basis !== "task_observations") throw new Error("expected per-task rows");
  return phase;
};
const withTasks = (phase: PhaseMeasurement | null, edit: (tasks: TaskObservation[]) => TaskObservation[]) => {
  const source = tasksOf(phase);
  return { ...source, tasks: edit(source.tasks) };
};

const task = (id: string, minutes: [number, number, number], extra: Partial<TaskObservation> = {}): TaskObservation => ({
  id,
  startedOn: "2026-05-04",
  status: "accepted",
  activeMinutes: { producing: minutes[0], humanReview: minutes[1], correction: minutes[2] },
  waitingMinutes: null,
  elapsedMinutes: null,
  reworked: false,
  qualityFailure: false,
  ...extra,
});
const phaseOf = (tasks: TaskObservation[]): PhaseMeasurement => ({
  label: "Test phase",
  periodStart: "2026-05-04",
  periodEnd: "2026-05-31",
  basis: "task_observations",
  tasks,
});

describe("median of per-task totals", () => {
  it("sums each task first and takes the median of the sums", () => {
    // Component medians are 10, 20 and 30, which add up to 60. No task took 60 minutes.
    const summary = summarizePhase(
      phaseOf([task("a", [10, 50, 5]), task("b", [5, 20, 30]), task("c", [40, 10, 60])]),
    );
    expect(summary.componentMedians).toEqual({ producing: 10, humanReview: 20, correction: 30 });
    expect(summary.medianActiveMinutes).toBe(65); // totals 65, 55, 110
    expect(summary.componentMedianSum).toBeNull();
  });

  it("averages the two middle totals of an even sample", () => {
    expect(median([10, 40, 20, 30])).toBe(25);
    expect(median([])).toBeNull();
  });

  it("differs from the earlier sum of component medians on the scenario fixtures", () => {
    const baseline = summarizePhase(musterstadt().baseline);
    expect(baseline.componentMedians).toEqual({ producing: 25, humanReview: 70, correction: 55 });
    expect(baseline.medianActiveMinutes).toBe(167.5); // reported as 150 before the correction
    expect(summarizePhase(musterstadt().followUp as PhaseMeasurement).medianActiveMinutes).toBe(90);
  });

  it("leaves a task without a complete time record out of the median and says so", () => {
    const summary = summarizePhase(
      phaseOf([
        task("a", [10, 20, 30]),
        task("b", [10, 20, 40]),
        { ...task("c", [10, 20, 0]), activeMinutes: { producing: 10, humanReview: 20, correction: null } },
      ]),
    );
    expect(taskActiveMinutes(tasksOf(phaseOf([task("x", [1, 2, 3])])).tasks[0])).toBe(6);
    expect(summary.accepted).toBe(3);
    expect(summary.timedResults).toBe(2);
    expect(summary.medianActiveMinutes).toBe(65);
    const value = assessValue({ ...musterstadt(), baseline: phaseOf([task("a", [1, 1, 1])]) });
    expect(value.verdict).toBe("unknown");
  });

  it("counts a duplicated task record once", () => {
    const rows = [task("a", [10, 20, 30]), task("b", [20, 20, 30]), task("b", [20, 20, 30])];
    const summary = summarizePhase(phaseOf(rows));
    expect(summary.attempts).toBe(2);
    expect(summary.duplicatesIgnored).toBe(1);
    expect(summary.medianActiveMinutes).toBe(65);

    const source = musterstadt();
    const duplicated = assessValue({
      ...source,
      followUp: withTasks(source.followUp, (tasks) => [...tasks, tasks[0], tasks[1]]),
    });
    expect(duplicated.followUp?.attempts).toBe(31);
    expect(duplicated.caveats.join(" ")).toContain("2 duplicate task record(s) ignored");
    expect(duplicated.observedChangeMinutes).toBe(assessValue(source).observedChangeMinutes);
  });
});

describe("denominators", () => {
  it("keeps abandoned and rejected attempts in the attempt count", () => {
    const summary = summarizePhase(brightmoor().followUp as PhaseMeasurement);
    expect(summary).toMatchObject({ attempts: 32, accepted: 26, abandoned: 5, rejected: 1 });
    expect(summary.acceptanceRate).toBeCloseTo(26 / 32);
    // Quality and rework are rates over accepted results, not over attempts.
    expect(summary).toMatchObject({ qualityFailures: 9, qualityChecked: 26, reworkedResults: 14, reworkKnown: 26 });
  });

  it("charges the effort on failed attempts to the accepted results", () => {
    const summary = summarizePhase(
      phaseOf([task("a", [10, 20, 30]), task("b", [30, 30, 0], { status: "abandoned", reworked: null, qualityFailure: null })]),
    );
    expect(summary.medianActiveMinutes).toBe(60);
    expect(summary.activeMinutesPerAcceptedResult).toBe(120);
  });

  it("has no rate when nothing was accepted or nothing was checked", () => {
    const none = summarizePhase(phaseOf([task("a", [10, 10, 0], { status: "abandoned", reworked: null, qualityFailure: null })]));
    expect(none.acceptanceRate).toBe(0);
    expect(none.medianActiveMinutes).toBeNull();
    expect(none.qualityFailureRate).toBeNull();
    expect(none.activeMinutesPerAcceptedResult).toBeNull();
    expect(summarizePhase(phaseOf([])).acceptanceRate).toBeNull();
  });

  it("separates waiting from active effort", () => {
    const summary = summarizePhase(musterstadt().baseline);
    expect(summary.elapsedKnown).toBe(9);
    expect(summary.medianElapsedMinutes).toBeGreaterThan(summary.medianActiveMinutes as number);
    const value = assessValue(musterstadt());
    expect(value.caveats).toContain(
      "Before the intervention: elapsed and waiting time recorded for 9 of 10 accepted results.",
    );
    expect(value.observed.join(" ")).toContain("Waiting is not effort and does not enter the verdict.");
  });
});

describe("component summaries", () => {
  it("never reports a median total and labels the sum for what it is", () => {
    const summary = summarizePhase(hanseatic().baseline);
    expect(summary.medianActiveMinutes).toBeNull();
    expect(summary.componentMedianSum).toBe(130);
    expect(summary.attempts).toBeNull();
    expect(summary.acceptanceRate).toBeNull();

    const value = assessValue(hanseatic());
    expect(value.verdict).toBe("unknown");
    expect(value.observedChangeMinutes).toBeNull();
    expect(value.observed[0]).toContain(COMPONENT_SUM_LABEL);
    expect(value.observed[0]).toContain("130 minutes (14 results) before, 115 minutes (12 results) after");
    expect(value.observed.join(" ")).not.toContain("Median active time");
    expect(value.missingEvidence.join(" ")).toContain("per-task observations");
    expect(value.caveats).toContain("Second quarter summary: rework was not captured.");
    expect(value.financial.status).toBe("not_calculated");
  });

  it("has no sum when a component was not captured", () => {
    const source = hanseatic().baseline;
    if (source.basis !== "component_summary") throw new Error("expected a summary");
    const partial = summarizePhase({
      ...source,
      medianMinutes: { producing: 30, humanReview: 60, correction: null },
    });
    expect(partial.componentMedianSum).toBeNull();
  });

  it("cannot demonstrate value against a per-task follow-up either", () => {
    const value = assessValue({ ...musterstadt(), baseline: { ...hanseatic().baseline, label: "Summary baseline" } });
    expect(value.verdict).toBe("unknown");
    expect(value.observedChangeMinutes).toBeNull();
  });
});

describe("value verdict", () => {
  it("reports the observed change with both sample sizes", () => {
    const value = assessValue(musterstadt());
    expect(value.observedChangeMinutes).toBe(-77.5);
    expect(value.observedChangeRatio).toBeCloseTo(-0.463, 3);
    expect(value.observed[0]).toContain("167.5 minutes (10 results)");
    expect(value.observed[0]).toContain("90 minutes (30 results)");
    expect(value.observed[1]).toContain("10 of 12 attempts (83%) before, 30 of 31 attempts (97%) after");
  });

  it("is demonstrated when time falls and quality does not get worse", () => {
    const value = assessValue(musterstadt());
    expect(value).toMatchObject({ verdict: "demonstrated", productivity: "improved", quality: "not_worse" });
    expect(value.baseline.qualityFailureRate).toBeCloseTo(0.3);
    expect(value.followUp?.qualityFailureRate).toBeCloseTo(0.067, 3);
    expect(value.followUp?.reworkRate).toBeLessThan(value.baseline.reworkRate as number);
  });

  it("is not demonstrated when time rises alongside abandonment, quality failures and rework", () => {
    const value = assessValue(brightmoor());
    expect(value).toMatchObject({ verdict: "not_demonstrated", productivity: "not_improved", quality: "worse" });
    expect(value.observedChangeMinutes).toBe(37.5);
    expect(value.reasons).toEqual([
      "Time to an acceptable result did not fall by at least 10%.",
      "A smaller share of attempts reached an accepted result.",
      "The quality-failure rate rose.",
      "The rework rate rose.",
    ]);
  });

  it("does not count a faster result as value when quality failures rise", () => {
    const source = musterstadt();
    const fasterButWorse = assessValue({
      ...source,
      followUp: withTasks(source.followUp, (tasks) =>
        tasks.map((row, index) => (row.status === "accepted" && index < 14 ? { ...row, qualityFailure: true } : row)),
      ),
    });
    expect(fasterButWorse.observedChangeMinutes).toBe(-77.5);
    expect(fasterButWorse).toMatchObject({ productivity: "improved", quality: "worse", verdict: "not_demonstrated" });
    expect(fasterButWorse.financial.status).toBe("not_calculated");
  });

  it("does not count a faster median as value when more attempts are abandoned", () => {
    const source = musterstadt();
    const abandoned = Array.from({ length: 12 }, (_, index) =>
      task(`extra-${index}`, [20, 20, 0], { status: "abandoned", reworked: null, qualityFailure: null }),
    );
    const value = assessValue({
      ...source,
      followUp: withTasks(source.followUp, (tasks) => [...tasks, ...abandoned]),
    });
    expect(value.observedChangeMinutes).toBe(-77.5);
    expect(value).toMatchObject({ productivity: "not_improved", verdict: "not_demonstrated" });
    expect(value.reasons).toContain("A smaller share of attempts reached an accepted result.");
  });

  it("is unknown without a follow-up measurement", () => {
    const value = assessValue({ ...musterstadt(), followUp: null });
    expect(value.verdict).toBe("unknown");
    expect(value.missingEvidence).toContain("Follow-up measurement of time to an acceptable result");
    expect(value.financial.status).toBe("not_calculated");
  });

  it("is unknown when a sample is too small to compare medians", () => {
    const source = musterstadt();
    const value = assessValue({
      ...source,
      baseline: withTasks(source.baseline, (tasks) => tasks.filter((row) => row.status === "accepted").slice(0, 6)),
    });
    expect(value.verdict).toBe("unknown");
    expect(value.missingEvidence.join(" ")).toContain("only 6 sampled");
  });

  it("is unknown when quality failures were not captured", () => {
    const source = musterstadt();
    const value = assessValue({
      ...source,
      baseline: withTasks(source.baseline, (tasks) => tasks.map((row) => ({ ...row, qualityFailure: null }))),
    });
    expect(value.verdict).toBe("unknown");
    expect(value.baseline.qualityFailureRate).toBeNull();
  });
});

describe("attribution and financial illustration", () => {
  it("states that causation is an assumption without a comparison group", () => {
    const value = assessValue(musterstadt());
    expect(value.attribution.status).toBe("not_established");
    expect(value.attribution.statement).toContain("assumption, not a finding");
    expect(value.attribution.confounders).toHaveLength(2);
  });

  it("reports a comparison group when one exists", () => {
    const value = assessValue({
      ...musterstadt(),
      comparisonGroup: { description: "Employment kept the old workflow and did not change." },
    });
    expect(value.attribution.status).toBe("supported_by_comparison");
  });

  it("shows the formula and every assumption behind the financial figure", () => {
    const { financial } = assessValue(musterstadt());
    expect(financial.status).toBe("illustrated");
    // 77.5 / 60 * 380 * 95 = 46,629.17, rounded to the nearest 100
    expect(financial.annualValueEur).toBe(46600);
    expect(financial.formula).toContain("77.5 minutes ÷ 60 × 380 results per year × EUR 95 per hour");
    expect(financial.assumptions).toHaveLength(5);
    expect(financial.assumptions.join(" ")).toContain("not established");
  });

  it("calculates no financial figure without recorded assumptions or without demonstrated value", () => {
    expect(assessValue({ ...musterstadt(), financialAssumptions: null }).financial).toMatchObject({
      status: "not_calculated",
      annualValueEur: null,
    });
    expect(assessValue(brightmoor()).financial.status).toBe("not_calculated");
  });
});
