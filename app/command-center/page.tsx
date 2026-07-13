import { commandCenterSnapshot } from "@/lib/command-center";
import { workflowGovernanceSnapshot } from "@/lib/workflow-governance";

export default function CommandCenterPage() {
  const { answer, recommendations, leadershipReport } = commandCenterSnapshot();
  const governance = workflowGovernanceSnapshot();
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
      <section className="rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold">Share review queue</h2><div className="mt-4 space-y-3">{governance.permissionGovernance.alerts.map((alert)=><article key={`${alert.eventId}-${alert.reason}`} className="rounded-md border border-amber-200 bg-amber-50 p-3"><strong className="text-sm">{alert.severity.toUpperCase()} · {alert.eventId}</strong><p className="mt-1 text-sm text-amber-900">{alert.reason}</p></article>)}</div><p className="mt-4 text-xs text-gray-500">Source: {governance.sourceRef}. Analytics only. External permission mutation is disabled.</p></section>

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
