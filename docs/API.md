# API Contracts

The dashboard is a local synthetic Next.js app. It does not expose an external
HTTP API. Public contracts are TypeScript report objects used by the server
components.

## Report route

`GET /insights/report` returns the portfolio report as a Markdown download.
`GET /insights/report?account=<id>` returns that account's customer review as
`synthetic-customer-review-<id>.md`, or 404 for an unknown account. Both documents
open and close with a synthetic notice. The route reads bundled JSON and has no
side effects.

## Usage export route

`GET /accounts/<id>/usage.csv` returns one account's per-practice-group usage as
`synthetic-practice-group-usage-<id>-<asOf>.csv`, or 404 (plain text) for an unknown
account. Columns: `data_class` (always `synthetic`), `account_id`, `practice_group`,
`window`, `seats`, `active_users`, `seat_utilisation` (four decimals), `queries_per_week`,
one `weekly_active_users_week_<n>` column per week from `_oldest` to `_latest`, and
`review_status` (a draft for account-owner review).

- **Window.** The synthetic weekly counts are undated, so the window is the N weeks ending
  on the as-of date, stated in every row as `<N> weeks ending <asOf> (oldest first)`, never
  a calendar quarter. N is the longest series in the account. Each group's last count sits
  in the `_latest` column; a shorter series is padded at the oldest end.
- **Missing values.** An empty cell, never 0: a week a group has no count for, and the
  utilisation of a group without seats.
- **As-of date.** `?asOf=YYYY-MM-DD` sets the date in the window and the file name; an
  invalid value is ignored, as on the pages (`resolveAsOf`).

The builder is `practiceGroupUsageCsv` in `lib/exports/practice-group-usage.ts`. The route
reads bundled JSON and has no side effects. It is a download, like the report route, not
an API.

## Customer Review

`buildCustomerReview(accountId)` in `lib/engagement/customer-review.ts` returns
`legal-ai-adoption.customer-review.v1`, or `null` for an unknown account.

Core fields:

1. `objectives`: each agreed objective with status `met`, `not_met` or `unknown`
2. `adoption`: per-workflow period metrics with numerator, denominator and caveats
3. `interventions`: stage, outcome statement, owner and follow-up status
4. `quality`: value assessments with observed change, verdict, attribution and
   financial illustration
5. `unresolved` and `evidenceGaps`
6. `expansion`: six criteria, counts, recommendation, supporting and missing evidence
7. `renewal`: signals and review priority, with a disclaimer and no probability
8. `owners` and `nextReviewDate`
9. `markdown`

`synthetic` is always `true` and `externalActionAllowed` is always `false`.

## Expansion Assessment

`accountExpansion(accountId)` in `lib/engagement/expansion.ts` evaluates six
criteria. `decideRecommendation` maps their statuses to `expand`, `continue`,
`adjust` or `pause`; the rule is documented on the function. `humanDecisionRequired`
is always `true`.

## Adoption Cockpit Report

`adoptionCockpitReport()` in `lib/adoption-cockpit.ts` returns
`legal-ai-adoption.adoption-cockpit.v1`.

Core fields:

1. `activeUsers`
2. `workflowRuns`
3. `reviewTables`
4. `draftOutputs`
5. `verifiedOutputs`
6. `blockedOutputs`
7. `productUsage`
8. `practiceGroupUsage`
9. `powerUserGroups`
10. `benchmarks`
11. `releaseActions`
12. `promptReadiness`
13. `leadershipBrief`
14. `presentationDeck`
15. `adoptionControls`

## Adoption Controls

`adoptionControls` is an internal section of the Adoption Cockpit report. It records
the synthetic source files used for the leadership deck, product-surface
coverage, review-gate counts, deck readiness and whether any external action is
allowed.

`sourceMode` is `local_synthetic_json`. `externalActionAllowed` is always
`false`. Presentation output is a draft package only and requires account-owner
review before renewal, expansion or client-facing use. The presentation deck
also records generated-from files, evidence items, export formats and the
account-owner review gate.
