# Reviewer guide

A five-minute path for a non-technical reviewer. For the full walk-through with both
scenarios, use [DEMO_GUIDE.md](DEMO_GUIDE.md).

1. **Run it.** `pnpm install && pnpm dev`, then open `http://localhost:3000`.
2. **Account Health (`/`).** Five synthetic accounts. Note the colored health badge on
   each and the review recommendation beneath the account name. Brightmoor & Associates
   is "Healthy" and carries "Adjust"; Stadtwerke Musterstadt is "Steady" and carries "Expand".
3. **Why those scores?** Open `lib/health.ts`. The score is a weighted mix of licence
   use, usage trend and the share of outputs a human reviewer verified, minus a penalty
   for open blockers. No machine learning, nothing hidden. Feedback forwarded to Product
   is not part of it.
4. **Why those recommendations?** Open either account and read "Expansion readiness":
   six criteria, each met, not met or unknown, with the evidence beside it.
5. **Interventions (`/interventions`).** One card is "Completed, not evaluated" and says
   that success is not established. One is evaluated with the result "not achieved".
6. **Manager Decisions (`/manager`).** Each account lists the recorded reasons it needs
   attention. Specialists are role labels in roster order, without a score.
7. **Adoption Blockers (`/blockers`) and Product Feedback Queue (`/feedback`).** Blockers
   carry a re-engagement action and a workshop follow-up. Feedback moves through New,
   Triaged and Shared with Product.

What to check: every rate shows its numerator and denominator, missing data reads
"Unknown", the reports separate what was observed from what is assumed, and nothing in
the repo touches real client data or pretends to give legal advice.

The logic is tested: `pnpm test` runs the unit tests for scoring, denominators,
intervention states, the value verdict and the expansion decision.
