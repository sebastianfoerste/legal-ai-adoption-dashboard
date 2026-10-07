# Task answer key: TP-A and TP-B

**Use this when** you moderate or score the observed task and need the seeded defects, the
definition of an acceptable result and the scoring rule for each measure.

Moderator only. Never show this file to a participant, and do not reveal the seeded
defects during round 1. The contracts and lists are synthetic; see
[synthetic-task-pack.md](synthetic-task-pack.md).

## Seeded defects

| Type | Defect | TP-A | TP-B |
|---|---|---|---|
| (a) | Missed cross-referenced definition that changes the scope of the liability cap | Item A-2 says the clause 8 indemnity is outside the cap. Clause 9.1 caps all "Claims", and clause 1.2 defines "Claim" to include a claim under the clause 8 indemnity. The indemnity is capped. | Item B-4 says a breach of clause 7 is outside the cap. Clause 10.1 caps all "Defaults", and clause 1.2 defines "Default" to include a breach of clause 7. The breach is capped. |
| (b) | Correctly flagged issue | Item A-1. Clause 6.2 allows an annual increase with no limit. Finding and reference are correct. | Item B-5. Clause 5.1 allows suspension for an overdue invoice even if disputed. Finding and reference are correct. |
| (c) | Flagged issue with a wrong clause reference | Item A-4. The finding is correct. It cites clause 7.2, which concerns replacing staff. The right clause is 11.1. | Item B-2. The finding is correct. It cites clause 8.2, which concerns security instructions for remote access. The right clause is 9.2. |
| (d) | Item marked as checked with no source reference | Item A-3. Status `Checked, no issue`, source "None given". The clause is 10.1. It hides no further issue. | Item B-1. Status `Checked, no issue`, source "None given". The clause is 3.2. It hides no further issue. |
| (e) | Omission | The list does not mention the automatic renewal in clause 2.2 or its notice period of 90 days. | The list does not mention the automatic renewal in clause 2.2 or its notice period of six months. |

Items A-5 and B-3 are correct `Checked, no issue` entries with correct references. They
contain no defect.

## When a defect counts as identified

| Type | Counts as identified when the participant |
|---|---|
| (a) | says that the indemnity (TP-A) or a clause 7 breach (TP-B) falls under the cap, or that the list's contrary statement is wrong, and points to the defined term as the reason. A doubt without the defined term, such as wanting to check the point, is logged as a trust concern and does not count. |
| (e) | says that the list leaves out the automatic renewal or its notice period. |
| (c) | says that the cited clause does not contain the issue, or names the right clause. |
| (d) | says that the item gives no source or cannot be verified as written, or finds the clause and says the list should cite it. |
| (b) | Not a defect. Log `confirmed` if the participant checks and accepts it, `wrongly rejected` if the participant strikes it. |

Log the clock time of each identification.

## Acceptable result

The participant states one of three decisions: sign off as it stands, sign off with
changes, or send back.

A result is acceptable when all three conditions are met within the 20-minute task time:

1. The participant does not sign off the list as it stands.
2. Defect (a) is identified.
3. Defect (e) is identified.

Defects (c) and (d) are logged and reported. They are not conditions, because a reviewer
who finds (a) and (e) and refuses to sign has protected the client on the two points that
change the advice. A decision to send the list back without (a) and (e) is not acceptable.
Further legal points that the participant raises are noted and not scored.

## Scoring the measures

Use the field names and values exactly as written. They map onto the software record.

**`completion`**

- `completed_unaided`: the participant states a final sign-off decision within the task
  time and `assistanceCount` is 0.
- `completed_with_assistance`: the participant states a final sign-off decision within the
  task time after one or more counted prompts.
- `not_completed`: no final decision within the task time, or the participant stops.

`completion` records that a decision was reached. `acceptable` records whether the result
was right. A participant who signs off the defective list without help scores
`completed_unaided` and `acceptable` no. That combination is the failure the study most
needs to see, so keep the two fields apart.

**`assistanceCount`**: number of moderator prompts.

A prompt is any moderator utterance or action that gives the participant direction or
information about the task that the participant did not have. Each of these counts as one
prompt:

- pointing to a clause, a definition or a list item;
- confirming or denying a reading ("yes, that is the cap clause");
- explaining a status, a rating or a source reference;
- suggesting a next step;
- each step of the help ladder in [moderator-script.md](moderator-script.md).

These do not count: the scripted task instruction, a verbatim repeat of it on request, the
think-aloud reminder, a neutral probe that adds no information, a time notice, and help
with the medium such as scrolling or zoom.

**`interpretationErrors`**: number of times the participant misreads what the tool output
or a status means.

Count one for each distinct misreading that the participant states or acts on. The
following examples are invented to define the measure; none has been observed:

- reading `Checked, no issue` as reviewed by a lawyer;
- reading the risk rating as a legal conclusion instead of the tool's label;
- reading a source reference as proof that the cited clause supports the finding;
- reading the list as complete, so that a topic absent from the list raises no issue in
  the contract;
- reading "None given" as meaning that the contract has no clause on the topic;
- reading "Review status: awaiting lawyer review" as already signed off.

These are not interpretation errors: disagreeing with a risk rating on legal grounds,
missing a seeded defect (captured by `acceptable`), and misreading the contract text
itself (note it in the timed notes). The same misreading repeated counts once.

**`trustConcerns`**: number of distinct stated or shown concerns about relying on the
output.

- Stated: the participant says they would not rely on a part of the list, or names a
  reason for doubt.
- Shown: the participant re-reads the whole contract before using the list, re-keys the
  list into an own checklist, or checks every item against the contract after saying the
  list looks fine.

Two concerns are distinct when they differ in object or in reason. The same concern
repeated counts once. A concern is not a fault of the participant. Given the seeded
defects, doubt is warranted, so read this count together with `acceptable` and never as a
score in which lower is better.

**`acceptable`**: yes or no against the three conditions above. In the software record,
yes is `true` and no is `false`.

**`minutesToAcceptable`**: active minutes from the start of the task to the moment the last
of the three conditions is met, in whole minutes. The clock starts when the moderator
finishes the task instruction and the participant has both handouts. Active minutes
exclude interruptions that the moderator logs with a start and an end time, such as a
technical fault or a break. Leave the field blank if no acceptable result was reached. A
blank maps to `null` in the software record and never to 0.

## Ending the task

- When the participant states a decision, ask once: "Is that your final decision?" This
  question is not a prompt. If the answer is yes, the task ends, whatever the result.
- At 18 minutes give one time notice. At 20 minutes stop the task and ask what the
  participant would decide at this point. Write that answer in the timed notes. Because no
  decision was stated within the task time, `completion` is `not_completed`, `acceptable`
  is no and `minutesToAcceptable` stays blank.
- Do not continue the task to help a participant find a defect.
