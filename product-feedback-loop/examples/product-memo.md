# What we heard, and where each requirement stands

_Customer feedback memo · Q2 2026 (synthetic) · synthetic_

The top themes we heard, the requirement each maps to, and its recorded status. A status is printed only when a delivery record exists; a release is described as a change that helped only when a follow-up observation supports that.

## 1. No audit trail for AI-assisted edits

- **What we heard:** “Without an exportable audit log this fails our internal review.” (raised by 3 accounts: Globex LLP (synthetic), Initech Legal (synthetic), Soylent Partners (synthetic))
- **Class / severity / reach:** quality control, blocker, 3 accounts · score 21.6
- **Requirement (chg-003):** Append-only log of every AI-assisted edit with author, time and change, exportable by an administrator.
- **Decision:** prioritised, confidence medium. A control failure raised by three accounts and first in the commercial ranking. No study observation yet shows how the record is used in a review.
- **Status:** in progress
- **Outcome:** not applicable
- **Next decision:** Do the two risk teams that raised the point accept the export format? (Product manager, platform (synthetic))

## 2. Can't restrict who approves sensitive matters

- **What we heard:** “We need approval permissions by practice group.” (raised by 2 accounts: Initech Legal (synthetic), Soylent Partners (synthetic))
- **Class / severity / reach:** quality control, high, 2 accounts · score 11.4
- **Requirement (chg-004):** Approval permissions scoped by practice group and matter value.
- **Decision:** prioritised, confidence low. A control gap raised by two accounts. The rule customers need (role, group, value) is not yet specified by any of them.
- **Status:** not started
- **Outcome:** not applicable
- **Next decision:** Which approval rule do the two accounts need: by role, by group or by matter value? (Product manager, platform (synthetic))

## 3. Citations not always traceable to the source

- **What we heard:** “I can't trust a summary I can't click through to the clause.” (raised by 2 accounts: Hooli Chambers (synthetic), Umbrella Legal (synthetic))
- **Class / severity / reach:** quality control, medium, 2 accounts · score 5.3
- **Requirement (chg-009):** Each list item carries the clause number and a link to the clause.
- **Decision:** prioritised, confidence medium. A verification gap seen in one task session and raised by two account feedback items.
- **Status:** released, release evidence: synthetic-release-notes/2026-07#clause-references
- **Outcome:** awaiting evidence
- **Next decision:** Hold the overdue follow-up session, then assess. (Product manager, review (synthetic))

---

_Synthetic customer feedback and synthetic delivery records. Product communication artifact, not legal advice._
