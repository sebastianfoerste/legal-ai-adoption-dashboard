import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { adoptionCockpitReport } from "@/lib/adoption-cockpit";
import { buildPracticeGroupBenchmark, type PracticeGroupTrend } from "@/lib/benchmarking";
import { getAccounts } from "@/lib/data";

const bandStyle = {
  leading: "bg-emerald-100 text-emerald-800",
  mid: "bg-amber-100 text-amber-800",
  lagging: "bg-rose-100 text-rose-800",
};

export default function BenchmarksPage() {
  const report = adoptionCockpitReport();
  const trends: PracticeGroupTrend[] = getAccounts().flatMap(account => account.practiceGroups.map(group => ({ practiceGroup: group.name, weeklyActiveUsers: group.weeklyActiveUsers })));
  const benchmark = buildPracticeGroupBenchmark({ usage: report.practiceGroupUsage, trends });
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader title="Practice-Group Benchmarks" subtitle="Internal cohort bands and adoption trends derived from synthetic usage data, with account-owner review required." />
      <Card>
        <h2 className="text-sm font-semibold text-gray-900">Internal peer median</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Metric label="Workflow runs" value={benchmark.internalMedian.workflowRuns.toFixed(0)} />
          <Metric label="Active users" value={benchmark.internalMedian.activeUsers.toFixed(0)} />
          <Metric label="Verified outputs" value={`${(benchmark.internalMedian.verifiedShare * 100).toFixed(0)}%`} />
        </div>
        <p className="mt-4 text-xs text-gray-500">{benchmark.reviewGate.note}</p>
      </Card>
      <div className="mt-6 space-y-4">
        {benchmark.rows.map(row => (
          <Card key={row.practiceGroup}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{row.practiceGroup}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${bandStyle[row.band]}`}>{row.band}</span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
              <Metric label="Runs" value={String(row.workflowRuns)} />
              <Metric label="Active users" value={String(row.activeUsers)} />
              <Metric label="Verified" value={`${(row.verifiedShare * 100).toFixed(0)}%`} />
              <Metric label="WAU trend" value={row.trendDelta >= 0 ? `+${row.trendDelta}` : String(row.trendDelta)} />
            </dl>
            {row.insights.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">{row.insights.map(insight => <li key={insight}>{insight}</li>)}</ul>}
          </Card>
        ))}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt><dd className="mt-1 font-semibold text-gray-900">{value}</dd></div>;
}
