# 0001. Charts are SVG Server Components

- **Status:** Accepted, 2026-10-20.
- **Context.** The two charts were `role="img"` divs: a weekly trend of five bars and a
  capacity bar. Neither could show a missing value, and the trend's `aria-label` was the only
  text alternative. The research ([plan, F1](../research/adaptation-plan.md#f1-accessible-svg-charts-built))
  measured the library route: Recharts 3.10.1 is about 155 KB gzipped as a full bundle, and
  Tremor brings Recharts 2 and more (Observed and Inferred). Both run in the browser, and
  neither ships a hidden data table. The repository adds no UI or chart library (rule 7) and
  renders on the server by default.
- **Decision.** `lib/charts.ts` lays out bars and writes the text alternative; it is pure and
  tested. `components/charts/BarChart.tsx` and `Meter.tsx` render SVG on the server: `<title>`
  and `<desc>`, a visually hidden table of every value, and a native tooltip per bar. A
  missing value is a dashed grey outline labelled Unknown, never a zero-height bar; a true
  zero is a violet baseline mark; an incomplete period is a light violet bar with a solid edge.
  Only Unknown is dashed and grey (amended after review: incomplete bars were dashed too, and
  zero was drawn in the Unknown grey). Colours
  come from the `chart`, `chart-track` and `unknown` tokens.
- **Consequences.** No client JavaScript for charts and no dependency. No hover cards, zoom or
  brushing; if those are ever needed, a `Proposed` ADR must weigh a library against its
  client cost. The `sr-only` class sits on a wrapper, because a table cannot shrink to one
  pixel and would otherwise widen the page at 375px.
