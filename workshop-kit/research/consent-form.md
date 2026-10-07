# Consent form

**Use this when** a screened person has read the information sheet and is ready to confirm,
item by item, what they agree to before the session starts.

Status: draft, not issued. No person has signed this form. Use it only after the legal
review listed in [README.md](README.md). Whether these consent items also serve as the
basis for handling personal data is a question for that review; the form does not decide
it. Remove this status paragraph before issue.

Storage: the signed form is stored only in the private identity store, apart from the
session notes. It never enters this repository. The notes carry a consent reference and
the study code, nothing more. See [data-handling.md](data-handling.md).

---

## Study

Contract-review handoff study, run by `{{controller_name}}`.
Information sheet version: `{{information_sheet_version}}`.

Please initial each item you agree to. Items 1 and 2 are needed to take part. Items 3, 4
and 5 are optional, and you can take part without agreeing to them.

## Needed to take part

**1. Taking part.** I have read the information sheet and had the chance to ask questions.
I understand that taking part is voluntary, that I can stop the session at any time
without giving a reason, and that I can withdraw afterwards until `{{aggregation_date}}`.

Initials: ________

**2. Notes.** I agree that written notes of the session are taken under a study code, kept
apart from my name and contact details, and kept for up to 24 months as the information
sheet describes.

Initials: ________

## Optional

**3. Recording.** I agree that the session is recorded (`{{recording_type}}`), that the
recording is used only to check the notes, and that it is deleted within 14 days once the
notes are checked.

Yes, initials: ________  No, initials: ________

**4. Anonymised quotation.** I agree that short quotations of what I say may be used in
reports or publications, attributed by role label only, with no employer or client name,
and only where the quotation could not identify me. Without this agreement my words stay
inside the research team.

Yes, initials: ________  No, initials: ________

**5. Follow-up contact.** I agree that my contact details are kept until
`{{follow_up_contact_deadline}}` at the latest so that I can be invited to a follow-up
session. I can decline that invitation.

Yes, initials: ________  No, initials: ________

## Confirmations

Please initial both.

- I will use only the synthetic documents provided and will not share client material, or
  the name of my employer, a client, a colleague or a matter. Initials: ________
- I have my employer's permission to take part, or I do not need it. Initials: ________

## Signatures

| | Participant | Researcher |
|---|---|---|
| Name | `{{participant_name}}` | `{{researcher_name}}` |
| Signature | `{{participant_signature}}` | `{{researcher_signature}}` |
| Date | `{{signature_date}}` | `{{signature_date}}` |

For the researcher only:

- Study code: `{{study_code}}`
- Consent reference: `{{consent_reference}}`

## Remote sessions

For a session by video call, send this form beforehand and ask the participant to reply in
writing, stating for each item whether they agree. Store the reply in the private identity
store in place of a signed form. The moderator reads back the status of items 3, 4 and 5
at the start of the session.

## Changes after signing

A participant can change the answer to item 3, 4 or 5 at any time by contacting
`{{research_contact}}`. Record the change with its date next to the form. A withdrawn
item 4 moves every quotation from that participant to `internal_only`. It cannot recall a
quotation that is already published, so confirm item 4 with the participant shortly before
any publication.

Item 5 extends the data-handling default, which deletes contact details within 30 days of
the round's last session. The owner approved keeping item 5 on 6 October 2026. The date in
`{{follow_up_contact_deadline}}` is still open and belongs to the legal review.
