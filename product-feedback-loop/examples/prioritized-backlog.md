# Prioritised product backlog (from customer feedback)

_Period: Q2 2026 (synthetic) · 5 themes from synthetic interviews · formula feedback-loop.score.v2_

## Quality and control failures

Reviewed first, whatever the commercial size of the accounts that raised them. Ordered by severity, then reach. The score is shown for reference and does not order this lane.

| Rank | Theme | Severity | Reach | Commercial factor | Score | Requirement | Delivery status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | No audit trail for AI-assisted edits | blocker | 3 | 1.8 (complete) | 21.6 | Append-only log of every AI-assisted edit with author, time and change, exportable by an administrator. | in progress (chg-003) |
| 2 | Can't restrict who approves sensitive matters | high | 2 | 1.9 (complete) | 11.4 | Approval permissions scoped by practice group and matter value. | not started (chg-004) |
| 3 | Citations not always traceable to the source | medium | 2 | 1.33 (complete) | 5.3 | Each list item carries the clause number and a link to the clause. | released (chg-009) |

## Commercially weighted backlog

Ordered by score.

| Rank | Theme | Severity | Reach | Commercial factor | Score | Requirement | Delivery status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | Hard to onboard associates | high | 2 | 1.47 (complete) | 8.8 | Show a short legend for item statuses at the top of every issues list. | released (chg-002) |
| 5 | No weekly usage visibility | low | 1 | 1.33 (complete) | 1.3 | Export of active users and runs by practice group and period. | deferred (chg-005) |

## How to read this

- Score = severity weight × accounts reached × commercial factor.
- Commercial factor = 1 + mean account signal ÷ 6, where account signal = ARR-band weight × renewal-risk weight. It lies between 1 and 2. Reach enters the score once.
- An account with no contract value has signal 0 and still counts towards reach. An account whose revenue band is not recorded is left out of the mean and named below.
- Accounts without revenue data: none.
- Delivery status is read from the evidence store. Rank never sets it. "not recorded" means no delivery record exists.
- Weights are documented judgments (uncalibrated judgment, not yet reviewed). Change them in `scoring.WEIGHTS` and record who reviewed them.

_Synthetic data; not legal advice._
