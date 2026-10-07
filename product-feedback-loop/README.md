# product-feedback-loop

A traceable bridge from **what customers said** to **where each requirement stands**. It turns synthetic customer interviews into a scored backlog and a customer memo, and reads every delivery status from the evidence store that the dashboard also reads.

Part of `legal-ai-adoption-dashboard`. Not legal advice; all data is synthetic.

> **If you don't code:** scroll to [What the demo produces](#what-the-demo-produces).

## Run it

```bash
cd product-feedback-loop
make test     # 27 unit tests, standard library only
make demo     # writes examples/prioritized-backlog.md, .json and product-memo.md
make check    # tests, and the committed examples must equal the generated output
```

Deterministic and offline. Inputs: `data/interviews.json` and, one level up, `data/evidence-loop.json` with its vocabulary in `packages/evidence-loop-contract/`. Pass `--no-evidence` to the CLI to run without the store; every status then reads "not recorded".

The interview file and every interview in it state an `origin`, in the form the evidence store uses. The CLI refuses a file without one: a name ending in "(synthetic)" does not count. Interview files hold synthetic fixtures only, and the generated backlog carries the same origin.

## What the demo produces

- [`examples/prioritized-backlog.md`](examples/prioritized-backlog.md): two lanes. Quality and control failures come first, ordered by severity and reach. The commercially weighted backlog follows, ordered by score.
- [`examples/prioritized-backlog.json`](examples/prioritized-backlog.json): the same, with the weights and schema ids (`feedback-loop.backlog.v2`).
- [`examples/product-memo.md`](examples/product-memo.md): for each top theme the requirement, the decision with its confidence and rationale, the recorded delivery status with its release evidence, the outcome and the next decision.

In the fixture the first-ranked requirement (an audit log) is in progress, the second is not started and the third is released and awaiting evidence. Rank sets none of these.

## How it works

| Step | What happens | Where |
| --- | --- | --- |
| Aggregate | Group pains into themes; count distinct accounts (reach) | `scoring.aggregate_themes` |
| Score | severity weight × reach × commercial factor | `scoring.priority_score` |
| Commercial factor | 1 + mean known account signal ÷ 6, between 1 and 2 | `scoring.commercial_factor` |
| Lane | A theme classed `quality_control` leaves the commercial ordering | `scoring.lane_sort_key` |
| Status | Requirement, decision, delivery and outcome from the evidence store | `evidence.statuses_by_theme` |
| Communicate | Backlog and memo | `scoring.render_*` |

## Formula version 2 and what it corrects

Version 1 computed severity × reach × the sum of the account signals. Reach therefore counted twice, and an account with no or unknown revenue pulled its theme to zero. Version 1 also printed "shipped", "in progress" and "planned" by rank position.

Version 2:

- **Reach counts once.** The commercial term is a mean over accounts, so adding an account raises reach and leaves the mean alone.
- **No revenue is not no problem.** The factor is at least 1. An account with band `none` has signal 0 and still counts towards reach. An account whose band is missing or unrecognised is unknown: it is left out of the mean and named in the output.
- **Quality and control failures get their own lane.** They are listed first and ordered by severity, then reach. The commercial size of the accounts cannot move one of them below another, or below a convenience item.
- **Status is a record.** `released` is printed only when the store holds release evidence, and the memo prints the outcome beside it: a release without an assessed follow-up reads "awaiting evidence".

The outputs of version 1 are kept in [`examples/superseded/`](examples/superseded/2026-q2-formula-v1/CORRECTION.md) with a correction note.

## The weights are judgments

`scoring.WEIGHTS` holds every number. None is calibrated against outcomes. `reviewed_on` and `reviewed_by` are empty until a named person has reviewed them, and each backlog prints that state. Review them before using the ranking for a real decision.

## Scope and disclaimers

Illustrative scoring over synthetic interviews. The module validates the part of the evidence format it depends on and refuses a store that contains participant records or identifying fields. Not a product-analytics backend and not legal advice.

## License

MIT.
