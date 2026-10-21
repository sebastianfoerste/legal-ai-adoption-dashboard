# Adaptation plan

What this repository takes from the [competitive research](2026-10-competitive-landscape.md),
what it rejects, and what waits for the owner. Mode: build. Every built item is one commit on
`feat/competitive-adaptation-2026-10` with tests; nothing is merged or deployed. Nothing here
is legal advice, and every recommendation the dashboard shows stays a draft for the account
owner's review.

## Baseline

Measured on 2026-10-20 before any change, with Node 22 and pnpm 10, `ADOPTION_AS_OF` unset
(demo date 31 Jul 2026).

| Check | Result |
| --- | --- |
| `pnpm lint`, `pnpm build`, `make check` | pass |
| Vitest (`pnpm test`) | 228 tests in 21 files |
| Contract test (`pnpm contract:test`) | 2 |
| Feedback-loop Python tests | 33 |
| Workshop-kit Python tests | 8 |
| Files with `"use client"` | 2: `components/ExportButton.tsx`, `components/NavLinks.tsx` |
| Navigation rows at 1280px | 2 (the eight links wrap) |
| Horizontal page scroll at 375px | none on any route |

Accessibility was measured with the axe-core 4.12.1 that `eslint-plugin-jsx-a11y` installs,
injected by Playwright, tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`. JavaScript is
the sum of decoded `script` response bodies in a fresh browser context per route.

| Route | axe violations (rule: nodes) before | after | Client JS before | after |
| --- | --- | --- | --- | --- |
| `/` | color-contrast 57, scrollable-region-focusable 5 | none | 831,332 B | 832,876 B |
| `/?band=at_risk` | color-contrast 42, scrollable-region-focusable 5 | none | 831,332 B | 832,876 B |
| `/accounts/acct-004` | color-contrast 54, scrollable-region-focusable 1 | none | 521,362 B | 522,917 B |
| `/accounts/acct-005` | color-contrast 61, scrollable-region-focusable 1 | none | 521,362 B | 522,917 B |
| `/accounts/acct-005/review` | color-contrast 29, scrollable-region-focusable 1 | none | 521,362 B | 522,917 B |
| `/accounts/unknown-id` (404) | color-contrast 1 | none | 521,362 B | 522,917 B |
| `/blockers` | color-contrast 29 | none | 521,362 B | 522,917 B |
| `/feedback` | color-contrast 19 | none | 521,362 B | 522,917 B |
| `/research` | color-contrast 19 | none | 521,362 B | 522,917 B |
| `/interventions` | color-contrast 74 | none | 521,362 B | 522,917 B |
| `/manager` | color-contrast 25 | none | 521,362 B | 522,917 B |
| `/insights` | color-contrast 13 | none | 521,362 B | 522,917 B |
| `/benchmarks` | color-contrast 16, dlitem 6 | none | 521,362 B | 522,917 B |

Almost every contrast failure was `text-gray-400` (2.6:1 on white). After: 253 Vitest tests in
25 files; client components are `ExportButton`, `NavLinks` and `app/error.tsx` (error
boundaries must be client components); the navigation is a sidebar at 1280px; no route
scrolls sideways at 375px. Client JS grew by about 1.5 KB per route; the charts add none.

## Best-of candidates

Impact is 1 to 5 for CSMs, Legal Engineers or their manager. Fit names the rule it passes or
fails. Effort S, M or L. Evidence is the strongest tag behind the pattern.

| # | Candidate | Impact | Fit | Effort | Evidence | Differentiation | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | Accessible SVG charts with Unknown gaps and period curves (H1, part of H5) | 4 | pass (3, 7, 10) | M | Observed | Differentiator | Built |
| F2 | Health-score explainability (H7) | 4 | pass (4, 11) | S | Claimed | Differentiator | Built |
| F3 | Per-practice-group usage CSV (H8) | 4 | pass (1, 3) | S | Claimed | Table stakes | Built |
| C4 | Feedback themes with account and persona counts (H6) | 3 | pass (6) | M | Claimed | Differentiator | Not built: budget |
| C5 | Saved views and filters on every list (H4) | 3 | pass | M | Claimed | Table stakes | Not built: budget |
| C6 | Adopters vs non-adopters, cohort curves (H5) | 3 | pass only with a labelled synthetic comparison group (1) | M | Claimed | Table stakes | Needs owner decision |
| C7 | Unused and inactive seat counts per account | 3 | pass (3) if the data held last-activity dates; it does not | M | Observed | Table stakes | Not built: budget (needs data) |
| C8 | Window and lag stated beside every count | 3 | pass (3) | S | Claimed | Differentiator | Not built: budget |
| C9 | Leadership PDF or PPTX (H8) | 3 | pass for print; a new dependency fails (7) | M | Observed | Table stakes | ADR only |
| C10 | Dark mode (H3) | 2 | pass (7) | M | Observed | Table stakes | ADR only |
| C11 | Recharts or Tremor charts | 3 | fail (7, 10: library and client JS) | M | Observed | Table stakes | Rejected |
| C12 | Command palette | 2 | fail for now (client JS for eight routes) | M | Inferred | Table stakes | Rejected |
| C13 | Churn or renewal probability | — | fail (4) | — | Claimed | — | Rejected |
| C14 | Health-triggered plays, rule-closed success | — | fail (4, 6) | — | Claimed | — | Rejected |

Design upgrades:

| # | Upgrade | Impact | Fit | Effort | Evidence | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Semantic colour tokens, AA contrast, tabular numerals (H3) | 4 | pass (3, 7) | S | Observed (axe baseline) | Built |
| D2 | Grouped sidebar, skip link, route states (H2) | 4 | pass (7, 10) | S | Observed (baseline nav rows) | Built |
| D3 | Type scale and wider content | 2 | pass | M | Inferred | Not built: budget |

Ranking within Fit-pass candidates is Impact, then Evidence, then Effort. F3 was scored 4
rather than 3 because a customer asked for it on the record (`docs/product-feedback-notes.md`,
item 3); C4 scored 3 because `/feedback` already shows delivery from the linked change
record.

## Anti-patterns

Every attribution carries its source and tag; sources were accessed on 2026-10-20 unless
marked 2026-10-21. Where no source was seen, the cell says "not observed".

| Anti-pattern | Who does it | Source | Rule it breaks |
| --- | --- | --- | --- |
| People leaderboards or per-person KPIs | Gainsight CSM Performance dashboard: CTAs closed and timeline entries per CSM (Claimed) | <https://www.gainsight.com/marketplace/csm-performance-dashboard> | 5: specialists are never ranked |
| Churn or renewal probabilities | Planhat close-probability modelling (Claimed); Pendo Predict claims to predict churn and expansion (Claimed); Customerscore.io scores churn risk (Claimed); ChurnZero's Retrospective agent attaches a confidence score (Claimed) | <https://www.planhat.com/products/opportunity-pipeline> ; <https://www.pendo.io/why-choose-pendo-predict/> ; <https://www.capterra.fr/software/1072389/Customerscore-io> ; <https://churnzero.com/press-release/churnzero-launches-retrospective-ai-churn-analysis-agent/> | 4: renewal gets no probability |
| Score-triggered plays | Totango SuccessPlays fire on a health change (Claimed); Gainsight Rules Engine raises CTAs from rule conditions (Claimed); Planhat expansion-ready alerts (Claimed) | <https://pipeline.zoominfo.com/sales/totango-review> ; <https://support.gainsight.com/Gainsight_NXT/04Cockpit_and_Playbooks/03Admin_Guides/Creating_and_Closing_CTAs_from_Rules_Engine> ; <https://www.planhat.com/products/opportunity-pipeline> | 4: expansion never follows from health |
| Agents acting without review | ChurnZero agents in act-alone mode (Claimed); Canny Autopilot in automated mode (Claimed); Gainsight's managed renewal service acts within guardrails (Claimed); Pendo Predict claims to act on predictions automatically (Claimed) | <https://www.cmswire.com/the-wire/churnzero-launches-retrospective-an-ai-churn-analysis-agent-expanding-its-agentic-essentials-02/> ; <https://intercom.help/canny/en/articles/13172055-canny-ideas-what-s-changing> ; <https://www.gainsight.com/press/gainsight-announces-new-ai-native-services-business/> ; <https://www.pendo.io/why-choose-pendo-predict/> | 2: never auto-actioned |
| Completion counted as success | Gainsight Close CTA action can set Closed Success by rule (Claimed) | <https://support.gainsight.com/gainsight_nxt/03Rules_Engine/Rules_Engine_(Horizon_Experience)/Set_Up_Rules_Action_Types/Close_CTA_Action_Type> | 6: completed is not successful until evaluated |
| Zero-filled gaps | copilot-metrics-viewer turns missing counts into 0 with `?? 0` (Observed) | <https://github.com/github-copilot-resources/copilot-metrics-viewer> | 3: missing is Unknown, never 0 |
| Showing query content | Not observed. Harvey states it hides prompts and thread content (Claimed) | <https://help.harvey.ai/articles/using-space-analytics> | 1, 11 (kept) |
| Summing vendor-native metrics | Worklytics reports usage across several AI tools (Claimed); that it adds differently defined "active" counts together is Inferred from research question 1 | <https://www.worklytics.co/resources/best-employee-ai-usage-analytics-by-team-worklytics-vs-4-alternatives-2025> | 3: a sum of different "active" definitions has no single denominator |
| Public boards naming customers | Canny and Featurebase run public portals and roadmaps (Claimed); whether customer names appear: not observed | <https://intercom.help/canny/en/articles/13172055-canny-ideas-what-s-changing> ; <https://featurebase.app/blog/uservoice-alternatives> | 1, 9 |
| Session replay | Pendo, DOM-based with 30-day default retention (Claimed); Mixpanel lists Session Replay among its tools (Claimed, 2026-10-21) | <https://userpilot.com/blog/pendo-vs-walkme> ; <https://docs.mixpanel.com/guides/mixpanel-introduction> | 10 |
| In-app surveys and guides | Formbricks: targeted in-app surveys (Observed, README); Pendo no-code guides, WalkMe and Whatfix in-app guidance overlays (Claimed, 2026-10-21) | <https://github.com/formbricks/formbricks> ; <https://userpilot.com/blog/pendo-vs-walkme> ; <https://support.walkme.com/knowledge-base/what-is-walkme/> ; <https://whatfix.com/support/faq/> | 10 |
| Per-user tracking | Amplitude event tracking with user properties joined across devices; Mixpanel per-person user profiles (both Claimed, 2026-10-21) | <https://amplitude.com/docs/en/get-started/what-is-amplitude> ; <https://docs.mixpanel.com/guides/mixpanel-introduction> | 1, 10 |
| Unflagged scoring-rule changes | Gainsight score history does not mark rule or weight changes (Claimed, community thread) | <https://communities.gainsight.com/deliver-customer-success-9/making-a-major-change-to-the-health-scoring-is-it-identified-in-the-health-trend-3494> | 11: the panel says what it cannot attribute |

## Positioning

The hypothesis "evidence-honest adoption analytics for review-gated legal AI" holds up. No
legal-AI vendor found reports reviewed or accepted output (Claimed, research question 10);
the closest is Legora's "work product creation". Denominators are shown inconsistently or
leak, as with CoCounsel's export of active users only and Copilot's tenant counts. Missing
data becomes zero in at least one open-source viewer (Observed). Customer-success platforms
tie health to expansion and close plays as successes. Against that, this dashboard shows the
denominator next to every rate, keeps Unknown visible and grey, keeps the outcome apart from
the action, and refuses to read expansion off health. The Legal Tech Monitor 2026 finding that
in-house teams ask firms for evidence of AI use (Claimed) is the buyer-side reason to care.
The weakness is that every vendor comparison rests on search summaries; a live look at two
admin consoles would firm it up.

## Specs

### F1. Accessible SVG charts (built)

- **User story.** As a Legal Engineer reading an account, I see adoption as bars, including
  where data is missing, and a screen-reader user hears the same values.
- **References.** Recharts 3.10.1 `connectNulls: false` and `accessibilityLayer`; PostHog
  chart gaps at NaN; Tremor Tracker and SparkChart; shadcn `--chart-*` tokens (all Observed).
- **Adapted.** Gaps for missing values; SVG `<title>` and `<desc>`; a token for the bar
  colour. **Different.** Server-rendered with no client JS; a visually hidden table instead
  of a keyboard tooltip; a dashed grey outline for Unknown, a violet baseline mark for a true
  zero, a light violet bar with a solid edge for an incomplete period. Only Unknown is dashed
  and grey.
- **Acceptance.** Null never becomes a zero-height bar or "0" in text; every chart has a
  title, a description listing every value and a hidden table; bars reach 3:1 against white
  and against the track; no new client component.
- **Files.** `lib/charts.ts`, `components/charts/BarChart.tsx`, `components/charts/Meter.tsx`,
  `components/TrendBar.tsx`, `components/engagement/AdoptionTrendTable.tsx`
  (`rateChartData` in `lib/engagement/adoption-trend.ts`), `app/manager/page.tsx`.
- **Tests.** `lib/charts.test.ts`; `rateChartData` in `lib/engagement/adoption-trend.test.ts`.
- **Risk.** Rule 3, mitigated by the tests. ADR: [0001](../adr/0001-charts.md).

### F2. Health-score explainability (built)

- **User story.** As a CSM preparing a QBR, I can say how the score is built and why a
  missing measurement does not count against the customer.
- **References.** Vitally component hover and weight redistribution; Gainsight measure-level
  history; Planhat additive points (Claimed).
- **Adapted.** Component points against their maximum, configured and rescaled weights,
  penalty rule, band cut-offs. **Different.** It states that the change since the last QBR is
  not attributed to any component, because no previous breakdown is stored, and that the
  score does not drive expansion or predict renewal.
- **Acceptance.** Weights, penalties and cut-offs come from the code and config, not copy;
  unknown reads "Unknown, left out"; formula unchanged.
- **Files.** `lib/health-explain.ts`, `lib/health.ts` (exports `BAND_FLOORS`, same
  cut-offs), `components/HealthExplanation.tsx`, `app/accounts/[id]/page.tsx`.
- **Tests.** `lib/health-explain.test.ts`; `lib/health.test.ts` passes unchanged.
- **Risk.** Rules 4 and 11; the weights, cut-offs and formula are untouched.

### F3. Per-practice-group usage CSV (built)

- **User story.** As an Innovation lead, I can take my practice groups' usage into a QBR
  without asking the vendor (feedback notes, item 3).
- **References.** Harvey's export follows filters; CoCounsel's chart-level export;
  copilot-metrics-viewer CSV (Claimed and Observed).
- **Adapted.** A download per account. **Different.** The window is stated in every row
  ("5 weeks ending 2026-07-31 (oldest first)"), because the weekly counts are undated and a
  quarter cannot be claimed; every row says synthetic and draft for account-owner review; a
  missing value is an empty cell. Not an API: a route download like `/insights/report`.
- **Files.** `lib/exports/practice-group-usage.ts`, `app/accounts/[id]/usage.csv/route.ts`,
  link in `app/accounts/[id]/page.tsx`; the portfolio CSV stops writing `0.0000` for an
  account without seats.
- **Tests.** `lib/exports/practice-group-usage.test.ts`.
- **Risk.** Rules 1 and 3. ADR: [0004](../adr/0004-exports.md).

### D1. Semantic colour tokens (built)

- `--color-muted`, `--color-link`, `--color-link-hover`, `--color-focus`, `--color-chart`,
  `--color-chart-track` and `--color-unknown` in `app/globals.css`. One link colour, one focus
  ring. Tables use tabular numerals. Scrolling tables are focusable. Contrast per token is in
  [ADR 0003](../adr/0003-dark-mode.md).

### D2. App shell (built)

- A sticky sidebar from the `lg` breakpoint, grouped Portfolio, Adoption signals and Product
  loop; a wrapping row below it. A skip link. `app/error.tsx` and `app/not-found.tsx`; no
  `loading.tsx`, which would turn the unknown-account 404 into a streamed 200 (found in
  review, see ADR 0002). `lib/navigation.ts` holds the list; `lib/navigation.test.ts` fails
  when a top-level route is missing from it. ADR: [0002](../adr/0002-navigation.md).

### C4. Feedback themes (not built: budget)

- Items carry `theme`; change records already carry `feedbackItemIds` and `feedbackThemes`
  in `lib/evidence/schema.ts`. "Votes" are the accounts and personas raising a theme, shown
  as "3 of 5 accounts" with the denominator and never as a rank. Routing statuses stay
  `new | triaged | shared_with_product`; a triage-only `duplicate` may be added. Delivery
  shows from the linked change record. Needs a schema change mirrored in
  `packages/evidence-loop-contract/` and the Python module, so it is an M.

### C5. Saved views (not built: budget)

- GET filters on `/blockers`, `/feedback` and `/interventions` like `/`, and named views as a
  committed `data/views.json` of query strings. ADR: [0005](../adr/0005-saved-views.md).

## Hypothesis verdicts

| # | Verdict | Evidence |
| --- | --- | --- |
| H1 | **Confirmed, built (F1).** Recharts 3 is about 155 KB gzipped as a full bundle (Observed; tree-shaken estimate 90 to 130 KB, Inferred); Tremor on Recharts 2 about 150 to 200 KB (Inferred). Neither ships a hidden table. | npm tarballs measured; library source |
| H2 | **Confirmed, built (D2), modified.** A sidebar, not a command palette. | Baseline: two nav rows at 1280px |
| H3 | **Modified.** Tokens built (D1); dark mode ADR only, now with an owner decision on the shared design system. | axe baseline; ADR 0003 |
| H4 | **Parked.** Fits; not built in this budget. | Vercel, Legora, Linear (Claimed) |
| H5 | **Modified.** Activation and repeat-use curves per period are built into F1; adopters versus non-adopters needs a synthetic comparison group, which is an owner decision. | Cortex, Jellyfish (Claimed) |
| H6 | **Parked.** Confirmed as valuable; schema change across three consumers. | Canny, Linear, Productboard (Claimed) |
| H7 | **Confirmed, built (F2).** | Vitally, Gainsight, Planhat (Claimed) |
| H8 | **Confirmed in part.** CSV built (F3); PDF/PPTX ADR proposes a print stylesheet. | Evidence (Observed) |

## Research questions

1. **Active users, windows, lag.** CoCounsel: any action beyond signing in, about 24 hours
   late. Copilot: one intentional action in a fixed trailing 28 days, up to six days late.
   Gemini: 7, 28 or 90 days, two to three days late. Harvey: DAU/WAU/MAU, no lag stated
   (Claimed). `lib/engagement/adoption-trend.ts` uses four-week periods, counts eligible users
   rather than all licences in the activation denominator, and marks the running period
   incomplete; none of the four was seen doing the last.
2. **Small groups.** Copilot suppresses below 10 by default (minimum 5); Worklytics below 8
   (Claimed). Suppression protects individuals where an employer reads its staff's data. The
   dashboard flags below 10 and shows counts, which suits an account team reading its own
   adoption. Where the comparison crosses accounts, as on `/benchmarks`, suppression would be
   safer. **Change nothing now;** listed under Needs owner decision.
3. **Why a score moved.** Gainsight shows measure-level history; Vitally shows components on
   hover; Planhat shows factor points (Claimed). None was seen tying the move to a rule
   change, and Planhat ties health to expansion. F2 shows components and says what it cannot
   attribute.
4. **Adoption curves.** Jellyfish uses an access, weekly, frequent funnel; Cortex and
   Jellyfish compare AI users with non-users; DX tracks the move from non-use to consistent
   use (Claimed). `data/adoption-periods.json` supports activation, repeat use, completion and
   drop-off per four-week period for two series, with a training cohort; it has no
   non-adopter comparison group.
5. **Feedback dedupe and voting.** Canny makes ideas or insights from incoming feedback and
   merges duplicates; Productboard links feedback to features with an importance level;
   Linear counts requests and customers per issue (Claimed). When voters are accounts, a vote
   is a count of distinct accounts with a denominator; it should never become a rank.
6. **Plays.** Gainsight: rule, CTA, playbook, rule-based close. Totango: segment entry or
   health change, tasks and emails. ChurnZero: steps and agents that can act alone (Claimed).
   They auto-act at creation, outreach and close. The dashboard keeps the human at each step
   and stops at "not evaluated".
7. **Accessible charts.** Recharts 3: keyboard tooltip and optional title and desc, no table.
   Tremor: no aria on Tracker. copilot-metrics-viewer: canvas without text. All are client
   side (Observed). Hand-rolled SVG costs no client JS.
8. **Exports.** Harvey exports what is filtered, a year at a time; CoCounsel exports chart
   tables; Gemini offers console reports and an API (Claimed). Evidence prints to PDF
   (Observed). Column lists were not found for any vendor.
9. **Review complaints.** See [review mining](2026-10-competitive-landscape.md#review-mining):
   setup burden and learning curve lead for Gainsight, Totango and Vitally; pricing opacity
   for Planhat. Fewer than 20 reviews each.
10. **Reviewed output.** No evidence that Harvey, CoCounsel or Legora report reviewed or
    accepted output (Claimed).
11. **CSM workload.** Gainsight shows workload per CSM and assigns new accounts to the lowest
    load; its performance dashboard lists per-person activity (Claimed). Planhat: nothing
    found. `/manager` keeps hours planned against hours available in roster order, now drawn
    with the SVG meter; no per-person output metric is added.

## Design direction

- **Tokens.** Violet accent, four bands and grey Unknown kept; they are now semantic roles.
  Research gave no reason to change the accent; the owner's shared design system would.
- **Type.** System fonts kept (offline build). Tabular numerals in tables. A type scale is
  D3, not built.
- **Layout.** Sidebar at `lg` with the content column unchanged at `max-w-5xl`; at 1280px the
  column fits beside the sidebar. Wider content was not needed for any table tested.
- **Data viz.** One grammar: `BarChart` and `Meter`, SVG, hidden table, stated denominator in
  the readout, Unknown as a dashed grey gap.
- **States.** Plain hedged copy: "This page could not be shown.
  Nothing was changed", "No page or synthetic account matches this address".
- **Acceptance met.** Text 4.5:1 or more for every text token on white and gray-50; bars and
  focus ring 3:1 or more; sidebar at 1280px; no horizontal page scroll at 375px.

## Not built: budget

C4 feedback themes, C5 saved views, C7 unused-seat counts, C8 window and lag beside every
count, D3 type scale.

## Needs owner decision

1. **Shared design system.** `sebastianfoerste/legal-ai-design-system` (read-only, 2026-10-20)
   defines two-theme tokens, a different accent and local fonts, vendored into each consuming
   app. Adopting it would replace the violet accent and add font files. Decide whether this
   dashboard joins it; ADR 0003 assumes not yet.
2. **Dark mode** ([ADR 0003](../adr/0003-dark-mode.md), Proposed).
3. **Leadership PDF/PPTX** ([ADR 0004](../adr/0004-exports.md), Proposed): a print stylesheet
   first; any PPTX library is a new dependency.
4. **Saved-view storage** ([ADR 0005](../adr/0005-saved-views.md), Proposed).
5. **Small-cohort suppression on `/benchmarks`.** Keep `SMALL_COHORT_THRESHOLD` at 10; decide
   whether cross-account rows below it should be suppressed rather than flagged.
6. **Synthetic comparison group** for adopters versus non-adopters (H5): it would be invented
   data and must be labelled as such everywhere it appears.
7. **Charts library.** Rejected here; reopen only with a `Proposed` ADR if interaction needs
   grow beyond static bars.
