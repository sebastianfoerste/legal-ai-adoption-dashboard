# 0005. Saved views as URL query strings

- **Status:** Accepted and built, 2026-11-02 (proposed 2026-10-20).
- **Context.** `/` filters by `search`, `type` and `band` through GET parameters. Other lists
  have no filters. Researched products keep views as stacked URL filters (Vercel) or named
  views (Linear, Legora date ranges) (Claimed). The dashboard has no database and no auth.
- **Proposal.** Add GET filters to `/blockers`, `/feedback` and `/interventions`, read on the
  server. Named views live in a committed, Zod-validated `data/views.json` of query strings,
  shown as links. Personal views are browser bookmarks; nothing is stored per person.
- **Built.**
  - `lib/list-filters.ts` defines each list's filters and reads them on the server.
    - `/blockers`: account, severity, category.
    - `/feedback`: account, severity, product area, routing.
    - `/interventions`: account, stage.
  - A value that is not one of a filter's options is shown as ignored, never matched to an empty list.
  - `components/ListFilters.tsx` is a plain GET form, so a filtered list is a URL; the filter keeps a chosen `?asOf=`.
  - Each page applies filters to its list only. Summary panels (accounts needing attention, the feedback themes and routing counts, the intervention totals) stay portfolio-wide, and the page says so.
  - Named views live in `data/views.json`. `lib/views.ts` loads and validates them, and they appear as links on their page and on `/`. The link matching the current URL is marked with `aria-current`.
- **Consequences.**
  - No persistence or per-user data; a person's own views are bookmarks.
  - The filter keys have no owner, specialist or sort parameter, and `lib/views.ts` refuses a view that uses one: a view filters, it never ranks people.
  - `lib/views.ts` also refuses a health-band view presented as an expansion or renewal list.
  - `/blockers` is now rendered per request instead of prerendered.
