import { notFound } from "next/navigation";
import Link from "next/link";
import { getAccounts, getBlockers, getFeedback } from "@/lib/data";
import { accountHealth } from "@/lib/aggregate";
import { recommendAction } from "@/lib/actions";
import { computeHealth } from "@/lib/health";
import { formatDate, resolveAsOf } from "@/lib/engagement/as-of";
import { buildCustomerReview } from "@/lib/engagement/customer-review";
import { specialistLabel, getEngagement } from "@/lib/engagement/data";
import { assessComplexity } from "@/lib/engagement/capacity";
import { AsOfNote } from "@/components/AsOfNote";
import { HealthExplanation } from "@/components/HealthExplanation";
import { HealthBadge } from "@/components/HealthBadge";
import { TrendBar } from "@/components/TrendBar";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { SeverityTag } from "@/components/SeverityTag";
import { SyntheticNotice } from "@/components/SyntheticNotice";
import { AdoptionTrendTable, MetricDefinitions } from "@/components/engagement/AdoptionTrendTable";
import { ExpansionPanel, RenewalAidPanel } from "@/components/engagement/ExpansionPanel";
import { InterventionCard } from "@/components/engagement/InterventionCard";
import { ValuePanel } from "@/components/engagement/ValuePanel";

const pct = (n: number) => `${Math.round(n * 100)}%`;

function Unknown({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm italic text-gray-500">
      Unknown: {children}
    </p>
  );
}

