import { BarChart } from "@/components/charts/BarChart";
import {
  METRIC_DEFINITIONS,
  caveatLabel,
  rateChartData,
  type Caveat,
  type Rate,
  type SeriesMetrics,
} from "@/lib/engagement/adoption-trend";
import { formatDate } from "@/lib/engagement/as-of";

const phaseLabel: Record<SeriesMetrics["periods"][number]["phase"], string> = {
  onboarding: "Onboarding",
  baseline: "Baseline",
  stalled: "Stalled",
  intervention: "Intervention",
  follow_up: "Follow-up",
};

const caveatMark: Record<Caveat, string> = { small_cohort: "a", incomplete_period: "b", cohort_changed: "c" };

function RateCell({ rate }: { rate: Rate }) {
  if (rate.value === null) {
    return <td className="px-3 py-2 italic text-muted">Unknown</td>;
  }
  return (
    <td className="px-3 py-2 text-gray-700">
      <span className="font-medium text-gray-900">
        {rate.numerator} of {rate.denominator}
      </span>{" "}
      <span className="text-gray-500">({Math.round(rate.value * 100)}%)</span>
      {rate.caveats.length > 0 && (
        <sup className="ml-0.5 text-amber-700">{rate.caveats.map((c) => caveatMark[c]).join(",")}</sup>
      )}
    </td>
  );
}

const count = (value: number | null) =>
  value === null ? <span className="italic text-muted">Unknown</span> : value;

/** `headingLevel`: the title's level; the pages place the table under an h2 or an h3. */
export function AdoptionTrendTable({ metrics, headingLevel = 4 }: { metrics: SeriesMetrics; headingLevel?: 3 | 4 }) {
  const Title: "h3" | "h4" = headingLevel === 3 ? "h3" : "h4";
  const { series, periods } = metrics;
  const caveats = [
    ...new Set(
      periods.flatMap((p) =>
        [p.activation, p.repeatUse, p.completion, p.dropOffAfterTraining].flatMap((r) => r.caveats),
      ),
    ),
  ];
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
        <Title className="text-sm font-semibold text-gray-900">
          {series.workflowName} · {series.practiceGroup}
        </Title>
        <p className="mt-0.5 text-xs text-gray-600">
          Four-week reporting periods, as of {formatDate(metrics.asOf)}.
          {series.trainingCohort &&
            ` Training cohort: ${series.trainingCohort.size} users, trained ${formatDate(series.trainingCohort.trainedOn)}.`}
        </p>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-3 px-3 pt-3">
        {(["activation", "repeatUse"] as const).map((key) => (
          <div key={key}>
            <p className="text-xs font-medium text-gray-700">
              {key === "activation" ? "Activation" : "Repeat use"} per period, 0 to 100%
            </p>
            <BarChart
              className="mt-1"
              title={`${key === "activation" ? "Activation" : "Repeat use"} per reporting period, ${series.workflowName}`}
              data={rateChartData(metrics, key)}
              max={1}
              barWidth={22}
              gap={6}
              height={40}
              ticks={periods.map((_, i) => `P${i + 1}`)}
              labelHeader="Reporting period"
              valueHeader={key === "activation" ? "Activation" : "Repeat use"}
            />
          </div>
        ))}
        <p className="basis-full text-xs text-gray-600">
          Grey dashed outline: not captured (Unknown). Light violet bar: incomplete period.
          Violet line on the baseline: zero. P1 is the oldest period; the table below has the
          dates.
        </p>
      </div>
      <p className="px-3 pt-2 text-xs text-muted md:hidden">Scroll sideways for all columns.</p>
      <div tabIndex={0} className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <table className="w-full min-w-[860px] text-sm">
          <caption className="sr-only">
            Adoption over time for {series.workflowName}, with numerator and denominator per rate
          </caption>
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Period</th>
              <th className="px-3 py-2 font-medium">Licensed</th>
              <th className="px-3 py-2 font-medium">Eligible</th>
              <th className="px-3 py-2 font-medium">Active</th>
              <th className="px-3 py-2 font-medium">Activation</th>
              <th className="px-3 py-2 font-medium">Repeat use</th>
              <th className="px-3 py-2 font-medium">Completed workflows</th>
              <th className="px-3 py-2 font-medium">Drop-off after training</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {periods.map((period) => (
              <tr key={period.start} className={period.complete ? "" : "bg-amber-50/40"}>
                <td className="px-3 py-2">
                  <span className="font-medium text-gray-900">{period.label}</span>
                  <span className="block text-xs text-gray-500">
                    {phaseLabel[period.phase]}
                    {!period.complete && " · incomplete"}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-700">{count(period.licensedUsers)}</td>
                <td className="px-3 py-2 text-gray-700">{count(period.eligibleUsers)}</td>
                <td className="px-3 py-2 text-gray-700">{count(period.activeUsers)}</td>
                <RateCell rate={period.activation} />
                <RateCell rate={period.repeatUse} />
                <RateCell rate={period.completion} />
                <RateCell rate={period.dropOffAfterTraining} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-1 border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
        {caveats.map((caveat) => (
          <p key={caveat}>
            <sup className="text-amber-700">{caveatMark[caveat]}</sup> {caveatLabel[caveat]}
          </p>
        ))}
        {series.dataNotes.map((note) => (
          <p key={note}>Data note: {note}</p>
        ))}
      </div>
    </div>
  );
}

export function MetricDefinitions() {
  const rows: [string, string][] = [
    ["Licensed users", METRIC_DEFINITIONS.licensedUsers],
    ["Eligible users", METRIC_DEFINITIONS.eligibleUsers],
    ["Active users", METRIC_DEFINITIONS.activeUsers],
    ["Activation", METRIC_DEFINITIONS.activation],
    ["Repeat use", METRIC_DEFINITIONS.repeatUse],
    ["Completed workflows", METRIC_DEFINITIONS.completion],
    ["Drop-off after training", METRIC_DEFINITIONS.dropOffAfterTraining],
    ["Reporting period", METRIC_DEFINITIONS.reportingPeriod],
  ];
  return (
    <details className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-medium text-gray-900">
        Definitions and denominators
      </summary>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        {rows.map(([term, definition]) => (
          <div key={term}>
            <dt className="font-medium text-gray-900">{term}</dt>
            <dd className="text-gray-600">{definition}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
