# Product-feedback template

**Use this when** you watched a user hit friction and want to turn it into something
Engineering can act on — not a vague complaint, a structured requirement. This is the
artifact that proves you translate field signal into product input.

Fill one per distinct friction point. Keep the user's words in the "observed" field; do not
sand them down.

## Template

- **Date / session:** `{{date}}` / `{{session}}`
- **User and persona:** who hit this, and their role (Partner, Associate, PSL, Innovation lead, In-house counsel).
- **Workflow:** what they were trying to do.
- **Observed friction:** what actually happened, in their words. Quote them.
- **Frequency:** does this hit every time, sometimes, or once? How many users have you seen hit it?
- **Severity:** does it block the workflow, slow it, or merely annoy? Does it touch trust (a wrong citation) or only convenience?
- **Proposed change:** the smallest change that would remove the friction. One sentence.
- **Acceptance:** how you would know it is fixed. Concrete and checkable.
- **Line to Product / Engineering:** the one sentence you would say in a triage meeting.

## Worked example (synthetic)

- **Date / session:** 2026-06-18 / Corporate associate hands-on
- **User and persona:** associate, Corporate group.
- **Workflow:** first-pass NDA review on a long agreement.
- **Observed friction:** "It pulled the confidentiality clause but missed that the definition section three pages earlier changes what 'Confidential Information' even means."
- **Frequency:** every time, on agreements with cross-referenced definitions. Seen with three associates.
- **Severity:** touches trust. A missed definition changes the risk read, and the associate only caught it because they knew the document.
- **Proposed change:** resolve cross-referenced definitions before extracting a clause, and attach the controlling definition to the extracted clause.
- **Acceptance:** on a document where a definition section modifies a later clause, the extracted clause shows the controlling definition; a reviewer can confirm it without hunting.
- **Line to Product / Engineering:** "Clause extraction ignores cross-referenced definitions; this is a grounding gap, not a formatting nicety, and it is hitting our most frequent corporate workflow."

---

**Notes**
- Severity that touches trust outranks severity that touches convenience. A wrong citation is a different class of problem than a clunky export.
- "Proposed change" is your hypothesis, not a spec. Engineering owns the solution; you own the clear problem.
- Route trust-touching items the same day. Convenience items can batch weekly.
