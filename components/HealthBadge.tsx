import type { HealthBreakdown, HealthResult } from "@/lib/health";

const bandStyles: Record<HealthResult["band"], string> = {
  at_risk: "bg-red-100 text-red-800 ring-red-300",
  needs_attention: "bg-amber-100 text-amber-800 ring-amber-300",
  steady: "bg-sky-100 text-sky-800 ring-sky-300",
  healthy: "bg-emerald-100 text-emerald-800 ring-emerald-300",
};

const bandLabel: Record<HealthResult["band"], string> = {
  at_risk: "At risk",
  needs_attention: "Needs attention",
  steady: "Steady",
  healthy: "Healthy",
};

function caption(b: HealthBreakdown): string {
  const r = Math.round;
  const reviewed = b.reviewedCompletionPts === null ? "unknown" : r(b.reviewedCompletionPts);
  return `use ${r(b.utilizationPts)} · trend ${r(b.trendPts)} · reviewed output ${reviewed} · −${r(b.penalty)} blockers`;
}

export function HealthBadge({
  health,
  breakdown,
}: {
  health: HealthResult;
  breakdown?: HealthBreakdown;
}) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset ${bandStyles[health.band]}`}
      >
        {bandLabel[health.band]} · {health.score}
      </span>
      {breakdown && <span className="text-xs text-muted">{caption(breakdown)}</span>}
    </div>
  );
}
