import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = { title: "Manager Decisions" };
import { Meter } from "@/components/charts/Meter";
import { getAccounts } from "@/lib/data";
import { accountHealth } from "@/lib/aggregate";
import { formatDate, resolveAsOf } from "@/lib/engagement/as-of";
import { getTeam, specialistLabel } from "@/lib/engagement/data";
import { accountExpansion } from "@/lib/engagement/expansion";
import {
  accountAttention,
  attentionKindLabel,
  openEscalations,
  overdueCommitments,
  specialistWorkloads,
  teamCapacity,
  urgencyLabel,
} from "@/lib/engagement/manager";
import type { Urgency } from "@/lib/engagement/attention-order";
import { AsOfNote } from "@/components/AsOfNote";
import { Card } from "@/components/Card";
import { HealthBadge } from "@/components/HealthBadge";
import { PageHeader } from "@/components/PageHeader";
import { SeverityTag } from "@/components/SeverityTag";
import { SyntheticNotice } from "@/components/SyntheticNotice";
import { RecommendationPill } from "@/components/engagement/ExpansionPanel";
import { Pill, type Tone } from "@/components/engagement/Pill";

const urgencyTone: Record<Urgency, Tone> = { act_now: "bad", this_week: "warn", watch: "neutral" };
const complexityTone = { low: "neutral", medium: "info", high: "warn" } as const;

