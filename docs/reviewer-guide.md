# Reviewer guide

A five-minute path for a non-technical reviewer.

1. **Run it.** `pnpm install && pnpm dev`, then open `http://localhost:3000`.
2. **Account Health (`/`).** Three synthetic accounts. Note the colored health badge on
   each: Meridian & Cole is "Steady," the other two are "At risk." Look at the weekly
   trend bars — Ardent & Roe is visibly declining.
3. **Why those scores?** Open `lib/health.ts`. The score is a weighted mix of seat
   utilization, usage trend, and how engaged the account is with feeding back to product,
   minus a penalty for open blockers. No machine learning, nothing hidden.
4. **Adoption Blockers (`/blockers`).** Blockers are grouped worst-first by severity.
   Each one already carries a re-engagement action and a workshop follow-up — the next
   step, not just the diagnosis.
5. **Product Feedback Queue (`/feedback`).** User friction routed to product areas, each
   item moving through New → Triaged → Shared with Product. This is the artifact you hand
   to Engineering.

What to check: the numbers are explainable, the actions are concrete, and nothing in the
repo touches real client data or pretends to give legal advice.

The logic is tested: `pnpm test` runs the health-score and data-layer unit tests.
