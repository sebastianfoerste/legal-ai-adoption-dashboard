# legal-ai-workshop-kit

Enablement materials for legal AI adoption: partner briefings, associate hands-on sessions, adoption questionnaires, workflow discovery, prioritization matrices, product-feedback templates, and rollout follow-up materials.

All examples are synthetic. The repository is a public-safe portfolio project and does not provide legal advice.

## Run it

```bash
git clone https://github.com/sebastianfoerste/legal-ai-workshop-kit
cd legal-ai-workshop-kit
make generate-pilot
```

## What the demo produces

The demo scores candidate workflows through a prioritization matrix and recommends a first pilot based on impact, frequency, AI fit, and review feasibility.

```markdown
# Sample output: prioritization result

| Candidate workflow | Impact | Frequency | AI fit | Review feasibility | Total |
|---|---:|---:|---:|---:|---:|
| NDA first-pass review | 4 | 5 | 5 | 5 | **19** |
| Clause comparison across versions | 4 | 4 | 5 | 5 | **18** |
| Document / issue summary | 3 | 5 | 4 | 4 | **16** |
```

## Pilot-to-adoption path

This is the legal-AI rollout reviewer path:

1. Scope the team with the adoption questionnaire and workflow discovery template.
2. Use the prioritization matrix to separate high-value workflows from low-review-feasibility demos.
3. Run the right enablement format: partner briefing, workshop, or hands-on session.
4. Convert user friction into structured product-feedback notes.
5. Re-baseline adoption with the maturity model and first 90 days deployment plan.

## What's inside

- Session agendas for partner briefings, workshops, and hands-on training.
- Discovery templates for adoption readiness and workflow mapping.
- Prioritization tools for choosing the first pilot.
- Follow-up templates and product-feedback notes.
- A unified playbook for reviewer evaluation.

## Data statement

All examples are generic or synthetic. No real client, firm, matter, or personal data appears anywhere in this repo.

## Check

`make check` verifies that the required materials exist.
