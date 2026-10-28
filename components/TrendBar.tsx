import { BarChart } from "@/components/charts/BarChart";

// Weekly counts are undated in the synthetic data, so the weeks are numbered, oldest first.
export function TrendBar({ series }: { series: (number | null)[] }) {
  const data = series.map((value, i) => ({
    label: `Week ${i + 1}${i === 0 ? " (oldest)" : i === series.length - 1 ? " (latest)" : ""}`,
    value,
    display: value === null ? undefined : `${value} active`,
  }));
  return (
    <BarChart
      title={`Weekly active users over the last ${series.length} weeks`}
      data={data}
      labelHeader="Week"
      valueHeader="Weekly active users"
    />
  );
}
