# legal-ai-workshop-kit

A content repo, not an application. It holds the deliverables for running a legal-AI
rollout with a law firm or in-house team: session agendas, discovery tools, objection
handling, and feedback templates. No code to run.

## Layout
- `sessions/` — timed agendas: 60-minute workshop, 30-minute partner briefing, 90-minute associate hands-on.
- `discovery/` — adoption questionnaire, workflow-discovery template, use-case prioritization matrix.
- `enablement/` — skeptical-partner objection handling, follow-up email templates, product-feedback template.
- `docs/` — reviewer guide, customer workflow, worked product-feedback notes.
- `examples/` — a synthetic discovery intake and the prioritization result derived from it.

## Rules
- Every document must be usable as-is in a real engagement. No placeholder text.
- No real client names or confidential matter detail. Keep framing generic.
- No "AI replaces lawyer" framing. Human review and partner sign-off stay explicit in every agenda and template.
- Each document opens with a one-line "Use this when…" so a non-developer routes correctly.

## Check
`make check` verifies every required document exists and that none contains placeholder
markers. It is the only gate; run it before committing.
