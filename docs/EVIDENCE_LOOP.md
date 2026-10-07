# Evidence loop

How a research question, an observation, a product change and a follow-up are recorded so
that each can be traced to the others, and where the line between public and private
records runs.

## The chain

```text
research question ── session ── observation ──┐
                                              ├─ problem (interpretation, class)
account feedback item or interview theme ─────┘        │
                                                       ▼
                     change: hypothesis ─ decision ─ acceptance criteria
                             ─ delivery (implementation ref, release evidence)
                             ─ follow-up (baseline and follow-up observations)
                             ─ outcome ─ next decision
```

| Record | Holds | Does not hold |
| --- | --- | --- |
| Research question | Question, evidence type, assumptions | Answers |
| Session | Round, kind, date, study code, role label, experience band, task pack | Name, employer, contact details |
| Observation | What was seen or said, evidence type, optional quotation with its permission, optional task measures | Any reading of it |
| Problem | Statement, the researcher's interpretation and role, class, supporting and contradicting observations, linked feedback items, themes and accounts | A solution |
| Change | Hypothesis, proposed change, owner, decision with confidence and rationale, acceptance criteria, delivery record, follow-up, outcome, next decision | A rank or score |

Contradicting observations are a field of the problem, so a finding that cuts against an
assumption has a place to go. Deferred and rejected changes stay in the store with their
rationale and, for a deferral, a revisit date.

## One store, one vocabulary

- `data/evidence-loop.json` is the authoritative store. Schema id
  `legal-ai-adoption.evidence-loop.v1`.
- `lib/evidence/schema.ts` is the strict Zod schema. Unknown keys are rejected.
- `packages/evidence-loop-contract/evidence-loop.v1.vocabulary.json` lists the allowed
  values. `lib/evidence/loop.test.ts` asserts that the Zod enums equal it;
  `product-feedback-loop` loads it at run time.
- `product-feedback-loop` reads the store for requirement text, decision, delivery status
  and outcome. It holds no status of its own. Both test suites pin the same outcome status
  for every change in the fixture, so a divergence between the two readers fails a gate.

A change to the format that removes or renames a field needs a new schema id (`v2`), a new
vocabulary file, and both readers updated in the same change.

## Rules enforced in code (`validateStore`)

- `released` requires release evidence, and release evidence means `released`.
- Delivery requires a decision to prioritise, a start date, and acceptance criteria
  recorded on or before that start date.
- `deferred` and `rejected` must agree between decision and delivery.
- An outcome requires a release and at least one follow-up observation from a session held
  on or after the release date.
- `supported` and `contradicted` require task measures on both sides of the comparison.
  Otherwise only `inconclusive` is allowed.
- A priority cannot rest on opinions about a proposal alone.
- Task measures belong only to observed tasks. A quotation marked public needs an approval
  reference. A duplicated observation is rejected.

Derived, never stored: outcome status (`awaiting_evidence` for a release without an
assessed follow-up), follow-up state against the as-of date, the follow-up comparison and
the list of missing observations.

## Public and private

| | Public store | Private research store |
| --- | --- | --- |
| Origin kinds | `synthetic_fixture`, `approved_aggregate` | `participant_session` |
| Location | This repository | Outside it; see `workshop-kit/research/data-handling.md` |
| Identities | None | In a separate identity file, linked only by study code |

The engagement layer pins `synthetic: true` on every record. The evidence loop states an
origin instead, so that a real observation has an honest label and the loader can refuse
it. `publicBoundaryIssues` rejects participant records and identifying fields before the
store is parsed; `scripts/check-private-boundary.mjs` repeats the check on the tracked tree
in every gate.

Two inputs sit outside the store and feed it: the dashboard's feedback items
(`data/feedback.json`) and the interview file (`product-feedback-loop/data/interviews.json`).
Each item, each interview and the interview file itself state an `origin` in the same
form. A name ending in "(synthetic)" does not count. The feedback loader runs the same
boundary check as the store, and the interview loader accepts synthetic fixtures only,
because practitioner evidence becomes public through the store as an approved aggregate.

Names are checked against a denylist that lives in the private store. Set
`PRIVATE_RESEARCH_DENYLIST` to its absolute path and run `pnpm boundary:check`. The check
reports a match by entry number. As long as the public tree holds synthetic fixtures only,
the list is optional; with the first approved aggregate the gate fails without it.

The dashboard loads only the bundled public store. To analyse real observations, run the
same code against the private store on a local machine; nothing in this repository reads
that location.

## Recording a real finding

1. Hold the session and write the observation sheet into the private store.
2. Write the problem record: statement, interpretation, supporting and contradicting
   observations.
3. Decide. Record the decision, confidence and rationale, and the acceptance criteria,
   before any implementation starts.
4. Implement through the normal checks. Record the implementation reference and, on
   release, the release evidence and which criteria were verified.
5. Plan the follow-up with a comparable task and a due date. Until it is held and assessed
   the outcome is "awaiting evidence".
6. Assess: supported, contradicted or inconclusive, with the other plausible causes.
7. Publish only an approved aggregate or quotation, as a new record with origin
   `approved_aggregate`. The original stays private.

## Regenerating outputs

```bash
pnpm evidence:backlog                 # docs/evidence-backlog.md
make -C product-feedback-loop demo    # backlog and memo
make check                            # all gates
```
