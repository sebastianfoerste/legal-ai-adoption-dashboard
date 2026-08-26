# Product-feedback notes

A worked example of the step that matters most: three observations from one workshop,
turned into requirements Engineering can act on. Each uses the
[product-feedback template](../enablement/product-feedback-template.md).

## Observation 1 — missed cross-referenced definition
**Seen:** a Corporate associate, NDA first-pass review. The tool extracted the
confidentiality clause but missed that an earlier definition section changed what
"Confidential Information" meant.
**Class:** trust. A missed definition changes the risk read.
**Requirement:** resolve cross-referenced definitions before extraction and attach the
controlling definition to the extracted clause.
**Acceptance:** on a document where a definition modifies a later clause, the extracted
clause shows the controlling definition without the reviewer hunting for it.
**Priority:** highest — trust-touching, and it hits the most frequent corporate workflow.

## Observation 2 — US-style drafting register
**Seen:** an in-house counsel, drafting. The output read as US-style boilerplate on a
German-law contract.
**Class:** fit. Not wrong, but unusable without a rewrite.
**Requirement:** a jurisdiction setting that switches the drafting register and the review
checklist.
**Acceptance:** under a German-law profile, the draft drops US boilerplate and uses the
local register.
**Priority:** high for in-house accounts in the DACH region; lower elsewhere.

## Observation 3 — no usage export
**Seen:** an Innovation lead, planning a wider rollout. Wanted last-quarter usage by group
and could not get it without asking us.
**Class:** convenience, but it blocks a champion's own planning.
**Requirement:** a self-serve export of per-group usage and trend.
**Acceptance:** an Innovation lead pulls last-quarter active users by group without a
support request.
**Priority:** medium — cheap, and it turns a champion into an advocate.

## The pattern to take to Engineering
Sequence by class, not by volume of complaints: ground first (Observation 1), fit second
(Observation 2), convenience third (Observation 3). Trust-touching items are a different
class of problem and jump the queue.
