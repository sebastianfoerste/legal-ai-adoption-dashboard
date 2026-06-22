export function TrendBar({ series }: { series: number[] }) {
  const max = Math.max(1, ...series);
  const label = `Weekly active users over ${series.length} weeks: ${series.join(", ")}`;
  return (
    <div className="flex h-12 items-end gap-1" role="img" aria-label={label}>
      {series.map((v, i) => (
        <div
          key={i}
          className="w-3 rounded-sm bg-blue-500"
          title={`week ${i + 1}: ${v} active`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
