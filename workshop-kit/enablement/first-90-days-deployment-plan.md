# First 90 Days: Deploying Legal AI at a Firm

Most legal AI pilots demo well and die in month two. They die for predictable reasons:
no baseline to prove value against, no workflow narrow enough to win, no measurement a
partner trusts, and no path from "the tool is live" to "the tool is used." This is the
plan I run to avoid that — a forward-deployed sequence that treats adoption as the
deliverable, not the demo.

The unit of success is not logins. It is one workflow, measurably faster, with the review
gate intact, that a skeptical partner signs off on.

---

## Days 1–30 — Pick one workflow and baseline it

Win narrow before winning wide. Choose a single high-volume, low-ambiguity workflow —
first-pass NDA review, DPA triage, clause extraction against a playbook — and instrument
the current, pre-AI version of it.

- **Map the workflow.** Who touches it, in what order, with what handoffs. (`discovery/workflow-discovery-template.md`)
- **Baseline the present.** Cycle time per document, rework rate, where the senior reviewer actually spends minutes. Without a before, there is no after.
- **Set the answer set.** Hand-author the gold standard the AI will be graded against, so quality is checked, not asserted. (`contract-review-eval-harness`)
- **Name the review gate.** Decide up front what a human must confirm and what is blocked until they do. Adoption survives on trust, and trust survives on the gate.

Exit criterion: a documented baseline and a gold answer set for one workflow. Nothing is deployed yet.

## Days 31–60 — Deploy to a beachhead, close the feedback loop

Deploy to one team, not the firm. A beachhead of three to five practitioners who run the
workflow daily and will tell you the truth.

- **Gate the output.** The model produces a first pass; the scorecard flags missed clauses, wrong severity, and ungrounded citations; the reviewer approves. No silent reliance.
- **Run the eval every week.** Track clause F1, risk-flag accuracy, citation grounding, and hallucination count over time — regression is a deployment event, not a surprise.
- **Translate feedback into product, weekly.** Every objection and miss becomes a structured note: which failure mode dominated, what the model got wrong, what the firm needs next. (`enablement/product-feedback-template.md`, `enablement/skeptical-partner-objections.md`)

Exit criterion: the beachhead uses the tool in live matters, the weekly scorecard is stable or improving, and product has a ranked list of what to fix.

## Days 61–90 — Prove the delta, then earn the expansion

Now compare against the Day 1 baseline and let the numbers make the case.

- **Show the delta.** Cycle time then versus now, rework rate then versus now, reviewer minutes redeployed. (`legal-ai-adoption-dashboard`)
- **Report adoption honestly.** Active users against licensed users, workflows completed, the accounts that stalled and why. A healthy rollout names its blockers. (`enablement/adoption-maturity-model.md`)
- **Make the scale decision explicit.** Either the workflow cleared its bar and the next two workflows are scoped, or it did not and you say so. Expansion is earned, not assumed.

Exit criterion: a one-page result a managing partner can act on — the delta, the adoption picture, and a yes/no on scaling with the reason attached.

---

## What I measure the whole way through

| Dimension | Metric | Why it matters |
| --- | --- | --- |
| Quality | clause F1, risk-flag accuracy, citation grounding, hallucination count | Trust is measured, not asserted |
| Speed | cycle time per document vs. baseline | The reason the firm bought it |
| Trust | rework rate, reviewer override rate | A tool that gets overridden is not adopted |
| Adoption | active vs. licensed users, workflows completed | Logins are vanity; completed work is the signal |
| Product | dominant failure mode per week | Tells engineering what to fix first |

## What I tell Product

The single most useful thing forward-deployed work sends back is not a feature request —
it is which failure mode dominates this firm's workflow, with the evidence attached.
Over-extraction, wrong severity, or fabricated citations each point engineering at a
different fix. That is the loop: deploy, measure, translate, repeat.

---

*Synthetic and illustrative. No client data, no privileged material. Not legal advice.*
