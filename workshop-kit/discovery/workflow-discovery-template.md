# Workflow discovery template

**Use this when** you are mapping a real workflow to a candidate AI use case, so the pilot
targets something that matters and can actually be reviewed.

Fill one of these per candidate workflow. The fields force the two questions that decide
whether a workflow is a good fit: how often does it happen, and how cheaply can a human
verify the output.

## Template

- **Workflow name:** `{{name}}`
- **Practice group:** `{{group}}`
- **Trigger:** what starts this work? (a signed engagement, an inbound contract, a filing)
- **Inputs:** what documents or facts come in?
- **Current steps:** the sequence today, who does each step.
- **Time cost:** rough hours per instance, and who spends them.
- **Frequency:** how often per week or month, across the group.
- **Mandatory review point:** where must a qualified lawyer review before anything is relied on or sent? This never moves.
- **Candidate AI step:** which single step becomes a first pass the AI produces and a human checks?
- **Verification cost:** how long does it take a human to confirm the AI output is right? If the answer is "as long as doing it from scratch," this is a poor fit.
- **Confidentiality note:** can this run in the approved environment, and is there a synthetic version for training?

## Worked example (synthetic)

- **Workflow name:** NDA first-pass review
- **Practice group:** Corporate
- **Trigger:** an inbound NDA arrives ahead of a deal conversation.
- **Inputs:** the counterparty's NDA, the firm's NDA playbook.
- **Current steps:** paralegal logs it; associate reads it against the playbook; associate marks deviations; partner reviews the marked-up version.
- **Time cost:** ~45 minutes of associate time per NDA.
- **Frequency:** 10–15 per week across the group.
- **Mandatory review point:** partner sign-off on the marked-up NDA before it goes back to the counterparty. Unchanged.
- **Candidate AI step:** the associate's first pass — extract clauses, compare to the playbook, flag deviations — becomes an AI first pass the associate verifies.
- **Verification cost:** ~10 minutes to check flagged clauses against the text. Much less than the 45 minutes from scratch. Good fit.
- **Confidentiality note:** runs in the approved environment; a synthetic NDA set exists for the workshop.

This example scores well because it is frequent, the review point is clear, and
verification is far cheaper than the original task. Carry the filled template into the
prioritization matrix.