export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const asOfState = resolveAsOf((await searchParams)?.asOf);
  const asOf = asOfState.date;
  const accounts = getAccounts();
  const account = accounts.find((a) => a.id === id);
  const review = account ? buildCustomerReview(account.id, asOf) : null;
  const engagement = account ? getEngagement(account.id) : undefined;

  if (!account || !review || !engagement) {
    notFound();
  }

  const health = accountHealth(account.id);
  const blockers = getBlockers().filter((b) => b.accountId === account.id);
  const feedback = getFeedback().filter((f) => f.accountId === account.id);
  const action = recommendAction(account, blockers, health, review.expansion.recommendation);
  const complexity = assessComplexity(engagement.complexity);

  const utilization = account.seats > 0 ? account.activeUsers / account.seats : 0;

  const delta = health.score - account.previousHealthScore;
  const deltaClass = delta > 0
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : delta < 0
    ? "bg-red-50 text-red-700 border-red-100"
    : "bg-gray-50 text-gray-600 border-gray-100";
  const deltaText = delta > 0 ? `+${delta} (QBR ↗)` : delta < 0 ? `${delta} (QBR ↘)` : "Stable (QBR)";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-sm font-medium text-violet-600 hover:text-violet-700">
          ← Back to portfolio
        </Link>
      </div>

      <PageHeader
        title={account.name}
        subtitle={`${account.type === "law_firm" ? "Law firm" : "In-house team"} · ${account.activeUsers}/${account.seats} licensed seats active (${pct(utilization)})`}
      >
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <HealthBadge health={health} breakdown={health.breakdown} />
          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${deltaClass}`}>
            {deltaText}
          </span>
          <span className="text-sm text-gray-500">Renewal: {formatDate(account.renewalDate)}</span>
        </div>
        <HealthExplanation health={health} previousScore={account.previousHealthScore} />
        <p className="mt-3 text-sm text-gray-600">
          Lead: {specialistLabel(engagement.reviewOwnerId)} · {complexity.band} complexity
          {complexity.drivers.length > 0 && ` (${complexity.drivers.join(", ")})`} · next review{" "}
          {formatDate(engagement.nextReviewDate)}
        </p>
        <AsOfNote asOf={asOfState} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/accounts/${account.id}/review`}
            className="inline-flex items-center rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Open customer review
          </Link>
          <a
            href={`/insights/report?account=${account.id}`}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Download review (Markdown)
          </a>
        </div>
        <div className="mt-6">
          <SyntheticNotice label={engagement.scenario?.label}>
            {engagement.scenario
              ? `${engagement.scenario.summary} Invented account and figures; no real client data.`
              : undefined}
          </SyntheticNotice>
        </div>
      </PageHeader>

      <div className="mt-10 space-y-10">
        {/* Recommended Action Card */}
        <section aria-labelledby="recommended-action-title">
          <Card>
            <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 id="recommended-action-title" className="text-xs font-bold uppercase tracking-wider text-violet-600">
                    Recommended Next Play
                  </h3>
                  <h4 className="mt-1 text-base font-bold text-gray-900">{action.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                </div>
                <div>
                  <span className="inline-block rounded bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    {action.deliverable}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section aria-labelledby="expansion-title">
          <h3 id="expansion-title" className="text-base font-semibold text-gray-900">
            Expansion readiness
          </h3>
          <p className="mb-4 mt-1 text-sm text-gray-600">
            Six criteria, each met, not met or unknown on the recorded evidence. The health score
            above is not an input.
          </p>
          <ExpansionPanel assessment={review.expansion} />
        </section>

        <section aria-labelledby="renewal-title">
          <h3 id="renewal-title" className="mb-4 text-base font-semibold text-gray-900">
            Renewal decision aid
          </h3>
          <RenewalAidPanel aid={review.renewal} />
        </section>

        <section aria-labelledby="adoption-title">
          <h3 id="adoption-title" className="text-base font-semibold text-gray-900">
            Adoption over time
          </h3>
          <p className="mb-4 mt-1 text-sm text-gray-600">
            Activation, repeat use, completed workflows and drop-off after training, each shown as
            numerator of denominator.
          </p>
          <div className="space-y-4">
            {review.adoption.length === 0 ? (
              <Unknown>
                no period-by-period adoption series is recorded for this account. Account-level
                weekly active users are shown under Practice Groups.
              </Unknown>
            ) : (
              review.adoption.map((metrics) => (
                <AdoptionTrendTable key={metrics.series.id} metrics={metrics} />
              ))
            )}
            <MetricDefinitions />
          </div>
        </section>

        <section aria-labelledby="value-title">
          <h3 id="value-title" className="text-base font-semibold text-gray-900">
            Customer value
          </h3>
          <p className="mb-4 mt-1 text-sm text-gray-600">
            Time to an acceptable completed result, human review and correction included, beside
            quality failures and rework. What was observed is kept apart from what is assumed.
          </p>
          <div className="space-y-4">
            {review.quality.length === 0 ? (
              <Unknown>
                no baseline or follow-up measurement of time to an acceptable result is recorded.
              </Unknown>
            ) : (
              review.quality.map((value) => <ValuePanel key={value.measurement.id} value={value} />)
            )}
          </div>
        </section>

        <section aria-labelledby="interventions-title">
          <h3 id="interventions-title" className="mb-4 text-base font-semibold text-gray-900">
            Interventions
          </h3>
          {review.interventions.length === 0 ? (
            <Card><p className="text-sm text-gray-500">No intervention is recorded for this account.</p></Card>
          ) : (
            <div className="space-y-4">
              {review.interventions.map(({ intervention }) => (
                <InterventionCard key={intervention.id} intervention={intervention} asOf={asOf} />
              ))}
            </div>
          )}
        </section>

        {/* Practice Group Usage Grid */}
        <section aria-labelledby="pg-title">
          <h3 id="pg-title" className="mb-4 text-base font-semibold text-gray-900">Practice Groups</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {account.practiceGroups.map((g) => {
              const groupHealth = computeHealth({
                seats: g.seats,
                activeUsers: g.activeUsers,
                weeklyActiveUsers: g.weeklyActiveUsers,
                openBlockers: [],
              });
              return (
                <div key={g.name} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{g.name}</span>
                    <HealthBadge health={groupHealth} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {g.activeUsers}/{g.seats} active seats
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {g.queriesPerWeek} queries per week
                  </p>
                  <div className="mt-3">
                    <span className="text-xs text-muted">Weekly active trend</span>
                    <TrendBar series={g.weeklyActiveUsers} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Group scores use licence use and trend only. Reviewed output is not captured per group,
            so that component is unknown and left out.
          </p>
        </section>

        {/* Blockers */}
        <section aria-labelledby="blockers-title">
          <h3 id="blockers-title" className="mb-4 text-base font-semibold text-gray-900">Blockers & Re-engagement</h3>
          {blockers.length === 0 ? (
            <Card><p className="text-sm text-gray-500">No blockers reported for this account.</p></Card>
          ) : (
            <div className="space-y-4">
              {blockers.map((b) => (
                <Card key={b.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {b.category.replaceAll("_", " ")}
                        </span>
                        <SeverityTag severity={b.severity} />
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          b.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700"
                            : b.status === "in_progress"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {b.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        <strong className="text-gray-900">CSM Action:</strong> {b.reEngagementAction}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        <strong className="text-gray-900">Workshop Follow-up:</strong> {b.workshopFollowUp}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Affected practice groups: {b.affectedGroups.join(", ")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Product Feedback */}
        <section aria-labelledby="feedback-title">
          <h3 id="feedback-title" className="text-base font-semibold text-gray-900">Feedback Log</h3>
          <p className="mb-4 mt-1 text-sm text-gray-600">{review.expansion.feedbackNote}</p>
          {feedback.length === 0 ? (
            <Card><p className="text-sm text-gray-500">No user feedback logged yet.</p></Card>
          ) : (
            <div className="space-y-4">
              {feedback.map((f) => (
                <Card key={f.id}>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500">{f.sourcePersona} · Theme: <span className="font-semibold">{f.theme}</span></span>
                      <SeverityTag severity={f.severity} />
                    </div>
                    <blockquote className="mt-2 border-l-2 border-gray-200 pl-3 italic text-sm text-gray-600">
                      &ldquo;{f.text}&rdquo;
                    </blockquote>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted">
                      <span>Product Area: <span className="capitalize">{f.productArea}</span></span>
                      <span className="capitalize">Status: {f.status.replaceAll("_", " ")}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
