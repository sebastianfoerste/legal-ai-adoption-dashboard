import Link from "next/link";
import { formatDate } from "@/lib/engagement/as-of";
import { evidenceSummary } from "@/lib/evidence/backlog";
import {
  decisionLabel,
  deliveryStatusLabel,
  evidenceTypeLabel,
  outcomeStatusLabel,
  problemClassLabel,
  type ChangeView,
  type OutcomeStatus,
  type TaskSetSummary,
} from "@/lib/evidence/loop";
import type { DeliveryStatus, Observation } from "@/lib/evidence/schema";
import { Pill, type Tone } from "@/components/engagement/Pill";

// "Released" is amber, like a completed intervention: delivered, effect still open.
export const deliveryTone: Record<DeliveryStatus, Tone> = {
  not_started: "neutral",
  in_progress: "info",
  released: "warn",
  deferred: "neutral",
  rejected: "neutral",
};

// Awaiting evidence and inconclusive are grey: neither may read as a pass.
export const outcomeTone: Record<OutcomeStatus, Tone> = {
  supported: "good",
  contradicted: "bad",
  inconclusive: "neutral",
  awaiting_evidence: "neutral",
  not_applicable: "neutral",
};

const confidenceTone = { low: "neutral", medium: "info", high: "accent" } as const;

export function ChangeStatusPills({ view }: { view: ChangeView }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Pill tone={view.problem.class === "quality_control" ? "bad" : "neutral"}>
        {problemClassLabel[view.problem.class]}
      </Pill>
      <Pill tone="neutral">Decision: {decisionLabel[view.change.decision.status]}</Pill>
      <Pill tone={confidenceTone[view.change.decision.confidence]}>
        Confidence: {view.change.decision.confidence}
      </Pill>
      <Pill tone={deliveryTone[view.deliveryStatus]}>
        Delivery: {deliveryStatusLabel[view.deliveryStatus]}
      </Pill>
      <Pill tone={outcomeTone[view.outcomeStatus]}>Outcome: {outcomeStatusLabel[view.outcomeStatus]}</Pill>
    </div>
  );
}

/** The short form used in the feedback queue and the customer review. */
export function ChangeEvidenceSummary({ view }: { view: ChangeView }) {
  const { change } = view;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link
          href={`/research#${change.id}`}
          className="font-medium text-violet-700 hover:text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {change.id}: {change.title}
        </Link>
        <ChangeStatusPills view={view} />
      </div>
      <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs text-gray-600 sm:grid-cols-2">
        <div>
          <dt className="inline font-semibold text-gray-700">Evidence: </dt>
          <dd className="inline">{evidenceSummary(view)}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-gray-700">Owner: </dt>
          <dd className="inline">{change.ownerRole}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline font-semibold text-gray-700">Missing observations: </dt>
          <dd className="inline">
            {view.missingObservations.length > 0 ? view.missingObservations.join(" ") : "None recorded."}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="inline font-semibold text-gray-700">Next decision: </dt>
          <dd className="inline">
            {change.nextDecision.question} ({change.nextDecision.ownerRole}
            {change.nextDecision.dueOn ? `, by ${formatDate(change.nextDecision.dueOn)}` : ""})
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Step({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-gray-100 px-4 py-3 md:grid-cols-[11rem_1fr] md:gap-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</h4>
      {/* min-w-0: a grid cell otherwise grows to the comparison table's minimum width. */}
      <div className="min-w-0 text-sm text-gray-700">{children}</div>
    </div>
  );
}

function ObservationList({ observations, empty }: { observations: Observation[]; empty: string }) {
  if (observations.length === 0) return <p className="italic text-gray-500">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {observations.map((observation) => (
        <li key={observation.id}>
          <a href={`#${observation.id}`} className="font-mono text-xs text-violet-700 hover:underline">
            {observation.id}
          </a>{" "}
          <span className="text-xs text-gray-500">({evidenceTypeLabel[observation.evidenceType]})</span>{" "}
          {observation.observed}
        </li>
      ))}
    </ul>
  );
}

