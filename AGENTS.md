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
- `app/` — three Server-Component routes: `/`, `/blockers`, `/feedback`.
- `components/` — presentational Server Components (no client components).

## Conventions
- TypeScript strict. Any `any` needs an inline justification.
- Server Components by default. Tailwind for styling, no UI library.
- The health-score formula is the one piece of real logic — keep it pure and tested.
  If you change the weights, update `lib/health.test.ts` to match the new arithmetic.
- Keep the human-review-gate framing explicit. Never present this as autonomous legal advice.

## Commands
`pnpm dev` · `pnpm test` (Vitest) · `pnpm build` · or the `Makefile` targets.
