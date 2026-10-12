# Case study: legal-ai-adoption-dashboard

> Synthetic data only. No real client, no document contents, no vendor integration. Not legal advice.

## What this is

A working model of how a manager of legal engineers or product specialists would run
post-sales adoption at a legal-AI vendor: which accounts need attention and why, what the
team tried, whether it worked, and what to recommend to the customer. It is a local
Next.js application over synthetic JSON, with the decision rules in small tested modules.

## The management problem

A rollout usually fails some weeks after training, when lawyers who activated stop
coming back and nobody can say why. The usual dashboard does
not help, because it counts logins and queries. Activity can rise while the work gets
slower and worse, and a manager who steers by activity will expand the wrong account and
praise the wrong specialist.

The project therefore treats four things as separate that are often merged: an action
delivered and an outcome achieved; use and value; an observed change and its cause; a
missing measurement and a zero.

## What the project demonstrates

**Diagnosing adoption problems.** Adoption is tracked per workflow in four-week periods
with stated denominators. Licensed, eligible and active users are separate counts.
Repeat use is divided by eligible users, so the rate cannot improve merely because the
active group shrank. Drop-off is measured against the training cohort. Uncaptured counts
display as "Unknown", and rates on fewer than ten users or in an unfinished period carry
a visible caveat.

**Overseeing customer engagements.** Each intervention records the account, the affected
workflow or practice group, the observed problem, its evidence, a hypothesis, the assigned
specialist, the action, dates, the expected result, follow-up observations and the
outcome. The stage is derived from the record. An intervention reaches "evaluated" only
with an evaluation date, an outcome and a follow-up observation made after completion.
A completed action is shown as "completed, not evaluated" and states that success is not
established.

**Measuring customer value.** Value is the time to an acceptable completed result, with
human review and correction included, read beside quality failures and rework. A faster
result with more quality failures does not count. Each measurement shows what was observed
in one column and what is assumed in another: without a comparison group the causal effect
of the intervention is an assumption, and concurrent changes are listed. A financial
figure appears only when value was observed, and it prints its formula and every
assumption.

**Managing specialists.** The manager view explains why each account receives attention:
open escalations, overdue commitments, overdue follow-ups, a renewal window, a sponsor gap,
undemonstrated value, a capacity gap or declining use. Each reason cites its record.
Workload is planned hours against assignable capacity and account complexity. Specialists
appear in roster order, carry no score and are not ranked by account count or activity.
Coaching actions link to the intervention they rest on.

**Supporting renewals and expansion.** Expansion readiness rests on six criteria:
demonstrated workflow value, sustained use, unresolved blockers, customer demand, sponsor
support and delivery capacity. Each is met, not met or unknown, with supporting and
missing evidence. Unknown evidence can never yield "expand". The renewal panel lists
recorded signals and suggests when to hold a review; it outputs no probability.

**Communicating to senior stakeholders.** The customer review report has seven sections:
objectives, adoption trends, intervention outcomes, quality evidence, unresolved problems,
a reasoned recommendation to expand, continue, adjust or pause, and owners with next
review dates. It renders as a page and downloads as Markdown.

## Two scenarios

**Scenario A, Stadtwerke Aurich (in-house).** Seven of eight eligible lawyers activated
after training; two periods later one of eight was a repeat user. Shadowed reviews and a
time sample showed that lawyers rebuilt the output into their own checklist, so the tool
saved no time. The specialist mapped the output to that checklist and ran two clinics.
Over three complete periods repeat use held at six to seven of eight, and median time to a
signed-off result fell from 167.5 to 90 active minutes with fewer quality failures. All six
expansion criteria are met and the recommendation is a bounded expansion after a
one-period pilot. The report still states that the cohort is small and that causation is
assumed.

**Scenario B, Brightmoor & Associates (law firm).** The account is the healthiest in the
portfolio and asks for 40 further seats. Nineteen of twenty eligible associates use the
drafting agent, yet 45 of 141 started runs reach an accepted draft. A refresher training
was delivered and evaluated: activity rose, median active time per accepted draft rose from
222.5 to 260 minutes, fewer attempts were accepted, and quality failures increased. Value is not demonstrated, a blocker is open,
the sponsor changed and the lead specialist has no spare hours. The recommendation is to
adjust the programme, and a scoped trial is underway.

Correction, 6 October 2026: earlier versions of this document gave 150 to 80 minutes for scenario A and 210 to 245 minutes for scenario B. Those figures were the sum of three component medians, which is not a median. The figures here are medians of per-task totals. See [the measurement dictionary](docs/MEASUREMENT_DICTIONARY.md).

## One correction to the earlier model

The original health score gave 20% of its weight to the share of feedback items forwarded
to Product, and derived "expansion-ready" from the health band. Forwarding feedback is a
vendor process step and changes nothing for the customer, so it left the score. The
weight moved to reviewed completion, the share of draft outputs a human reviewer
verified. When that measurement is missing the component is unknown and the remaining
weights are rescaled. Expansion readiness is now a separate evidence model.

## Controls

- Every engagement record is pinned to `synthetic: true` and parsed strictly, so an
  unknown key such as a client name fails at load.
- The shared telemetry allowlist `legal-workflow.event.v1` is unchanged, and a test fails
  if a field is added to it.
- Specialists are role labels. Reports and exports carry a synthetic notice; download
  file names start with `synthetic-`.
- Recommendations are drafts for account-owner review. The application sends nothing and
  changes nothing in another system.

## Verification

132 Vitest tests cover denominators, missing evidence, intervention states, health
scoring, the value verdict, expansion decisions, manager ordering and the report. A
mutation spot-check broke seven rules one at a time (for example, counting unknown
evidence as met, or dividing repeat use by active users) and the suite failed each time.
The rendered pages were inspected at 1280 and 375 pixels.

## Limits

- The data is invented to make the reasoning visible. The scenarios show that the model
  can tell these cases apart; they are no evidence about real accounts.
- Thresholds are uncalibrated judgment calls: ten for a small cohort or sample, 50% of
  eligible users over three periods for sustained use, 10% for a time improvement.
- Medians are compared without dispersion or a significance test. A before-and-after
  comparison cannot separate the intervention from concurrent changes, which the report
  says but cannot repair.
- Time to an acceptable result is the hardest input to collect in practice. Here it is
  typed into a JSON file. No collection method has been tested with real lawyers.
- Capacity hours and the complexity points are planning assumptions.
- The decision rule is fixed and simple. It orders evidence for a human decision and has
  not been compared with real expansion or renewal outcomes.
- No specialist team has used the manager view and no customer has seen a report.
- There is no persistence, authentication or multi-tenancy, and one fixed as-of date.

## Next steps

Test the measurement method with a small group of practitioners on synthetic documents;
add a comparison group to one scenario; record how recommendations fared against later
outcomes; calibrate the thresholds once real cohorts exist.
