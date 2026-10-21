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
