# Legal AI Adoption Dashboard

[![CI](https://github.com/sebastianfoerste/legal-ai-adoption-dashboard/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sebastianfoerste/legal-ai-adoption-dashboard/actions/workflows/ci.yml)

A mock dashboard for steering legal-AI adoption inside a law firm or in-house team.
It shows how a Customer Success Manager, Legal Engineer, or Innovation lead watches
adoption, catches accounts before they stall, and turns user friction into product
feedback.

**Public-safety posture:** synthetic account data only, source provenance for dashboard inputs, review-gated legal outputs, and no legal advice.

The adopted legal-AI product gates every output behind a named lawyer's review; this dashboard tracks adoption, not output, and surfaces expansion and renewal moves as signals for the account owner, never auto-actioned.

**Live demo:** https://legal-ai-adoption-dashboard.vercel.app

![Top of the Account Health page: navigation, framing questions, filters and the portfolio status strip](docs/demo.png)

*Screenshot of the running app (`pnpm build && pnpm start`), top of the Account Health page (`/`), synthetic data.*

## Quick start

Needs Node.js 20.9 or later, pnpm and, for `make check`, Python 3.10 or later.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # the adoption health score and data layer are unit-tested
```

Deterministic tests cover health scoring, adoption denominators, intervention states, the value verdict, expansion decisions, Adoption Cockpit analytics and synthetic data contracts.

`make dashboard-check` runs lint, tests and build; `make check` adds the contract, private-data boundary, feedback-loop and workshop-kit checks.

## Synthetic data statement

Every record in `data/` is synthetic and exists only for demonstration. No real client,
firm, or in-house team is represented; account names are invented. No personal data.
See [`data/README.md`](data/README.md).

## Documentation

See [CASE_STUDY.md](CASE_STUDY.md) for what the project demonstrates and its limits, and [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md) for a ten-minute walk-through.
The guide follows two synthetic scenarios: an account whose stalled adoption was diagnosed and recovered, and a heavily used account where expansion is inappropriate.

- [Docs index](docs/README.md): every guide
- [Overview](docs/overview.md): framing questions, adoption path, problem, target user, [what this proves](docs/overview.md#what-this-proves), a customer meeting, [limitations](docs/overview.md#limitations) and stack
- [Features](docs/FEATURES.md): the [demo path](docs/FEATURES.md#demo-path), the main pages and their code
- [How it works](docs/how-it-works.md): health score, expansion readiness and renewal
- [Screenshots](docs/screenshots.md): blockers, feedback queue and account cards
- [Reviewer guide](docs/reviewer-guide.md): a five-minute path

## Licence

MIT, see [LICENSE](LICENSE).
