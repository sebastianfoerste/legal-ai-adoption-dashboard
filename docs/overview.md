# Overview

The longer introduction to the dashboard. The [README](../README.md) has the quick start; the [docs index](README.md) lists every other guide. Most of these sections were part of the README until October 2026, so "this document" in the correction below means the README.

A mock dashboard for steering legal-AI adoption inside a law firm or in-house team.
It shows how a Customer Success Manager, Legal Engineer, or Innovation lead watches
adoption, catches accounts before they stall, and turns user friction into product
feedback. All data is synthetic.

The Adoption Cockpit adds a local synthetic review summary: which product areas are
used, which evidence files support the deck, which actions remain blocked, and
which account-owner review gate applies before any renewal or expansion move.

The engagement layer adds what a manager of legal engineers needs after the sale:
intervention tracking from observed problem to evaluated outcome, adoption over time with
stated denominators, customer value measured as time to an acceptable result, a manager
view of assignments, capacity, overdue commitments, escalations and coaching, evidence-based
expansion readiness, and a customer review report. Two synthetic scenarios run through all
of it: an account whose stalled adoption was diagnosed and recovered, and a heavily used
account where expansion is inappropriate.

**Public-safety posture:** synthetic account data only, source provenance for dashboard inputs, review-gated legal outputs, and no legal advice.

**Live demo** (an earlier build; the footer shows its commit): https://legal-ai-adoption-dashboard.vercel.app

**Run locally:** `pnpm install && pnpm dev`.

> **What workflow does this improve?** Post-sales adoption of legal AI across a firm or in-house team.
> **Who is the user?** CSMs, Legal Engineers, and Innovation leads steering an account.
> **Where does human review happen?** The product gates every output behind a named lawyer. This dashboard tracks adoption, not output.
> **What is blocked until approval?** Expansion and renewal moves are surfaced as signals, never auto-actioned.
> **What would I tell Product?** See the Product Feedback Queue: friction routed to product areas.

## Pilot-to-adoption path

This is the legal-AI platform adoption path:

1. **Onboarding:** start in Account Health to see which teams are active and which practice groups are drifting.
2. **Blocker diagnosis:** open Adoption Blockers to identify training gaps, workflow mismatch, stakeholder resistance, or missing precedent coverage.
3. **Intervention:** record the observed problem, its evidence, a hypothesis, the action and the expected result in Interventions. A delivered action stays "completed, not evaluated" until follow-up observations are compared with the expected result.
4. **Adoption over time:** read activation, repeat use, completed workflows and drop-off after training per reporting period on the account page, each as numerator of denominator.
5. **Customer value:** compare time to an acceptable result before and after, review and correction included, beside quality failures and rework.
6. **Product feedback:** route observed friction to the Product Feedback Queue with severity, product area, and customer impact. Routing is not counted as customer value.
7. **Manager decisions:** see why each account receives attention, who is assigned, and where capacity, commitments or escalations need a decision.
8. **Customer review:** open the review report for objectives, trends, outcomes, unresolved problems and a recommendation to expand, continue, adjust or pause.
9. **Adoption profile:** inspect the Adoption Cockpit coverage table before turning any synthetic insight into a leadership deck or account action.

## Problem

A legal-AI rollout does not fail at the demo. It fails three months later, when two
practice groups quietly stop logging in and nobody notices until renewal. The work of
adoption has no home: spotting the dip, naming the blocker, scheduling the right
workshop, and routing the right feedback to Product. This dashboard is that home.

## Target user

A Legal Engineer or CSM who owns a portfolio of firm and in-house accounts and is
measured on utilization, expansion, and renewal, not on shipping code.

## What this proves

- I model adoption as data: a health score over licence use, trend, reviewed output and blockers, with every denominator stated.
- I separate a delivered action from an achieved outcome: an intervention counts as a success only after follow-up observations are evaluated against the expected result.
- I separate use from value: expansion rests on six evidence criteria, and a healthy, busy account can still receive "adjust".
- I separate what was observed from what is assumed: a before-and-after improvement is reported as observed, its cause as an assumption, and any EUR figure prints its assumptions.
- I show missing data as unknown: an uncaptured count is never a zero and never a pass.
- I manage on recorded reasons: the manager view explains why an account needs attention, and specialists are never ranked by account count or activity.
- I translate user friction into product requirements: the feedback queue is the artifact you hand to Product and Engineering.
- I keep the human-review gate explicit: this tracks adoption of a reviewed product, never autonomous legal advice.

## Synthetic data statement

Every record in `data/` is synthetic and exists only for demonstration. No real client,
firm, or in-house team is represented; account names are invented. No personal data.
See [`data/README.md`](../data/README.md).

## How a Legal Engineer would use this in a customer meeting

Open the customer review for the account at the start of a quarterly review. For the
synthetic Stadtwerke Musterstadt account it shows three objectives met, repeat use at six to
seven of eight eligible lawyers over three complete periods, and median time to a
signed-off result down from 167.5 to 90 active minutes with fewer quality failures
and 30 of 31 attempts accepted against 10 of 12 before. You say what
was observed, then what is assumed: the cohort is small, there was no comparison group,
and a product release landed in the same window. The recommendation is a bounded
expansion after a one-period pilot, with a named owner and a review date.

Correction, 6 October 2026: earlier versions of this document gave 150 and 80 minutes for this account. Those figures were the sum of three component medians, which is not a median. The figures here are medians of per-task totals. See [the measurement dictionary](MEASUREMENT_DICTIONARY.md).

For Brightmoor & Associates the same report argues the other way. The customer wants 40
more seats and the account is the healthiest in the book, yet fewer than a third of
started drafting runs reach an accepted draft and time to an accepted draft has risen.
You show the evidence, name what is missing, and propose the scoped trial before any
commercial conversation.

## Limitations

The Adoption Insights validates synthetic `legal-workflow.event.v1` bundles and reports workflow-version adoption, review latency, comment resolution, lock contention, reviewer coverage and permission-governance alerts. The telemetry contract rejects document text, comments, names and client identifiers. The dashboard remains analytical and cannot mutate permissions in another app.

The versioned contract is maintained in `packages/legal-workflow-contract`. Dashboard analytics consume its typed Zod schema, and the standalone validator consumes its JSON Schema allowlist. The facilitation content is maintained in `workshop-kit` and retains its own `make check` gate. Run `make dashboard-check`, `make contract-check` and `make workshop-check` independently, or run `make check` for the combined gate.

- The health score is a deliberately simple, transparent formula (see `lib/health.ts`), not a tuned model.
- Practice-group health uses licence use and trend only. Reviewed output is not captured per group, so that component is unknown and left out.
- The engagement thresholds are uncalibrated judgment calls: ten for a small cohort or sample, 50% of eligible users over three periods for sustained use, 10% for a time improvement. Medians are compared without a significance test.
- A before-and-after comparison cannot establish that an intervention caused a change. The reports say so; they cannot repair it.
- Capacity hours and complexity points are planning assumptions. The engagement views share one as-of date: the demo default is 31 July 2026, overridable per request with `?asOf=YYYY-MM-DD` or for the whole app with `ADOPTION_AS_OF` (`lib/engagement/as-of.ts`).
- Data is static JSON. There is no persistence, auth, or multi-tenancy. This is an MVP that demonstrates the workflow, not a product. See [CASE_STUDY.md](../CASE_STUDY.md) for the full list of limits.

## Stack

Next.js (App Router, Server Components), TypeScript (strict), Tailwind, Zod for data
validation, Vitest for the logic tests.
