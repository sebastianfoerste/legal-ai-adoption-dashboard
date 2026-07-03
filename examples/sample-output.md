# Sample output

The adoption health score for the account in [`synthetic-input.json`](synthetic-input.json),
computed by `computeHealth` in `lib/health.ts`.

## Input
- Seats: 50, active users: 45 → **utilization 0.90**
- Weekly active: `[30, 32, 35, 40, 45]` → growth ratio +0.50 → **trend (normalized) 0.75**
- Feedback: 3 of 4 items shared with Product → **engagement 0.75**
- Open blockers: one `medium` → **penalty 6**

## Computation
```
base    = 100 × (0.5 × 0.90 + 0.3 × 0.75 + 0.2 × 0.75)
        = 100 × (0.45 + 0.225 + 0.15)
        = 82.5
score   = round(82.5 − 6) = 77
band    = steady          (60–79)
expansionReady = false    (band is not "healthy")
```

## Result
```json
{ "score": 77, "band": "steady", "expansionReady": false }
```

The takeaway a CSM acts on: a strong, growing, engaged account is held just below
"healthy" by a single open training-gap blocker. Close it, and the account crosses into
expansion territory. That is the whole argument for booking the workshop now.
