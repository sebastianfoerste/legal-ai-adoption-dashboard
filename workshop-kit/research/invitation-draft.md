# Invitation draft

**Use this when** the owner has authorised recruitment and you need the wording of the
first email to a possible participant.

Status: draft for human review. It has not been sent to anyone. Sending it, in any form
and through any channel, needs the owner's explicit authorisation.

## Before sending

- The owner has authorised recruitment and named the recipients.
- The legal review listed in [README.md](README.md) is complete and the
  [information sheet](information-sheet.md) is final.
- Every `{{merge_field}}` is replaced. `{{reason_for_asking}}` states a fact about the
  person's work, for example that the person reviews contract issues lists. It contains no
  compliment.
- Each recipient receives a separate email. No recipient sees another's address.
- The information sheet is attached.

## Draft email

**Subject:** Request: 60 minutes on how contract issues lists are handed over for sign-off

Hi {{first_name}},

I am preparing a small study on one step in contract review: the point where a first-pass
issues list, produced with an AI-assisted tool, passes from the lawyer who prepared it to
the lawyer who reviews it and signs it off. I am asking you because {{reason_for_asking}}.

What it involves:

- One session of 60 minutes, one to one with me{{note_taker_clause}}, {{session_format}},
  between {{session_window_start}} and {{session_window_end}}.
- I ask about the last time you dealt with such a handoff. You then review a short made-up
  contract excerpt and a made-up issues list while I watch, and you give me your view on
  one idea.
- All documents are synthetic. Please bring no client material. I will not ask for the
  name of a client, a matter or your employer.

What I keep: written notes under a study code, stored apart from your name. I record the
session only if you agree to that separately. The attached information sheet explains how
the data is handled and how you can withdraw.

Taking part is voluntary, and declining has no consequence of any kind. {{incentive_statement}}
If you need your employer's permission to take part, please obtain it before you confirm.

If you are willing, reply by {{reply_by_date}}. I will then send a few short screening
questions and the consent form.

Best,
{{sender_name}}
{{research_contact}}

## Merge fields

| Field | Content |
|---|---|
| `{{first_name}}` | Recipient's first name |
| `{{reason_for_asking}}` | One factual clause on why this person fits the study |
| `{{note_taker_clause}}` | Empty, or " and one note-taker" |
| `{{session_format}}` | "by video call" or "in person at" followed by the place |
| `{{session_window_start}}`, `{{session_window_end}}` | First and last possible session dates |
| `{{incentive_statement}}` | One sentence on payment or benefit, as approved in the legal review |
| `{{reply_by_date}}` | Date by which a reply is needed |
| `{{sender_name}}` | Sender |
| `{{research_contact}}` | Contact details for questions and withdrawal |
