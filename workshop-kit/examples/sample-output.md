# Sample output — prioritization result

The candidate workflows in [`synthetic-input.json`](synthetic-input.json) scored through the
[prioritization matrix](../discovery/use-case-prioritization-matrix.md).

| Candidate workflow | Impact | Frequency | AI fit | Review feasibility | Total |
|---|---:|---:|---:|---:|---:|
| NDA first-pass review | 4 | 5 | 5 | 5 | **19** |
| Clause comparison across versions | 4 | 4 | 5 | 5 | **18** |
| Document / issue summary | 3 | 5 | 4 | 4 | **16** |
| DPA review (GDPR) | 4 | 3 | 3 | 3 | **13** |
| Litigation research memo | 5 | 3 | 3 | 2 | **13** |

## Recommended first pilot: NDA first-pass review

It tops the table, and it clears the floor rule comfortably — review feasibility 5, meaning a
reviewer confirms the output in about ten minutes against a forty-five-minute task. It is the
group's highest-frequency work, and the model handles it well today.

## What was deliberately not picked first

The **litigation research memo** ties on total and scores highest on impact, but its review
feasibility is 2: verifying it means checking every authority, ninety minutes of work, and a
missed fabricated citation is a serious error. Piloting it first would stake the account's
trust on the workflow hardest to verify. It is a strong candidate for later — once the group
trusts the review habit — not for week one.

## The pilot plan that follows

1. Partner briefing for the go decision on NDA first-pass review.
2. Workshop for the Corporate group on the synthetic NDA set.
3. Associate hands-on to build verification fluency.
4. Friction captured with the product-feedback template; re-baseline at four weeks.
5. On a real usage signal, expand to clause comparison — the next-highest, also cheap to verify.
