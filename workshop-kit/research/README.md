# Contract-review handoff research pack

**Use this when** you prepare the first qualitative study round on the contract-review
handoff and need to know which document to use at which step, and which steps still need
the owner's authorisation.

## Status

As of 6 October 2026 this pack is preparation only.

- Zero sessions have been held.
- No invitation has been sent and no session is scheduled.
- No participant exists. The pack contains no observation, quotation or finding.
- Every contract, party and issues list in the pack is synthetic. Every value a person must
  supply is a `{{merge_field}}`.

## What the study looks at

One workflow: the contract-review handoff. An AI-assisted first-pass issues list for a
contract passes from the lawyer who produced it to the lawyer who must review it and sign
it off. The list is a first pass. Nothing in it is relied on until a qualified lawyer has
reviewed it and signed it off. The study examines how that review happens. The review
itself is fixed and is never a variable in the study.

Round 1 is planned as four to eight one-to-one sessions of 60 minutes. A later follow-up
session is planned to test whether a product change helped.

## Fixed identifiers

The software record uses these identifiers. Use them exactly as written.

- Research questions `RQ1` to `RQ5` and assumptions `A1` to `A5`: see [study-plan.md](study-plan.md).
- Evidence types: `past_behaviour`, `observed_task`, `opinion_on_proposal`. Scripts and
  sheets keep them apart.
- Task packs: `TP-A` for round 1, `TP-B` for the follow-up session. `TP-M` is a separate
  pack on a whole matter for a later round; it is not comparable with the other two.
- Per-task measures: `completion`, `assistanceCount`, `interpretationErrors`,
  `trustConcerns`, `acceptable`, `minutesToAcceptable`. Definitions are in
  [task-answer-key.md](task-answer-key.md).
- Experience bands: `0-2 years`, `3-7 years`, `8+ years`.
- Quotation permission: `internal_only`, `public_approved`.

## Order of use

| Step | File | Purpose | Seen by |
|---|---|---|---|
| 1 | [study-plan.md](study-plan.md) | Questions, assumptions, sample, method, success and failure observations, risks | Research team |
| 2 | [data-handling.md](data-handling.md) | Storage, retention and deletion rules (written separately) | Research team |
| 3 | [screener.md](screener.md) | Screening questions, include and exclude logic, quota table | Research team |
| 4 | [invitation-draft.md](invitation-draft.md) | Draft invitation email, not sent | Research team until authorised |
| 5 | [information-sheet.md](information-sheet.md) | Participant information in plain language | Participant |
| 6 | [consent-form.md](consent-form.md) | Individually initialled consent items | Participant |
| 7 | [moderator-script.md](moderator-script.md) | Word-for-word script for the 60-minute session | Moderator |
| 8 | [synthetic-task-pack.md](synthetic-task-pack.md) | Handouts for TP-A and TP-B | Moderator, and participant for the handout sections only |
| 9 | [task-answer-key.md](task-answer-key.md) | Seeded defects, acceptable result, scoring | Moderator only |
| 10 | [observation-sheet.md](observation-sheet.md) | One sheet per session | Moderator and note-taker |
| 11 | [follow-up-questions.md](follow-up-questions.md) | Questions after a session and after a product change | Research team until authorised |
| 12 | [follow-up-session-plan.md](follow-up-session-plan.md) | Follow-up session with TP-B and the comparison with round 1 | Research team |
| 13 | [matter-task-pack.md](matter-task-pack.md) | `TP-M`: the same session on a synthetic multi-document matter, its prerequisites and where its records go. Not part of round 1 | Research team |
| 14 | [legal-review-worksheet.md](legal-review-worksheet.md) | For each open merge field: what it must say, the provision it answers and a wording to start from, with the sources checked | Legal reviewer |

## Needs the owner's explicit authorisation

None of these has happened. Each needs a separate, explicit decision by the owner before
it happens.

1. Sending any invitation or screener, including an informal message to a contact.
2. Scheduling a session or sending a calendar entry.
3. Recording a session. Recording also needs the participant's separate consent.
4. Storing real observations, in any system. Completed observation sheets never enter this
   repository.
5. Publishing or sharing any quotation or aggregate outside the research team.
6. Sending any follow-up question or debrief after a session.
7. Approving the proposed data-handling defaults that the information sheet relies on.

## Decisions recorded

The owner decided on 6 October 2026:

- Recruitment does not start yet. It waits for the legal review below.
- The private research store is an encrypted local folder outside `~/Developer`, opened
  only by the owner. See [data-handling.md](data-handling.md), section 7. The owner
  created it on 7 October 2026. It is empty.
- Consent item 5 (follow-up contact) stays in the consent form.
- Seeded defects stay undisclosed to returning participants until after the follow-up
  session.

Every other item in the list above is still undecided.

## Needs legal review before use

The information sheet and consent form state no legal provision. They carry merge fields
that a qualified reviewer must complete or confirm:

- `{{controller_name}}`: who is responsible for participants' personal data.
- `{{legal_basis}}`: the basis for handling personal data, and whether the consent items
  also serve as that basis.
- `{{research_contact}}`: who participants contact to ask questions or withdraw.
- `{{data_subject_rights_statement}}` and `{{complaints_route}}`: participants' rights and
  how to complain.
- `{{processors_or_none}}`: any other organisation that handles the data, for example a
  video-call or transcription provider.
- `{{aggregation_date}}`: the withdrawal cut-off, and how a later deletion request for
  pseudonymised notes is handled.
- `{{follow_up_contact_deadline}}`: how long contact details are kept when a participant
  opts in to follow-up contact. The proposed default deletes them within 30 days of the
  round's last session, which is too short for a later follow-up session.
- `{{incentive_statement}}`: whether any payment or benefit is offered, and whether
  professional or employer rules allow it.

The review should also cover the employer-permission question in the screener and the
statement on professional confidentiality in the information sheet.

[legal-review-worksheet.md](legal-review-worksheet.md) prepares that review. It proposes a
starting wording for each field and lists eight points to settle, among them that the
sheet's withdrawal cut-off does not fit a consent basis. It decides nothing.

## Check

Links to [data-handling.md](data-handling.md) resolve once that file is in this folder.
The kit's `make check` fails on placeholder markers and broken links, so run it after that
file arrives.
