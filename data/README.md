# Synthetic data

Every record in this folder is **synthetic**. It was generated for demonstration only.

- No real client, firm, or in-house team is represented. Account names are invented.
- No personal data. Personas are aggregate counts, not individuals.
- No confidential matter detail.

## Engagement files

| File | Content |
| --- | --- |
| `team.json` | Specialists as role labels with capacity assumptions; commitments, escalations, coaching actions |
| `engagements.json` | Per account: assignments, complexity factors, sponsor and demand records, expansion scope, objectives, review owner and date |
| `interventions.json` | Interventions from observed problem to outcome |
| `adoption-periods.json` | Per-workflow counts in four-week reporting periods |
| `value-measurements.json` | Baseline and follow-up time to an acceptable result, quality failures, rework, financial assumptions |

| `evidence-loop.json` | Research questions, sessions, observations, problems and product changes with their decision, delivery record, follow-up and outcome (`legal-ai-adoption.evidence-loop.v1`) |

`value-measurements.json` holds one row per attempt for the two scenario accounts and a
component summary for `acct-002`, which the dashboard labels and does not report as a median.

`evidence-loop.json` states an `origin` on every record instead of `synthetic: true`. All of
its records are `synthetic_fixture`. The loader refuses a `participant_session` record: real
observations belong in the private research store, never here.

`feedback.json` states an `origin` on every item in the same form, and the loader refuses
an item without one.

Each record in the other engagement files carries `"synthetic": true`, and `lib/engagement/schema.ts`
rejects any other value and any unknown key. A `null` count means "not captured" and is
shown as "Unknown".

Two accounts carry a scenario: `acct-005` (scenario A, stalled adoption diagnosed and
recovered) and `acct-004` (scenario B, high activity where expansion is inappropriate).
`previousHealthScore` in `accounts.json` is stated under the current health formula.

The data exists to make the dashboard's logic — the adoption health score, blocker
triage, and product-feedback routing — visible on a realistic-looking but fabricated
account portfolio.
