# Contributing

This is a personal, public-safe prototype. Issues and corrections are welcome.

## Ground rules

1. **Synthetic data only.** Never add real client data, privileged material, negotiation history, or personal data.
2. **Deterministic by default.** Same input, same output. No network or model calls in the core checks/evaluation.
3. **Cited / grounded findings.** Every regulatory finding carries a specific, verifiable citation.
4. **Not legal advice.** Keep the framing as a review / evaluation artifact.

## Where the kit is maintained

The kit is maintained in [`workshop-kit/`](https://github.com/sebastianfoerste/legal-ai-adoption-dashboard/tree/main/workshop-kit) of the legal-ai-adoption-dashboard repository. The standalone [legal-ai-workshop-kit](https://github.com/sebastianfoerste/legal-ai-workshop-kit) repository receives releases from there. Open issues and pull requests against the dashboard repository.

## Working on it

```bash
make check    # regenerates examples/generated-pilot-plan.md and the unified kit, then checks files and links
```

Commit the regenerated files with your change. `make check` must pass before any PR.

## Reporting an issue

Be specific: the rule or step, what you expected, and — for regulatory checks — the corrected citation. Citation fixes are the most valuable contribution.
