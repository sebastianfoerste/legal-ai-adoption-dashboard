# Matter task pack: TP-M

**Use this when** a later round should observe the contract-review handoff on a whole
matter with several documents, using the synthetic Northwind matter of the
`contract-review-eval-harness` repository in place of the single-excerpt packs.

Status: preparation only. `TP-M` is not part of round 1, and no session has been held with
it. In the harness the matter's expected answers, its captured outputs and its reviewer
sessions are all pending, so the prerequisites in section 3 are not met today.

## 1. What TP-M is

The participant acts as the reviewing lawyer for the customer in a fictional matter: a
company buying a hosted analytics platform on the vendor's paper. Round 1 of the matter has
seven documents of about 3,200 words in total: three contracts, a negotiation record, a
security questionnaire, the client's instructions and the client's playbook. Every document
is fabricated.

The handout is one captured AI-assisted review of those documents. It lists findings of
three kinds: conflicts between documents, positions the client must take, and questions
the file cannot answer yet. The review is a first pass. Nothing in it is relied on until
the participant, as the reviewing lawyer, has signed it off.

The harness describes the method in `docs/MATTER_EVALUATION.md` and the matter in
`matters/northwind-saas/README.md`. Read both before preparing a session.

## 2. Why it is a separate pack

`TP-A` and `TP-B` are built to be compared with each other: the same structure, the same
five seeded defect types, the same time limit. `TP-M` shares none of that. Its findings
come from a real model output, it has no seeded defects, and it needs reading in advance.

- Do not use `TP-M` in the same round as `TP-A`, and do not compare its measures with
  those of `TP-A` or `TP-B`.
- `TP-M` addresses RQ3 and RQ4 of the [study plan](study-plan.md) on a harder task. It
  adds one thing the short packs cannot show: whether a reviewer follows a finding across
  documents.
- A follow-up on `TP-M` needs a second matter round of its own. The harness has round 2 of
  the same matter for that purpose.

## 3. What must be true first

In this order. A session held earlier produces records that cannot be scored.

1. **The matter documents are reviewed by their author.** Six of them were drafted with AI
   assistance and are marked as pending review in the harness.
2. **The expected answers for round 1 exist.** The harness rule is that the answers are
   written before their author reads any model output. A moderator reads the output during
   the session, so a session before the answers exist would break that rule.
3. **The acceptable result is defined from those answers.** For `TP-A` it is two named
   defects and a refusal to sign as it stands. For `TP-M` it must name the issues of high
   materiality that the reviewer may not sign off without. Until that definition is
   written into [task-answer-key.md](task-answer-key.md), `acceptable` and
   `minutesToAcceptable` cannot be scored.
4. **One output for round 1 is captured.** A capture can be made without being read.
5. **The condition each participant will see is decided and written down** before any
   output is read. The harness produces outputs under three conditions, and choosing after
   seeing them would bias the sample.
6. **A reviewer template is generated from the capture** with the harness command
   `matter-review-template`. The template names the output by its hash and does not say
   which condition produced it.
7. **The pre-read has gone out** at least two working days ahead: the seven documents and
   nothing else. Sending it is one of the steps in the [README](README.md) that need the
   owner's explicit authorisation.

## 4. Changes to the session

Everything in the [moderator script](moderator-script.md) applies, with these changes.

| Element | `TP-A` | `TP-M` |
|---|---|---|
| Before the session | Nothing to read | Seven documents, read in advance. Allow 30 minutes |
| Handout | Contract excerpt and a five-item issues list | The captured review. The documents stay open beside it |
| Part 2 | 0:25 to 0:45, 20 minutes | 0:25 to 0:50, 25 minutes |
| Part 3 | 0:45 to 0:55, 10 minutes | 0:50 to 0:55, 5 minutes |
| Answer key | Seeded defects (a) to (e) | The harness's expected answers for round 1 |
| Help ladder | As written | As written. Never explain a finding before it is rated |

Part 3 is shortened because it yields the weakest evidence in the study. Part 1 keeps its
full 15 minutes, and it still comes before the participant sees any output.

In Part 2 the participant gives the same closing decision as for `TP-A`: sign off as it
stands, sign off with changes, or send back. On the way there they also record, for each
finding, whether they accept, correct or reject it.

## 5. What is recorded

One sitting produces two records.

**The observation sheet.** The six per-task measures of the pack apply unchanged:
`completion`, `assistanceCount`, `interpretationErrors`, `trustConcerns`, `acceptable` and
`minutesToAcceptable`, with `taskPackId` set to `TP-M`. Note for each observation which
finding it belongs to. On the [observation sheet](observation-sheet.md), write `TP-M` in
the task pack field, use the session kind `observed_task`, and leave the table of seeded
defects blank, because this pack has none.

**The harness reviewer session.** For each finding: `accepted`, `corrected` or `rejected`,
a usefulness score from 1 to 4 on the harness scale, and a reason for anything not
accepted. For the sitting: minutes spent reviewing and any material issue the output
missed.

One constraint follows from the harness. It accepts a reviewer session only if every
finding of the output is rated once. If the participant does not finish within Part 2,
either they rate the remaining findings afterwards on their own, or no reviewer session is
kept and the sitting counts through the observation sheet alone. Decide which before the
session and tell the participant.

## 6. Where the records go

Both records are participant records. Both stay in the private research store, as
[data-handling.md](data-handling.md) describes.

The harness keeps reviewer sessions under `matters/northwind-saas/reviews/`, in a public
repository. A reviewer session is the rating record of one person, and a pseudonym does not
change that. Under section 6 of [data-handling.md](data-handling.md) only an aggregate from
at least three sessions, or an approved quotation, becomes public. A single reviewer
session is therefore not placed in the harness repository under the present rules.

Two consequences:

- The harness's usefulness figure is reported only as an approved aggregate from at least
  three sessions, with its approval reference.
- Publishing an individual reviewer session would need a new consent item, because the
  [consent form](consent-form.md) covers notes, recording, quotation and follow-up contact
  and has no item for a published rating record. That is a decision for the owner and a
  point for the legal review.

A participant has one study code in this pack, such as `P01`. The harness names reviewers
in the form `R01`. The link between the two is kept in the private identity file and is
published nowhere.

## 7. What a TP-M session can and cannot show

It can show how the lawyers observed review one model output on one fabricated matter:
which findings they accept, where they stop trusting the output, and what they check
across documents.

It cannot show how the output would fare on real client documents, how common a problem is
among lawyers, or that a tool is in use anywhere. Sessions with practitioners on synthetic
documents are discovery and a user pilot with a stated number of participants. They are
not evidence of adoption inside an organisation.
