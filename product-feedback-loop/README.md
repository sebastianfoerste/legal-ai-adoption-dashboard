# product-feedback-loop

A traceable bridge from **what customers said** to **what product should build**. It turns synthetic customer interviews into a **prioritised, scored backlog** and a **"what we heard, what we changed" memo** — so user pain becomes a product requirement, not an anecdote.

Designed to live inside `legal-ai-adoption-dashboard` (drop this folder in), or run standalone. Not legal advice; all data is synthetic.

> **If you don't code:** scroll to [What the demo produces](#what-the-demo-produces). It ships a ranked backlog and a customer memo you can read in the browser.

## Why this exists

Both the adoption story and the product story fail at the same gap: feedback that never makes it into a prioritised, traceable requirement. This closes the loop — pain → theme → severity & revenue signal → priority score → mapped requirement → memo back to the customer.

## Run it

```bash
cd product-feedback-loop
make install && make test
make demo
```

Deterministic and offline. Reads `data/interviews.json`; writes the backlog and memo to `examples/`.

## What the demo produces

From five synthetic interviews, the loop ranks the themes by **severity × reach × revenue signal** and maps each to a requirement:

```
| Rank | Theme | Reach | Severity | Score | Mapped requirement |
| 1 | No audit trail for AI-assisted edits | 3 | blocker | 173 | Exportable, append-only audit log (who, what, when). |
| 2 | Can't restrict who approves sensitive matters | 2 | high | 65 | Role-based approval permissions by practice group + value. |
```

Full outputs: [`examples/prioritized-backlog.md`](examples/prioritized-backlog.md), [`examples/prioritized-backlog.json`](examples/prioritized-backlog.json), and the customer-facing [`examples/product-memo.md`](examples/product-memo.md).

## How it works

| Step | What happens | Where |
| --- | --- | --- |
| Aggregate | Group pains into themes; count distinct accounts (reach) | `scoring.aggregate_themes` |
| Score | severity weight × reach × revenue signal (ARR band × renewal risk) | `scoring.py` |
| Map | Theme → product requirement; unmapped themes are surfaced, never dropped | `THEME_TO_REQUIREMENT` |
| Communicate | Render a backlog + a "what we heard, what we changed" memo | `render_*` |

## How it is built

- **Deterministic & traceable.** Same interviews, same backlog — there is a test. Every score decomposes into severity, reach, and revenue.
- **Honest.** A theme with no mapped requirement is flagged "needs product scoping," not silently dropped.
- **Closes the loop.** The memo + `templates/changelog-note.md` are the customer-facing half.

## Scope and disclaimers

Illustrative scoring over synthetic interviews; the weights are defaults to be tuned. Not a product-analytics backend and not legal advice.

## License

MIT.
