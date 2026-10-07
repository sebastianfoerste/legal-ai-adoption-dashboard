# Features

## Account Health

Portfolio health over synthetic accounts: licence use, usage trend, reviewed output and
open blockers. Feedback routed to Product is displayed and not scored.

Implementation:

1. `app/page.tsx`
2. `lib/health.ts`
3. `lib/portfolio.ts`
4. `lib/data.ts`

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
