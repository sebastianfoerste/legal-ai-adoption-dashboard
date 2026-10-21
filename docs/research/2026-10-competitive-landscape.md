# Competitive landscape, October 2026

> **Network-limited run.** On 2026-10-20 the research container could not open vendor sites
> or EUR-Lex: WebFetch returned DNS failures (`ENOTFOUND`) for `help.harvey.ai`,
> `www.thomsonreuters.com`, `learn.microsoft.com`, `www.vitally.io` and `eur-lex.europa.eu`.
> Web search, `git clone` of public GitHub repositories and the npm registry worked. So every
> vendor fact below comes from a search-result summary and is tagged **Claimed**, even where
> the summary paraphrases public help docs. Only facts read in open-source code are
> **Observed**. No product was used live, no account or trial was created, and no gap was
> filled from memory.

This is desk research for an adaptation of competitor patterns into this dashboard. It feeds
the [feature matrix](feature-matrix.csv), the [design teardown](design-teardown.md) and the
[adaptation plan](adaptation-plan.md). Nothing here is legal advice.

## Method

- **Window.** Searches and code reading on 2026-10-20. Every source has that access date.
- **Evidence tags.** **Observed**: read in source code or a live product. **Claimed**: seen
  only in a search result, including vendor docs and marketing. **Inferred**: our reasoning.
  Tags are never upgraded. A matrix row carries its weakest tag.
- **Sources.** Search results for vendor help centres, release notes, press, review sites
  (G2, Capterra, GetApp, Software Advice) and trade press; shallow clones of public
  repositories into `/tmp`, read but never run; npm tarballs downloaded only to measure size.
- **IP.** Patterns only. No code, text, logos or screenshots from any product are in the
  repository. Review themes are paraphrased and counted; no reviewer is named.
- **Rings.** Direct (legal-AI vendors and customer-success platforms), adjacent (AI-adoption
  analytics, feedback tools, digital adoption, product analytics) and pattern donors (OSS
  dashboard and chart libraries, plus two dashboards known for one pattern).

## Searches

About 75 distinct web searches ran: 31 for legal-AI and AI-adoption analytics, 35 for
customer-success and feedback tools, one network preflight, and eight on 2026-10-21 in the
review follow-up (vendor URLs for seven products, and HighQ). A selection, with language:

| # | Query | Language |
| --- | --- | --- |
| 1 | legal AI usage analytics dashboard admin active users | EN |
| 2 | Harvey usage dashboard admin analytics help.harvey.ai active users | EN |
| 3 | CoCounsel Legal usage analytics report administrators Thomson Reuters | EN |
| 4 | Microsoft Copilot Dashboard Viva Insights minimum group size active user definition data lag | EN |
| 5 | Google Workspace admin Gemini usage reports active users export | EN |
| 6 | Worklytics AI adoption dashboard minimum group size privacy anonymization | EN |
| 7 | Jellyfish AI Impact dashboard adoption cohorts AI users vs non-users | EN |
| 8 | Legora admin analytics usage dashboard firms | EN |
| 9 | Vitally vs Planhat | EN |
| 10 | Gainsight scorecard history health score trend explain change Customer 360 | EN |
| 11 | Gainsight CTA playbook rules engine automatically create CTA close success criteria | EN |
| 12 | Canny Autopilot merge duplicate posts feedback MRR company votes | EN |
| 13 | Linear customer requests customer revenue tier Linear Asks Insights | EN |
| 14 | Gainsight reviews complaints G2 cons steep learning curve | EN |
| 15 | KI-Nutzung Kanzlei messen | DE |
| 16 | Legal Tech Monitor 2026 KI | DE |
| 17 | Customer Success Plattform Health Score Vergleich | DE |
| 18 | tableau de bord adoption IA juridique | FR |
| 19 | plateforme customer success score de santé comparatif | FR |
| 20 | Regulation (EU) 2026/1744 Digital Omnibus AI | EN |

## Products

45 products are in the [matrix](feature-matrix.csv): 16 direct, 19 adjacent, 10 donors. In
brief:

- **Legal-AI vendors.** Harvey, CoCounsel Legal and Legora publish admin usage analytics
  (Claimed). Lexis+ AI was renamed Lexis+ with Protégé in February 2026 (Claimed). For
  Luminance and Spellbook no adoption analytics turned up. Robin AI sought a buyer in October
  2025 and its 2026 status is unconfirmed, so it is marked `unknown`.
