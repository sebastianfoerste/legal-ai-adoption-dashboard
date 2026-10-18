# Legal AI workshop kit

A content folder in the legal-ai-adoption-dashboard repository, not an application. It holds the deliverables for running a legal-AI
rollout with a law firm or in-house team: session agendas, discovery tools, objection
handling, and feedback templates. Its code is `check.sh` and three standard-library Python
scripts in `scripts/` (`generate_pilot_plan.py`, `compile_kit.py` and `link_checker.py`), a
unit test for `generate_pilot_plan.py` in `tests/`, and the inline navigation script that
`compile_kit.py` writes into the generated `enablement/workshop-kit-unified.html`.

## Layout
- `sessions/` — timed agendas: 60-minute workshop, 30-minute partner briefing, 90-minute associate hands-on.
- `discovery/` — adoption questionnaire, workflow-discovery template, use-case prioritization matrix.
- `enablement/` — skeptical-partner objection handling, follow-up email templates, product-feedback template.
- `docs/` — reviewer guide, customer workflow, worked product-feedback notes.
- `examples/` — a synthetic discovery intake, the prioritization result derived from it, and the pilot plan generated from it (`generated-pilot-plan.md`).
- `scripts/`: `generate_pilot_plan.py` writes `examples/generated-pilot-plan.md` from the intake; `compile_kit.py` writes the unified kit (`enablement/workshop-kit-unified.md` and `.html`); `check.sh` checks required documents and placeholder markers; `link_checker.py` checks relative links. Standard library only, no network access.
- `tests/`: a stdlib `unittest` for the frequency parsing in `generate_pilot_plan.py`; `make test` runs it.
- `research/` — the practitioner study pack for the contract-review handoff: plan, screener, invitation draft, information and consent, moderator script, synthetic task packs, a matter task pack for a later round, observation sheet, follow-up plan and data handling. Preparation only; completed sheets and participant records never enter this repository.

## Rules
- Every document must be usable as-is in a real engagement. No placeholder text.
- No real client names or confidential matter detail. Keep framing generic.
- No "AI replaces lawyer" framing. Human review and partner sign-off stay explicit in every agenda and template.
- Each document opens with a one-line "Use this when…" so a non-developer routes correctly.

## Check
`make check` in this folder runs the unit test, regenerates `examples/generated-pilot-plan.md`
and the unified kit, checks that every required document exists and that none contains
placeholder markers, and checks relative links. Commit the regenerated files with your change:
CI runs the check and fails if a regenerated file differs from the committed one. Run it, and the
repository's root `make check` (which includes it and the private-data boundary check), before
committing.
