import Link from "next/link";
import { getAccounts, getBlockers } from "@/lib/data";
import { accountHealth } from "@/lib/aggregate";
import { portfolioSummary } from "@/lib/portfolio";
import { computeHealth } from "@/lib/health";
import { recommendAction } from "@/lib/actions";
import { commandCenterReport } from "@/lib/command-center";
import { HealthBadge } from "@/components/HealthBadge";
import { TrendBar } from "@/components/TrendBar";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ExportButton } from "@/components/ExportButton";

const pct = (n: number) => `${Math.round(n * 100)}%`;

const prompts: { q: string; a: string }[] = [
  { q: "What workflow does this improve?", a: "Post-sales adoption of legal AI across a firm or in-house team." },
  { q: "Who is the user?", a: "CSMs, Legal Engineers, and Innovation leads steering an account." },
  { q: "Where does human review happen?", a: "The product gates every output behind a named lawyer; this view tracks adoption, not output." },
  { q: "What is blocked until approval?", a: "Expansion and renewal moves are surfaced as signals, never auto-actioned." },
  { q: "What would I tell Product?", a: "See the Product Feedback Queue — friction routed to product areas." },
];

function getRenewalStatus(dateStr: string) {
  const current = new Date("2026-06-23");
  const renewal = new Date(dateStr);
  const diffTime = renewal.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const formattedDate = renewal.toLocaleDateString('en-US', options);
  
  return {
    daysLeft: diffDays,
    formattedDate,
    isUrgent: diffDays <= 90
  };
}

