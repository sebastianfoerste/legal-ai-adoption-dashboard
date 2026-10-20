// A horizontal share-of-capacity bar, drawn in SVG on the server. The visible text beside it
// states the numbers; the meter repeats them for screen readers.
export function Meter({
  value,
  label,
  warnAt = 90,
}: {
  /** Percentage, 0 to 100. */
  value: number;
  label: string;
  warnAt?: number;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <svg role="img" aria-label={label} width="100%" height={8} className="block">
      <title>{label}</title>
      <rect width="100%" height={8} rx={4} className="fill-chart-track" />
      {pct > 0 && (
        <rect width={`${pct}%`} height={8} rx={4} className={pct >= warnAt ? "fill-amber-600" : "fill-chart"} />
      )}
    </svg>
  );
}
