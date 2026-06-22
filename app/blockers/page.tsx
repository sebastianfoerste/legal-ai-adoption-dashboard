import { getAccounts, getBlockers } from "@/lib/data";
import { accountHealth } from "@/lib/aggregate";
import { HealthBadge } from "@/components/HealthBadge";
import { SeverityTag } from "@/components/SeverityTag";
import type { Blocker, Severity } from "@/lib/schema";

const severityWeight: Record<Severity, number> = { low: 1, medium: 2, high: 3 };

const categoryLabel: Record<Blocker["category"], string> = {
  trust_in_output: "Trust in output",
  workflow_fit: "Workflow fit",
  training_gap: "Training gap",
  integration: "Integration",
  change_management: "Change management",
  pricing_value: "Pricing & value",
};

const weightOf = (blockers: Blocker[]) =>
  blockers.reduce((sum, b) => sum + severityWeight[b.severity], 0);

export default function BlockersPage() {
  const accounts = getAccounts();
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  const open = getBlockers().filter((b) => b.status !== "resolved");

  const byCategory = new Map<Blocker["category"], Blocker[]>();
  for (const b of open) {
    const list = byCategory.get(b.category) ?? [];
    list.push(b);
    byCategory.set(b.category, list);
  }
  const categories = [...byCategory.entries()].sort((a, b) => weightOf(b[1]) - weightOf(a[1]));

  const atRisk = accounts
    .map((a) => ({ account: a, health: accountHealth(a.id) }))
    .filter((x) => x.health.band === "at_risk" || x.health.band === "needs_attention")
    .sort((a, b) => a.health.score - b.health.score);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Adoption Blockers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Open blockers grouped by category, worst first, each with a re-engagement action and a
          workshop follow-up.
        </p>
      </header>

      {atRisk.length > 0 && (
        <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900">Accounts needing attention</h2>
          <ul className="mt-3 space-y-2">
            {atRisk.map(({ account, health }) => (
              <li key={account.id} className="flex items-center justify-between text-sm">
                <span>{account.name}</span>
                <HealthBadge health={health} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-6">
        {categories.map(([category, blockers]) => (
          <section key={category} className="rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold">{categoryLabel[category]}</h2>
            <ul className="mt-4 space-y-4">
              {blockers.map((b) => (
                <li
                  key={b.id}
                  className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityTag severity={b.severity} />
                    <span className="text-sm font-medium">{accountName(b.accountId)}</span>
                    <span className="text-xs text-gray-400">{b.affectedGroups.join(", ")}</span>
                    {b.status === "in_progress" && (
                      <span className="text-xs font-medium text-sky-600">in progress</span>
                    )}
                  </div>
                  <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Re-engagement</dt>
                      <dd className="text-gray-700">{b.reEngagementAction}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">
                        Workshop follow-up
                      </dt>
                      <dd className="text-gray-700">{b.workshopFollowUp}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