const minutes = (value: number | null) => (value === null ? "None reached" : `${value} min`);

function ComparisonTable({ view }: { view: ChangeView }) {
  const comparison = view.comparison;
  if (!comparison) return null;
  const rows: [string, (set: TaskSetSummary) => string | number][] = [
    ["Sessions", (set) => set.sessions],
    ["Acceptable result reached", (set) => `${set.acceptable} of ${set.sessions}`],
    ["Completed unaided", (set) => set.completedUnaided],
    ["Completed with assistance", (set) => set.completedWithAssistance],
    ["Not completed", (set) => set.notCompleted],
    ["Moderator prompts", (set) => set.assistance],
    ["Interpretation errors", (set) => set.interpretationErrors],
    ["Trust concerns", (set) => set.trustConcerns],
    ["Median minutes to an acceptable result", (set) => minutes(set.medianMinutesToAcceptable)],
  ];
  return (
    <>
      <p className="mb-2 text-xs text-gray-600">{comparison.comparability}</p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[420px] text-sm">
          <caption className="sr-only">Baseline and follow-up task measures for {view.change.id}</caption>
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-3 py-2 font-medium">Measure</th>
              <th className="px-3 py-2 font-medium">Baseline</th>
              <th className="px-3 py-2 font-medium">Follow-up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(([label, pick]) => (
              <tr key={label}>
                <td className="px-3 py-1.5 text-gray-700">{label}</td>
                <td className="px-3 py-1.5 text-gray-700">{pick(comparison.baseline)}</td>
                <td className="px-3 py-1.5 text-gray-700">{pick(comparison.followUp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 rounded-lg bg-amber-50/60 p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
          Other plausible causes
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-gray-700">
          {comparison.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** The full chain for one change, from research question to outcome. */
export function ChangeChain({ view }: { view: ChangeView }) {
  const { change, problem } = view;
  const release = change.delivery.release;
  const verified = new Set(release?.criteriaVerified ?? []);
  return (
    <article id={change.id} className="scroll-mt-6 rounded-xl border border-gray-200">
      <header className="flex flex-wrap items-start justify-between gap-2 bg-gray-50 px-4 py-3">
        <h3 className="text-base font-semibold text-gray-900">
          <span className="mr-2 font-mono text-xs text-gray-500">{change.id}</span>
          {change.title}
        </h3>
        <ChangeStatusPills view={view} />
      </header>

      <Step label="Research question">
        {view.questions.length === 0 ? (
          <p className="italic text-gray-500">None. This problem did not come from the study.</p>
        ) : (
          <ul className="space-y-1">
            {view.questions.map((question) => (
              <li key={question.id}>
                <span className="font-mono text-xs text-gray-500">{question.id}</span> {question.question}
              </li>
            ))}
          </ul>
        )}
        {view.sessions.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {view.sessions.length} session(s), {view.participants} participant code(s):{" "}
            {view.sessions.map((session) => `${session.id} (${session.roleLabel})`).join(", ")}
          </p>
        )}
      </Step>
      <Step label="Observed">
        <ObservationList
          observations={view.supporting}
          empty="No study observation. The problem rests on account feedback alone."
        />
        {view.contradicting.length > 0 && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50/50 p-2">
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">Contradicting</p>
            <ObservationList observations={view.contradicting} empty="" />
          </div>
        )}
        {(problem.feedbackItemIds.length > 0 || problem.feedbackThemes.length > 0) && (
          <p className="mt-2 text-xs text-gray-500">
            Account feedback: {[...problem.feedbackItemIds, ...problem.feedbackThemes].join(", ")}
          </p>
        )}
      </Step>
      <Step label="Interpretation">
        <p className="font-medium text-gray-900">{problem.statement}</p>
        <p className="mt-1">{problem.interpretation}</p>
        <p className="mt-1 text-xs text-gray-500">
          Reading by {problem.interpretedByRole}. It is not part of the observations above.
        </p>
      </Step>
      <Step label="Hypothesis and change">
        <p>{change.hypothesis}</p>
        <p className="mt-1 text-gray-900">{change.proposedChange}</p>
      </Step>
      <Step label="Priority decision">
        <p>
          {decisionLabel[change.decision.status]} on {formatDate(change.decision.decidedOn)} by{" "}
          {change.decision.decidedByRole}, confidence {change.decision.confidence}.
        </p>
        <p className="mt-1">{change.decision.rationale}</p>
        {change.decision.revisitOn && (
          <p className="mt-1 text-xs text-gray-500">Revisit on {formatDate(change.decision.revisitOn)}.</p>
        )}
      </Step>
      <Step label="Acceptance criteria">
        {change.acceptanceCriteria.length === 0 ? (
          <p className="italic text-gray-500">None recorded.</p>
        ) : (
          <ul className="space-y-1">
            {change.acceptanceCriteria.map((criterion) => (
              <li key={criterion.id}>
                {criterion.text}{" "}
                {release && (
                  <span className={`text-xs ${verified.has(criterion.id) ? "text-emerald-700" : "text-amber-700"}`}>
                    {verified.has(criterion.id) ? "verified at release" : "not verified at release"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {change.criteriaRecordedOn && (
          <p className="mt-1 text-xs text-gray-500">
            Recorded {formatDate(change.criteriaRecordedOn)}
            {change.delivery.startedOn ? `, before implementation started on ${formatDate(change.delivery.startedOn)}` : ""}.
          </p>
        )}
      </Step>
      <Step label="Delivery">
        <p>
          {deliveryStatusLabel[view.deliveryStatus]}
          {release ? ` on ${formatDate(release.releasedOn)}` : ""}. Owner: {change.ownerRole}.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Implementation reference: {change.delivery.implementationRef ?? "none"}. Release evidence:{" "}
          {release ? `${release.evidenceKind.replaceAll("_", " ")}, ${release.evidenceRef}` : "none"}.
        </p>
      </Step>
      <Step label="Follow-up">
        {view.followUpState.state === "not_applicable" && (
          <p className="italic text-gray-500">Not applicable: nothing is released.</p>
        )}
        {view.followUpState.state === "not_planned" && (
          <p className="italic text-gray-500">Released without a planned follow-up.</p>
        )}
        {view.followUpState.state === "scheduled" && (
          <p className="italic text-gray-500">
            No follow-up observation yet. Due {formatDate(view.followUpState.dueOn)}.
          </p>
        )}
        {view.followUpState.state === "overdue" && (
          <p className="font-medium text-red-700">
            No follow-up observation. Overdue by {view.followUpState.daysOverdue} day(s), due{" "}
            {formatDate(view.followUpState.dueOn)}.
          </p>
        )}
        <ComparisonTable view={view} />
      </Step>
      <Step label="Outcome">
        <p className="font-medium text-gray-900">{outcomeStatusLabel[view.outcomeStatus]}</p>
        {change.outcome && (
          <p className="mt-1">
            {change.outcome.rationale}{" "}
            <span className="text-xs text-gray-500">Assessed {formatDate(change.outcome.assessedOn)}.</span>
          </p>
        )}
        {view.outcomeStatus === "awaiting_evidence" && (
          <p className="mt-1">A release is not an outcome. Nothing can be said about the effect yet.</p>
        )}
      </Step>
      <Step label="Missing observations">
        {view.missingObservations.length === 0 ? (
          <p className="text-gray-500">None recorded.</p>
        ) : (
          <ul className="list-disc space-y-0.5 pl-5">
            {view.missingObservations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </Step>
      <Step label="Next decision">
        <p>{change.nextDecision.question}</p>
        <p className="mt-1 text-xs text-gray-500">
          {change.nextDecision.ownerRole}
          {change.nextDecision.dueOn ? `, by ${formatDate(change.nextDecision.dueOn)}` : ""}
        </p>
      </Step>
    </article>
  );
}
