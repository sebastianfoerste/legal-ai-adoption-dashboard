# legal-ai-workshop-kit

Enablement materials for rolling out a legal-AI tool in a law firm or an in-house legal team: partner briefings, associate hands-on sessions, adoption questionnaires, workflow discovery, prioritization matrices, product-feedback templates, and rollout follow-up materials.

The kit is for the people who run such a rollout: Legal Engineers, Customer Success Managers and innovation leads who prepare the sessions, work with the partners and associates who will use the tool, and report friction back to the product team.

All examples are synthetic. The repository is a public-safe portfolio project and does not provide legal advice.

## Run it

```bash
git clone https://github.com/sebastianfoerste/legal-ai-workshop-kit
cd legal-ai-workshop-kit
make generate-pilot
```

## What the demo produces

`make generate-pilot` reads the synthetic discovery intake in [`examples/synthetic-input.json`](examples/synthetic-input.json) and writes [`examples/generated-pilot-plan.md`](examples/generated-pilot-plan.md). The script ranks the candidate workflows by estimated hours saved per week (time per instance minus verification time, multiplied by frequency), takes the top one, and fills in a staged enablement plan and communication templates for it. On the synthetic intake it selects NDA first-pass review at an estimated 7.3 hours per week. The time figures are the intake's estimates, not measurements.

Scoring the candidates through the prioritization matrix on impact, frequency, AI fit and review feasibility is a separate, manual step. [`examples/sample-output.md`](examples/sample-output.md) works it through for the same intake:

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
- A German partner briefing, [`sessions/30-min-partner-briefing-de.md`](sessions/30-min-partner-briefing-de.md), that answers the confidentiality question under §§ 43a, 43e BRAO and § 203 StGB.
- Discovery templates for adoption readiness and workflow mapping.
- Prioritization tools for choosing the first pilot, and [pilot success metrics](discovery/pilot-success-metrics.md) agreed with the sponsor before the pilot starts.
- Team playbooks in [`team/`](team/): a demo quality rubric, a discovery question bank by practice group, and a six-week onboarding plan for a new legal engineer.
- Follow-up templates and product-feedback notes.
- A unified playbook for reviewer evaluation.

## Practitioner research pack

[`research/`](research/README.md) prepares a first qualitative study round on the contract-review handoff with four to eight practitioners. It is preparation only: no invitation has been sent and no session has been held. Predictive statements elsewhere in the kit are worded as hypotheses that the study and later adoption data can check.

## Data statement

All examples are generic or synthetic. No real client, firm, matter, or personal data appears anywhere in this repo.

## Check

`make check` verifies that the required materials exist.
