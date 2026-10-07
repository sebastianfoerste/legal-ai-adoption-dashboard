# API Contracts

The dashboard is a local synthetic Next.js app. It does not expose an external
HTTP API. Public contracts are TypeScript report objects used by the server
components.

## Report route

`GET /command-center/report` returns the portfolio report as a Markdown download.
`GET /command-center/report?account=<id>` returns that account's customer review as
`synthetic-customer-review-<id>.md`, or 404 for an unknown account. Both documents
open and close with a synthetic notice. The route reads bundled JSON and has no
side effects.

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
