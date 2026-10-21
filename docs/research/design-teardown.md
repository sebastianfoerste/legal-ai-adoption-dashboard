# Design teardown

Patterns from the eight deepest-researched products, then a table per dashboard surface. All
vendor facts are **Claimed** (search summaries; see the
[network-limited banner](2026-10-competitive-landscape.md)); code facts are **Observed**.
Access date for every source: 2026-10-20. Screenshots of other products were not taken and
none is in the repository.

## Top eight

### Harvey Analytics (legal AI, Claimed)

- **Flow.** Admin opens Analytics: assistant queries over time, active users over time, users
  by activity, with DAU/WAU/MAU on rolling periods. Exports follow the current filters, one
  year at a time.
- **Trust.** Space Analytics is aggregate only and never shows prompt or thread content.
- **Gap.** Counts queries, not reviewed output; no stated lag or partial-period marker found.
- **Take.** Aggregate-only, content-free analytics is already this dashboard's posture. Keep.
- Source: <https://help.harvey.ai/articles/usage-dashboard>,
  <https://help.harvey.ai/articles/using-space-analytics>

### CoCounsel Legal usage analytics (legal AI, Claimed)

- **Flow.** Summary tab, then By-skill tab; chart menus export the underlying table.
- **Uncertainty.** States a roughly 24-hour lag and that deleted data lowers the figures.
- **Gap.** The export leaves out users who never signed in, so its denominator is short
  (Inferred).
- **Take.** Say the window and the lag next to the number. The new usage CSV names its
  window in every row.
- Source: <https://www.thomsonreuters.com/en-us/help/cocounsel/legal/administration/usage-analytics>

### Legora Metrics (legal AI, Claimed)

- **Flow.** Admin, then Metrics: 7/14/30/90-day or all-time ranges, grouped by day, week or
  month, filtered by department, role or group.
- **Standout.** "Work product creation" is counted apart from AI responses (January 2026).
- **Take.** Range and grouping controls are table stakes for saved views (H4, not built).
- Source: <https://support.legora.com/en/articles/270082-viewing-usage-statistics>

### Gainsight CS (customer success, Claimed)

- **Flow.** Customer 360 scorecard with weekly history at overall, group and measure level;
  the Rules Engine raises a CTA with a playbook; a rule can close it as Closed Success.
- **Trust gap.** A change to the scoring rules is not marked in the history, so a rule change
  looks like a customer change. Closing a CTA is treated as its evaluation.
- **Take.** Measure-level drill-down, yes. Rule-closed success, no: the dashboard's
  intervention stays "not evaluated" until an outcome is recorded.
- Source: <https://support.gainsight.com/Gainsight_NXT/05Scorecards/03User_Guides/View_and_Update_Scorecards_in_360>,
  <https://communities.gainsight.com/deliver-customer-success-9/making-a-major-change-to-the-health-scoring-is-it-identified-in-the-health-trend-3494>

### Vitally (customer success, Claimed)

- **Flow.** Several 0–10 scores combine into a weighted average; hovering the overall score
  shows the components; a builder previews results.
- **Null handling.** A blank input is skipped and its weight spread over the known inputs,
  as `computeHealth` already does.
- **Take.** Show the rescaled weights explicitly, which Vitally was not seen doing. Built in
  the "How this score is built" panel.
- Source: <https://docs.vitally.io/account-health-scores-and-metrics/health-scores>

### Planhat (customer success, Claimed)

- **Flow.** Score starts at a neutral 5; factors add or subtract points; 25-week history and
  90/30/7-day trends.
- **Conflict.** Health-based forecasts, expansion-ready alerts and close probabilities.
- **Take.** Additive points are easy to read, and the dashboard's breakdown already uses
  points. Reject the expansion link (rule 4).
- Source: <https://help.planhat.com/en/articles/9590704-how-health-is-calculated>,
  <https://www.planhat.com/products/opportunity-pipeline>

### Microsoft Copilot Dashboard (AI adoption, Claimed)

- **Flow.** Readiness, adoption and impact; active = one intentional action in a trailing
  28 days; up to six days of delay.
- **Privacy.** Group threshold default 10, minimum 5, admin-set, also for comparisons.
- **Take.** The threshold matches `SMALL_COHORT_THRESHOLD`. The difference is suppression
  versus a caveat; see research question 2 in the [plan](adaptation-plan.md).
- Source: <https://learn.microsoft.com/en-ca/Viva/insights/org-team-insights/copilot-dashboard>

### copilot-metrics-viewer (OSS, MIT, Observed)

- **Flow.** Seat analysis: never used, inactive 7 days, inactive 30 days; metrics charts in
  Chart.js; CSV export.
- **Defects read in source.** Missing monthly counts become 0 (`?? 0`); the 30-day tooltip
  says it includes never-used seats while the arithmetic skips them; windows run on the
  browser clock, not an as-of date; canvas charts carry no text alternative.
- **Take.** Unused-seat counts are a good idea; every defect above is one this repository's
  rules prevent.
