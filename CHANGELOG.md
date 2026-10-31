# Changelog

All synthetic data; nothing here is legal advice.

## Unreleased

From the October 2026 competitive research ([plan](docs/research/adaptation-plan.md)).

### Added

- Accessible SVG charts with no client JavaScript: a missing value is a dashed grey Unknown
  gap, never a zero bar, and every chart has a title, a description and a hidden data table.
  Activation and repeat use now show as bars per reporting period.
  ([ADR 0001](docs/adr/0001-charts.md))
- "How this score is built" on each account: component points, configured and rescaled
  weights, the blocker penalty and band cut-offs. A change since the last QBR is shown, never
  attributed to a component.
- `/accounts/<id>/usage.csv`: per-practice-group usage over the weeks ending on the as-of
  date, with empty cells for missing values. ([ADR 0004](docs/adr/0004-exports.md))
- A sidebar grouped by job, a skip link, and error and not-found pages.
  ([ADR 0002](docs/adr/0002-navigation.md))
- Competitive research, a feature matrix, a design teardown and five ADRs under `docs/`.

### Changed

- Colours are semantic tokens. Secondary text moves from gray-400 to gray-500, which clears
  every axe colour-contrast violation; links, focus rings and bars share the violet accent.
- Tables use tabular numerals; horizontally scrolling tables are keyboard-focusable.

### Fixed

- The portfolio CSV wrote `0.0000` utilisation for an account without seats; it is now empty.
- `/benchmarks` peer-median metrics sit in a description list (axe `dlitem`).
- Review of the first draft: unknown accounts answer 404 again (a root `loading.tsx` had
  turned them into a streamed 200, so it is removed); the score explanation reconciles its
  rounded points with the score; only Unknown is dashed and grey in charts; shorter weekly
  series line up with the as-of week in the usage CSV; the portfolio CSV builder is tested.

### Security (2026-10-30 round)

- Next.js 16.2.9 → 16.4.3, which clears the critical advisories of the 16.2 line and the
  postcss and sharp high advisories; zod ^4.6.6; transitive dev-tooling packages pinned to
  patched lines so that `pnpm audit --audit-level=high` is clean and gates CI.
- `poweredByHeader: false`, `images.unoptimized: true` (the `/_next/image` endpoint answers
  404; the app renders no `next/image`) and response headers on every route: a static
  Content-Security-Policy with `frame-ancestors 'none'`, X-Content-Type-Options,
  Referrer-Policy, X-Frame-Options and Permissions-Policy, pinned by `lib/next-config.test.ts`.
- CI: read-only token, actions pinned to commit SHAs of their current majors,
  `persist-credentials: false`, concurrency and timeouts, a zizmor job, and Dependabot for npm
  and GitHub Actions (grouped minor and patch updates, no auto-merge).
- The portfolio CSV is built on the server (`/accounts.csv`); the data layer no longer ships
  to the browser (a test guards every client component). CSV cells that a spreadsheet would
  read as a formula are neutralised; both CSV routes end lines with CRLF.

### Accessibility (2026-10-30 round)

- Every page has its own `<title>`; heading levels no longer skip; tables on the manager,
  insights, research and customer-review pages have captions and column scopes.
- An axe-core gate (`pnpm test:a11y`, Playwright) visits every HTML route at 1280 px and
  375 px and runs in CI: WCAG 2.0/2.1/2.2 A and AA, heading order, one h1 per page, titles
  unique per route.
- The compiled workshop-kit HTML loads no third-party font, has valid heading ids and shows
  its formulas as readable text.

### Changed (2026-10-30 round)

- The footer shows the commit and date a build was made from, linked to GitHub.
- The README states the current floors (Node.js 22, pnpm 11, Python 3.11) and names the
  Vercel demo an earlier build. `product-feedback-loop` declares PEP 639 licence metadata,
  `requires-python >= 3.11` and classifiers, and CI tests that floor.
- `vitest.config.ts` → `vitest.config.mts`, which removes Vite's CJS warning. The README link
  test now checks every tracked Markdown file outside `workshop-kit/`.

## Merged after 0.1.0, before the Unreleased work

Pull requests on `main` between the tag and the October 2026 adaptation, by merge date.

| PR | Merged | Title |
|---|---|---|
| #1 | 2026-07-13 | feat: add workflow governance analytics |
| #2 | 2026-07-13 | fix: complete Collaboration-inspired programme verification |
| #3 | 2026-07-13 | Remediate workflow governance review findings |
| #5 | 2026-09-24 | refactor: rename command center to adoption insights |
| #4 | 2026-10-12 | feat: add practice-group cohort benchmarking |
| #6 | 2026-10-12 | feat: land the adoption cockpit stack and sync the workshop kit |
| #7 | 2026-10-12 | docs: record that the private research store exists |
| #8 | 2026-10-18 | fix: replace a real utility's name and tidy the public surface |
| #9 | 2026-10-19 | docs: trim the README to 347 words and move detail into docs |

PR #10 (merged 2026-10-28, "Competitive research and adaptation: accessible charts, score
explanation, usage CSV, app shell") is the Unreleased work above.

## 0.1.0 - 2026-07-03

First tagged release (`v0.1.0`, commit `cd65d51`, "Initial clean public portfolio
snapshot"). From the release notes: a synthetic legal AI adoption cockpit with governance
metrics, review gates, benchmark data and presentation-ready reports; deterministic tests
cover health scoring, cockpit analytics and synthetic data contracts.

- Next.js App Router dashboard with the Account Health, Adoption Blockers and Product
  Feedback Queue views over synthetic JSON data validated by Zod.
- The transparent adoption health score (`lib/health.ts`) with unit tests.
- Repository hygiene from the first commit: CI workflow, `AGENTS.md`, `CASE_STUDY.md`,
  `PRIVACY.md`, `SECURITY.md`, MIT licence.
