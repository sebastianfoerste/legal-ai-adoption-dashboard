export function TrendBar({ series }: { series: number[] }) {
  const max = Math.max(1, ...series);
  return (
    <div className="flex h-12 items-end gap-1" aria-label="weekly active users trend">
      {series.map((v, i) => (
        <div
          key={i}
          className="w-3 rounded-sm bg-blue-500"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
