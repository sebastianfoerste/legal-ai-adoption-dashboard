# Features

## Account Health

Portfolio health over synthetic accounts, blockers, utilization, feedback and
renewal urgency.

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
