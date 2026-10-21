# Features

The demo path and its main pages first, then the main features with the code behind them. Two synthetic scenarios run through the pages: an account whose stalled adoption was diagnosed and recovered, and a heavily used account where expansion is inappropriate. Research to Change (`/research`) is walked through in the [evidence-loop demonstration](DEMO_GUIDE.md#evidence-loop-demonstration-six-minutes). The [README](../README.md) has the quick start; [how-it-works.md](how-it-works.md) explains the scores and recommendations.

## Demo path

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # the adoption health score and data layer are unit-tested
```

Pages:

1. **Account Health** (`/`): a portfolio overview strip (accounts by band, accounts whose expansion evidence is met, open high-severity blockers), then per-account health with a score breakdown, the review recommendation, practice groups, persona adoption, and the weekly-active trend.
2. **Account detail** (`/accounts/[id]`): expansion readiness with supporting and missing evidence, the renewal decision aid, adoption over time, customer value and the account's interventions.
3. **Customer review** (`/accounts/[id]/review`): the seven-section review report; `/insights/report?account=<id>` downloads it as Markdown.
4. **Adoption Blockers** (`/blockers`): open blockers by category, worst first, each with a re-engagement action and a workshop follow-up.
5. **Product Feedback Queue** (`/feedback`): user friction routed to product areas, with a triage pipeline.
6. **Interventions** (`/interventions`): every intervention by stage: proposed, underway, completed and not evaluated, evaluated.
7. **Manager Decisions** (`/manager`): why each account receives attention, specialist assignments against capacity and complexity, overdue commitments, escalations, coaching actions and expansion readiness across accounts.
8. **Adoption Cockpit review summary** (`/`): synthetic product-surface coverage, review gates, deck package readiness and blocked external action status.
9. **Adoption Insights** (`/insights`): constrained adoption analytics, review-gated capability recommendations, the customer review reports and a filterable leadership report package.

The two scenarios are Stadtwerke Musterstadt (`/accounts/acct-005`, scenario A) and Brightmoor & Associates (`/accounts/acct-004`, scenario B). [docs/DEMO_GUIDE.md](DEMO_GUIDE.md) walks through both in ten minutes.

## Account Health

Portfolio health over synthetic accounts: licence use, usage trend, reviewed output and
open blockers. Feedback routed to Product is displayed and not scored.

Implementation:

1. `app/page.tsx`
2. `lib/health.ts`
3. `lib/portfolio.ts`
4. `lib/data.ts`

## Health-score explanation

On `/accounts/[id]`, "How this score is built" shows each component's points against its
maximum, the configured weights and, when reviewed output is unknown, the weights rescaled
without it. It lists the blocker penalty rule and the band cut-offs. The change since the
last QBR is shown as a number only: the previous breakdown is not stored, so no component is
credited with the move. The score is not an input to expansion and does not predict renewal.

Implementation:

1. `lib/health-explain.ts`
2. `components/HealthExplanation.tsx`

## Adoption Cockpit

`legal-ai-adoption.adoption-cockpit.v1` aggregates local synthetic JSON into active
users, workflow runs, review-table use, draft outputs, verified outputs, blocked
outputs, practice-group usage, power users, peer benchmarks, prompt readiness,
release actions and a draft presentation package.

The same report includes a local review summary for product-surface coverage,
synthetic evidence files, deck readiness and blocked external action status.

All outputs remain synthetic, draft-only and account-owner reviewed before any
renewal, expansion or client-facing use.

Implementation:

1. `lib/adoption-cockpit.ts`
2. `lib/adoption-cockpit.test.ts`
3. `app/page.tsx`
4. `data/workflows.json`

## Intervention tracking

Each intervention records the account, the affected workflow or practice group, the
observed problem, supporting evidence, a hypothesis, the assigned specialist, the action,
dates, the expected result, follow-up observations and the outcome. The stage (proposed,
underway, completed, evaluated) is derived from the record. A completed action is not a
success until it is evaluated.

Implementation:

1. `lib/engagement/interventions.ts`
2. `app/interventions/page.tsx`
3. `components/engagement/InterventionCard.tsx`
4. `data/interventions.json`

## Adoption over time

Per-workflow series in four-week reporting periods: licensed, eligible and active users,
activation, repeat use, completed workflows and drop-off after training. Each rate shows
numerator and denominator. Uncaptured counts are unknown. Rates on fewer than ten users
and rates in an unfinished period carry a caveat.

Implementation:

1. `lib/engagement/adoption-trend.ts`
2. `components/engagement/AdoptionTrendTable.tsx`
3. `data/adoption-periods.json`

## Charts

Activation and repeat use per period, the weekly-active trend and specialist capacity are
SVG drawn on the server, with no client JavaScript. Each chart has a title, a description
listing every value and a visually hidden table. A value that was not captured is a dashed
grey gap labelled Unknown, never a zero bar; a true zero is a violet baseline mark; an
incomplete period is a light violet bar with a solid edge. Only Unknown is dashed and grey. See [ADR 0001](adr/0001-charts.md).

Implementation:

1. `lib/charts.ts`
2. `components/charts/BarChart.tsx`
3. `components/charts/Meter.tsx`

## Practice-group usage export

`/accounts/<id>/usage.csv` downloads one row per practice group: seats, active users, seat
utilisation, queries per week and each weekly active-user count. The window is stated in
every row as the weeks ending on the as-of date; the synthetic counts are undated, so no
calendar quarter is claimed. A missing value is an empty cell. The file name starts with
`synthetic-` and every row is a draft for account-owner review.

Implementation:

1. `lib/exports/practice-group-usage.ts`
2. `app/accounts/[id]/usage.csv/route.ts`

## Customer value

Baseline and follow-up time to an acceptable completed result (producing, human review,
correction), quality failures and rework. The observed change is separated from the
assumption that the intervention caused it. A financial illustration is calculated only
when value was observed and prints its formula and assumptions.

Implementation:

1. `lib/engagement/value.ts`
2. `components/engagement/ValuePanel.tsx`
3. `data/value-measurements.json`

## Manager decisions

Specialist assignments, capacity assumptions, account complexity, overdue commitments,
escalations and coaching actions. Each account lists the recorded reasons it receives
attention. Specialists are shown in roster order without a score.

Implementation:

1. `lib/engagement/manager.ts`
2. `lib/engagement/capacity.ts`
3. `lib/engagement/attention-order.ts`
4. `app/manager/page.tsx`
5. `data/team.json`, `data/engagements.json`

## Expansion readiness and renewal decision aid

Six criteria per account (demonstrated workflow value, sustained use, unresolved blockers,
customer demand, sponsor support, delivery capacity), each met, not met or unknown, with
supporting and missing evidence and a recommendation to expand, continue, adjust or pause.
The renewal panel lists signals and a review priority and outputs no probability.

Implementation:

1. `lib/engagement/expansion.ts`
2. `lib/engagement/renewal.ts`
3. `components/engagement/ExpansionPanel.tsx`

## Customer review report

Objectives, adoption trends, intervention outcomes, quality evidence, unresolved problems,
a reasoned recommendation, owners and next review dates. Rendered at
`/accounts/[id]/review` and served as Markdown at `/insights/report?account=<id>`.

Implementation:

1. `lib/engagement/customer-review.ts`
2. `app/accounts/[id]/review/page.tsx`
3. `app/insights/report/route.ts`

## Adoption Blockers

Open blocker queue by category, severity, re-engagement action and workshop
follow-up.

Implementation:

1. `app/blockers/page.tsx`
2. `lib/actions.ts`
3. `data/blockers.json`

## Product Feedback Queue

Synthetic user friction routed to product areas and product requirements.

Implementation:

1. `app/feedback/page.tsx`
2. `data/feedback.json`
3. `docs/product-feedback-notes.md`

## App shell

A sidebar grouped by job (Portfolio, Adoption signals, Product loop) from the `lg`
breakpoint, a skip link, and pages for errors and unknown addresses (the latter still
returns HTTP 404). Colours are
semantic tokens (`muted`, `link`, `focus`, `chart`, `unknown`) that pass WCAG AA. See
[ADR 0002](adr/0002-navigation.md) and the [competitive research](research/adaptation-plan.md)
behind these changes.

Implementation:

1. `app/layout.tsx`
2. `lib/navigation.ts`
3. `app/globals.css`
4. `app/error.tsx`, `app/not-found.tsx`
