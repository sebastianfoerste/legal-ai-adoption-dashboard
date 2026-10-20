# 0005. Saved views as URL query strings

- **Status:** Proposed, 2026-10-20. Not built.
- **Context.** `/` filters by `search`, `type` and `band` through GET parameters. Other lists
  have no filters. Researched products keep views as stacked URL filters (Vercel) or named
  views (Linear, Legora date ranges) (Claimed). The dashboard has no database and no auth.
- **Proposal.** Add GET filters to `/blockers`, `/feedback` and `/interventions`, read on the
  server. Named views live in a committed, Zod-validated `data/views.json` of query strings,
  shown as links. Personal views are browser bookmarks; nothing is stored per person.
- **Consequences.** No persistence or per-user data. A view never ranks specialists and never
  filters by health alone into an expansion list.