export default async function AccountHealthPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const search = params.search ?? "";
  const type = params.type ?? "";
  const band = params.band ?? "";

  const accounts = getAccounts();
  const blockers = getBlockers();
  const summary = portfolioSummary();
  const commandCenter = commandCenterReport();

  const stats: { label: string; value: number; tone: string }[] = [
    { label: "Accounts", value: summary.total, tone: "text-gray-900" },
    { label: "At risk", value: summary.byBand.at_risk, tone: "text-red-700" },
    { label: "Needs attention", value: summary.byBand.needs_attention, tone: "text-amber-700" },
    { label: "Steady", value: summary.byBand.steady, tone: "text-sky-700" },
    { label: "Healthy", value: summary.byBand.healthy, tone: "text-emerald-700" },
    { label: "Expansion-ready", value: summary.expansionReady, tone: "text-violet-700" },
    { label: "Open high-sev blockers", value: summary.openHighSeverityBlockers, tone: "text-red-700" },
  ];

  // Filter accounts
  const filteredAccounts = accounts.filter((a) => {
    const health = accountHealth(a.id);
    if (type && a.type !== type) return false;
    if (band && health.band !== band) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Map health & renewal urgency to sort order
  const processedAccounts = filteredAccounts.map((account) => {
    const health = accountHealth(account.id);
    const renewalStatus = getRenewalStatus(account.renewalDate);
    const action = recommendAction(account, blockers, health);
    
    let urgencyScore = 0;
    if (renewalStatus.daysLeft <= 90 && (health.band === "at_risk" || health.band === "needs_attention")) {
      urgencyScore = 3;
    } else if (renewalStatus.daysLeft <= 90 || health.band === "at_risk") {
      urgencyScore = 2;
    } else if (health.band === "needs_attention") {
      urgencyScore = 1;
    }

    return { account, health, renewalStatus, action, urgencyScore };
  }).sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    return a.renewalStatus.daysLeft - b.renewalStatus.daysLeft;
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Account Health"
        subtitle="Adoption, utilization, and expansion readiness across the legal-AI account portfolio. All data is synthetic."
      >
        <dl className="mt-6 grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-2">
          {prompts.map((p) => (
            <div key={p.q}>
              <dt className="font-medium text-gray-900">{p.q}</dt>
              <dd className="text-gray-600">{p.a}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      {/* Filter UI Form (Pure Server-Side Action using standard HTML GET) */}
      <form method="GET" className="mb-8 grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
        <div>
          <label htmlFor="search" className="block text-xs font-semibold text-gray-500 uppercase">Search Account</label>
          <input
            type="text"
            id="search"
            name="search"
            defaultValue={search}
            placeholder="e.g. Meridian"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-xs font-semibold text-gray-500 uppercase">Account Type</label>
          <select
            id="type"
            name="type"
            defaultValue={type}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">All Types</option>
            <option value="law_firm">Law Firm</option>
            <option value="in_house">In-house Team</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div className="grow">
            <label htmlFor="band" className="block text-xs font-semibold text-gray-500 uppercase">Health Band</label>
            <select
              id="band"
              name="band"
              defaultValue={band}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">All Bands</option>
              <option value="at_risk">At Risk</option>
              <option value="needs_attention">Needs Attention</option>
              <option value="steady">Steady</option>
              <option value="healthy">Healthy</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer transition-colors"
            >
              Apply
            </button>
            {(search || type || band) && (
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              >
                Reset
              </Link>
            )}
          </div>
        </div>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">Portfolio Status</h3>
        <ExportButton accounts={filteredAccounts} />
      </div>

      <section
        className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
        aria-label="Portfolio overview"
      >
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 p-3 text-center">
            <div className={`text-2xl font-semibold ${s.tone}`}>{s.value}</div>
            <div className="mt-0.5 text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="mb-10 rounded-lg border border-gray-200 bg-white p-5" aria-labelledby="command-center-heading">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Command Center</p>
            <h2 id="command-center-heading" className="mt-1 text-lg font-semibold text-gray-900">
              Legal AI adoption intelligence
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              Synthetic aggregate view across assistant, workflow agents, review tables, knowledge, Outlook and writing-style usage. External action remains blocked by review policy.
            </p>
          </div>
          <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-600">
            {commandCenter.schema}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-6">
          <CommandMetric label="Active users" value={commandCenter.activeUsers} />
          <CommandMetric label="Workflow runs" value={commandCenter.workflowRuns} />
          <CommandMetric label="Review tables" value={commandCenter.reviewTables} />
          <CommandMetric label="Draft outputs" value={commandCenter.draftOutputs} />
          <CommandMetric label="Verified outputs" value={commandCenter.verifiedOutputs} />
          <CommandMetric label="Blocked outputs" value={commandCenter.blockedOutputs} tone="text-red-700" />
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-gray-100">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50 px-3 py-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">aOS adoption profile</h3>
              <p className="mt-1 text-xs text-gray-600">{commandCenter.aosProfile.reviewNotice}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded border border-gray-200 bg-white px-2 py-1 font-mono text-gray-600">
                {commandCenter.aosProfile.schema}
              </span>
              <span className="rounded border border-red-100 bg-red-50 px-2 py-1 font-semibold text-red-700">
                {commandCenter.aosProfile.externalActionAllowed ? "external allowed" : "external blocked"}
              </span>
            </div>
          </div>
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-gray-100 p-3 lg:border-b-0 lg:border-r">
              <dl className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <dt className="font-semibold text-gray-900">Source mode</dt>
                  <dd>{commandCenter.aosProfile.sourceMode}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Deck package</dt>
                  <dd>{commandCenter.aosProfile.adoptionSignals.deckPackageReady ? "ready" : "pending"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Power groups</dt>
                  <dd>{commandCenter.aosProfile.adoptionSignals.powerUserGroups}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Review gates</dt>
                  <dd>{commandCenter.aosProfile.adoptionSignals.reviewGatesTracked}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-gray-600">
                Sources: {commandCenter.aosProfile.generatedFrom.join(", ")}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Surface</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Usage signal</th>
                    <th className="px-3 py-2 font-medium">Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commandCenter.aosProfile.productSurfaceCoverage.map((surface) => (
                    <tr key={surface.surface}>
                      <td className="px-3 py-3 font-medium text-gray-900">{surface.surface}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded border px-2 py-1 text-xs ${commandStatusClass(surface.status)}`}>
                          {surface.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-gray-700">{surface.usageSignal}</td>
                      <td className="px-3 py-3 text-gray-600">{surface.reviewGate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
              <h3 className="text-sm font-semibold text-gray-900">Synthetic peer benchmarks</h3>
            </div>
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Metric</th>
                  <th className="px-3 py-2 font-medium">Firm</th>
                  <th className="px-3 py-2 font-medium">Peer median</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commandCenter.benchmarks.map((benchmark) => (
                  <tr key={benchmark.metric}>
                    <td className="px-3 py-3 font-medium text-gray-900">{benchmark.metric}</td>
                    <td className="px-3 py-3 font-mono text-gray-700">{benchmark.firmValue}</td>
                    <td className="px-3 py-3 font-mono text-gray-700">{benchmark.peerMedian}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded border px-2 py-1 text-xs ${commandStatusClass(benchmark.status)}`}>
                        {benchmark.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{benchmark.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
              <h3 className="text-sm font-semibold text-gray-900">Release and access actions</h3>
            </div>
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Release</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Users</th>
                  <th className="px-3 py-2 font-medium">Next action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commandCenter.releaseActions.map((release) => (
                  <tr key={release.release}>
                    <td className="px-3 py-3 font-medium text-gray-900">{release.release}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded border px-2 py-1 text-xs ${commandStatusClass(release.status)}`}>
                        {release.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-gray-700">{release.eligibleUsers}</td>
                    <td className="px-3 py-3 text-gray-600">{release.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
              {commandCenter.releaseActions[0]?.gate}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Runs</th>
                    <th className="px-3 py-2 font-medium">Active users</th>
                    <th className="px-3 py-2 font-medium">Review tables</th>
                    <th className="px-3 py-2 font-medium">Verified</th>
                    <th className="px-3 py-2 font-medium">Blocked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commandCenter.productUsage.map((product) => (
                    <tr key={product.product}>
                      <td className="px-3 py-3 font-medium text-gray-900">{product.product.replace("_", " ")}</td>
                      <td className="px-3 py-3 text-gray-600">{product.runs}</td>
                      <td className="px-3 py-3 text-gray-600">{product.activeUsers}</td>
                      <td className="px-3 py-3 text-gray-600">{product.reviewTables}</td>
                      <td className="px-3 py-3 text-gray-600">{product.verifiedOutputs}</td>
                      <td className="px-3 py-3 text-red-700">{product.blockedOutputs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
                <h3 className="text-sm font-semibold text-gray-900">Practice group usage</h3>
              </div>
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Practice</th>
                    <th className="px-3 py-2 font-medium">Users</th>
                    <th className="px-3 py-2 font-medium">Runs</th>
                    <th className="px-3 py-2 font-medium">Tables</th>
                    <th className="px-3 py-2 font-medium">Verified</th>
                    <th className="px-3 py-2 font-medium">Blocked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commandCenter.practiceGroupUsage.map((group) => (
                    <tr key={group.practiceGroup}>
                      <td className="px-3 py-3 font-medium text-gray-900">{group.practiceGroup}</td>
                      <td className="px-3 py-3 text-gray-600">{group.activeUsers}</td>
                      <td className="px-3 py-3 text-gray-600">{group.workflowRuns}</td>
                      <td className="px-3 py-3 text-gray-600">{group.reviewTables}</td>
                      <td className="px-3 py-3 text-gray-600">{group.verifiedOutputs}</td>
                      <td className="px-3 py-3 text-red-700">{group.blockedOutputs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Ask Command Center</h3>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {commandCenter.leadershipBrief.headline}
            </p>
            <div className="mt-3 rounded-lg border border-violet-100 bg-white p-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700">
                {commandCenter.leadershipBrief.title}
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-gray-700">
                {commandCenter.leadershipBrief.slides.map((slide) => (
                  <li key={slide}>{slide}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-600">{commandCenter.leadershipBrief.reviewGate}</p>
            </div>
            <div className="mt-3 rounded-lg border border-violet-100 bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700">
                    Presentation package
                  </h4>
                  <p className="mt-1 text-xs text-gray-600">{commandCenter.presentationDeck.audience}</p>
                </div>
                <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-[10px] text-gray-600">
                  {commandCenter.presentationDeck.schema}
                </span>
              </div>
              <dl className="mt-3 grid gap-2 text-xs text-gray-700">
                {commandCenter.presentationDeck.slides.map((slide) => (
                  <div key={slide.title}>
                    <dt className="font-semibold text-gray-900">{slide.title}</dt>
                    <dd className="mt-0.5">{slide.takeaway}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-gray-600">
                Sources: {commandCenter.presentationDeck.generatedFrom.join(", ")}. Formats:{" "}
                {commandCenter.presentationDeck.exportFormats.join(", ")}.
              </p>
              <ul className="mt-2 space-y-1 text-xs text-gray-700">
                {commandCenter.presentationDeck.evidenceList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-600">{commandCenter.presentationDeck.accountOwnerReviewGate}</p>
              <p className="mt-2 text-xs text-gray-600">{commandCenter.presentationDeck.exportGate}</p>
            </div>
            <div className="mt-4 space-y-3">
              <CommandList title="Power user groups" values={commandCenter.powerUserGroups.map((group) => `${group.accountName}, ${group.practiceGroup}: ${group.runs} runs`)} />
              <CommandList title="Needs attention" values={commandCenter.needsAttention} />
              <CommandList title="Recommended actions" values={commandCenter.recommendedActions} />
              <CommandList title="Enabled releases" values={commandCenter.releaseReadiness} />
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
            <h3 className="text-sm font-semibold text-gray-900">Prompt improvement backlog</h3>
            <p className="mt-1 text-xs text-gray-600">
              Structured prompt contracts for workflows that need stronger source hierarchy, failure conditions or review-table output.
            </p>
          </div>
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">Workflow</th>
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Missing</th>
                <th className="px-3 py-2 font-medium">Review gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commandCenter.promptReadiness.map((item) => (
                <tr key={`${item.accountName}-${item.workflow}`}>
                  <td className="px-3 py-3 font-medium text-gray-900">{item.workflow}</td>
                  <td className="px-3 py-3 text-gray-600">{item.accountName}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded border px-2 py-1 text-xs ${commandStatusClass(item.status)}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    {item.missingFields.length ? item.missingFields.join(", ") : "Complete"}
                  </td>
                  <td className="px-3 py-3 text-gray-600">{item.reviewGate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="space-y-8">
        {processedAccounts.length === 0 ? (
          <Card>
            <p className="text-center py-6 text-sm text-gray-500">No accounts match the active search filters.</p>
          </Card>
        ) : (
          processedAccounts.map(({ account, health, renewalStatus, action }) => {
            const utilization = account.seats > 0 ? account.activeUsers / account.seats : 0;
            const delta = health.score - account.previousHealthScore;
            const deltaClass = delta > 0 
              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
              : delta < 0 
              ? "bg-red-50 text-red-700 border-red-100" 
              : "bg-gray-50 text-gray-600 border-gray-100";
            const deltaText = delta > 0 ? `+${delta} (QBR ↗)` : delta < 0 ? `${delta} (QBR ↘)` : "Stable (QBR)";

            return (
              <Card key={account.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold hover:text-violet-600 transition-colors">
                      <Link href={`/accounts/${account.id}`}>{account.name}</Link>
                    </h2>
                    <p className="text-sm text-gray-500">
                      {account.type === "law_firm" ? "Law firm" : "In-house team"} ·{" "}
                      {account.activeUsers}/{account.seats} seats active ({pct(utilization)})
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-gray-500">Renewal: {renewalStatus.formattedDate}</span>
                      <span className={`font-medium ${renewalStatus.daysLeft <= 90 ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
                        ({renewalStatus.daysLeft > 0 ? `in ${renewalStatus.daysLeft} days` : `expired ${Math.abs(renewalStatus.daysLeft)} days ago`})
                      </span>
                      <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${deltaClass}`}>
                        {deltaText}
                      </span>
                      {renewalStatus.daysLeft <= 90 && (health.band === "at_risk" || health.band === "needs_attention") && (
                        <span className="inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase">
                          ⚠️ Renewal Risk
                        </span>
                      )}
                    </div>
                  </div>
                  <HealthBadge health={health} breakdown={health.breakdown} />
                </div>

                <div className="mt-4 flex items-center gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Weekly active users</p>
                    <TrendBar series={account.weeklyActiveUsers} />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">Practice groups</h3>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {account.practiceGroups.map((g) => {
                      const groupHealth = computeHealth({
                        seats: g.seats,
                        activeUsers: g.activeUsers,
                        weeklyActiveUsers: g.weeklyActiveUsers,
                        openBlockers: [],
                        feedbackSharedWithProduct: 0,
                        feedbackTotal: 0,
                      });
                      return (
                        <div key={g.name} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{g.name}</span>
                            <HealthBadge health={groupHealth} />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {g.activeUsers}/{g.seats} active · {g.queriesPerWeek} queries/wk
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">Persona adoption</h3>
                  <table className="mt-2 w-full text-sm">
                    <caption className="sr-only">Persona adoption for {account.name}</caption>
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                        <th className="py-1 font-medium">Role</th>
                        <th className="py-1 font-medium">Seats</th>
                        <th className="py-1 font-medium">Adoption</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account.personas.map((p) => (
                        <tr key={p.role} className="border-t border-gray-100">
                          <td className="py-1.5">{p.role}</td>
                          <td className="py-1.5 text-gray-600">{p.count}</td>
                          <td className="py-1.5 text-gray-600">{pct(p.adoptionRate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6">
                  <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Recommended Next Play</h4>
                        <h5 className="mt-1 text-sm font-bold text-gray-900">{action.title}</h5>
                        <p className="mt-1 text-xs text-gray-600">{action.description}</p>
                      </div>
                      <div className="shrink-0">
                        <span className="inline-block rounded bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                          {action.deliverable}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}

function CommandMetric({
  label,
  value,
  tone = "text-gray-900",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
      <div className={`text-2xl font-semibold ${tone}`}>{value}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  );
}

function CommandList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700">{title}</h4>
      <ul className="mt-1 space-y-1 text-xs text-gray-700">
        {(values.length ? values : ["No items in this synthetic snapshot."]).slice(0, 4).map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  );
}

function commandStatusClass(status: string) {
  if (status === "ahead" || status === "enabled" || status === "ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "behind" || status === "not_enabled" || status === "blocked") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-800";
}
