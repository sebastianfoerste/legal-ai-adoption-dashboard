# 0003. Dark mode, only after the tokens pass in both themes

- **Status:** Proposed, 2026-10-20. Needs owner decision.
- **Context.** `app/globals.css` forces a light scheme because components were styled with raw
  palette steps that do not survive a dark background. Commit "semantic colour tokens" moved
  the app onto roles. Measured contrast of each role's light value (rendered colour, WCAG
  ratio):

  | Token | Value | On white | On gray-50 | Use |
  | --- | --- | --- | --- | --- |
  | `muted` | gray-500 `#6a7282` | 4.84 | 4.63 | secondary text; not on gray-100 (4.39) |
  | `link` | violet-700 `#7008e7` | 7.30 | 6.98 | links |
  | `link-hover` | violet-800 `#5d0ec0` | 9.17 | 8.78 | links on hover |
  | `focus` | violet-500 `#8e51ff` | 4.40 | 4.21 | focus ring (needs 3:1) |
  | `chart` | violet-600 `#7f22fe` | 5.89 | 5.64 | bars and meters (needs 3:1) |
  | `chart-track` | gray-200 `#e5e7eb` | 1.24 | 1.18 | decorative track |
  | `unknown` | gray-500 `#6a7282` | 4.84 | 4.63 | Unknown text and gap outlines |

  Against the track, the chart fill is about 4.7:1 and the capacity warning fill (amber-700)
  about 4:1. The owner's shared design system defines two-theme tokens with a different
  accent; see [Needs owner decision](../research/adaptation-plan.md#needs-owner-decision).
- **Proposal.** Give every role a dark value, apply it under `prefers-color-scheme: dark` and
  an explicit `data-theme` override, and move the remaining raw steps (band badges, card
  borders, `text-gray-900` headings) onto roles first. Ship only when every text role is 4.5:1
  and every graphic role 3:1 on both themes' surfaces, with Unknown still grey.
- **Consequences.** Touches nearly every component class. No runtime dependency. Print stays
  light.