- **Customer-success platforms.** Gainsight, ChurnZero, Vitally, Planhat, Totango (merged
  with Catalyst in 2024), Custify, ClientSuccess, HubSpot's customer-success workspace and
  Customerscore.io (status unknown; seen only on a review listing).
  All score health; several trigger plays or forecast churn and expansion (Claimed).
- **AI-adoption analytics.** Microsoft's Copilot Dashboard, Google's Gemini reports,
  Worklytics, Larridin, DX, Jellyfish, Pendo Agent Analytics, Cortex, Langdock (Claimed).
- **Feedback tools.** Productboard, Canny, Linear Customer Requests, Featurebase (Claimed).
- **Legal adjacent.** Litera Foundation dashboards, Intapp Celeste's ethical walls for AI, and
  HighQ, whose help docs cover dashboards and KPI charts but no AI-adoption analytics
  (Claimed).
- **Code read (Observed).** copilot-metrics-viewer (MIT), Tremor (Apache-2.0), shadcn/ui's
  chart (MIT) on Recharts 3.10.1, PostHog's chart package (MIT outside `ee/`), Langfuse (MIT
  outside `ee/`), Evidence (MIT). Formbricks (AGPLv3 core) was read for its README and licence
  only.
- **Seeds dropped or changed.** WalkMe was acquired by SAP in 2024 (Claimed). Clio, Faros AI,
  Libra and Noxtua were not researched: no adoption analytics surfaced for them in discovery.

## Context (background only)

None of this enters the UI, the data or the exports.

