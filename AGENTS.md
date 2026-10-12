<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Legal AI Adoption Dashboard

Mock post-sales dashboard for steering legal-AI adoption (Account Health, Adoption
Blockers, Product Feedback Queue). All data is synthetic — never add real client, firm,
or personal data.

## Layout
- `data/*.json` — synthetic accounts, blockers, feedback. Validated by Zod at load.
- `lib/schema.ts` — Zod schemas and inferred types (single source of truth for shapes).
- `lib/health.ts` — the adoption health score. Pure, transparent formula. Unit-tested.
- `lib/data.ts` / `lib/aggregate.ts` — typed data access and per-account aggregation.
- `lib/engagement/` — the manager layer, one small module per concern: `schema.ts` (strict
  Zod, every record `synthetic: true`), `interventions.ts`, `adoption-trend.ts`, `value.ts`,
  `capacity.ts`, `manager.ts`, `expansion.ts`, `renewal.ts`, `customer-review.ts`. All views
  share the as-of date in `as-of.ts`. Rules for this layer: a missing count is `null` and
  renders as "Unknown", never 0; a completed intervention is not a success until evaluated;
  expansion never follows from the health score or from unknown evidence; specialists are
  role labels and are never ranked.
- `lib/evidence/` — the evidence loop: `schema.ts` (every record states its `origin`),
  `loop.ts` (validation, derived outcome status, follow-up comparison, missing observations),
  `private-boundary.ts` (what may be public, what an import of real observations needs),
  `backlog.ts` (the evidence-linked backlog). The store is `data/evidence-loop.json`; the
  Python module in `product-feedback-loop/` reads the same file and the same vocabulary in
  `packages/evidence-loop-contract/`. Rules: delivery status lives only in that store and is
  never derived from rank; a release is not an outcome; observation and interpretation are
  separate fields; a real participant record is never marked synthetic and never enters this
  repository (see `workshop-kit/research/data-handling.md`). Feedback items and interviews
  state an `origin` too, and a record without one is refused. Names are checked against a
  denylist kept in the private store (`PRIVATE_RESEARCH_DENYLIST`); never copy that list,
  or anything from the private store, into this repository.
- `app/` — Server-Component routes: `/`, `/accounts/[id]`, `/accounts/[id]/review`,
  `/blockers`, `/feedback`, `/research` (and the Markdown route `/research/backlog`), `/interventions`, `/manager`, `/insights`, and the
  Markdown route `/insights/report` (`?account=<id>` for a customer review).
- `components/` — presentational Server Components; `components/engagement/` holds the
  panels for the manager layer. `ExportButton` and `NavLinks` are the only client components.

## Conventions
- TypeScript strict. Any `any` needs an inline justification.
- Server Components by default. Tailwind for styling, no UI library.
- The health-score formula is the one piece of real logic — keep it pure and tested.
  If you change the weights, update `lib/health.test.ts` to match the new arithmetic.
- Keep the human-review-gate framing explicit. Never present this as autonomous legal advice.

## Commands
`pnpm dev` · `pnpm test` (Vitest) · `pnpm build` · or the `Makefile` targets. `make check`
is the combined gate: dashboard tests and build, contract and telemetry checks, the
private-data boundary, the feedback module's tests and the workshop kit. After changing
`data/evidence-loop.json` run `pnpm evidence:backlog` and `make -C product-feedback-loop demo`
to regenerate the committed outputs.
