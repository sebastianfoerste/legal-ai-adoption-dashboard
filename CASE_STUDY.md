# Case study — legal-ai-adoption-dashboard

> Legal AI succeeds or fails on adoption after the demo, not on the demo. Synthetic data only; not legal advice.

## Problem
Most legal AI rollouts die quietly. The pilot demos well, a few enthusiasts use it, and three months later usage has decayed and no one can say why. The gap is not the model — it is the absence of an adoption feedback loop: who is using it, which practice groups have stalled, which accounts are at renewal risk, and what users actually asked for.

## Users
A customer success lead, innovation partner, or legal-AI vendor's post-sales team who owns the question: *are sophisticated lawyers actually using this every week?*

## Workflow
1. Usage and engagement signals are ingested (synthetic) per account and practice group.
2. The dashboard surfaces **account health**, **practice-group usage**, **low-usage warnings**, and **renewal-risk** signals.
3. A **product-feedback loop** classifies what users asked for by severity and revenue impact.
4. The output is a weekly **customer-success memo** and a prioritised product-feedback list.

## Controls
Adoption is measured by *reviewer-accepted* and *active-use* signals, not raw logins — usage that doesn't reflect real value is flagged, not celebrated. Feedback is mapped from user pain to a product requirement so the loop is traceable.

## Evaluation
The bundled view turns a set of synthetic accounts into a ranked **adoption-risk** list, a renewal-risk memo, and a "what we heard / what we changed" product note — i.e. a demo turned into a weekly operating rhythm.

## Limitations
Data is synthetic and the signal model is illustrative; it is not wired to a real product-analytics backend, and the thresholds for "at risk" should be calibrated against real cohorts.

## Next steps
Connect to real usage telemetry; add cohort baselines and time-to-habit metrics; close the loop by pushing classified feedback into a product backlog and tracking what shipped.
