# What this proves

This repo is built to read for a Legal Engineer / Product Specialist role — the
post-sales side of legal AI. Each feature maps to a responsibility in that work.

| Feature | Responsibility it demonstrates |
| --- | --- |
| Adoption health score (`lib/health.ts`) | Adoption and utilization measured as data, not vibes. |
| Per-account and per-practice-group breakdown | Reading an account the way a CSM does — by segment, not in aggregate. |
| Weekly-active trend | Catching a decline before renewal, not after. |
| Blocker categories with severity | Naming why adoption stalls: trust, workflow fit, training, integration, change management, pricing. |
| Re-engagement action per blocker | Turning a problem into a next step, not a status label. |
| Workshop follow-up per blocker | Enablement tied to the specific gap it closes. |
| Expansion-ready flag | Knowing when an account is ready to grow, on evidence. |
| Product Feedback Queue with triage pipeline | Translating user friction into structured product input for Engineering. |
| Synthetic data + explicit review-gate framing | Working safely: no client data, no autonomous-advice posture. |

The score is intentionally a transparent formula, not a black box. A reviewer can read
`lib/health.ts` in a minute and see exactly why an account is "At risk." That
explainability is the point: a CSM has to defend the number in front of a partner.
