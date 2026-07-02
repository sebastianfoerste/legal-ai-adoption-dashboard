# Features

## Account Health

Portfolio health over synthetic accounts, blockers, utilization, feedback and
renewal urgency.

Implementation:

1. `app/page.tsx`
2. `lib/health.ts`
3. `lib/portfolio.ts`
4. `lib/data.ts`

## Command Center

`legal-ai-adoption.command-center.v1` aggregates local synthetic JSON into active
users, workflow runs, review-table use, draft outputs, verified outputs, blocked
outputs, practice-group usage, power users, peer benchmarks, prompt readiness,
release actions and a draft presentation package.

The same report includes `legal-ai-adoption.command-center-aos.v1`, a
Legora-inspired product pattern with aOS layers, Skills, product-surface
coverage, synthetic trusted sources, draft package status, Portal-style access
metadata, monitor/list signals and security governance.

Legora-inspired product pattern, no Legora integration or dependency.

All outputs remain synthetic, draft-only and account-owner reviewed before any
renewal, expansion or client-facing use.

Implementation:

1. `lib/command-center.ts`
2. `lib/command-center.test.ts`
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
