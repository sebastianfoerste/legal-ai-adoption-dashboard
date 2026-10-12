# Research data handling and the private research store

**Use this when** you are about to hold a session, write up notes or publish a finding, and
need to know where each kind of record lives, who may open it, how long it is kept and who
approves its use.

Status: proposal. The store was created on 7 October 2026 and is empty: no real record
exists. Every rule below takes effect only when the owner approves it. The participant documents
([information-sheet.md](information-sheet.md), [consent-form.md](consent-form.md)) repeat
these rules and must be changed with them.

## 1. Two places, one boundary

| | Public repository | Private research store |
|---|---|---|
| Holds | Synthetic fixtures, this pack, code, tests | Participant records and original observations |
| Record origin | `synthetic_fixture`, or `approved_aggregate` with an approval reference | `participant_session` |
| Location | This repository | `{{private_store_location}}`: an encrypted disk image outside `~/Developer`, reachable only while the owner has it open |
| Readers | Anyone | The people named in section 3 |

A real observation is never marked synthetic to fit a schema. The evidence format
(`legal-ai-adoption.evidence-loop.v1`) states the origin of every record, and the public
store refuses any record whose origin is `participant_session`.

Three checks enforce the boundary in the repository:

- `lib/evidence/private-boundary.ts` rejects a participant record and any identifying
  field (name, email, phone, employer, firm, contact details, consent record, signature,
  recording link) when the public store is loaded. The dashboard's feedback queue passes
  through the same check, and every feedback item must state its origin.
- `scripts/check-private-boundary.mjs` runs in the combined gate and fails if a private
  file is tracked by Git, a participant record appears in a tracked data file, a feedback
  item or an interview states no origin, or a name from the denylist (section 2) appears
  in a tracked text file.
- `.gitignore` excludes `/private-research/` and `*.private.json`, as a second line of
  defence in case the store is ever placed inside a checkout by mistake.

## 2. Layout of the private store

Identities and analysis are separate files with separate access. The study code is the
only link between them.

```text
{{private_store_location}}/
  identity/                 access: study owner only
    participants.json       study code, name, contact details, recruitment route
    denylist.txt            names that must never appear in the repository, one per line
    consent/                signed forms or written replies, one per consent reference
    withdrawals.json        study code, date, what was deleted
  analysis/                 access: study owner only
    manifest.json           what may be imported and for which use (section 5)
    sessions.json           session records, by study code and role label
    observations.json       observation records, origin participant_session
    problems.json           interpretation, kept apart from observations
  recordings/               access: study owner only, emptied within 14 days
  approvals/                one file per approved aggregate or quotation
```

The denylist holds the name of every participant, of each employer, and of any client or
matter a participant mentioned. Add to it on the day of each session. The boundary check
reads it when the environment variable `PRIVATE_RESEARCH_DENYLIST` holds its absolute
path, `{{private_store_location}}/identity/denylist.txt`, and it refuses a list
kept inside the repository. The check can therefore read the list only while the store
is open. A match is reported as "matches
denylist entry 3", so the name never reaches a terminal or a build log. The list catches
the names you know. It cannot recognise a name nobody entered, so the reading in section 6
still decides.

The same checks read free text for obvious identifiers: an email address, a web address, a
phone number, a company legal form such as GmbH or LLP, and a personal title before a
name. They apply to every approved aggregate in the public tree and to every participant
record offered for import. Synthetic fixtures are not read, because their invented
companies carry legal forms on purpose. Reference fields such as `approvalRef` are left
out, since a reference may be a link.

Rules for the analytical files:

- A participant appears only as a study code such as `P01`, a role label and an experience
  band. No name, employer, client, matter or contact detail.
- Each observation carries `origin.kind` `participant_session` with the study id, a consent
  reference and a storage reference.
- What was observed and what the researcher makes of it are separate fields, and the
  interpretation names the role of the person who wrote it.

## 3. Access

