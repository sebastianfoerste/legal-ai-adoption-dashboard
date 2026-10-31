import { formatDate } from "@/lib/engagement/as-of";
import { specialistLabel } from "@/lib/engagement/data";
import {
  followUpStatus,
  interventionStage,
  outcomeStatement,
  resultLabel,
  stageLabel,
  type InterventionStage,
} from "@/lib/engagement/interventions";
import type { Intervention } from "@/lib/engagement/schema";
import { Pill, type Tone } from "./Pill";

// "Completed" is amber on purpose: the action is done, the outcome is still open.
export const stageTone: Record<InterventionStage, Tone> = {
  proposed: "neutral",
  underway: "info",
  completed: "warn",
  evaluated: "accent",
};

const resultTone: Record<NonNullable<Intervention["outcome"]>["result"], Tone> = {
  achieved: "good",
  partly_achieved: "warn",
  not_achieved: "bad",
  inconclusive: "neutral",
};

const evidenceKind: Record<Intervention["supportingEvidence"][number]["kind"], string> = {
  adoption_metric: "Adoption metric",
  value_measurement: "Value measurement",
  specialist_observation: "Specialist observation",
  customer_statement: "Customer statement",
};

const bearingTone = { supports: "good", contradicts: "bad", mixed: "warn" } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-700">{children}</dd>
    </div>
  );
}

const date = (value: string | null) => (value ? formatDate(value) : "Not set");

export function InterventionCard({
  intervention,
  accountName,
  asOf,
}: {
  intervention: Intervention;
  accountName?: string;
  asOf: string;
}) {
  const stage = interventionStage(intervention);
  const followUp = followUpStatus(intervention, asOf);
  const { dates, outcome } = intervention;
  return (
    <article
      id={intervention.id}
      className="scroll-mt-4 rounded-xl border border-gray-200 p-5"
      aria-label={`Intervention ${intervention.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-gray-500">{intervention.id}</span>
        <Pill tone={stageTone[stage]}>{stageLabel[stage]}</Pill>
        {outcome && stage === "evaluated" && (
          <Pill tone={resultTone[outcome.result]}>{resultLabel[outcome.result]}</Pill>
        )}
        {followUp.state === "overdue" && (
          <Pill tone="bad">Follow-up {followUp.daysOverdue} days overdue</Pill>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-900">
        {accountName && `${accountName} · `}
        {[intervention.practiceGroup, intervention.workflowId].filter(Boolean).join(" · ")}
      </p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Observed problem">{intervention.observedProblem}</Field>
        <Field label="Hypothesis">{intervention.hypothesis}</Field>
        <Field label="Action">{intervention.action}</Field>
        <Field label="Expected result">
          {intervention.expectedResult.target}, by {formatDate(intervention.expectedResult.byDate)}.
          <span className="block text-xs text-gray-500">
            Measure: {intervention.expectedResult.metric}
          </span>
        </Field>
        <Field label="Assigned specialist">
          {specialistLabel(intervention.assignedSpecialistId)}
        </Field>
        <Field label="Dates">
          Proposed {date(dates.proposedOn)} · Started {date(dates.startedOn)} · Completed{" "}
          {date(dates.completedOn)} · Follow-up due {date(dates.followUpDueOn)} · Evaluated{" "}
          {date(dates.evaluatedOn)}
        </Field>
      </dl>

      <div className="mt-4">
        <h3 className="text-xs uppercase tracking-wide text-muted">Supporting evidence</h3>
        <ul className="mt-1 space-y-1 text-sm text-gray-700">
          {intervention.supportingEvidence.map((item) => (
            <li key={item.summary}>
              <span className="font-medium text-gray-900">{evidenceKind[item.kind]}:</span>{" "}
              {item.summary}
              {item.ref && <span className="ml-1 font-mono text-xs text-muted">{item.ref}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-xs uppercase tracking-wide text-muted">Follow-up observations</h3>
        {intervention.followUpObservations.length === 0 ? (
          <p className="mt-1 text-sm italic text-muted">None recorded yet.</p>
        ) : (
          <ul className="mt-1 space-y-1.5 text-sm text-gray-700">
            {intervention.followUpObservations.map((observation) => (
              <li key={observation.observedOn} className="flex flex-wrap items-baseline gap-2">
                <span className="text-xs text-gray-500">{formatDate(observation.observedOn)}</span>
                <Pill tone={bearingTone[observation.bearing]}>{observation.bearing}</Pill>
                <span className="min-w-0 flex-1 basis-64">{observation.summary}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className={`mt-4 rounded-lg border p-3 text-sm ${
          stage === "completed"
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-gray-200 bg-gray-50 text-gray-700"
        }`}
      >
        <p className="font-medium">{outcomeStatement(intervention)}</p>
        {outcome && stage === "evaluated" && (
          <>
            <p className="mt-1">{outcome.rationale}</p>
            {outcome.confounders.length > 0 && (
              <p className="mt-1 text-xs">Confounders: {outcome.confounders.join("; ")}.</p>
            )}
          </>
        )}
      </div>
    </article>
  );
}
