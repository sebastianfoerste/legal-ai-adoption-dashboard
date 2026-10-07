# Observation sheet

**Use this when** you take notes in a session. Copy this sheet once per session and fill it
during and directly after the session.

Status: template. No sheet has been filled. A completed sheet holds real observations, so
it needs the owner's authorisation to store and never enters this repository. Storage and
deletion follow [data-handling.md](data-handling.md).

Rules for every entry:

- Refer to the participant by study code only. Write no name of a person, employer, client
  or matter.
- Write what happened or was said. Leave the interpretation column empty during the
  session.
- Give every row one evidence type and one research question.

## 1. Header

| Field | Value | Software field |
|---|---|---|
| Session id | `{{session_id}}` | `id` |
| Study round | `{{study_round}}` | `studyRound` |
| Session kind | `interview` \| `observed_task` \| `follow_up_task` | `kind` |
| Study code | `{{study_code}}` | `participantCode` |
| Role label | `{{role_label}}` | `roleLabel` |
| Experience band | `0-2 years` \| `3-7 years` \| `8+ years` | `experienceBand` |
| Date | `{{session_date}}` | `heldOn` |
| Task pack | `TP-A` \| `TP-B` \| none | `taskPackId` |
| Consent reference | `{{consent_reference}}` | `origin.consentRef` |
| Recording made | yes \| no | none |
| Quotation opt-in on consent form | yes \| no | none |
| Moderator and note-taker | `{{moderator_role}}`, `{{note_taker_role}}` | none |

Use `interview` for a session without the task, `observed_task` for a round-1 session with
`TP-A` and `follow_up_task` for a follow-up session with `TP-B`.

## 2. Timed notes

One row per observation. The first five columns are filled in the session. The last column
is filled later and names the role of the person who added it.

| Clock | Evidence type | RQ | Observed (what happened or was said) | Task marker | Interpretation (added later, by whom) |
|---|---|---|---|---|---|
| `{{clock}}` | `past_behaviour` \| `observed_task` \| `opinion_on_proposal` | `{{rq_id}}` | `{{observed}}` | `{{task_marker}}` | `{{interpretation}}` (`{{interpreted_by_role}}`, `{{interpretation_date}}`) |

Task markers, for Part 2 only. Use as many as apply, or none:

- `prompt-1`, `prompt-2`, `prompt-3`: a counted moderator prompt, with the help-ladder step
- `interpretation-error`
- `trust-concern`
- `defect-a`, `defect-c`, `defect-d`, `defect-e`: a seeded defect identified
- `item-b-confirmed`, `item-b-wrongly-rejected`
- `re-keyed`: the participant wrote or typed an own list or checklist
- `source-used`: the participant went from a list item to the contract through its source
  reference
- `decision`: the participant's final decision
- `interruption-start`, `interruption-end`
- `participant-explanation`: an answer to a clarifying question after the task

In the software record the observed text goes into `observed`. The interpretation is
stored separately, with the role of its author, and never in the observation.

## 3. Per-task measures

Fill directly after the session from the timed notes, using
[task-answer-key.md](task-answer-key.md). Leave the whole section blank for a session
without the task.

| Field | Value | Basis in the timed notes |
|---|---|---|
| `completion` | `completed_unaided` \| `completed_with_assistance` \| `not_completed` | Clock time of `decision` |
| `assistanceCount` | `{{number}}` | Rows marked `prompt-1` to `prompt-3` |
| `interpretationErrors` | `{{number}}` | Rows marked `interpretation-error` |
| `trustConcerns` | `{{number}}` | Rows marked `trust-concern`, distinct concerns only |
| `acceptable` | yes \| no | The three conditions in the answer key |
| `minutesToAcceptable` | `{{minutes}}` or blank | Start time, time of the last condition met, minus interruptions |

Seeded defects identified, for the notes and not a software field:

| Defect | Identified | Clock |
|---|---|---|
| (a) | yes \| no | `{{clock}}` |
| (c) | yes \| no | `{{clock}}` |
| (d) | yes \| no | `{{clock}}` |
| (e) | yes \| no | `{{clock}}` |
| Item (b) | confirmed \| wrongly rejected \| not addressed | `{{clock}}` |

Decision stated: sign off as it stands \| sign off with changes \| send back \| none.

A count of 0 means that the moderator looked and saw none. A blank means that the measure
was not taken. Do not enter 0 for a measure that was not taken.

## 4. Quotation log

Write a quotation word for word, or do not log it as a quotation. Remove any name before
writing it down.

| Clock | Quotation (word for word) | Evidence type | RQ | Permission | Approval reference |
|---|---|---|---|---|---|
| `{{clock}}` | `{{quotation_text}}` | `{{evidence_type}}` | `{{rq_id}}` | `internal_only` \| `public_approved` | `{{approval_reference}}` |

- Every quotation starts as `internal_only`.
- `public_approved` needs both the participant's quotation opt-in on the consent form and
  the owner's approval of that quotation, recorded in the approval reference.
- A quotation is attributed by role label only.

## 5. After the session

- [ ] Header complete and study code checked against the private identity store.
- [ ] Every row has one evidence type and one research question.
- [ ] Measures filled from the notes, with blanks where a measure was not taken.
- [ ] Notes checked against the recording, if one was made, and the recording scheduled
      for deletion.
- [ ] No name of a person, employer, client or matter anywhere on the sheet.
- [ ] Interpretation column still empty, or each entry carries a role and a date.
