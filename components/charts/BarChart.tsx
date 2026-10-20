import { useId } from "react";
import { describeSeries, layoutBars, type ChartDatum } from "@/lib/charts";

// The one chart grammar: an SVG Server Component, no client JavaScript. The SVG carries a
// <title> and <desc>; a visually hidden table carries the same values for screen readers
// and for copying. A missing value is a dashed grey gap, a zero a baseline mark, and an
// incomplete period a lighter bar with a dashed outline. See docs/adr/0001-charts.md.
export function BarChart({
  title,
  data,
  max,
  barWidth = 12,
  gap = 4,
  height = 48,
  ticks,
  labelHeader = "Period",
  valueHeader = "Value",
  className = "",
}: {
  title: string;
  data: ChartDatum[];
  max?: number;
  barWidth?: number;
  gap?: number;
  height?: number;
  /** Short labels drawn under the bars; the full labels are in the table. */
  ticks?: string[];
  labelHeader?: string;
  valueHeader?: string;
  className?: string;
}) {
  const id = useId();
  const width = Math.max(1, data.length * barWidth + Math.max(0, data.length - 1) * gap);
  const bars = layoutBars(data, { width, height, gap, max });
  const tickSpace = ticks ? 14 : 0;
  return (
    <figure className={className}>
      <svg
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        width={width}
        height={height + tickSpace}
        viewBox={`0 0 ${width} ${height + tickSpace}`}
        className="block max-w-full overflow-visible"
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{describeSeries(data)}</desc>
        <line x1={0} x2={width} y1={height - 0.5} y2={height - 0.5} className="stroke-chart-track" />
        {bars.map((bar) => (
          <g key={bar.index}>
            <title>{`${bar.label}: ${bar.text}${bar.incomplete ? " (incomplete period)" : ""}`}</title>
            {bar.kind === "unknown" && (
              <rect
                x={bar.x + 0.5}
                y={0.5}
                width={Math.max(0, bar.width - 1)}
                height={height - 1}
                rx={2}
                className="fill-none stroke-unknown"
                strokeDasharray="2 2"
              />
            )}
            {bar.kind === "zero" && (
              <rect x={bar.x} y={height - 2} width={bar.width} height={2} className="fill-unknown" />
            )}
            {bar.kind === "value" && (
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={2}
                className={bar.incomplete ? "fill-chart/40 stroke-chart" : "fill-chart"}
                strokeDasharray={bar.incomplete ? "3 2" : undefined}
              />
            )}
            {ticks?.[bar.index] && (
              <text
                x={bar.x + bar.width / 2}
                y={height + 11}
                textAnchor="middle"
                className="fill-gray-600 text-[10px]"
              >
                {ticks[bar.index]}
              </text>
            )}
          </g>
        ))}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{labelHeader}</th>
            <th scope="col">{valueHeader}</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((bar) => (
            <tr key={bar.index}>
              <th scope="row">{bar.label}</th>
              <td>
                {bar.text}
                {bar.incomplete ? " (incomplete period)" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
