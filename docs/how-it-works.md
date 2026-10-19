# How the scores and recommendations work

How the dashboard turns synthetic records into a health score, an expansion recommendation and a renewal decision aid. The [measurement dictionary](MEASUREMENT_DICTIONARY.md) defines every measure and its denominator.

**Adoption health** (`lib/health.ts`) is 45% licence use (active users of licensed seats), 25% usage trend and 30% reviewed completion (draft outputs a human reviewer verified), minus a penalty for open blockers. A component that was not captured is unknown: it is left out and the remaining weights are rescaled. Feedback routed to Product is not an input. Health is a triage aid and decides nothing about expansion.

**Expansion readiness** (`lib/engagement/expansion.ts`) checks six criteria, each met, not met or unknown: demonstrated workflow value, sustained use, no unresolved blocker in the way, customer demand, sponsor support and delivery capacity. All six met gives "expand". Sponsor support not met gives "pause". Value, sustained use or the blocker criterion not met gives "adjust". Anything else, including any unknown, gives "continue". The result is a recommendation for the account owner.

**Renewal** (`lib/engagement/renewal.ts`) is a decision aid: it lists recorded signals and suggests when to hold a human review. It outputs no probability.
