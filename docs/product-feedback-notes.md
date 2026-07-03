# Product feedback notes

This is the step the role is really screening for: turning what users say into what
Engineering can build. Below, three items from the synthetic feedback queue, rewritten as
product requirements.

## 1. Citation grounding in long documents
**Signals:** "Clause extraction misses cross-referenced definitions in long SPAs"
(Associate, Meridian & Cole, high) and "Research answers need pinpoint citations to be
usable in a memo" (Associate, Ardent & Roe, high).

**Theme:** grounding and citation precision — the same root cause behind a `trust_in_output`
blocker at two accounts.

**Requirement:** Extraction must resolve cross-referenced definitions and attach a
pinpoint source span to every extracted clause and research claim. Acceptance: a reviewer
can click any claim and land on the exact sentence in the source.

**Priority rationale:** high-severity, multiple accounts, directly tied to a trust blocker
that gates renewal. Top of the queue.

## 2. Jurisdiction and localization for non-US law
**Signals:** "DPA review needs to be tuned to GDPR, not US privacy frameworks" (In-house
Counsel, Hanseatic, high) and "Drafting tone is too US-style for German-law contracts"
(In-house Counsel, Hanseatic, medium).

**Theme:** the product assumes US law and US drafting conventions.

**Requirement:** A jurisdiction setting that switches the review checklist and drafting
register. Acceptance: DPA review under a GDPR profile flags Art. 28 processor terms; German
drafting register drops US boilerplate.

**Priority rationale:** concentrated in one account but blocking daily use there. Bundle
with the integration pilot for that account.

## 3. Adoption analytics export
**Signal:** "A usage-analytics export would make our quarterly business reviews far easier"
(Innovation lead, Meridian & Cole, low).

**Theme:** customers want their own adoption data.

**Requirement:** A CSV/API export of per-group usage and trend. Acceptance: an Innovation
lead can pull last-quarter active users by practice group without asking us.

**Priority rationale:** low severity, single account, but cheap and turns a champion into
an advocate. Good filler for a sprint with spare capacity.
