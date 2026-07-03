# API Contracts

The dashboard is a local synthetic Next.js app. It does not expose an external
HTTP API. Public contracts are TypeScript report objects used by the server
components.

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
