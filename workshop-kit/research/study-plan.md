# Study plan: contract-review handoff, round 1

**Use this when** you need the reasoning behind the study before you recruit: what it asks,
whom it needs, how each question is answered and what would count as the handoff working
or failing.

Status: plan only. No session has been held and no participant has been approached.

## 1. Workflow and why this one

The contract-review handoff is the step where an AI-assisted first-pass issues list passes
from the lawyer who produced it to the lawyer who must review it and sign it off.

Reasons for choosing it:

- It contains the mandatory review point. A qualified lawyer reviews the list before
  anything is relied on or sent. That point does not move in any version of the workflow.
- The cost of the handoff decides whether the first pass saves time. If the reviewer
  repeats the whole review, the first pass has added a step.
- It is observable in one sitting. A reviewer can work through a short synthetic contract
  and list in 20 minutes while a moderator watches.
- It involves two people, so it shows where information is lost between them. A
  single-user task would hide that.

## 2. Research questions

| ID | Question | Evidence type |
|---|---|---|
| RQ1 | How do reviewers currently decide that a first-pass issues list is acceptable to sign off, and what do they check first? | `past_behaviour` |
| RQ2 | Where in the handoff from producer to reviewer is information lost or rebuilt, for example by re-keying the list into the reviewer's own checklist? | `past_behaviour`, then `observed_task` |
| RQ3 | Given a synthetic contract and an AI first-pass issues list with seeded defects, can a reviewer reach an acceptable result, and what assistance, interpretation errors and time does it take? | `observed_task` |
| RQ4 | Which information in the handoff (source links, what was checked, what was not checked) changes the reviewer's willingness to rely on the list? | `observed_task`, then `opinion_on_proposal` |
| RQ5 | How do practitioners react to a proposed handoff note? | `opinion_on_proposal` |

The three evidence types rank in this order of strength: what the moderator sees a person
do (`observed_task`), what a person reports having done on the last concrete occasion
(`past_behaviour`), and what a person says about a shown idea (`opinion_on_proposal`).
Answers to RQ5 are the weakest evidence in the study. A favourable reaction to the proposed
note does not show that the note would be used.

## 3. Assumptions stated before recruitment

These are assumptions. The study may contradict each of them.

| ID | Assumption | An observation that would contradict it |
|---|---|---|
| A1 | Reviewers rebuild the issues list into their own checklist before signing off. | Participants describe or show a review that works on the producer's list directly. |
| A2 | Missing source links are the main reason reviewers re-read the whole contract. | Participants re-read the whole contract although every item has a source reference, or give another reason. |
| A3 | The handoff problem looks similar in law firms and in-house teams. | In-house participants describe a different handoff, for example no separate reviewer. |
| A4 | Synthetic documents prompt review behaviour close enough to real work to be informative. | Participants say or show that they review the synthetic material differently from real work. |
| A5 | Participants have used an AI-assisted review tool at least once. | Screener answers show that several participants have not. |

## 4. Participants: how many and what the number supports

Round 1 plans four to eight participants. The GOV.UK guidance cited in section 10 gives
that range as the usual number for a round of in-depth interviews or usability testing,
and advises more rounds over one larger round when findings are unclear.

A round of this size can support:

- a description of how the handoff is done by the people observed;
- the places where reviewers stall, rebuild information or misread a status;
- candidate causes that are worth testing with a change;
- a decision on which change to try first.

It cannot support:

- a statement of how common a problem is among lawyers;
- a reliable comparison between law firms and in-house teams, or between roles;
- a claim that a change caused an improvement;
- any percentage. Results are reported as counts with role labels, for example "three of
  six sessions", and never as percentages or rates.

If round 1 leaves a question open, the next step is a further round with adjusted
questions.

## 5. Participant mix

All participants are actual or likely users of the handoff. The round needs variety across
role, experience and organisation type.

