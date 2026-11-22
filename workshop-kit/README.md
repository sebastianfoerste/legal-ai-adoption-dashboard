# Legal AI workshop kit

Enablement materials for rolling out a legal-AI tool in a law firm or an in-house legal team: partner briefings, associate hands-on sessions, adoption questionnaires, workflow discovery, prioritization matrices, product-feedback templates, and rollout follow-up materials.

The kit is for the people who run such a rollout: Legal Engineers, Customer Success Managers and innovation leads who prepare the sessions, work with the partners and associates who will use the tool, and report friction back to the product team.

All examples are synthetic. The repository is a public-safe portfolio project and does not provide legal advice.

## Run it

```bash
git clone https://github.com/sebastianfoerste/legal-ai-adoption-dashboard
cd legal-ai-adoption-dashboard/workshop-kit
make generate-pilot
```

## What the demo produces

`make generate-pilot` reads the synthetic discovery intake in [`examples/synthetic-input.json`](examples/synthetic-input.json) and writes [`examples/generated-pilot-plan.md`](examples/generated-pilot-plan.md). The script ranks the candidate workflows by estimated hours saved per week (time per instance minus verification time, multiplied by frequency), takes the top one, and fills in a staged enablement plan and communication templates for it. On the synthetic intake it selects NDA first-pass review at an estimated 7.3 hours per week. A frequency of "daily" with no count is read as five instances per week, one per working day, which puts Document / issue summary at 0.8 hours per week. A count per day, per workday or per weekday is multiplied by five, so "2 per workday" and "twice daily" both read as ten per week. The time figures are the intake's estimates, not measurements.

Scoring the candidates through the prioritization matrix on impact, frequency, AI fit and review feasibility is a separate, manual step. [`examples/sample-output.md`](examples/sample-output.md) works it through for the same intake. Its heading and score table:

```markdown
# Sample output — prioritization result

| Candidate workflow | Impact | Frequency | AI fit | Review feasibility | Total |
|---|---:|---:|---:|---:|---:|
| NDA first-pass review | 4 | 5 | 5 | 5 | **19** |
| Clause comparison across versions | 4 | 4 | 5 | 5 | **18** |
| Document / issue summary | 3 | 5 | 4 | 4 | **16** |
| DPA review (GDPR) | 4 | 3 | 3 | 3 | **13** |
| Litigation research memo | 5 | 3 | 3 | 2 | **13** |
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

## Regulatory context (as of 22 November 2026)

Orientation only, not legal advice. Each point was last read on 21 or 22 November 2026 at the source linked; the firm's own professional-conduct review decides what applies to its rollout.

- **AI literacy, Article 4 of the AI Act.** Article 4(1) of Regulation (EU) 2024/1689, as amended by [Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj) (the Digital Omnibus on AI), requires providers and deployers of AI systems to "take measures to support the development of AI literacy" of their staff and of others who operate or use AI systems on their behalf, and adds that this "does not require providers or deployers to guarantee any specific level of AI literacy of any individual". The AI-literacy obligation has applied since 2 February 2025; the amending regulation was published in the Official Journal on 24 July 2026 and entered into force on 27 July 2026 (Official Journal text, CELEX 32026R1744; [Commission, AI Omnibus enters into force](https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force)). A firm that deploys a legal-AI tool can document the sessions in this kit as such measures.
- **Germany: KI-MIG.** The KI-Marktüberwachungs-und-Innovationsförderungs-Gesetz (KI-MIG), enacted as Article 1 of the Gesetz zur Durchführung der Verordnung über künstliche Intelligenz vom 22. Juli 2026 (BGBl. 2026 I Nr. 223), has been in force since 29 July 2026, the day after its promulgation. Under § 2 Abs. 1 the Bundesnetzagentur is the market-surveillance authority for compliance with Regulation (EU) 2024/1689, "soweit in diesem Gesetz nichts anderes bestimmt ist": § 2 Abs. 2 keeps the sector authorities for AI systems linked to products under Annex I, Section A, of that Regulation, and § 2 Abs. 3 makes BaFin competent for AI systems directly connected with a regulated financial activity of the firms it supervises ([BGBl. 2026 I Nr. 223](https://www.recht.bund.de/bgbl/1/2026/223/VO.html)).
- **Germany: BRAK guidance.** The Bundesrechtsanwaltskammer's "Hinweise zum Einsatz von künstlicher Intelligenz (KI)", Stand: Oktober 2026, replace the version of December 2024: "Aufgrund aktueller Entwicklungen wurde der KI-Leitfaden aus Dezember 2024 im Oktober 2026 angepasst und erweitert." ([BRAK, KI-Leitfaden, Stand 10/2026](https://www.brak.de/fileadmin/service/publikationen/Handlungshinweise/BRAK_Leitfaden_mit_Hinweisen_zum_KI-Einsatz_Stand_10_2026.pdf); [BRAK, Handlungshinweise und Leitfäden](https://www.brak.de/publikationen/handlungshinweise/)). The CCBE's Standing Committee adopted a guide for lawyers on generative AI in early October 2025 ([BRAK newsletter 18/2025 of 24 October 2025](https://www.brak.de/newsroom/newsletter/nachrichten-aus-bruessel/2025/ausgabe-18-2025-v-24102025/leitfaden-fuer-die-anwaltschaft-zum-umgang-mit-generativer-kuenstlicher-intelligenz-ccbe/)). Check both for updates before a session.

## Data statement

All examples are generic or synthetic. No real client, firm, matter, or personal data appears anywhere in this repo.

## Check

`make check` regenerates `examples/generated-pilot-plan.md` and the unified kit, checks that the required documents exist and contain no placeholder markers, and checks relative links. Commit the regenerated files with your change.
