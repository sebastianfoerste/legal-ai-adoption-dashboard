# 0004. Leadership exports: print to PDF first

- **Status:** Proposed for PDF and PPTX, 2026-10-20. The per-practice-group CSV is built
  (accepted with this ADR).
- **Context.** `exportFormats` in `lib/adoption-cockpit.ts` names PPTX and PDF, but neither is
  built. Evidence produces PDF by calling the browser's print dialog with print utilities and
  switching charts to SVG when printing (Observed). The charts here are already SVG. A PPTX
  writer would be a new runtime or build dependency (rule 7).
- **Options.**
  1. Print stylesheet on `/accounts/[id]/review` and `/insights`: hide the nav and controls,
     keep the synthetic and review-gate notices on every page, avoid breaking inside a table
     row. No dependency.
  2. Build-time generation with a headless browser: needs Playwright in `package.json`, which
     this repository forbids.
  3. A PPTX library: a new dependency, a `Proposed` ADR of its own.
- **Proposal.** Option 1 for PDF. Defer PPTX until a customer asks for an editable deck.
- **CSV (built).** `/accounts/<id>/usage.csv`: per practice group, the window stated in every
  row, `synthetic-` file name, missing values as empty cells, every row a draft for
  account-owner review. A download, not an API.
- **Consequences.** PDF output depends on the reader's browser; page breaks need testing in
  at least two engines.
