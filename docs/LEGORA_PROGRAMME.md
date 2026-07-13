# Legora-inspired programme

`legal-workflow.event.v1` is a strict synthetic telemetry contract. Unknown keys, raw document text, prompts, legal conclusions, client identifiers and source passages are rejected because they are outside the allowlist.

The dashboard reports workflow starts and completion, time saved, product and practice adoption, review timing, comment resolution, reopen and lock contention, reviewer coverage, source verification, guest sharing, expiry, revocation and overdue access review. Metric definitions and source event records remain visible.

Run `make check` and `npm run telemetry:validate`. The fixture is synthetic and the dashboard has no external mutation route.
