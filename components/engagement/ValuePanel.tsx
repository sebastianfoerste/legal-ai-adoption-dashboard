import type { PhaseSummary, ValueAssessment } from "@/lib/engagement/value";
import { MIN_SAMPLE } from "@/lib/engagement/value";
import { Pill, type Tone } from "./Pill";

const verdictTone: Record<ValueAssessment["verdict"], Tone> = {
  demonstrated: "good",
  not_demonstrated: "bad",
  unknown: "neutral",
};
const verdictText: Record<ValueAssessment["verdict"], string> = {
  demonstrated: "Improvement observed",
  not_demonstrated: "No improvement observed",
  unknown: "Unknown: evidence incomplete",
};

const minutes = (value: number | null) =>
  value === null ? <span className="italic text-muted">Unknown</span> : `${value} min`;

const share = (part: number | null, whole: number, rate: number | null) =>
  part === null || rate === null ? (
    <span className="italic text-muted">Unknown</span>
  ) : (
    `${part} of ${whole} (${Math.round(rate * 100)}%)`
  );

const PHASE_COLUMNS = 8;

function PhaseColumn({ phase }: { phase: PhaseSummary | null }) {
  if (!phase) {
    return (
      <>
        {Array.from({ length: PHASE_COLUMNS }, (_, row) => (
          <td key={row} className="px-3 py-2 italic text-muted">
            Unknown
          </td>
        ))}
      </>
    );
  }
  return (
    <>
      <td className="px-3 py-2 text-gray-700">
        {phase.attempts === null ? (
          <>
            {phase.accepted} results
            <span className="block text-xs italic text-muted">attempts unknown</span>
          </>
        ) : (
          <>
            {share(phase.accepted, phase.attempts, phase.acceptanceRate)}
            <span className="block text-xs text-gray-500">
              {phase.abandoned} abandoned, {phase.rejected} rejected
            </span>
          </>
        )}
        {phase.smallSample && (
          <span className="block text-xs text-amber-700">
            {phase.timedResults} timed, below {MIN_SAMPLE}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-gray-700">{minutes(phase.componentMedians.producing)}</td>
      <td className="px-3 py-2 text-gray-700">{minutes(phase.componentMedians.humanReview)}</td>
      <td className="px-3 py-2 text-gray-700">{minutes(phase.componentMedians.correction)}</td>
      <td className="px-3 py-2 font-semibold text-gray-900">
        {phase.basis === "task_observations" ? (
          minutes(phase.medianActiveMinutes)
        ) : (
          <>
            <span className="italic font-normal text-muted">Unknown</span>
            {phase.componentMedianSum !== null && (
              <span className="block text-xs font-normal text-amber-700">
                Component medians sum to {phase.componentMedianSum} min. That is not a median.
              </span>
            )}
          </>
        )}
      </td>
      <td className="px-3 py-2 text-gray-700">
        {minutes(phase.medianElapsedMinutes)}
        {phase.medianElapsedMinutes !== null && phase.elapsedKnown < phase.accepted && (
          <span className="block text-xs text-gray-500">
            {phase.elapsedKnown} of {phase.accepted} recorded
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-gray-700">
        {share(phase.qualityFailures, phase.qualityChecked, phase.qualityFailureRate)}
      </td>
      <td className="px-3 py-2 text-gray-700">
        {share(phase.reworkedResults, phase.reworkKnown, phase.reworkRate)}
      </td>
    </>
  );
}

const productivityText: Record<ValueAssessment["productivity"], string> = {
  improved: "Productivity: improved",
  not_improved: "Productivity: not improved",
  unknown: "Productivity: unknown",
};
const qualityText: Record<ValueAssessment["quality"], string> = {
  not_worse: "Quality: not worse",
  worse: "Quality: worse",
  unknown: "Quality: unknown",
};

/**
 * `headingLevel` is the level of the panel's title; the pages place the panel under an h2
 * (customer review) or an h3 (account page), and the outline must not skip a level.
 */
export function ValuePanel({ value, headingLevel = 4 }: { value: ValueAssessment; headingLevel?: 3 | 4 }) {
  const { measurement, financial } = value;
  const Title: "h3" | "h4" = headingLevel === 3 ? "h3" : "h4";
  const Sub: "h4" | "h5" = headingLevel === 3 ? "h4" : "h5";
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
        <div>
          <Title className="text-sm font-semibold text-gray-900">
            {measurement.workflowName} · {measurement.practiceGroup}
          </Title>
          <p className="mt-0.5 text-xs text-gray-600">
            Acceptable result: {measurement.acceptableResultDefinition}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill tone={value.productivity === "improved" ? "good" : value.productivity === "unknown" ? "neutral" : "bad"}>
            {productivityText[value.productivity]}
          </Pill>
          <Pill tone={value.quality === "not_worse" ? "good" : value.quality === "unknown" ? "neutral" : "bad"}>
            {qualityText[value.quality]}
          </Pill>
          <Pill tone={verdictTone[value.verdict]}>{verdictText[value.verdict]}</Pill>
        </div>
      </div>

      <p className="px-3 pt-2 text-xs text-muted md:hidden">Scroll sideways for all columns.</p>
      <div tabIndex={0} className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <table className="w-full min-w-[980px] text-sm">
          <caption className="sr-only">
            Attempts, median active time per accepted result, elapsed time, quality failures and
            rework, before and after
          </caption>
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Phase</th>
              <th className="px-3 py-2 font-medium">Accepted of attempts</th>
              <th className="px-3 py-2 font-medium">Producing</th>
              <th className="px-3 py-2 font-medium">Human review</th>
              <th className="px-3 py-2 font-medium">Correction</th>
              <th className="px-3 py-2 font-medium">Active time per accepted result</th>
              <th className="px-3 py-2 font-medium">Elapsed, waiting included</th>
              <th className="px-3 py-2 font-medium">Quality failures</th>
              <th className="px-3 py-2 font-medium">Rework</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-3 py-2">
                <span className="font-medium text-gray-900">{value.baseline.label}</span>
                <span className="block text-xs text-gray-500">{value.baseline.window}</span>
              </td>
              <PhaseColumn phase={value.baseline} />
            </tr>
            <tr>
              <td className="px-3 py-2">
                <span className="font-medium text-gray-900">
                  {value.followUp?.label ?? "Follow-up"}
                </span>
                <span className="block text-xs text-gray-500">
                  {value.followUp?.window ?? "Not measured"}
                </span>
              </td>
              <PhaseColumn phase={value.followUp} />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
        Medians over accepted results. The component columns are medians of each step on its
        own; &quot;active time per accepted result&quot; is the median of each task&apos;s own total, so the
        three component medians need not add up to it. {measurement.measurementMethod}
      </p>

      <div className="grid gap-0 border-t border-gray-100 md:grid-cols-2">
        <div className="p-3 md:border-r md:border-gray-100">
          <Sub className="text-xs font-bold uppercase tracking-wider text-emerald-700">Observed</Sub>
          <ul className="mt-1 space-y-1 text-sm text-gray-700">
            {value.observed.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {value.reasons.map((item) => (
              <li key={item} className="font-medium text-gray-900">
                {item}
              </li>
            ))}
            {value.missingEvidence.map((item) => (
              <li key={item} className="italic text-gray-500">
                Missing: {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-gray-100 bg-amber-50/40 p-3 md:border-t-0">
          <Sub className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Assumed, not established
          </Sub>
          <ul className="mt-1 space-y-1 text-sm text-gray-700">
            <li>{value.attribution.statement}</li>
            {value.attribution.confounders.map((item) => (
              <li key={item}>Concurrent change: {item}</li>
            ))}
            {value.caveats.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 p-3">
        <Sub className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Financial illustration
        </Sub>
        {financial.status === "illustrated" ? (
          <>
            <p className="mt-1 text-sm text-gray-700">
              About{" "}
              <span className="font-semibold text-gray-900">
                EUR {financial.annualValueEur?.toLocaleString("en-GB")} per year
              </span>
              , if every assumption below holds. This is an illustration, not a measured saving.
            </p>
            <p className="mt-1 font-mono text-xs text-gray-600">{financial.formula}</p>
            <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-xs text-gray-600">
              {financial.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-600">Not calculated. {financial.reason}</p>
        )}
      </div>
    </div>
  );
}
