# 0004. Leadership exports: print to PDF first

- **Status:** Accepted for PDF, 2026-11-03: option 1, the print stylesheet, is built. PPTX
  deferred. Proposed 2026-10-20. The per-practice-group CSV is built (accepted with this ADR).
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
- **Built (2026-11-03).** `@media print` in `app/globals.css`: navigation, forms and elements
  marked `data-print="hide"` (download buttons, back links) drop out; scrolling tables print
  in full; rows, figures and notices do not split across pages; every printed page carries
  "Synthetic data. Draft for account-owner review; not legal advice." The on-page synthetic
  and review notices stay. `lib/print.test.ts` pins these rules.
- **Checked in two engines (2026-11-17).** Chromium (Playwright's build 1194) and Firefox
  160 (headless, through geckodriver's print command) printed the account page, the customer
  review, `/insights`, `/benchmarks` and a filtered `/blockers`. Firefox ignores page margin
  boxes, so the first version left pages without the notice there (pages 2 to 4 of a
  six-page account print). The notice now comes by two routes: the `@bottom-center` margin
  box, which Chromium prints, and a print-only table footer group in the layout
  (`.print-notice`, text in `lib/print.ts`), which Firefox repeats on every page and Chromium
  prints once at the end. Result: the notice on every page in both engines, the line twice
  on Chromium's last page, no navigation or download control in either, no table clipped.
  Page numbers print in Chromium only.
- **Consequences.** PDF output depends on the reader's browser; page breaks were tested in
  Chromium and Firefox and should be re-checked in both after layout changes. Safari is not
  checked.
