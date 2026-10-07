import { DEMO_AS_OF, asOfSourceLabel, formatDate, type AsOf } from "@/lib/engagement/as-of";

export function AsOfNote({ asOf }: { asOf: AsOf }) {
  return (
    <p className="mt-3 text-xs text-gray-500" data-testid="as-of-note">
      As of <span className="font-semibold text-gray-700">{formatDate(asOf.date)}</span> (
      {asOfSourceLabel[asOf.source]}).
      {asOf.date !== DEMO_AS_OF &&
        ` The fixtures were written for ${formatDate(DEMO_AS_OF)}; on another date overdue items, incomplete periods and countdowns change.`}
      {asOf.rejected !== null && (
        <span className="ml-1 text-amber-700">
          Ignored &quot;{asOf.rejected}&quot;: not a date in YYYY-MM-DD form.
        </span>
      )}
    </p>
  );
}
