# Legal review worksheet

**Use this when** you carry out the legal review of the
[information sheet](information-sheet.md) and the [consent form](consent-form.md) and need,
for each open merge field, what it has to say, which provision it answers and a wording to
start from.

Status: preparation for the reviewer. Every proposal below is a draft. Nothing here has
been entered into the participant documents, and the reviewer decides each point.

## Sources checked

Checked on 7 October 2026 against the published text:

| Source | Where | Result |
|---|---|---|
| Regulation (EU) 2016/679 (GDPR), Articles 6, 7, 13, 17, 21 and 77 | EUR-Lex, consolidated text of 4 May 2016, which EUR-Lex lists as the current consolidated version | In force. The record shows corrigenda and two amendment proposals (COM(2025) 501 and COM(2025) 837). A proposal changes nothing until it is adopted. |
| Section 201 of the German Criminal Code (StGB) | gesetze-im-internet.de | Recording another person's non-public spoken word without authority is an offence under subsection 1 no. 1. |
| Section 43a(2) of the Federal Lawyers' Act (BRAO) | gesetze-im-internet.de | A lawyer's duty of confidentiality covers everything learned in the course of practice. |

Not checked: the Federal Data Protection Act, state data protection law, professional rules
for in-house counsel, and the law of any other country a participant may sit in.

## The decision that comes first

Who is the controller? The answer fills `{{controller_name}}`, and it decides whose
supervisory authority, whose data protection officer and whose internal rules apply. The
options are the study owner as a private individual, or a firm or other organisation on
whose behalf the study runs. Settle this before the other fields.

## Merge fields

| Field | What it has to say | Provision | Proposed starting point |
|---|---|---|---|
| `{{controller_name}}` | Name and contact details of the controller | Art. 13(1)(a) GDPR | Name and postal address of the controller as decided above |
| `{{research_contact}}` | How a participant reaches the study for questions and withdrawal | Art. 13(1)(a) GDPR | One email address that the controller reads, and no personal mobile number |
| `{{legal_basis}}` | The basis for each purpose | Art. 13(1)(c), Art. 6(1) GDPR | "Your consent (Article 6(1)(a) GDPR), which you give item by item on the consent form." See point 1 below for what this choice entails. |
| `{{data_subject_rights_statement}}` | Access, rectification, erasure, restriction, portability, and withdrawal of consent | Art. 13(2)(b) and (c) GDPR | "You can ask us for a copy of your data, for its correction or deletion, for its use to be restricted, and to receive it in a portable format. You can withdraw any consent at any time. Withdrawal does not affect what was done before it." |
| `{{complaints_route}}` | The right to complain to a supervisory authority | Art. 13(2)(d), Art. 77(1) GDPR | The controller's contact for complaints first, then: "You may also complain to a data protection supervisory authority, in particular where you live, where you work or where you think the infringement took place." Name the authority competent for the controller. |
| `{{processors_or_none}}` | Recipients of the data | Art. 13(1)(e) GDPR | "None", or each provider by name with its role, for example the video-call service |
| `{{aggregation_date}}` | The date after which individual notes are merged into findings | Art. 13(2)(c), Art. 7(3) GDPR | A fixed calendar date after the last session. It can limit what a withdrawal still removes. It cannot end the right to withdraw. See point 1 below. |
| `{{follow_up_contact_deadline}}` | How long contact details are kept for a follow-up invitation | Art. 13(2)(a) GDPR | A fixed date no later than the planned follow-up session plus a short margin |
| `{{recording_type}}` | Audio or video | Art. 13(1)(c) GDPR, section 201 StGB | "audio" unless video is needed. Consent item 3 and the spoken confirmation at the start of the session cover the recording. |
| `{{incentive_statement}}` | Whether anything is paid or given | None in the GDPR | "Taking part is unpaid." A benefit of any kind raises questions under professional and employer rules. |
| `{{information_sheet_version}}` | Version and date of the sheet the participant saw | Art. 7(1) GDPR | A version number and date, repeated on the consent form |

## Points the review should settle

1. **Consent as the basis makes withdrawal possible at any time.** Article 7(3) GDPR says
   so, and Article 13(2)(c) requires the sheet to state it. The sheet currently says that a
   participant can withdraw "until we combine the findings" and that the contribution
   "cannot be taken out" afterwards. [data-handling.md](data-handling.md) is more careful:
   after aggregation individual records are still deleted on request where possible. The
   sheet should say the same. A wording to start from: "You can withdraw at any time. We
   then delete your notes and any recording. Findings that were already combined or
   published before you withdrew stay as they are, because they no longer contain anything
   that points to you."
2. **If another basis is chosen for the notes**, for example legitimate interests under
   Article 6(1)(f), the sheet must name those interests (Article 13(1)(d)) and the right to
   object (Article 21). The consent items would then cover recording, quotation and
   follow-up contact only.
3. **Three items of Article 13 have no field in the sheet.** The contact details of a data
   protection officer, where the controller has one (Article 13(1)(b)). Any transfer to a
   country outside the EU, which a video-call or transcription provider may cause
   (Article 13(1)(f)). And whether automated decision-making takes place
   (Article 13(2)(f)); the study has none, and one sentence can say so.
4. **Recording.** Recording without authority is a criminal offence in Germany. The pack
   handles it with a separate consent item and a spoken confirmation. Check whether that is
   enough where a participant joins from another country.
5. **Confidentiality of participants.** The sheet tells participants that their
   professional duties apply and asks for no client material. For lawyers admitted in
   Germany the duty is section 43a(2) BRAO. Decide whether the sheet should say more than
   it does, and whether in-house participants need a different sentence.
6. **Employer permission.** The screener asks about it and records only the confirmation.
   Decide whether a confirmation by the participant is enough.
7. **Language.** The screener requires a session in English. A participant should receive
   the sheet and the form in a language they read with ease. Decide whether German
   versions are needed.
8. **The denylist.** The boundary check reads a list of participant, employer and client
   names kept in the private store. The list is personal data. Decide whether the sheet
   should mention it and which retention period applies to it.

## When the review is done

1. Enter the agreed text in both documents.
2. Remove the status paragraph from each.
3. Record the review date and the reviewer's role in the decisions section of the
   [README](README.md).
