> **Correction, 6 October 2026.** This report is superseded and kept for the record.
> Two things in it are wrong. The priority score multiplied severity by reach and by the
> sum of the account signals, so reach counted twice. The "Status" lines in the memo were
> assigned by rank (first = shipped, second = in progress, third = planned); no delivery
> record stood behind them, and no requirement named here was shipped. Corrected outputs:
> [`prioritized-backlog.md`](../../prioritized-backlog.md) and
> [`product-memo.md`](../../product-memo.md).

# Prioritised product backlog (from customer feedback)

_Period: Q2 2026 (synthetic) · 5 themes from synthetic interviews_

| Rank | Theme | Reach | Severity | Revenue signal | Score | Mapped requirement |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | No audit trail for AI-assisted edits | 3 | blocker | 14.4 | 173 | Exportable, append-only audit log of every AI-assisted edit (who, what, when). |
| 2 | Can't restrict who approves sensitive matters | 2 | high | 10.8 | 65 | Role-based approval permissions, scoped by practice group and matter value. |
| 3 | Hard to onboard associates | 2 | high | 5.6 | 34 | Guided in-product onboarding flow with role-specific first tasks. |
| 4 | Citations not always traceable to the source | 2 | medium | 4.0 | 16 | Click-through citation grounding: every cited passage links to the source location. |
| 5 | No weekly usage visibility | 1 | low | 2.0 | 2 | Weekly per-team usage view with low-usage warnings. |

_Score = severity weight × accounts reached × revenue signal (ARR band × renewal-risk). Synthetic data; not legal advice._
