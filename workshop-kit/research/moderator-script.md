# Moderator script

**Use this when** you run a 60-minute session and need the exact wording, the order of the
three evidence parts and the rule for when you may help.

Status: no session has been run with this script. One participant, one moderator,
optionally one note-taker. Notes go on [observation-sheet.md](observation-sheet.md).

## Before the session

- The signed consent form or written reply is in the private identity store. You know the
  status of the optional items: recording, quotation, follow-up contact.
- You have the two handouts of the task pack for this session from
  [synthetic-task-pack.md](synthetic-task-pack.md): `TP-A` in round 1, `TP-B` in the
  follow-up session.
- You have [task-answer-key.md](task-answer-key.md) open where the participant cannot see
  it.
- No client material is in the room or on a shared screen, yours included.

## Timing

| Clock | Part | Evidence type |
|---|---|---|
| 0:00 to 0:10 | Introduction and consent | none |
| 0:10 to 0:25 | Part 1: the last real handoff | `past_behaviour` |
| 0:25 to 0:45 | Part 2: observed task | `observed_task` |
| 0:45 to 0:55 | Part 3: reaction to a proposal | `opinion_on_proposal` |
| 0:55 to 1:00 | Close | none |

Keep the parts apart. Do not show the proposal card before Part 3. Do not ask for opinions
on the idea in Part 1 or Part 2.

## Introduction (read word for word)

> Thank you for making the time. I am {{moderator_name}}. {{note_taker_sentence}}
>
> This session is part of a small study on one step in contract review: the point where a
> first-pass issues list, produced with an AI-assisted tool, passes from the lawyer who
> prepared it to the lawyer who reviews it and signs it off. I want to understand how that
> step works in practice.
>
> The session takes 60 minutes and has three parts. First I ask about the last time you
> dealt with such a handoff. Then I ask you to review a short made-up contract excerpt and
> a made-up issues list while I watch. Then I show you an idea and ask what you think of
> it.
>
> Three ground rules. First, everything we use today is synthetic. The contract, the
> parties and the issues list were written for this study. Please do not name your
> employer, your clients, your colleagues or any matter, and do not describe a matter in a
> way that would identify it. If a name slips out, I will not write it down.
>
> Second, I am studying the handoff and the materials. I am not assessing you or your
> legal judgement.
>
> Third, please be candid. Criticism of the materials or of the idea I show you is useful
> to me, and I will not argue with it.
>
> During the exercise I will stay quiet and will not answer questions about the content. I
> want to see what the materials let you do without me.
>
> I take written notes under the study code {{study_code}}. Your name and contact details
> are kept apart from the notes. {{recording_sentence}}
>
> Taking part is voluntary. You can skip any question, pause, or stop the session at any
> time without giving a reason. You can also withdraw after the session until
> {{aggregation_date}}, when the findings are combined.
>
> You have had the information sheet and the consent form. Do you have any questions about
> them before we start?

Answer questions about the study. Then read back the status of the optional consent items
and correct the record if the participant changes one.

`{{recording_sentence}}` is one of two sentences. With recording consent: "You agreed to a
recording, which I use only to check my notes and delete within 14 days once they are
checked. I am starting it now." Without it: "This session is not recorded."

Warm-up, to confirm the header fields:

> In general terms, and without naming your employer: what is your role, and roughly how
> long have you worked in it?

---

## Part 1: the last real handoff (`past_behaviour`, 15 minutes)

Every question asks about one concrete occasion. If the participant answers in general
terms ("usually I ..."), bring them back with: "And on that last occasion, what happened?"
If the participant cannot recall a concrete occasion, write that down and move on. Do not
switch to a hypothetical.

For a participant who reviews lists:

| No. | Question | RQ |
|---|---|---|
| PB1 | Tell me about the last time you reviewed a contract issues list that someone else had prepared. Without naming the client or the matter, walk me through what you did from the moment it reached you. | RQ1 |
| PB2 | On that occasion, what did you look at first? | RQ1 |
| PB3 | What did you do before you were willing to sign it off? | RQ1 |
| PB4 | Did you write or type anything of your own during that review? What was it? | RQ2, A1 |
| PB5 | At what point, if at all, did you open the contract itself? What sent you there? | RQ2, A2 |
| PB6 | What did you ask the person who prepared the list, if anything? | RQ2 |
| PB7 | Was any part of that list produced with an AI-assisted tool? How did you know? | RQ1, A5 |
| PB8 | Roughly how long did that review take, and which part took longest? | RQ2 |

For a participant who prepares lists, ask PB9 to PB12 first and then PB1 to PB5 if the
participant has also reviewed a list:

| No. | Question | RQ |
|---|---|---|
| PB9 | Tell me about the last time you handed an issues list that you had prepared to a lawyer for review. What did you send, and in what form? | RQ2 |
| PB10 | What did you tell the reviewer about what you had checked and what you had left out? | RQ2 |
| PB11 | What came back from the reviewer? | RQ2 |
| PB12 | Did you see what the reviewer did with your list? What did they do? | RQ2, A1 |

For every participant, at the end of Part 1:

| No. | Question | RQ |
|---|---|---|
| PB13 | On that occasion, who signed the work off before it was used, and at what point? | RQ1 |

Log each answer with evidence type `past_behaviour` and its research question.

---

## Part 2: observed task (`observed_task`, 20 minutes)

A legal operations participant who is not a qualified lawyer skips Part 2. Use the time to
extend Part 1.

Hand over both handouts, then read:

