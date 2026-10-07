# Sample output

The adoption health score for the account in [`synthetic-input.json`](synthetic-input.json),
computed by `computeHealth` in `lib/health.ts`.

## Input
- Seats: 50, active users: 45 → **licence use 0.90**
- Weekly active: `[30, 32, 35, 40, 45]` → growth ratio +0.50 → **trend (normalized) 0.75**
- Draft outputs: 150, verified by a reviewer: 128 → **reviewed completion 0.853**
- Open blockers: one `medium` → **penalty 6**

Feedback routed to Product is not an input.

## Computation
```
base    = 100 × (0.45 × 0.90 + 0.25 × 0.75 + 0.30 × 0.853)
        = 100 × (0.405 + 0.1875 + 0.256)
        = 84.85
score   = round(84.85 − 6) = 79
band    = steady          (60–79)
```

If reviewed completion were not captured, that component would be unknown and the other
two weights would be rescaled: `100 × (0.405 + 0.1875) / 0.70 = 84.6`.

## Result
```json
{ "score": 79, "band": "steady", "unknownComponents": [] }
```

The takeaway a CSM acts on: a strong, growing account is held just below "healthy" by a
single open training-gap blocker. The score says where to look. Whether the account should
expand is a separate question, answered from six evidence criteria in
`lib/engagement/expansion.ts`.