export default async function ManagerPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const asOfState = resolveAsOf((await searchParams)?.asOf);
  const asOf = asOfState.date;
  const accounts = getAccounts();
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;
  const attention = accountAttention(asOf);
  const workloads = specialistWorkloads(asOf);
  const capacity = teamCapacity(asOf);
  const overdue = overdueCommitments(asOf);
  const escalations = openEscalations();
  const coaching = getTeam().coachingActions;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Manager Decisions"
        subtitle={`Where the team's attention goes this week and why, as of ${formatDate(asOf)}. Every item cites the record it rests on.`}
      >
        <AsOfNote asOf={asOfState} />
        <div className="mt-6">
          <SyntheticNotice>
            Specialists are role labels, not people. Accounts, hours and commitments are invented
            for demonstration. Capacity figures are planning assumptions.
          </SyntheticNotice>
        </div>
      </PageHeader>

      <section className="mb-10" aria-labelledby="attention-heading">
        <h2 id="attention-heading" className="text-lg font-semibold text-gray-900">
          Why each account receives attention
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Ordered by recorded reasons: act-now items first, then this-week items, then watch items,
          then the nearer renewal date. Seat count and activity volume are not part of the order.
        </p>
        <div className="mt-4 space-y-4">
          {attention.map((account) => {
            const expansion = accountExpansion(account.accountId, asOf);
            return (
              <Card key={account.accountId} className="!p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 hover:text-violet-600">
                      <Link href={`/accounts/${account.accountId}`}>{account.accountName}</Link>
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Lead: {account.leadSpecialist} · renewal in {account.daysToRenewal} days
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={complexityTone[account.complexity.band]}>
                      {account.complexity.band} complexity
                    </Pill>
                    <RecommendationPill recommendation={expansion.recommendation} />
                  </div>
                </div>
                {account.complexity.drivers.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Complexity drivers: {account.complexity.drivers.join(", ")}.
                  </p>
                )}
                {account.reasons.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-500">
                    No attention reason recorded. Routine cadence.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {account.reasons.map((reason) => (
                      <li
                        key={`${reason.kind}-${reason.evidenceRef}`}
                        className="flex flex-wrap items-baseline gap-2 text-sm"
                      >
                        <Pill tone={urgencyTone[reason.urgency]}>{urgencyLabel[reason.urgency]}</Pill>
                        <span className="font-medium text-gray-900">
                          {attentionKindLabel[reason.kind]}
                        </span>
                        <span className="min-w-0 flex-1 basis-72 text-gray-700">
                          {reason.detail}{" "}
                          <span className="font-mono text-xs text-muted">{reason.evidenceRef}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mb-10" aria-labelledby="capacity-heading">
        <h2 id="capacity-heading" className="text-lg font-semibold text-gray-900">
          Specialist assignments and capacity
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Roster order. This is planning context, not a performance ranking: account counts and
          activity say nothing about the quality of the work. Team total: {capacity.planned} of{" "}
          {capacity.capacity} assignable hours planned per week, {capacity.headroom} hours of
          headroom.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {workloads.map((workload) => {
            const used = Math.min(
              100,
              Math.round((workload.plannedHours / workload.specialist.weeklyCapacityHours) * 100),
            );
            return (
              <Card key={workload.specialist.id} className="!p-5">
                <h3 className="font-semibold text-gray-900">{workload.specialist.label}</h3>
                <p className="text-xs text-gray-500">{workload.specialist.region}</p>
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">
                    {workload.plannedHours} of {workload.specialist.weeklyCapacityHours}
                  </span>{" "}
                  assignable hours planned · {workload.headroomHours} headroom
                </p>
                <div className="mt-1.5">
                  <Meter value={used} label={`${used}% of assignable hours planned`} />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">{workload.specialist.capacityBasis}</p>

                <ul className="mt-3 space-y-1.5 text-sm">
                  {workload.assignments.map((assignment) => (
                    <li key={assignment.accountId} className="flex flex-wrap items-baseline gap-x-2">
                      <Link
                        href={`/accounts/${assignment.accountId}`}
                        className="font-medium text-gray-900 hover:text-violet-600"
                      >
                        {assignment.accountName}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {assignment.role} · {assignment.plannedHoursPerWeek} h/week ·{" "}
                        {assignment.complexity} complexity
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
                  <div>
                    <dt className="font-semibold text-gray-900">Commitments</dt>
                    <dd>
                      {workload.openCommitments} open, {workload.overdueCommitments} overdue
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">Escalations raised</dt>
                    <dd>{workload.openEscalations} open</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-semibold text-gray-900">Interventions</dt>
                    <dd>
                      {workload.interventions.byStage.proposed} proposed,{" "}
                      {workload.interventions.byStage.underway} underway,{" "}
                      {workload.interventions.byStage.completed} completed and not evaluated,{" "}
                      {workload.interventions.byStage.evaluated} evaluated
                    </dd>
                  </div>
                </dl>
                {workload.context.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-600">
                    {workload.context.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <Card className="!p-5">
          <h2 className="font-semibold text-gray-900">Overdue commitments</h2>
          {overdue.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">None.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {overdue.map((commitment) => (
                <li key={commitment.id} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={commitment.daysOverdue > 14 ? "bad" : "warn"}>
                      {commitment.daysOverdue} days overdue
                    </Pill>
                    <span className="font-medium text-gray-900">
                      {accountName(commitment.accountId)}
                    </span>
                    <span className="font-mono text-xs text-muted">{commitment.id}</span>
                  </div>
                  <p className="mt-1 text-gray-700">{commitment.description}</p>
                  <p className="text-xs text-gray-500">
                    Owner: {commitment.ownerLabel}
                    {commitment.ownerType === "customer" && " (customer side)"} · due{" "}
                    {formatDate(commitment.dueOn)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="!p-5">
          <h2 className="font-semibold text-gray-900">Open escalations</h2>
          {escalations.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">None.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {escalations.map((escalation) => (
                <li key={escalation.id} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityTag severity={escalation.severity} />
                    <span className="font-medium text-gray-900">
                      {accountName(escalation.accountId)}
                    </span>
                    <span className="font-mono text-xs text-muted">{escalation.id}</span>
                  </div>
                  <p className="mt-1 text-gray-700">{escalation.topic}</p>
                  <p className="mt-1 text-gray-700">
                    <span className="font-medium text-gray-900">Decision needed:</span>{" "}
                    {escalation.decisionNeeded}
                  </p>
                  <p className="text-xs text-gray-500">
                    Raised by {specialistLabel(escalation.raisedById)} on{" "}
                    {formatDate(escalation.raisedOn)} · owner {escalation.decisionOwner} · due{" "}
                    {formatDate(escalation.dueOn)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="mb-10" aria-labelledby="coaching-heading">
        <h2 id="coaching-heading" className="text-lg font-semibold text-gray-900">
          Coaching actions
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Each action rests on an observed piece of work, linked below. Coaching covers practice to
          keep as well as practice to change.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {coaching.map((action) => (
            <Card key={action.id} className="!p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-gray-900">{specialistLabel(action.specialistId)}</h3>
                <Link
                  href={`/interventions#${action.evidenceRef}`}
                  className="font-mono text-xs text-violet-600 hover:text-violet-700"
                >
                  {action.evidenceRef}
                </Link>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium text-gray-900">Observed:</span> {action.observation}
              </p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium text-gray-900">Action:</span> {action.action}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Observed {formatDate(action.observedOn)} · due {formatDate(action.dueOn)} ·{" "}
                {action.status}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="expansion-heading">
        <h2 id="expansion-heading" className="text-lg font-semibold text-gray-900">
          Expansion readiness across accounts
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Six evidence criteria per account. The health band is shown beside the recommendation
          because the two can disagree: heavy use is not demonstrated value.
        </p>
        <div tabIndex={0} className="mt-4 overflow-x-auto rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Expansion readiness per account: six evidence criteria</caption>
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Account</th>
                <th scope="col" className="px-3 py-2 font-medium">Adoption health</th>
                <th scope="col" className="px-3 py-2 font-medium">Recommendation</th>
                <th scope="col" className="px-3 py-2 font-medium">Met</th>
                <th scope="col" className="px-3 py-2 font-medium">Not met</th>
                <th scope="col" className="px-3 py-2 font-medium">Unknown</th>
                <th scope="col" className="px-3 py-2 font-medium">Evidence missing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map((account) => {
                const expansion = accountExpansion(account.id, asOf);
                return (
                  <tr key={account.id}>
                    <td className="px-3 py-3 font-medium text-gray-900">
                      <Link href={`/accounts/${account.id}`} className="hover:text-violet-600">
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-start">
                        <HealthBadge health={accountHealth(account.id)} />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <RecommendationPill recommendation={expansion.recommendation} short />
                    </td>
                    <td className="px-3 py-3 text-emerald-700">{expansion.counts.met}</td>
                    <td className="px-3 py-3 text-red-700">{expansion.counts.not_met}</td>
                    <td className="px-3 py-3 text-gray-500">{expansion.counts.unknown}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {expansion.missingEvidence.length} item(s)
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
