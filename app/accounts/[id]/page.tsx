import { notFound } from "next/navigation";
import Link from "next/link";
import { getAccounts, getBlockers, getFeedback } from "@/lib/data";
import { accountHealth } from "@/lib/aggregate";
import { recommendAction } from "@/lib/actions";
import { computeHealth } from "@/lib/health";
import { HealthBadge } from "@/components/HealthBadge";
import { TrendBar } from "@/components/TrendBar";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { SeverityTag } from "@/components/SeverityTag";

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const accounts = getAccounts();
  const account = accounts.find((a) => a.id === id);

  if (!account) {
    notFound();
  }

  const health = accountHealth(account.id);
  const blockers = getBlockers().filter((b) => b.accountId === account.id);
  const feedback = getFeedback().filter((f) => f.accountId === account.id);
  const action = recommendAction(account, blockers, health);

  const utilization = account.seats > 0 ? account.activeUsers / account.seats : 0;
  
  const delta = health.score - account.previousHealthScore;
  const deltaClass = delta > 0 
    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
    : delta < 0 
    ? "bg-red-50 text-red-700 border-red-100" 
    : "bg-gray-50 text-gray-600 border-gray-100";
  const deltaText = delta > 0 ? `+${delta} (QBR ↗)` : delta < 0 ? `${delta} (QBR ↘)` : "Stable (QBR)";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-sm font-medium text-violet-600 hover:text-violet-700">
          ← Back to portfolio
        </Link>
      </div>

      <PageHeader
        title={account.name}
        subtitle={`${account.type === "law_firm" ? "Law firm" : "In-house team"} · ${account.activeUsers}/${account.seats} seats active (${pct(utilization)})`}
      >
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <HealthBadge health={health} breakdown={health.breakdown} />
          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${deltaClass}`}>
            {deltaText}
          </span>
          <span className="text-sm text-gray-500">Renewal: {account.renewalDate}</span>
        </div>
      </PageHeader>

      <div className="mt-10 space-y-8">
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
                feedbackSharedWithProduct: 0,
                feedbackTotal: 0,
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
                    <span className="text-xs text-gray-400">Weekly active trend</span>
                    <TrendBar series={g.weeklyActiveUsers} />
                  </div>
                </div>
              );
            })}
          </div>
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {b.category.replace("_", " ")}
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
                      <p className="mt-1 text-xs text-gray-400">
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
          <h3 id="feedback-title" className="mb-4 text-base font-semibold text-gray-900">Feedback Log</h3>
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
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>Product Area: <span className="capitalize">{f.productArea}</span></span>
                      <span className="capitalize">Status: {f.status.replace("_", " ")}</span>
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
