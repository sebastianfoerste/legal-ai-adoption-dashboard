# Screener

**Use this when** a person has replied to the invitation and you need to decide whether
they fit round 1, and which quota cell they fill.

Status: not in use. No screener has been sent. Sending it needs the owner's authorisation.

## How to use it

- Ask the questions by email reply or in a call of about five minutes.
- Record the answers against a study code such as `P01`. Keep the name and contact details
  in the private identity store, apart from the answers. See
  [data-handling.md](data-handling.md).
- Do not ask for or record the name of an employer, a client or a matter. If a person
  volunteers one, leave it out of the record.
- Send the [information sheet](information-sheet.md) with the screener, so that the person
  knows what the session involves before answering.

## Questions and logic

| No. | Question | Answer options | Logic |
|---|---|---|---|
| S1 | Which description fits your current role best? | Associate or junior lawyer who prepares contract issues lists; senior lawyer or partner who reviews and signs them off; in-house counsel; professional support lawyer; legal operations; none of these | Sets the role label. Exclude "none of these". |
| S2 | How many years have you worked in this kind of role since qualifying or starting? | Number of years | Sets the experience band: `0-2 years`, `3-7 years` or `8+ years`. |
| S3 | Where do you work? Please give the type only. | Law firm; in-house legal team; other | Quota only. Record the type and nothing more. |
| S4 | In the last 12 months, which of these have you done with a contract issues list? | Prepared one that another lawyer reviewed or signed off; reviewed or signed off one that someone else prepared; both; neither | "Neither": exclude, unless S1 is professional support lawyer or legal operations and the person designs or maintains the review process. Include that person as an interview-only session. |
| S5 | When was the most recent occasion? | Within the last month; one to three months ago; four to twelve months ago; longer ago | "Longer ago": exclude. The interview asks about one concrete occasion and needs it to be recallable. |
| S6 | Have you used an AI-assisted contract review tool at least once? | Yes, in real work; yes, in a trial or training; no | Not an exclusion. Record the answer. It tests assumption A5. |
| S7 | Do you need your employer's permission to take part in a research session about your working practice? | No; yes, and I have it; yes, and I do not have it yet; not sure | "Do not have it yet" or "not sure": hold. Schedule only after the person confirms that permission is given or not needed. Record the confirmation, not the employer. |
| S8 | Do you report to the study owner, work under the owner's supervision, or work for a provider of legal AI tools? | Yes; no | "Yes": exclude. A reporting line puts pressure on the answers. |
| S9 | Can you take part in a 60-minute one-to-one session in English, using only synthetic documents that we provide, without sharing client information? | Yes; no | "No": exclude. |
| S10 | Is there anything we should arrange so that you can take part comfortably, for example a document format, a font size or breaks? | Free text | Not an exclusion. Arrange what is asked. |

The researcher also records the recruitment route for each person: `direct_contact`,
`referral` or `no_prior_contact`. The route is needed to describe the recruitment bias in
the findings.

## Include and exclude summary

Include a person who:

- holds one of the five roles in S1;
- prepared or reviewed a contract issues list handed to another lawyer within the last 12
  months, or maintains the review process in a support role;
- has employer permission or does not need it;
- accepts synthetic documents only and will not share client information.

Exclude a person who:

- has had no contract-review handoff in the last 12 months and holds no support role;
- reports to the owner, is supervised by the owner or works for a provider of legal AI tools;
- needs employer permission and has not confirmed it;
- cannot commit to keeping client information out of the session.

A current client or working relationship between the owner and a person is not an
automatic exclusion. The owner decides each such case and the recruitment route records it.

## Quota table template

Proposed targets for a round of six. Adjust the targets to the planned number between four
and eight before recruitment starts. The count columns are template fields.

| Role label | Target | Screened in | Confirmed |
|---|---|---|---|
| Producing associate | 2 | `{{screened_in_count}}` | `{{confirmed_count}}` |
| Reviewing senior lawyer or partner | 2 | `{{screened_in_count}}` | `{{confirmed_count}}` |
| In-house counsel | 1 | `{{screened_in_count}}` | `{{confirmed_count}}` |
| Professional support lawyer or legal operations | 1 | `{{screened_in_count}}` | `{{confirmed_count}}` |

| Cross-check | Minimum | Current |
|---|---|---|
| Participants in band `0-2 years` | 1 | `{{count}}` |
| Participants in band `3-7 years` | 1 | `{{count}}` |
| Participants in band `8+ years` | 1 | `{{count}}` |
| Participants from a law firm | 2 | `{{count}}` |
| Participants from an in-house team | 1 | `{{count}}` |
| Participants recruited by `referral` or `no_prior_contact` | 1 | `{{count}}` |
| Participants who answered "no" to S6 | Record only | `{{count}}` |

If a cell cannot be filled, run the round with the cell empty and state the gap in the
findings. Do not fill a cell with a person who fails an exclusion rule.
