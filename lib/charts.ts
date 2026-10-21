/**
 * Geometry and text for the dashboard's bar charts. Pure, so the rules the charts must keep
 * are tested here rather than in the markup:
 * - a missing value is drawn as an "Unknown" gap, never as a zero-height bar;
 * - a true zero is drawn as a baseline mark in the chart colour, so it differs from Unknown;
 * - an incomplete period is a light bar with a solid edge, because its count will still rise;
 * - only Unknown is dashed and grey, so no other mark can be read as missing;
 * - every chart has a text alternative that lists every value, Unknown included.
 */

export interface ChartDatum {
  label: string;
  /** `null` when not captured. Never replaced by 0. */
  value: number | null;
  /** How the value is read out, e.g. "5 of 8 (63%)". Defaults to the number. */
  display?: string;
  /** The period has not ended on the as-of date. */
  incomplete?: boolean;
}

export type BarKind = "value" | "zero" | "unknown";

export interface Bar {
  index: number;
  label: string;
  kind: BarKind;
  x: number;
  width: number;
  /** Top of the bar. For "unknown" the placeholder spans the full plot height. */
  y: number;
  height: number;
  incomplete: boolean;
  text: string;
}

export interface BarLayoutOptions {
  /** Plot width and height in SVG user units. */
  width: number;
  height: number;
  /** Gap between bars, in the same units. */
  gap?: number;
  /** Fixed top of the scale, e.g. 1 for a rate. Defaults to the largest known value. */
  max?: number;
}

export const UNKNOWN_TEXT = "Unknown";

export const datumText = (d: ChartDatum): string =>
  d.value === null ? UNKNOWN_TEXT : (d.display ?? String(d.value));

export function layoutBars(data: ChartDatum[], options: BarLayoutOptions): Bar[] {
  const { width, height, gap = 2 } = options;
  const known = data.flatMap((d) => (d.value === null ? [] : [d.value]));
  // Math.max(1, ...) keeps an all-zero or all-unknown series from dividing by zero.
  const max = options.max ?? Math.max(1, ...known);
  const n = data.length;
  const barWidth = n > 0 ? Math.max(1, (width - gap * (n - 1)) / n) : 0;
  return data.map((d, index) => {
    const x = index * (barWidth + gap);
    const base = { index, label: d.label, x, width: barWidth, incomplete: d.incomplete ?? false, text: datumText(d) };
    if (d.value === null) return { ...base, kind: "unknown" as const, y: 0, height };
    if (d.value <= 0) return { ...base, kind: "zero" as const, y: height, height: 0 };
    const h = Math.min(height, (d.value / max) * height);
    return { ...base, kind: "value" as const, y: height - h, height: h };
  });
}

/** One sentence per chart for <desc> and the figure caption: every value, in order. */
export function describeSeries(data: ChartDatum[]): string {
  if (data.length === 0) return "No data.";
  const parts = data.map((d) => `${d.label}: ${datumText(d)}${d.incomplete ? " (incomplete period)" : ""}`);
  const unknown = data.filter((d) => d.value === null).length;
  const note = unknown > 0 ? ` ${unknown} of ${data.length} not captured, shown as gaps.` : "";
  return `${parts.join("; ")}.${note}`;
}

/** How a bar is drawn. Colours are the `chart` and `unknown` tokens. */
export interface BarEncoding {
  fill: "chart" | "chart-light" | "none";
  stroke: "chart" | "unknown" | null;
  dashed: boolean;
}

export function barEncoding(bar: Pick<Bar, "kind" | "incomplete">): BarEncoding {
  if (bar.kind === "unknown") return { fill: "none", stroke: "unknown", dashed: true };
  if (bar.kind === "zero") return { fill: "chart", stroke: null, dashed: false };
  return bar.incomplete
    ? { fill: "chart-light", stroke: "chart", dashed: false }
    : { fill: "chart", stroke: null, dashed: false };
}
