import type { Metadata } from "next";
import { Card } from "@/components/Card";


export const metadata: Metadata = { title: "Practice-Group Benchmarks" };
import { PageHeader } from "@/components/PageHeader";
import { adoptionCockpitReport } from "@/lib/adoption-cockpit";
import { SUPPRESSION_NOTE, UNBANDED_NOTE, buildPracticeGroupBenchmark, type PracticeGroupTrend } from "@/lib/benchmarking";
import { getAccounts, getWorkflowUsage } from "@/lib/data";
import { CountWindows } from "@/components/CountWindows";
import { commonWeeks } from "@/lib/count-windows";
import { resolveAsOf } from "@/lib/engagement/as-of";

const bandStyle = {
  leading: "bg-emerald-100 text-emerald-800",
  mid: "bg-amber-100 text-amber-800",
  lagging: "bg-red-100 text-red-800",
};

export default async function BenchmarksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const asOf = resolveAsOf((await searchParams)?.asOf).date;
  const report = adoptionCockpitReport();
  const trends: PracticeGroupTrend[] = getAccounts().flatMap(account => account.practiceGroups.map(group => ({ practiceGroup: group.name, weeklyActiveUsers: group.weeklyActiveUsers })));
  const benchmark = buildPracticeGroupBenchmark({ usage: report.practiceGroupUsage, trends });
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader title="Practice-Group Benchmarks" subtitle="Internal cohort bands and adoption trends derived from synthetic usage data, with account-owner review required." />
      <Card>
        <h2 className="text-label font-semibold text-gray-900">Internal peer median</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <Metric label="Workflow runs" value={num(benchmark.internalMedian.workflowRuns)} />
          <Metric label="Active users" value={num(benchmark.internalMedian.activeUsers)} />
          <Metric label="Verified outputs" value={share(benchmark.internalMedian.verifiedShare)} />
        </dl>
        <CountWindows
          panel="practiceGroupBenchmarks"
          asOf={asOf}
          weeks={commonWeeks([...getWorkflowUsage().map((w) => w.weeklyRuns), ...trends.map((t) => t.weeklyActiveUsers)])}
          className="mt-4"
        />
        <p className="mt-2 text-xs text-gray-500">{SUPPRESSION_NOTE}</p>
        {benchmark.rows.some(row => row.band === null) && <p className="mt-2 text-xs text-gray-500">{UNBANDED_NOTE}</p>}
        <p className="mt-2 text-xs text-gray-500">{benchmark.reviewGate.note}</p>
      </Card>
      <div className="mt-6 space-y-4">
        {benchmark.rows.map(row => (
          <Card key={row.practiceGroup}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-title font-semibold">{row.practiceGroup}</h2>
              {row.band === null ? (
                <span className="rounded-full border border-dashed border-unknown px-3 py-1 text-xs font-semibold text-muted">not banded</span>
              ) : (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${bandStyle[row.band]}`}>{row.band}</span>
              )}
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
              <Metric label="Runs" value={String(row.workflowRuns)} />
              <Metric label="Active users" value={String(row.activeUsers)} />
              <Metric label="Verified" value={share(row.verifiedShare)} />
              <Metric label="WAU trend (latest minus first week)" value={trend(row.trendDelta)} />
            </dl>
            {row.insights.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">{row.insights.map(insight => <li key={insight}>{insight}</li>)}</ul>}
          </Card>
        ))}
        {benchmark.suppressed.map(group => (
          <Card key={group.practiceGroup}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-title font-semibold">{group.practiceGroup}</h2>
              <span className="rounded-full border border-dashed border-unknown px-3 py-1 text-xs font-semibold text-muted">suppressed</span>
            </div>
            <p className="mt-3 text-sm text-muted">{group.reason}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}

// A value that was not captured reads Unknown, never 0.
const num = (value: number | null) => (value === null ? "Unknown" : value.toFixed(0));
const share = (value: number | null) => (value === null ? "Unknown" : `${(value * 100).toFixed(0)}%`);
const trend = (value: number | null) => (value === null ? "Unknown" : value >= 0 ? `+${value}` : String(value));

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 font-semibold text-gray-900">{value}</dd></div>;
}
