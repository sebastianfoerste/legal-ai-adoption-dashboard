# Adoption workspace consolidation

The dashboard repository is the canonical working repository for adoption analytics, the facilitation kit and their shared event contract.

## Boundaries

- Dashboard application: root Next.js application and `lib/` analytics.
- Workshop generation: `workshop-kit`, with its original content workflow and tests.
- Shared telemetry: `packages/legal-workflow-contract`, versioned as `legal-workflow.event.v1`.

The contract allows synthetic operational metadata only. Raw document text, prompts, comments, legal conclusions, client identifiers and personal data remain outside the allowlist. The dashboard cannot mutate permissions or workflow state in another application.

The former standalone workshop repository, [legal-ai-workshop-kit](https://github.com/sebastianfoerste/legal-ai-workshop-kit), is archived and receives no further releases. The kit is maintained only in `workshop-kit/`.