> Here are two synthetic documents. The first is an excerpt from a contract between two
> invented companies. The second is a first-pass issues list on that excerpt. A colleague
> produced it with an AI-assisted review tool and has handed it to you.
>
> You act for the Customer. Your colleague asks you to sign the list off so that it can go
> to the client contact. Nothing in the list is used until you, as the reviewing lawyer,
> have signed it off.
>
> Please do what you would do before signing off. At the end, tell me your decision: sign
> off as it stands, sign off with changes, or send it back, and why.
>
> You have about 20 minutes. Please think aloud as you go: say what you are looking at,
> what you are checking and what you make of it. I will stay quiet. If you get stuck, tell
> me what you would do if I were not here.

Start the clock when you finish reading.

**Think-aloud reminder.** After about 20 seconds of silence say: "Please keep talking."
Use no other wording. The reminder is not a prompt.

**When you may help.** Help only when one of two conditions is met:

1. The participant has made no progress for about two minutes and has already been asked
   "What would you do if you were on your own?"
2. The participant says they would stop here or would ask a colleague, and cannot continue.

Then use the help ladder, one step at a time, and wait before taking the next step:

| Step | Wording |
|---|---|
| 1 | "Everything you need is in the two documents." |
| 2 | "You may want to look at how the terms in that clause are defined." or "You may want to compare the list with the contract clause by clause." |
| 3 | Name the clause or the item. |

Each step counts as one prompt in `assistanceCount`. Log the clock time, the step and your
exact words. If the participant asks "Is that right?", answer: "What do you think?"
Confirming or denying a reading counts as a prompt, so avoid it.

**What to log during the task**

- Start time, and whether the participant opens the list or the contract first.
- The order in which the participant works through the items.
- Each move from a list item to the contract, and whether the source reference was used.
- Anything the participant writes, types or re-keys, such as an own checklist (RQ2).
- Any information the participant looks for or asks for: source, what was checked, what
  was not checked (RQ4).
- Each seeded defect identified, with clock time.
- Each prompt, each interpretation error and each trust concern, with clock time.
- Interruptions, with start and end time.
- The final decision in the participant's words, with clock time.

Write what happened and what was said. Leave the interpretation column empty.

**Ending the task.** When the participant states a decision, ask once: "Is that your final
decision?" Give one time notice at 18 minutes. Stop at 20 minutes. The scoring rules are in
[task-answer-key.md](task-answer-key.md).

**Clarifying questions (two minutes at most).** After the task you may ask about things
you saw, in this form only:

> At one point you went to {{place_in_document}}. What were you looking for?

Log the answer as `observed_task` and mark it "participant's explanation". Do not reveal a
seeded defect and do not say whether the result was acceptable.

---

## Part 3: reaction to a proposal (`opinion_on_proposal`, 10 minutes)

Everything in this part is opinion about an idea. It is the weakest evidence in the study.
Log every answer as `opinion_on_proposal`.

Read:

> I now show you a description of an idea. Nothing has been built. I did not design it to
> be liked, and I am as interested in what is wrong with it as in what is right.

Show card P1 and give the participant a minute to read it.

**Card P1: proposed handoff note (description of an idea; nothing has been built or shipped)**

A note that travels with the first-pass issues list from the producer to the reviewer. It
would contain:

1. Who produced the list, when, and with which kind of tool.
2. For each item: the finding, the status and a source link that opens the cited clause.
3. What was checked: the clauses and checklist topics that the first pass covered.
4. What was not checked: clauses, schedules and topics outside the first pass, and
   definitions that were not traced.
5. Open points that the producer wants the reviewer to decide.
6. A review status that stays "awaiting lawyer review" until a named qualified lawyer has
   signed the list off.

| No. | Question | RQ |
|---|---|---|
| OP1 | What is your first reaction? | RQ5 |
| OP2 | Which part, if any, would have changed what you did in the exercise just now? | RQ4 |
| OP3 | Which part would you ignore? | RQ5 |
| OP4 | What is missing? | RQ5 |
| OP5 | What would make you distrust a note like this? | RQ4 |
| OP6 | Of source links, what was checked and what was not checked: which matters most to you, and why? | RQ4 |

Do not ask "Would you use this?" or "Do you like it?". Those questions invite a polite
yes.

---

## Close (5 minutes)

> That is everything I wanted to cover. Is there anything about the last real handoff, or
> about today's exercise, that we have not talked about and that you think matters?
>
> Did the made-up documents lead you to review differently from how you would review real
> work? In what way?
>
> The contract and the list were constructed for this study. I will explain how they were
> built once your part in the study is over.
>
> A reminder: you can withdraw until {{aggregation_date}} by contacting
> {{research_contact}}. {{quotation_sentence}} {{follow_up_sentence}}
>
> Thank you.

Log the answer to the first close question under the evidence type it belongs to. Log the
answer to the second as `observed_task`, marked "participant's explanation", for
assumption A4. Stop any recording. Collect the handouts.

`{{quotation_sentence}}` and `{{follow_up_sentence}}` restate what the participant chose
on the consent form, for example "You agreed that short quotations may be used with your
role label only." Leave a sentence out if the item was declined.

## Neutral probes

- "What are you looking at now?"
- "What makes you say that?"
- "Tell me more about that."
- "What happened next?"
- "What did you expect to find there?"
- Silence. Count to five before speaking.

## The moderator must not

- Ask a leading question, such as "Did the missing source bother you?"
- Defend or explain the tool, the list or the idea.
- Teach. Do not explain a status, a clause or a defect, and do not correct a mistake.
- Reveal the seeded defects or say whether the result was acceptable.
- Give a legal view on the synthetic contract.
- Ask two questions at once, or ask about a hypothetical in Part 1.
- Rephrase the participant's answer in your own terms and ask for agreement.
- Ask for or write down the name of an employer, a client, a colleague or a matter.
- Show approval or disappointment at a finding or a decision.
- Suggest at any point that a list could be used before a qualified lawyer has reviewed it.
