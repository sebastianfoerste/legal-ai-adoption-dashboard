import { describe, expect, it } from "vitest";
import { UNKNOWN_TEXT, barEncoding, describeSeries, layoutBars, type ChartDatum } from "./charts";

const opts = { width: 100, height: 40, gap: 0 };

describe("layoutBars", () => {
  it("scales known values against the largest one", () => {
    const bars = layoutBars([{ label: "a", value: 10 }, { label: "b", value: 5 }], opts);
    expect(bars.map((b) => b.height)).toEqual([40, 20]);
    expect(bars.map((b) => b.y)).toEqual([0, 20]);
    expect(bars.map((b) => b.width)).toEqual([50, 50]);
  });

  it("draws a missing value as an Unknown gap, never as zero", () => {
    const [unknown, known] = layoutBars([{ label: "a", value: null }, { label: "b", value: 4 }], opts);
    expect(unknown.kind).toBe("unknown");
    expect(unknown.text).toBe(UNKNOWN_TEXT);
    expect(unknown.kind).not.toBe("zero");
    expect(known.height).toBe(40); // the unknown value takes no part in the scale
  });

  it("keeps a true zero apart from Unknown", () => {
    const [zero, unknown] = layoutBars([{ label: "a", value: 0 }, { label: "b", value: null }], opts);
    expect(zero.kind).toBe("zero");
    expect(zero.text).toBe("0");
    expect(unknown.kind).toBe("unknown");
  });

  it("survives an all-unknown series without NaN", () => {
    const bars = layoutBars([{ label: "a", value: null }, { label: "b", value: null }], opts);
    expect(bars.every((b) => b.kind === "unknown")).toBe(true);
    expect(bars.flatMap((b) => [b.x, b.y, b.width, b.height]).some(Number.isNaN)).toBe(false);
  });

  it("uses a fixed scale when given and never draws past it", () => {
    const [half, over] = layoutBars([{ label: "a", value: 0.5 }, { label: "b", value: 2 }], { ...opts, max: 1 });
    expect(half.height).toBe(20);
    expect(over.height).toBe(40);
  });

  it("carries the incomplete-period flag", () => {
    const [bar] = layoutBars([{ label: "a", value: 3, incomplete: true }], opts);
    expect(bar.incomplete).toBe(true);
  });
});

describe("describeSeries", () => {
  it("lists every value in order, Unknown and incomplete periods included", () => {
    const data: ChartDatum[] = [
      { label: "P1", value: 0.5, display: "4 of 8 (50%)" },
      { label: "P2", value: null },
      { label: "P3", value: 0.25, display: "2 of 8 (25%)", incomplete: true },
    ];
    expect(describeSeries(data)).toBe(
      "P1: 4 of 8 (50%); P2: Unknown; P3: 2 of 8 (25%) (incomplete period). 1 of 3 not captured, shown as gaps.",
    );
  });

  it("never reads a missing value as 0", () => {
    expect(describeSeries([{ label: "W1", value: null }])).not.toMatch(/\b0\b/);
  });
});

describe("barEncoding", () => {
  it("draws only Unknown dashed and grey", () => {
    const encodings = [
      barEncoding({ kind: "unknown", incomplete: false }),
      barEncoding({ kind: "unknown", incomplete: true }),
      barEncoding({ kind: "zero", incomplete: false }),
      barEncoding({ kind: "zero", incomplete: true }),
      barEncoding({ kind: "value", incomplete: false }),
      barEncoding({ kind: "value", incomplete: true }),
    ];
    const dashedOrGrey = encodings.filter((e) => e.dashed || e.stroke === "unknown");
    expect(dashedOrGrey).toEqual([
      { fill: "none", stroke: "unknown", dashed: true },
      { fill: "none", stroke: "unknown", dashed: true },
    ]);
  });

  it("draws a true zero in the chart colour, apart from Unknown", () => {
    expect(barEncoding({ kind: "zero", incomplete: false }).fill).toBe("chart");
  });

  it("marks an incomplete period with a light fill and a solid edge", () => {
    expect(barEncoding({ kind: "value", incomplete: true })).toEqual({ fill: "chart-light", stroke: "chart", dashed: false });
  });
});