| Role label | Why this role | Proposed target in a round of six |
|---|---|---|
| Producing associate | Prepares and hands over the list; main source for the producer side of RQ2 | 2 |
| Reviewing senior lawyer or partner | Reviews and signs off; main source for RQ1, RQ3 and RQ4 | 2 |
| In-house counsel | Tests A3 | 1 |
| Professional support lawyer or legal operations | Sees the handoff across teams and often owns the checklist | 1 |

- Experience: at least one participant in each band (`0-2 years`, `3-7 years`, `8+ years`).
- Organisation type: at least two from law firms and at least one in-house. With one or
  two in-house participants the round can show that a difference exists. It cannot show
  that none exists.
- Every participant who is a qualified lawyer performs the observed task in the reviewer's
  seat, including producing associates. Task results are reported by role label.
- A legal operations participant who is not a qualified lawyer does not perform the
  sign-off task. That session uses the interview and the proposal parts only, and the task
  measures stay blank.

Screening questions and quota tracking are in [screener.md](screener.md).

## 6. Method per research question

Each session lasts 60 minutes with one participant, one moderator and optionally one
note-taker. The script is in [moderator-script.md](moderator-script.md).

| RQ | Session part | Instrument | What is recorded |
|---|---|---|---|
| RQ1 | Part 1, 15 minutes | Interview about the last concrete handoff | Steps the participant took, first check, sign-off condition |
| RQ2 | Part 1, then Part 2 | Interview, then observation of the task | Reported and observed rebuilding: own checklist, re-keying, questions to the producer |
| RQ3 | Part 2, 20 minutes | Task pack `TP-A` from [synthetic-task-pack.md](synthetic-task-pack.md) | The six per-task measures in [task-answer-key.md](task-answer-key.md) |
| RQ4 | Part 2, then Part 3 | Observation, then reaction to the proposal card | Which information the participant looked for; stated reaction, logged separately |
| RQ5 | Part 3, 10 minutes | Proposal card describing a handoff note | Stated reaction, logged as opinion |

Notes go on [observation-sheet.md](observation-sheet.md), which separates what was
observed from interpretation added later.

## 7. Success and failure observations, defined in advance

These describe a single session. They are fixed before recruitment so that the findings
cannot redefine them.

The handoff works in a session when:

- S1. The reviewer reaches an acceptable result against the answer key with `completion`
  `completed_unaided`.
- S2. The reviewer moves from a list item to the cited clause and checks it there, without
  re-reading the whole contract first.
- S3. The reviewer can say what the list covers and what it leaves out, without help.
- S4. The reviewer reads every status correctly (`interpretationErrors` is 0).
- S5. In the interview, the reviewer's last real review used the producer's list as the
  working document.

The handoff fails in a session when:

- F1. The reviewer signs off the list as it stands (`acceptable` is no).
- F2. The reviewer reaches an acceptable result only by reviewing the whole contract from
  the start and setting the list aside. The list then saved nothing.
- F3. The reviewer re-keys the list into an own checklist or note before judging it.
- F4. The reviewer treats `Checked, no issue` as lawyer-reviewed, or treats the list as
  complete.
- F5. The reviewer needs moderator prompts to find where a finding comes from.
- F6. In the interview, the reviewer's last real review involved asking the producer what
  had been checked, or repeating the producer's review.

A session can show observations from both lists. Report each one with its session and
role label.

Satisfaction ratings and attendance are not evidence of adoption. The study collects no
satisfaction rating. The number of people who accept an invitation or attend a session
shows availability and goodwill. Evidence of adoption is behaviour, and
[follow-up-session-plan.md](follow-up-session-plan.md) lists the four behaviours that are
reported separately.

## 8. Risks and biases

