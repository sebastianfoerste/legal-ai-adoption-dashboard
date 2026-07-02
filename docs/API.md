# API Contracts

The dashboard is a local synthetic Next.js app. It does not expose an external
HTTP API. Public contracts are TypeScript report objects used by the server
components.

Legora-inspired product pattern, no Legora integration or dependency.

## Command Center Report

`commandCenterReport()` in `lib/command-center.ts` returns
`legal-ai-adoption.command-center.v1`.

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
15. `aosProfile`

## aOS Adoption Profile

`aosProfile` returns `legal-ai-adoption.command-center-aos.v1`.

Minimum vocabulary:

1. `aosLayers`
2. `agentPlan`
3. `skills`
4. `tabularReview`
5. `trustedSources`
6. `editorDraft`
7. `wordExportPackage`
8. `portalRoom`
9. `monitors`
10. `lists`
11. `securityGovernance`
12. `externalActionAllowed`

`sourceMode` is `local_synthetic_json`. `externalActionAllowed` is always
`false`. Presentation output is a draft package only and requires account-owner
review before renewal, expansion or client-facing use.
