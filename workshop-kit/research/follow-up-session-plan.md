# Follow-up session plan

**Use this when** round 1 has led to a product change and you want to test, with `TP-B`,
whether the change helped the handoff.

Status: plan only. No round-1 session, no change and no follow-up session exists yet. The
follow-up needs the same authorisations as round 1; see [README.md](README.md).

## 1. Before the change is built

Record these four things, with a date, before work on the change starts. In the software
record they are the problem, the hypothesis, `acceptanceCriteria` and `criteriaRecordedOn`.

- Problem: `{{problem_statement}}`, with the ids of the round-1 observations that support
  it and of those that contradict it.
- Hypothesis: `{{hypothesis}}`. State what the change is expected to alter in the
  reviewer's behaviour.
- Proposed change: `{{proposed_change}}`.
- Acceptance criteria: `{{acceptance_criterion_1}}`, `{{acceptance_criterion_2}}`. Write
  each criterion in terms of the per-task measures, so that a session can meet or miss it.
- Recorded on `{{criteria_recorded_on}}` by `{{recorded_by_role}}`.

Criteria written or changed after the first follow-up session cannot be used for this
comparison. Record new criteria for a later round instead.

## 2. Preparing TP-B

- Apply the change to the `TP-B` issues list from
  [synthetic-task-pack.md](synthetic-task-pack.md). The contract excerpt stays as it is.
- Keep all five seeded defect types in the content. The change may alter how the list
  presents its content. It must not correct the content, because a corrected list no
  longer tests the review.
- Write down exactly what the changed form adds or removes compared with the baseline
  form, for example a line stating what was not checked. If that addition names a seeded
  defect outright, say so in the comparison: the task has then become easier for a reason
  that needs no reviewer skill.
- The changed list still carries "Review status: awaiting lawyer review". The participant
  remains the reviewing lawyer whose sign-off is required.

## 3. Participants

| Group | What the comparison shows | Main limit |
|---|---|---|
| Returning participants | The same person with `TP-A` and with `TP-B` | Learning effect |
| New participants | A fresh reviewer with the changed handoff | Participant differences |

Aim for both groups if numbers allow, and report them separately. Returning participants
can be invited only if they opted in to follow-up contact and their contact details are
still held under [data-handling.md](data-handling.md).

## 4. Running the session

Use the [moderator script](moderator-script.md) with the same timing, task instruction,
think-aloud reminder and help rule as in round 1, and the same moderator where possible.
Use the after-change questions in [follow-up-questions.md](follow-up-questions.md). Score
with [task-answer-key.md](task-answer-key.md) and set the session kind to `follow_up_task`
on the [observation sheet](observation-sheet.md).

## 5. Comparison with the round-1 baseline

List every session. Report counts per session and no percentages, averages or tests of
significance.

| Measure | Round-1 baseline, `TP-A` | Follow-up, `TP-B` | Reading rule |
|---|---|---|---|
| `completion` | `{{value_per_session}}` | `{{value_per_session}}` | Compare with `acceptable`. A quick unaided decision that is not acceptable is a failure. |
| `assistanceCount` | `{{value_per_session}}` | `{{value_per_session}}` | Fewer prompts with the same help rule favours the change. |
| `interpretationErrors` | `{{value_per_session}}` | `{{value_per_session}}` | Fewer misreadings favours the change. Name which misreading disappeared. |
| `trustConcerns` | `{{value_per_session}}` | `{{value_per_session}}` | Read with `acceptable`. Fewer concerns together with a missed defect is worse. |
| `acceptable` | `{{value_per_session}}` | `{{value_per_session}}` | The main result. |
| `minutesToAcceptable` | `{{value_per_session}}` | `{{value_per_session}}` | Compare only sessions with an acceptable result. A blank is not a time. |

Add the success and failure observations from [study-plan.md](study-plan.md), section 7,
for each session in both rounds.

## 6. Other explanations to state

Write each of these down with the comparison, even where it seems unlikely. In the software
record they are the `alternativeExplanations` of the outcome.

- Learning effects. A returning participant knows the task format, expects defects and has
  practised thinking aloud.
- Task differences. `TP-A` and `TP-B` differ in contract type, defect topics, item order
  and notice period. Their difficulty has not been shown to be equal. The round and the
  task pack change together, so their effects cannot be separated.
- Participant differences. New participants differ from the round-1 participants in role,
  experience and familiarity with AI-assisted tools.
- Other plausible causes: a change in moderator behaviour or help given, session
  conditions, the time between the sessions, training or tool exposure in between, and a
  changed form that discloses a seeded defect.

## 7. Conclusions

Each acceptance criterion and the hypothesis as a whole receive one of four values.

| Value | Use it when |
|---|---|
| `awaiting_evidence` | No follow-up session has been held, or the follow-up observations are not yet checked. This is the value today. |
| `supported` | The pre-recorded acceptance criteria are met in the follow-up sessions, the result holds for returning and new participants where both exist, and none of the explanations in section 6 accounts for the result at least as well as the change does. |
| `contradicted` | The criteria are missed, and the measures are unchanged or worse under conditions that should have favoured the change. |
| `inconclusive` | The sessions point in different directions, or an explanation in section 6 accounts for the result at least as well as the change, or there are too few sessions to tell. |

State the reasons for the value and the confidence in it. With four to eight sessions per
round, `supported` means that the change is worth keeping and testing further. It does not
mean that the effect is established for lawyers in general.

## 8. What a follow-up session cannot show

A follow-up session takes place within a short window after the change. A short window
leaves sustained adoption unproven, whatever the session shows.

Report these four separately and never merge them into one adoption figure:

| Term | Meaning | Can a follow-up session show it? |
|---|---|---|
| Activation | A person uses the changed handoff for the first time in their own work | No. The session uses a synthetic task. |
| Repeated use | The same person uses it again on a later occasion | No. |
| Accepted workflow completion | A reviewing lawyer reaches an acceptable, signed-off result through the workflow | Yes, on a synthetic task only. |
| Sustained use | Use continues over a longer period, defined in advance as `{{sustained_use_window}}` | No. |

A good follow-up result is therefore reported as accepted workflow completion on a
synthetic task, with activation, repeated use and sustained use marked as not yet
evidenced. Satisfaction ratings and attendance are not evidence of any of the four.
