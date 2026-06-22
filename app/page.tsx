import { getAccounts } from "@/lib/data";
import { accountHealth } from "@/lib/aggregate";
import { portfolioSummary } from "@/lib/portfolio";
import { computeHealth } from "@/lib/health";
import { HealthBadge } from "@/components/HealthBadge";
import { TrendBar } from "@/components/TrendBar";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const pct = (n: number) => `${Math.round(n * 100)}%`;

const prompts: { q: string; a: string }[] = [
  { q: "What workflow does this improve?", a: "Post-sales adoption of legal AI across a firm or in-house team." },
  { q: "Who is the user?", a: "CSMs, Legal Engineers, and Innovation leads steering an account." },
  { q: "Where does human review happen?", a: "The product gates every output behind a named lawyer; this view tracks adoption, not output." },
  { q: "What is blocked until approval?", a: "Expansion and renewal moves are surfaced as signals, never auto-actioned." },
  { q: "What would I tell Product?", a: "See the Product Feedback Queue — friction routed to product areas." },
];

export default function AccountHealthPage() {
  const accounts = getAccounts();
  const summary = portfolioSummary();

  const stats: { label: string; value: number; tone: string }[] = [
    { label: "Accounts", value: summary.total, tone: "text-gray-900" },
    { label: "At risk", value: summary.byBand.at_risk, tone: "text-red-700" },
    { label: "Needs attention", value: summary.byBand.needs_attention, tone: "text-amber-700" },
    { label: "Steady", value: summary.byBand.steady, tone: "text-sky-700" },
    { label: "Healthy", value: summary.byBand.healthy, tone: "text-emerald-700" },
    { label: "Expansion-ready", value: summary.expansionReady, tone: "text-violet-700" },
    { label: "Open high-sev blockers", value: summary.openHighSeverityBlockers, tone: "text-red-700" },
  ];

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

      <div className="space-y-8">
        {accounts.map((account) => {
          const health = accountHealth(account.id);
          const utilization = account.seats > 0 ? account.activeUsers / account.seats : 0;
          return (
            <Card key={account.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{account.name}</h2>
                  <p className="text-sm text-gray-500">
                    {account.type === "law_firm" ? "Law firm" : "In-house team"} ·{" "}
                    {account.activeUsers}/{account.seats} seats active ({pct(utilization)})
                  </p>
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
            </Card>
          );
        })}
      </div>
    </main>
  );
}
