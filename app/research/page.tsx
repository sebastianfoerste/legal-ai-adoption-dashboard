import type { Metadata } from "next";
import { formatDate, resolveAsOf } from "@/lib/engagement/as-of";


export const metadata: Metadata = { title: "Research to Change" };
import { EVIDENCE_SOURCE_FILE, getEvidenceStore, practitionerEvidence } from "@/lib/evidence/data";
import { evidenceTypeLabel, summarizeLoop, viewChanges } from "@/lib/evidence/loop";
import { AsOfNote } from "@/components/AsOfNote";
import { PageHeader } from "@/components/PageHeader";
import { SyntheticNotice } from "@/components/SyntheticNotice";
import { ChangeChain } from "@/components/evidence/ChangeEvidence";

const REMAINING_STEPS = [
  "Have the information sheet and consent form reviewed, and fill their open fields.",
  "Authorise recruitment, then send the invitation draft.",
  "Run a timed dry run of task pack TP-A with a colleague outside the sample.",
  "Hold four to eight sessions and record observations in the private store.",
  "Approve any aggregate or quotation before it appears here.",
];

export default async function ResearchPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const asOfState = resolveAsOf((await searchParams)?.asOf);
  const store = getEvidenceStore();
  const views = viewChanges(store, asOfState.date);
  const summary = summarizeLoop(views);
  const practitioner = practitionerEvidence(store);
  const { study } = store;

  const stats: { label: string; value: number; tone: string }[] = [
    { label: "Changes recorded", value: summary.changes, tone: "text-gray-900" },
    { label: "Released", value: summary.byDelivery.released, tone: "text-amber-700" },
    { label: "Supported", value: summary.byOutcome.supported, tone: "text-emerald-700" },
    { label: "Contradicted", value: summary.byOutcome.contradicted, tone: "text-red-700" },
    { label: "Inconclusive", value: summary.byOutcome.inconclusive, tone: "text-gray-700" },
    { label: "Awaiting evidence", value: summary.byOutcome.awaiting_evidence, tone: "text-gray-700" },
    { label: "Deferred or rejected", value: summary.byDelivery.deferred + summary.byDelivery.rejected, tone: "text-gray-700" },
    { label: "Follow-ups overdue", value: summary.followUpsOverdue, tone: "text-red-700" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Research to Change"
        subtitle="From a research question to an observation, a product change and the follow-up that tests it. A release is not an outcome."
      >
        <AsOfNote asOf={asOfState} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={`/research/backlog?asOf=${asOfState.date}`}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Download evidence-linked backlog (Markdown)
          </a>
          <span className="text-xs text-gray-500">
            Source: <code>{EVIDENCE_SOURCE_FILE}</code>, schema <code>{store.schema}</code>
          </span>
        </div>
      </PageHeader>

      <section aria-labelledby="study-title" className="mb-10">
        <h2 id="study-title" className="mb-3 text-lg font-semibold text-gray-900">
          Practitioner study: {study.workflow}
        </h2>
        <div className="rounded-xl border border-gray-200 p-5">
          <dl className="grid gap-4 text-sm sm:grid-cols-4">
            {[
              ["Planned participants", `${study.plannedParticipants.min} to ${study.plannedParticipants.max}`],
              ["Recruitment", study.recruitmentAuthorised ? "Authorised" : "Not authorised"],
              ["Invitations sent", String(study.invitationsSent)],
              ["Sessions completed", String(study.sessionsCompleted)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
                <dd className="mt-0.5 font-semibold text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
          {practitioner.observations.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4" data-testid="practitioner-empty-state">
              <p className="text-sm font-semibold text-gray-900">No practitioner has taken part yet.</p>
              <p className="mt-1 text-sm text-gray-600">
                There are no practitioner observations, quotations or outcomes to show. {study.note} The
                pack is in <code>{study.packPath}</code>.
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                What has to happen first
              </p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-gray-700">
                {REMAINING_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="mt-5 text-sm text-gray-700">
              {practitioner.sessions.length} approved session record(s) and {practitioner.observations.length}{" "}
              approved observation(s) are published here. Original notes stay in the private research store.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="chain-title">
        <h2 id="chain-title" className="mb-3 text-lg font-semibold text-gray-900">
          Synthetic demonstration cases
        </h2>
        <SyntheticNotice label="Synthetic demonstration cases">{store.notice}</SyntheticNotice>
        <dl className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-gray-200 px-3 py-2">
              <dt className="text-xs text-gray-500">{stat.label}</dt>
              <dd className={`text-xl font-semibold ${stat.tone}`}>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-6">
          {views.map((view) => (
            <ChangeChain key={view.change.id} view={view} />
          ))}
        </div>
      </section>

      <section aria-labelledby="sources-title" className="mt-10">
        <h2 id="sources-title" className="mb-1 text-lg font-semibold text-gray-900">
          Sources
        </h2>
        <p className="mb-3 text-sm text-gray-600">
          Every observation cited above, with its session. Participant codes are study codes; no
          person stands behind a code in this file.
        </p>
        <div tabIndex={0} className="overflow-x-auto rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Every observation with its session, question and evidence type</caption>
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Observation</th>
                <th scope="col" className="px-3 py-2 font-medium">Session</th>
                <th scope="col" className="px-3 py-2 font-medium">Question</th>
                <th scope="col" className="px-3 py-2 font-medium">Evidence type</th>
                <th scope="col" className="px-3 py-2 font-medium">Observed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {store.observations.map((observation) => {
                const session = store.sessions.find((s) => s.id === observation.sessionId);
                return (
                  <tr key={observation.id} id={observation.id} className="scroll-mt-6 align-top target:bg-violet-50">
                    <td className="px-3 py-2 font-mono text-xs text-gray-700">{observation.id}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {observation.sessionId}
                      {session && (
                        <span className="block">
                          {session.participantCode}, {session.roleLabel}, {formatDate(session.heldOn)}
                          {session.taskPackId ? `, ${session.taskPackId}` : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600">{observation.questionId}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{evidenceTypeLabel[observation.evidenceType]}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {observation.observed}
                      {observation.quotation && (
                        <span className="mt-1 block text-xs text-gray-500">
                          Quotation ({observation.quotation.permission.replaceAll("_", " ")}, synthetic): “
                          {observation.quotation.text}”
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