| Risk | How it distorts | Mitigation | What remains |
|---|---|---|---|
| Moderator effect | The moderator is associated with the product. Participants may soften criticism or try to give the expected answer. | Word-for-word introduction, neutral probes, a list of things the moderator must not do, a note-taker where possible. | Politeness cannot be removed. Opinion evidence is discounted for it. |
| Recruitment through the owner's network | Participants are likely to be more interested in legal AI and better disposed to the owner than lawyers in general. | Record the recruitment route per participant. Exclude people who report to the owner. Seek at least one referral without prior contact. | The sample is a convenience sample. Findings describe these participants. |
| Synthetic-document effect | A short invented excerpt carries no client risk and no deal context. Review may be faster or less careful than in real work. | Ask A4 directly in Part 1 and at the close. Compare the task with the reported last real occasion. | Time and care on the task are not estimates for real matters. |
| Learning effect in the follow-up | A returning participant has seen the task format and may look for seeded defects. | Different document and item order in `TP-B`. Seeded defects are not revealed after round 1. Returning and new participants are reported separately. | A better follow-up result may be learning. The follow-up plan requires this to be stated. |
| Think-aloud effect | Speaking while reviewing slows the participant and may make the review more deliberate. | The same instruction in both rounds. | Times are comparable between rounds and are not real-work times. |
| Small sample | One unusual participant shifts the picture. | Report every session individually next to any summary. | No generalisation beyond the round. |

Before recruitment, a timed dry run of `TP-A` and `TP-B` with one colleague outside the
sample is recommended to check that both packs fit into 20 minutes and are of similar
difficulty. A dry run is a proposal and needs the owner's decision like any other session.

## 9. After the round

1. Check the notes of each session. Delete any recording within the proposed 14 days once
   the notes are checked. See [data-handling.md](data-handling.md).
2. Fill the interpretation column of each observation sheet, with the interpreter's role.
3. Aggregate across sessions. From this point a participant can no longer withdraw.
4. Write each problem as a separate statement with the observations that support it and
   those that contradict it. The kit's
   [product-feedback template](../enablement/product-feedback-template.md) gives the form.
5. Decide which change to try. Record the problem and the acceptance criteria before the
   change is built.
6. Run the follow-up session with `TP-B` as set out in
   [follow-up-session-plan.md](follow-up-session-plan.md).
7. Explain to each participant how the materials were built, as the information sheet
   promises. Participants who will not return receive the explanation before their contact
   details are deleted. Participants who opted in to follow-up contact receive it after the
   follow-up session, so that the seeded defects stay undisclosed until then. The owner
   approved this delayed explanation on 6 October 2026.
8. Obtain the owner's approval before any aggregate or quotation leaves the research team.

## 10. Reference

GOV.UK Service Manual, "Plan user research for your service":
https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service
(accessed 6 October 2026).

This plan takes the following points from that page, in paraphrase:

- Turn unfounded assumptions and opinions into research questions. Section 3 states the
  assumptions and sections 2 and 6 tie them to questions.
- Decide who to research with; this can be specific groups. See section 5.
- Choose research activities that give strong evidence and reliable answers for the least
  time, effort and cost. See section 6.
- Prepare rounds of research, each answering specific research questions with specific
  user groups.
- A round using methods such as in-depth interviews or usability testing usually needs
  between 4 and 8 participants. Where clear findings need more participants, do more
  rounds. Surveys, A/B testing and benchmarking need hundreds of participants.
- Include a good variety of the users within a group.
- Record the plan in a shared document and be clear which research questions each round
  answers and how that helps decisions.

Two linked pages informed the participant documents:

- "Finding participants for user research":
  https://www.gov.uk/service-manual/user-research/find-user-research-participants
  Participants must be actual or likely users. Give participants an information sheet
  before the session. Collect the minimum personal information, share it only with
  colleagues who need it and delete it when it is no longer needed.
- "Getting informed consent for user research":
  https://www.gov.uk/service-manual/user-research/getting-users-consent-for-research
  The page lists what a participant must understand for consent to be informed, and
  advises checking the information sheet with a data protection expert or legal adviser.

The following are this pack's own choices and are not GOV.UK guidance: the three evidence
types and their ranking, the per-task measures, the success and failure observations, the
rule against percentages, the participant roles and the data-handling defaults.

One proposed default departs from the consent page. That page advises keeping the record
of consent with the research data it covers and being able to match the two. This pack
proposes storing the signed form apart from the notes, in the private identity store, and
matching the two through the study code and a consent reference. The owner should confirm
that choice.
