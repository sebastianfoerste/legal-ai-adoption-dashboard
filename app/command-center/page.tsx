import { commandCenterSnapshot } from "@/lib/command-center";
import { workflowGovernanceSnapshot } from "@/lib/workflow-governance";
import { getAccounts } from "@/lib/data";
import { formatDate, resolveAsOf } from "@/lib/engagement/as-of";
import { getEngagement, specialistLabel } from "@/lib/engagement/data";
import { accountExpansion } from "@/lib/engagement/expansion";
import { RecommendationPill } from "@/components/engagement/ExpansionPanel";

export default async function CommandCenterPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const asOf = resolveAsOf((await searchParams)?.asOf).date;
  const { answer, recommendations, leadershipReport } = commandCenterSnapshot();
  const governance = workflowGovernanceSnapshot();
  const reviews = getAccounts().map((account) => ({
    account,
    expansion: accountExpansion(account.id, asOf),
    engagement: getEngagement(account.id),
  }));
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Command Center</p>
        <h1 className="mt-1 text-2xl font-semibold">Adoption intelligence and recommendations</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Ask constrained questions over synthetic adoption data, prioritize reviewed capability rollouts and prepare a leadership report package.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Command Center Agent</h2>
        <p className="mt-2 text-sm font-medium text-gray-900">{answer.question}</p>
        <p className="mt-2 text-sm leading-6 text-gray-600">{answer.answer}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {answer.evidence.map((item) => (
            <article key={item.metric} className="rounded-md bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{item.metric}</p>
              <p className="mt-1 font-semibold">{item.value}</p>
              <p className="mt-1 text-xs text-gray-400">{item.sourceRef}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold">Workflow templates</h2><p className="mt-3 text-3xl font-semibold">{governance.workflowAnalytics.events}</p><p className="mt-1 text-sm text-gray-600">events across {governance.workflowAnalytics.apps} synthetic apps, {governance.workflowAnalytics.blockedEvents} blocked</p></article>
        <article className="rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold">Collaboration</h2><p className="mt-3 text-3xl font-semibold">{governance.collaborationMetrics.reviewerCoveragePercent}%</p><p className="mt-1 text-sm text-gray-600">reviewer coverage, {governance.collaborationMetrics.commentResolutionMinutes} minute comment resolution, {governance.collaborationMetrics.lockContention} lock conflict</p></article>
        <article className="rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold">Permission governance</h2><p className="mt-3 text-3xl font-semibold">{governance.permissionGovernance.alerts.length}</p><p className="mt-1 text-sm text-gray-600">synthetic access alerts across {governance.permissionGovernance.activeShares} active shares</p></article>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold">Share review queue</h2><div className="mt-4 space-y-3">{governance.permissionGovernance.alerts.map((alert)=><article key={`${alert.eventId}-${alert.reason}`} className="rounded-md border border-amber-200 bg-amber-50 p-3"><a href={alert.href} className="text-sm font-semibold underline">{alert.severity.toUpperCase()} · {alert.eventId}</a><p className="mt-1 text-sm text-amber-900">{alert.reason}</p></article>)}</div><p className="mt-4 text-xs text-gray-500">{governance.permissionGovernance.guestShares} guest shares, {governance.permissionGovernance.resourcesAcrossShares} resources, {governance.permissionGovernance.overdueAccessReviews} overdue access review. Source: {governance.sourceRef}. Analytics only. External permission mutation is disabled.</p></section>
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Metric definitions and source events</h2>
        <dl className="mt-3 space-y-2 text-sm">{Object.entries(governance.metricDefinitions).map(([name, definition]) => <div key={name}><dt className="font-medium">{name}</dt><dd className="text-gray-600">{definition}</dd></div>)}</dl>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{governance.eventRecords.map((event) => <article id={`event-${event.id}`} key={event.id} className="rounded border p-3 text-xs"><strong>{event.id}</strong><p>{event.appId} · {event.featureId} · {event.eventType} · {event.status}</p><p className="text-gray-500">{event.occurredAt}</p></article>)}</div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Capability recommendations</h2>
        <div className="mt-4 space-y-3">
          {recommendations.map((recommendation) => (
            <article key={`${recommendation.rank}-${recommendation.capability}`} className="rounded-md border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">{recommendation.rank}</span>
                <div>
                  <h3 className="font-medium">{recommendation.capability}</h3>
                  <p className="mt-1 text-sm text-gray-600">{recommendation.reason}</p>
                  <p className="mt-2 text-xs text-gray-500">{recommendation.action} {recommendation.gate}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="font-semibold">Customer review reports</h2>
        <p className="mt-1 text-sm text-gray-600">
          One synthetic review per account: objectives, adoption trends, intervention outcomes, quality evidence, unresolved problems and a reasoned recommendation with owners and review dates.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="px-3 py-2 font-medium">Recommendation</th>
                <th className="px-3 py-2 font-medium">Next review</th>
                <th className="px-3 py-2 font-medium">Owner</th>
                <th className="px-3 py-2 font-medium">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map(({ account, expansion, engagement }) => (
                <tr key={account.id}>
                  <td className="px-3 py-3 font-medium text-gray-900">{account.name}</td>
                  <td className="px-3 py-3"><RecommendationPill recommendation={expansion.recommendation} short /></td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-600">{engagement ? formatDate(engagement.nextReviewDate) : "Unknown"}</td>
                  <td className="px-3 py-3 text-gray-600">{engagement ? specialistLabel(engagement.reviewOwnerId) : "Unknown"}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <a className="font-medium text-blue-700 underline" href={`/accounts/${account.id}/review`}>Open</a>
                    <span className="mx-2 text-gray-300">|</span>
                    <a className="font-medium text-blue-700 underline" href={`/command-center/report?account=${account.id}`}>Markdown</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500">Synthetic scenarios. Recommendations are decision aids for the account owner; nothing is sent or booked.</p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Leadership report generator</h2>
            <p className="mt-1 text-sm text-gray-600">{leadershipReport.audience}</p>
          </div>
          <div className="flex items-center gap-2">
            <a className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700" href="/command-center/report">
              Download Markdown
            </a>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">account-owner review required</span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {leadershipReport.sections.map((section) => (
            <article key={section.heading} className="rounded-md border border-gray-200 p-4">
              <h3 className="font-medium">{section.heading}</h3>
              <p className="mt-1 text-sm text-gray-600">{section.takeaway}</p>
              <p className="mt-2 text-xs text-gray-400">{section.evidence.length} evidence item(s)</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Generated format: {leadershipReport.generatedFormat}. Reviewed conversion targets: {leadershipReport.reviewedConversionTargets.join(", ")}. {leadershipReport.reviewGate}
        </p>
      </section>
    </main>
  );
}