- **Regulation (EU) 2026/1744, the Digital Omnibus on AI.** Secondary sources say it was
  published in the Official Journal on 24 July 2026, entered into force on 27 July 2026,
  delays high-risk obligations and softens the AI-literacy duty (Claimed:
  [Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/eu-digital-omnibus-on-ai-enters-into-force),
  [Cooley](https://cdp.cooley.com/digital-ai-omnibus-delays-key-deadlines-introduces-new-rules/)).
  **Unverified:** EUR-Lex was unreachable, so the citation is not checked against the
  primary source and must not be relied on.
- **Legal Tech Monitor 2026.** Reported on 17 September 2026: about 73% of in-house lawyers
  would consolidate mandates with firms that demonstrate AI savings, and nearly 40% already
  ask advisers for evidence of AI use (Claimed:
  [beck-aktuell](https://www.beck-aktuell.de/rechtsbranche/anwaltschaft/legal-tech-monitor-2026-ki-tools-2026-09-17),
  [DIS](https://www.disarb.org/wissen/dis-newsletter/newsletter-3/2026/legal-tech-monitor-2026)).
  This supports the dashboard's emphasis on reviewed output over raw activity.

## Top findings

1. **No legal-AI vendor reports reviewed or accepted output.** Harvey counts queries,
   CoCounsel counts messages and skills run, Legora counts AI responses and "work product
   creation" (Claimed). The dashboard's reviewed-completion measure has no counterpart found.
2. **Active-user definitions differ and are rarely flagged as provisional.** CoCounsel: any
   action beyond signing in, about 24 hours late. Copilot: one intentional action in a fixed
   trailing 28 days, up to six days late. Gemini: 7, 28 or 90 days, two to three days late
   (Claimed). None of them was seen labelling the running period as incomplete, which the
   dashboard does.
3. **Denominators leak.** CoCounsel's export leaves out users who never signed in (Claimed),
   so a rate built on it overstates use (Inferred). Copilot's tenant counts can exceed
   licences (Claimed).
4. **Missing becomes zero in open-source viewers.** copilot-metrics-viewer turns a missing
   monthly-active count into 0 (`?? 0`) (Observed). PostHog's charts break lines at NaN and
   Recharts defaults to `connectNulls: false` (Observed), the pattern the dashboard adopts.
5. **Small-group suppression thresholds sit near the dashboard's.** Copilot defaults to 10
   with a minimum of 5; Worklytics uses 8 (Claimed). The dashboard flags rather than
   suppresses below 10.
6. **Health-score explainability stops at components.** Vitally shows component scores on
   hover and redistributes the weight of a blank input; Gainsight keeps measure-level
   history but does not flag a rule change; Planhat adds factor points to a neutral 5
   (Claimed). None was seen saying what it cannot attribute.
7. **Health drives expansion and plays elsewhere.** Planhat forecasts from health and alerts
   on expansion-ready behaviour; Totango fires plays on a health change; Gainsight rules can
   close a CTA as a success (Claimed). The dashboard's rules forbid all three.
8. **Agents act without review by configuration.** ChurnZero agents can act alone; Canny's
   Autopilot can publish without approval; Gainsight's renewal service acts within
   guardrails (Claimed). ChurnZero's Retrospective agent, which a CSM saves, is the
   review-gated exception. Sources for findings 7 and 8 are in the plan's
   [anti-pattern table](adaptation-plan.md#anti-patterns).
9. **Accessible charts cost client JavaScript or need hand work.** Recharts 3.10.1 is about
   155 KB gzipped as a full UMD bundle, Tremor on Recharts 2 about 150 to 200 KB (Observed
   and Inferred). Neither ships a hidden data table. A server-rendered SVG adds none.
10. **Print is the cheapest PDF path.** Evidence's "Download PDF" calls `window.print()` with
    print utilities and switches charts to SVG when printing (Observed).

## Review mining

Fewer than 20 reviews per product were visible as search snippets (about 13 individual
snippets plus aggregate summaries in total), so these counts are directional only. Count =
distinct results mentioning the theme.

| Product | Theme 1 | Theme 2 | Theme 3 |
| --- | --- | --- | --- |
| Gainsight | Setup and admin burden (4) | Steep learning curve (3) | Unintuitive or slow interface (2) |
| Totango | Learning curve, slow (2) | Health score misleading (2) | Manual integrations, little customisation (1) |
| Vitally | Setup and learning curve (2) | Playbook and bulk-email limits (2) | Missing filters or connectors (2) |
| Planhat | Opaque pricing (2) | Needs a strong admin (1) | Permissions and reporting usability (1) |

Sources: [Gainsight on G2](https://www.g2.com/products/gainsight-customer-success/reviews),
[Gainsight on Capterra](https://www.capterra.com/p/148980/Gainsight/reviews/),
[Totango on Capterra](https://www.capterra.com/p/222281/Totango/reviews/),
[Totango on G2](https://www.g2.com/products/totango/reviews),
[Vitally on G2](https://www.g2.com/products/vitally/reviews),
[Planhat on Capterra](https://www.capterra.com/p/149430/Planhat/reviews/), and the rfp.wiki
summaries listed in the matrix.

## Not reachable

| Host or source | What failed | When |
| --- | --- | --- |
| `help.harvey.ai` | WebFetch DNS `ENOTFOUND` | 2026-10-20 |
| `www.thomsonreuters.com` | WebFetch DNS `ENOTFOUND` | 2026-10-20 |
| `learn.microsoft.com` | WebFetch DNS `ENOTFOUND` | 2026-10-20 |
| `www.vitally.io` | WebFetch DNS `ENOTFOUND` | 2026-10-20 |
| `eur-lex.europa.eu` | WebFetch DNS `ENOTFOUND`; every legal citation is unverified | 2026-10-20 |
| Other vendor sites, G2, Capterra, bundlephobia | Not fetched: the preflight showed non-GitHub hosts failing, so only search summaries were used | 2026-10-20 |
| Live products, demo videos | Not used: no login, trial or demo request is allowed | 2026-10-20 |

`sebastianfoerste/legal-ai-design-system` was reachable read-only. It is the owner's shared
token set; see [Needs owner decision](adaptation-plan.md#needs-owner-decision).

## Coverage against the targets

| Target | Result |
| --- | --- |
| 15 or more products in the matrix | 45 |
| 8 or more deep teardowns, 2+ legal-AI vendors, 2+ CS platforms | 8 (Harvey, CoCounsel, Legora; Gainsight, Vitally, Planhat; Copilot Dashboard; copilot-metrics-viewer). **Shortfall:** seven of the eight rest on Claimed search summaries, not live observation, and for those seven the design language (navigation, type, colour, density, data viz, empty states, microcopy, accessibility) and integrations were not captured; pricing only for the Copilot Dashboard; complaints only for Gainsight, Vitally and Planhat |
| Code read for 3 or more OSS projects | 7 (copilot-metrics-viewer, Tremor, shadcn/ui, Recharts, PostHog, Langfuse, Evidence) |
| Review mining for 3 or more products | 4, but **shortfall:** fewer than 20 reviews each |
| 12 or more searches in English, German and French | About 75, with German and French queries |