- Source: <https://github.com/github-copilot-resources/copilot-metrics-viewer>

## Per surface

Adapt = re-implemented in this repository's terms. Reject = conflicts with a rule. Park =
fits but not built in this budget.

### `/` Account Health

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| Stat tile with denominator and period | Gemini reports, Copilot Dashboard | matrix rows | Adapt later: tiles already show counts; denominators parked with H4 | 3 |
| Filters stack and every panel updates | Vercel Web Analytics | <https://vercel.com/docs/analytics/filtering> | Park (H4 saved views) | none |
| Score-sorted portfolio with churn probability | Planhat, Pendo Predict | matrix rows | Reject | 4 |
| Grouped sidebar instead of a wrapping top bar | Linear, Vercel (Inferred from their docs) | <https://linear.app/docs/customer-requests> | Adapt (built, D2) | 7 |

### `/accounts/[id]`

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| Component breakdown of the health score | Vitally, Gainsight | matrix rows | Adapt (built, F2) | 4, 11 |
| Unknown input dropped, weight redistributed | Vitally | <https://docs.vitally.io/account-health-scores-and-metrics/health-scores> | Adapt: shown as rescaled weights | 3 |
| Measure-level score history | Gainsight | matrix row | Park: no previous breakdown is stored; the panel says so | 4 |
| Trend chart with gaps for missing data | PostHog charts, Recharts | <https://github.com/PostHog/posthog> | Adapt (built, F1) | 3 |
| Usage export following the current filter | Harvey | <https://help.harvey.ai/articles/usage-dashboard> | Adapt (built, F3) | 1, 3 |

### `/accounts/[id]/review`, `/insights/report`, `/research/backlog`

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| "Download PDF" through the print dialog | Evidence | <https://github.com/evidence-dev/evidence> | Park: ADR 0004 proposes a print stylesheet | 1 |
| Charts switch to SVG when printing | Evidence | same | Already true: every chart is SVG | none |

### `/blockers`, `/feedback`

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| Votes as distinct customers, with revenue filter | Canny, Linear | matrix rows | Park (H6): accounts and personas as counts with a denominator, never a rank | 6 |
| AI-created feedback published without approval | Canny Autopilot (automated mode) | matrix row | Reject | 2, 6 |
| Editable AI topic hierarchy | Productboard Pulse | <https://www.productboard.com/pulse> | Park: themes would be hand-assigned; no LLM calls | 10 |
| Public board naming customers | Canny, Featurebase | matrix rows | Reject | 1, 9 |
| Tabular numerals in dense tables | general practice | n/a | Adapt (built, D1) | none |

### `/interventions`

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| Play closed as success by a rule | Gainsight CTAs | matrix row | Reject | 6 |
| Play fired on a health change | Totango SuccessPlays | matrix row | Reject | 4 |
| Agent draft saved only by a human | ChurnZero Retrospective | matrix row | Already true: recommendations are drafts | 2 |

### `/manager`

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| Per-CSM KPIs (CTAs closed, entries) | Gainsight CSM Performance | matrix row | Reject: amounts to ranking people | 5 |
| Capacity as hours planned against hours available | ClientSuccess, Vitally blueprint | matrix rows | Already true; meter rebuilt as SVG (F1) | 5 |

### `/insights`, `/benchmarks`

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| Suppress groups below a threshold | Copilot Dashboard (10), Worklytics (8) | matrix rows | Answered in the plan; no change | 11 |
| Adopters vs non-adopters | Cortex, Jellyfish | matrix rows | Park (H5): needs a labelled synthetic comparison group | 1 |
| Comparison only with enough history | Stripe | <https://docs.stripe.com/stripe-apps/analytics> | Already true: incomplete periods are flagged | 3 |

### `/research`

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| Typed score kept apart from free-text comment | Langfuse | <https://github.com/langfuse/langfuse> | Already true: observation and interpretation are separate fields | 6 |

### Shell and states

| Pattern | Product | Source | Decision | Rule touched |
| --- | --- | --- | --- | --- |
| Light and dark `--chart-*` tokens | shadcn/ui | <https://github.com/shadcn-ui/ui> | Adapt as semantic tokens (built, D1); dark mode parked (ADR 0003) | 7 |
| Command palette | Linear (Inferred) | n/a | Reject for now: needs client JS for eight routes | 7 |
| Skip link, `error`, `not-found` | framework convention | `node_modules/next/dist/docs/` | Adapt (built, D2); `loading` rejected: it streams and turns a 404 into 200 | 10 |
| Charts as canvas with one aria-label | PostHog, copilot-metrics-viewer | matrix rows | Reject: SVG with title, desc and a table instead | 3 |
| Keyboard tooltip across points (`role="application"`) | Recharts 3 | npm package source | Reject: a hidden table is simpler and needs no JS | 7 |
| Tracker blocks reachable by mouse only | Tremor | <https://github.com/tremorlabs/tremor> | Reject | none |
