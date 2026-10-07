# Baseline and extension, 6 October 2026

What the repository contained before the evidence-loop work, where its three components
disagreed, and the smallest extension that connects them. The engagement layer
(`lib/engagement/`) was uncommitted work in progress at the time; it is preserved and
extended, not rebuilt.

## 1. The three components

| Component | Location | What it does | Its records |
| --- | --- | --- | --- |
| Workshop discovery materials | `workshop-kit/` | Questionnaire, workflow-discovery template, ROI worksheet, session agendas, feedback template | Markdown templates and one synthetic intake (`examples/synthetic-input.json`) |
| Dashboard analytics | `app/`, `lib/`, `data/` | Health score, blockers, feedback queue, and the engagement layer: adoption trend, interventions, value, capacity, manager view, expansion, renewal, customer review | Zod-validated synthetic JSON |
| Feedback pipeline | `product-feedback-loop/` | Ranks interview themes and writes a backlog and a customer memo | `data/interviews.json`, generated Markdown and JSON |

## 2. What already worked and was kept

- **Adoption trend.** Activation, repeat use, completion and drop-off after training are
  separate rates with explicit denominators. A missing count is `null` and renders as
  "Unknown". Incomplete periods and small cohorts are flagged. Sustained use needs three
  complete periods.
- **Interventions.** A record runs from observed problem through evidence, hypothesis,
  action and expected result to follow-up observations and an outcome. "Completed" and
  "evaluated" are different stages; attribution is stated separately.
- **Expansion and renewal.** Six criteria, each met, not met or unknown. Unknown evidence
  cannot produce "expand". The health score is not an input.
- **Manager view.** Attention reasons cite the record they rest on. Specialists are role
  labels and are not ranked.
- **Customer review.** Seven sections generated from the records, with a human review gate.

## 3. Shared concepts

| Concept | Workshop kit | Dashboard | Feedback pipeline |
| --- | --- | --- | --- |
| Observed friction | Product-feedback template ("observed", in the user's words) | `feedback.json` item text; intervention `observedProblem` | Interview `pains[].quote` |
| Severity | "blocks / slows / annoys", "touches trust" | `low / medium / high` | `blocker / high / medium / low` |
| Trust versus convenience | "Trust-touching items jump the queue" | Blocker category `trust_in_output` | Absent before this work |
| Proposed change and acceptance | Template fields | Absent for feedback items | A static theme-to-requirement table |
| Time saved | ROI worksheet (manual minus verification) | `value-measurements.json` | Absent |
| Follow-up | Follow-up email templates | Intervention follow-up observations | Absent |

## 4. Disconnected records

- The feedback pipeline ranked five accounts (Globex, Initech and others) that do not exist
  in the dashboard, whose five accounts (Meridian & Cole and others) it never read.
- A dashboard feedback item had no problem statement, no decision, no acceptance criteria
  and no delivery record. Its trail ended at "shared with Product".
- The workshop template asks for proposed change and acceptance; nothing stored them.
- Interventions (customer-success actions) had a full evidence chain. Product changes had
  none.
- No record linked a research question or a session to anything.

## 5. Conflicting status definitions

| Where | Vocabulary | What it actually described |
| --- | --- | --- |
| `data/feedback.json` | `new / triaged / shared_with_product` | Routing inside the vendor |
| Feedback memo | `shipped / in progress / planned` | Nothing: assigned by rank position |
| Workshop changelog template | `in progress / planned`, "what shipped" | Free text |
| Interventions | `proposed / underway / completed / evaluated` | Customer-success actions, correctly evidenced |

The memo printed "shipped" for whatever ranked first. No requirement in it had shipped.

## 6. Measurement and evidence defects

| Defect | Where | Correction |
| --- | --- | --- |
| Sum of three component medians presented as "median time to an acceptable result" | `lib/engagement/value.ts`, value panel, customer review, README, case study, demo guide | Per-task observations; each task totalled before the median; summaries labelled and never reported as a median |
| Abandoned and rejected attempts invisible | Value measurement | Attempts are the denominator of the acceptance share; effort on failed attempts is charged to accepted results |
| Waiting time not distinguished from effort | Value measurement | Active minutes and elapsed minutes recorded separately; only active time enters the verdict |
| Productivity and quality merged into one verdict | Value measurement | Two separate assessments, then the combined verdict |
| As-of date a hard-coded constant | `lib/engagement/as-of.ts` | `ADOPTION_AS_OF` and `?asOf=`; the demo date stays the default |
| Cohort changes not flagged | Adoption trend | A rate whose eligible group differs from the previous period is flagged |
| Reach counted twice in the feedback score | `product-feedback-loop` | Formula v2: mean account signal, bounded factor |
| Zero or missing revenue erased a theme | `product-feedback-loop` | Factor of at least 1; missing revenue is unknown, not zero |
| Control failures competed on commercial size alone | `product-feedback-loop` | A separate lane ordered by severity and reach |
| Delivery status derived from rank | `product-feedback-loop` | Read from the evidence store |
| Predictive claims stated as fact | Adoption questionnaire, discovery template, ROI worksheet | Reworded as hypotheses with what to record to test them |
| Production build needed network access for a web font | `app/layout.tsx` | System font stack; no build-time download |

Earlier outputs are preserved with a correction note:
`product-feedback-loop/examples/superseded/2026-q2-formula-v1/` and the copies in
`examples/`. The three documents that quoted "150 to 80 minutes" carry a correction line.

## 7. The extension

One new record type and one file connect the three components.

- **`data/evidence-loop.json`**, schema `legal-ai-adoption.evidence-loop.v1`: research
  questions, sessions, observations, problems and changes. It is the single place a
  delivery status is recorded. See [EVIDENCE_LOOP.md](EVIDENCE_LOOP.md).
- **`packages/evidence-loop-contract/evidence-loop.v1.vocabulary.json`**: the shared
  vocabulary. The dashboard and the Python module each test against it.
- **`lib/evidence/`**: validation, derived status, follow-up comparison, the public and
  private boundary, and the evidence-linked backlog.
- **`/research`**: the research-to-change view. `/feedback` and the customer review show
  evidence, confidence, status, owner, missing observations and the next decision.
- **`workshop-kit/research/`**: the practitioner study pack.

Not built, deliberately: a database, an import job for real observations, any change to the
health score or the expansion rule, and any connection to an external system.
