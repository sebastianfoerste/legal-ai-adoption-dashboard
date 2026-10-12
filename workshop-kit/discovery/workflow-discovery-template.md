# Workflow discovery template

**Use this when** you are mapping a real workflow to a candidate AI use case, so the pilot
targets something that matters and can actually be reviewed.

Fill one of these per candidate workflow. The fields ask the two questions this kit treats
as the main test of fit: how often does the work happen, and how cheaply can a human verify
the output. That these two decide fit is a working hypothesis. Record the source of every
figure, because an estimate and a measurement are different kinds of evidence.

## Template

- **Workflow name:** `{{name}}`
- **Practice group:** `{{group}}`
- **Trigger:** what starts this work? (a signed engagement, an inbound contract, a filing)
- **Inputs:** what documents or facts come in?
- **Current steps:** the sequence today, who does each step.
- **Time cost:** hours per instance and who spends them. State whether this is an estimate or a measured sample, and from how many instances.
- **Frequency:** how often per week or month, across the group.
- **Mandatory review point:** where must a qualified lawyer review before anything is relied on or sent? This never moves.
- **Candidate AI step:** which single step becomes a first pass the AI produces and a human checks?
- **Verification cost:** how long does it take a human to confirm the AI output is right, and to correct it where it is wrong? Count review and correction. If the answer is "as long as doing it from scratch", the hypothesis is that this is a poor fit. Until a per-task sample exists, mark the figure as an estimate.
- **Evidence type:** for each answer above, note whether it comes from what someone reported about past work, from watching the task, or from an opinion about a proposal.
- **Confidentiality note:** can this run in the approved environment, and is there a synthetic version for training?

## Worked example (synthetic)

- **Workflow name:** NDA first-pass review
- **Practice group:** Corporate
- **Trigger:** an inbound NDA arrives ahead of a deal conversation.
- **Inputs:** the counterparty's NDA, the firm's NDA playbook.
- **Current steps:** paralegal logs it; associate reads it against the playbook; associate marks deviations; partner reviews the marked-up version.
- **Time cost:** ~45 minutes of associate time per NDA. Estimate by the team, not measured.
- **Frequency:** 10–15 per week across the group.
- **Mandatory review point:** partner sign-off on the marked-up NDA before it goes back to the counterparty. Unchanged.
- **Candidate AI step:** the associate's first pass — extract clauses, compare to the playbook, flag deviations — becomes an AI first pass the associate verifies.
- **Verification cost:** ~10 minutes to check flagged clauses against the text. Estimate, review only; correction time is not yet known. If a per-task sample confirms it, the workflow is a good fit.
- **Evidence type:** all figures are reported estimates. Nothing here was observed.
- **Confidentiality note:** runs in the approved environment; a synthetic NDA set exists for the workshop.

This example is a promising candidate because it is frequent, the review point is clear,
and verification is estimated to be far cheaper than the original task. The estimate is the
hypothesis a pilot has to test: measure production, review and correction per task, total
them per task, and compare the median with a baseline measured the same way. Carry the
filled template into the prioritization matrix.
