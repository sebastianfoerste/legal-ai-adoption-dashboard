# 0002. A grouped sidebar and route states

- **Status:** Accepted, 2026-10-20.
- **Context.** Eight top-level links wrapped to two rows at 1280px. The nav focus ring was blue
  among violet ones. There was no `loading.tsx`, `error.tsx` or `not-found.tsx`, so an unknown
  account showed the framework's default 404.
- **Options.** A command palette needs a client component and keyboard handling for eight
  routes: rejected. Shorter labels lose meaning. A sidebar is the common pattern in the
  researched products (Inferred from their docs).
- **Decision.** From the `lg` breakpoint the nav is a sticky sidebar, grouped by job:
  Portfolio, Adoption signals, Product loop. Below it the same list wraps as a row. A skip
  link jumps to `#content`. `lib/navigation.ts` holds the groups, and a test fails when a
  top-level route is missing. `app/not-found.tsx` and `app/loading.tsx` are Server
  Components; `app/error.tsx` is a client component, as Next requires, retries with
  `unstable_retry` and sends nothing anywhere.
- **Consequences.** A third client component (`app/error.tsx`). The content column keeps
  `max-w-5xl` and fits beside the sidebar at 1280px. Nested routes highlight their section.