| Record | Who may open it | Why |
|---|---|---|
| Identity files and consent records | Study owner | Scheduling, withdrawal, proof of consent |
| Recordings | Study owner | Checking notes |
| Analytical files | Study owner | Analysis |
| Approved aggregates and quotations | As stated in the approval | Publication or internal sharing |

The store is on encrypted storage that the study owner controls. It is not synchronised to
a shared drive or a third-party service unless that service is named in
`{{processors_or_none}}` on the information sheet.

## 4. Retention and deletion

| Record | Kept until | Then |
|---|---|---|
| Contact details | 30 days after the round's last session, or `{{follow_up_contact_deadline}}` with consent item 5 | Deleted; deletion logged by study code |
| Recording | 14 days after the session, once notes are checked | Deleted |
| Signed consent form or written reply | As long as the notes it covers | Deleted with the notes |
| Coded notes and analytical records | 24 months after the session | Deleted, or kept after a recorded re-approval |
| Withdrawal log | As long as any record of the round exists | Deleted last |

Withdrawal: until `{{aggregation_date}}` the participant's notes, observations and any
recording are deleted on request and the deletion is logged. After aggregation the
individual records are still deleted on request where that is possible; the combined
findings stay.

The consent form is kept apart from the notes and matched through the study code and the
consent reference. This departs from the GOV.UK advice to keep the consent record with the
data it covers, in favour of separating identities from analysis. The owner decides whether
to keep that choice.

## 5. Import of real observations

Nothing is imported until four things are established and written into `manifest.json`:

| Field | Meaning |
|---|---|
| `source` | Where the observations come from, for example moderator notes of round 1 |
| `consentRefs` | The consent references that cover the records |
| `storageLocation` | The absolute path of the private store, outside the repository |
| `authorisedUses` | `internal_analysis`, `public_aggregate`, `public_quotation` |

Together with `studyId`, `approvedByRole`, `approvedOn` and `retentionReviewOn`.
`importIssues` in `lib/evidence/private-boundary.ts` checks a manifest and a set of records
and lists every reason an import would be refused: a missing field, a store inside the
repository, a record without covered consent, a record from another study, an identifying
field, or a synthetic fixture offered as a real record. It checks; it does not import.

The workflow was built and tested with synthetic records. The same record shapes, rules
and views apply to real records inside the private store.

## 6. Approval for a public aggregate or quotation

| Step | Rule |
|---|---|
| Aggregate | Counts with role labels only, from at least three sessions, with no detail that singles out one participant. The study owner approves in writing. |
| Quotation | Only with consent item 4, attributed by role label, checked for identifying detail, and confirmed with the participant shortly before publication. The study owner approves in writing. |
| Record | One file in `approvals/` with an approval reference, date, approver role, the exact text and the sessions it rests on. |
| Name check | Before the approved text is committed, the boundary check runs with `PRIVATE_RESEARCH_DENYLIST` set. Once any record with origin `approved_aggregate` is in the public tree, the gate fails without the denylist. |
| Publication | The approved text enters the public store as a new record with origin `approved_aggregate` and the approval reference. The original observation stays private. |

No percentage is published from a round of four to eight sessions.

## 7. Decisions

Taken by the owner on 6 October 2026:

1. The private store is an encrypted local folder outside `~/Developer`, opened only by
   the study owner. The owner created it on 7 October 2026 as an encrypted disk image
   holding the folders `identity`, `analysis`, `recordings` and `approvals`, all empty.
   Its path stays out of this repository; `{{private_store_location}}` stands for it.
   Anyone added later as a reader needs a new decision.
2. Consent item 5 (follow-up contact) is kept, so contact details of participants who
   opt in are held until `{{follow_up_contact_deadline}}`.
3. The seeded defects are explained to returning participants only after the follow-up
   session.
4. Recruitment is not authorised. No invitation is sent.

Still open:

1. The retention periods in section 4, the withdrawal cut-off and the follow-up contact
   deadline.
2. Whether consent records stay apart from the notes.
3. Whether sessions are recorded at all.
4. The legal review of the information sheet and consent form listed in
   [README.md](README.md).
