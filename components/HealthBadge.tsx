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
  return `util ${r(b.utilizationPts)} · trend ${r(b.trendPts)} · feedback ${r(b.engagementPts)} · −${r(b.penalty)} blockers`;
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
      <span className="inline-flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset ${bandStyles[health.band]}`}
        >
          {bandLabel[health.band]} · {health.score}
        </span>
        {health.expansionReady && (
          <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 ring-1 ring-inset ring-violet-300">
            Expansion-ready
          </span>
        )}
      </span>
      {breakdown && <span className="text-xs text-gray-400">{caption(breakdown)}</span>}
    </div>
  );
}
