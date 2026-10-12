# Measurement dictionary

Every measure the dashboard, the feedback pipeline and the research pack report: its
definition, its denominator, what counts as missing, and what it does not show. Thresholds
are uncalibrated judgments and are marked as such.

## 1. Rules that apply everywhere

| Rule | Meaning |
| --- | --- |
| Unknown is not zero | A count that was not captured is `null` and renders as "Unknown". A rate with an unknown side, or a zero denominator, is unknown. |
| Unknown is not success | Unknown evidence never produces "expand", "demonstrated", "supported" or a green status. |
| Counts before percentages | Every rate is shown with numerator and denominator. Below 10 in the denominator the percentage is flagged. |
| As-of date | Every view states its as-of date. Default `2026-07-31`, the date the demo fixtures were written for. Override per request with `?asOf=YYYY-MM-DD`, or for the whole server with `ADOPTION_AS_OF`. A malformed query value is ignored and reported; a malformed environment value stops the server. |
| Incomplete period | A reporting period whose last day has not passed on the as-of date. Its counts will still rise. It is shown, flagged, and excluded from sustained use and from objective checks. |
| Observation and interpretation | What was seen or said is recorded apart from what someone concludes from it. The conclusion names its author's role. |

## 2. Adoption (`lib/engagement/adoption-trend.ts`)

Four-week reporting periods, Monday to Sunday.

| Measure | Definition | Denominator | Not the same as |
| --- | --- | --- | --- |
| Licensed users | Seats held in the practice group at period end | none | Eligible users |
| Eligible users | Licensed users whose role includes the workflow | none | Licensed users |
| Activation | Eligible users with at least one run in the period | Eligible users | Repeat use |
| Repeat use | Eligible users with runs in two or more distinct weeks of the period | Eligible users, so the rate cannot rise while the active group shrinks | Activation |
| Accepted workflow completion | Runs that reached a reviewer-accepted result | Runs started in the period | Activity volume |
| Drop-off after training | Members of the training cohort with no run in the period | Size of the training cohort | Churn |
| Sustained use | Repeat use at or above 50% of eligible users in each of the last three complete periods | as repeat use | A good single period |

Activation, repeat use, accepted completion and sustained use are reported separately and
are never combined into one adoption figure. With fewer than three complete periods,
sustained use is unknown; a short observation window leaves it unproven.

Caveats attached to a rate: `small_cohort` (denominator below 10), `incomplete_period`,
`cohort_changed` (the number of eligible users differs from the previous period, so the two
rates describe different groups).

Workshop attendance, satisfaction ratings and licence counts are not adoption measures and
are not stored as such.

## 3. Time to an acceptable result (`lib/engagement/value.ts`)

The unit of observation is one **attempt** at the task (`taskObservationSchema`).

| Field | Definition |
| --- | --- |
| `status` | `accepted` (reached a result the responsible lawyer accepted), `abandoned` (given up before review finished), `rejected` (reviewed and not accepted) |
| `activeMinutes.producing` | Hands-on time to the first output |
| `activeMinutes.humanReview` | Hands-on review time by the responsible lawyer |
| `activeMinutes.correction` | Hands-on time correcting the output |
| `waitingMinutes` | Time the task sat in a queue between steps. Not effort. |
| `elapsedMinutes` | Start to acceptance or abandonment, waiting included |
| `reworked` | Sent back at least once before acceptance |
| `qualityFailure` | Material error found at or after sign-off |

| Measure | Definition | Denominator |
| --- | --- | --- |
| Task total | producing + review + correction for one task. Unknown if any of the three is missing. | none |
| **Median active time per accepted result** | Median of the task totals of accepted attempts | Accepted attempts with a complete time record |
| Component medians | Median of each step on its own. Shown for diagnosis. They need not add up to the median above. | Accepted attempts |
| Accepted share | Accepted attempts | All attempts, abandoned and rejected included |
| Active minutes per accepted result | All active minutes, failed attempts included | Accepted attempts |
| Median elapsed time | Median of `elapsedMinutes` of accepted attempts | Accepted attempts with elapsed time recorded |
| Quality-failure rate | Accepted results with a quality failure | Accepted results that were checked |
| Rework rate | Accepted results that were reworked | Accepted results with rework recorded |

**Component summaries.** Where a team recorded only one median per step and kept no
per-task rows (`basis: "component_summary"`), the dashboard shows the figure as "Sum of
component medians (not an observed median of task totals)". It reports no median total, no
accepted share and no verdict for that measurement, and the customer objective that depends
on it stays unknown.

**Productivity and quality are assessed separately.**

| Assessment | Improved or not worse when | Otherwise |
| --- | --- | --- |
| Productivity | Median active time fell by at least 10% and the accepted share did not fall | Not improved |
| Quality | Neither the quality-failure rate nor the rework rate rose | Worse |
| Value verdict | Both of the above hold | Not demonstrated |

The verdict is unknown when a phase has fewer than 10 timed, accepted results, when quality
failures were not captured, when a phase is a component summary, or when there is no
follow-up. Waiting time never enters the verdict.

**Missingness is reported, not imputed.** An accepted result without a complete time record
is left out of the median and counted in a caveat. A duplicated task record (same id) is
counted once and reported. Elapsed time recorded for only part of the sample is stated as
"n of m recorded".

**Attribution.** A before-and-after comparison without a comparison group shows a
difference, not a cause. Concurrent changes are listed next to every result.

**Financial illustration.** Calculated only for a demonstrated verdict with recorded cost
and volume assumptions: saved minutes ÷ 60 × yearly results × hourly cost. It is labelled
an illustration and prints its formula and assumptions.

### Correction of earlier figures

Before 6 October 2026 the dashboard added the three component medians and reported the sum
as the median time to an acceptable result. On the two scenario fixtures:

| Scenario | Reported before | Corrected median of task totals |
| --- | --- | --- |
| A, before the intervention | 150 min | 167.5 min (10 accepted of 12 attempts) |
| A, after | 80 min | 90 min (30 of 31) |
| B, before the refresher training | 210 min | 222.5 min (24 of 27) |
| B, after | 245 min | 260 min (26 of 32) |

The component medians are unchanged (25/70/55, 20/45/15, 35/90/85, 30/105/110). The
direction of both scenarios is unchanged; the financial illustration for scenario A moved
from about EUR 42,100 to about EUR 46,600 a year. All figures are synthetic.

## 4. Practitioner task measures (`lib/evidence/schema.ts`, research pack)

One record per participant per observed task.

| Field | Definition |
| --- | --- |
| `completion` | `completed_unaided`, `completed_with_assistance`, `not_completed`: whether a final decision was stated within the task time |
| `assistanceCount` | Moderator prompts that gave direction |
| `interpretationErrors` | Times the participant misread what the output or a status means |
| `trustConcerns` | Distinct stated or shown concerns about relying on the output |
| `acceptable` | The result meets the task's answer key |
| `minutesToAcceptable` | Active minutes to an acceptable result; empty if none was reached |

`completion` and `acceptable` are independent. A confident wrong sign-off is
`completed_unaided` and not acceptable.

Evidence types, strongest first: `observed_task`, `past_behaviour`, `opinion_on_proposal`.
A priority cannot rest on opinions about a proposal alone.

A follow-up comparison sets baseline and follow-up measures side by side as counts. With
four to eight sessions per round no percentage is reported. Every comparison lists
returning participants (learning effect), new participants, document differences and the
number of sessions.

## 5. Change status (`data/evidence-loop.json`)

| Field | Values | Rule |
| --- | --- | --- |
| Decision | `prioritised`, `needs_evidence`, `deferred`, `rejected` | Carries confidence (`low`, `medium`, `high`), rationale, date and role. Confidence is a recorded judgment. |
| Delivery | `not_started`, `in_progress`, `released`, `deferred`, `rejected` | `released` requires release evidence. Delivery requires a prior decision to prioritise and acceptance criteria recorded before implementation started. Rank never sets it. |
| Outcome | `supported`, `contradicted`, `inconclusive`; derived `awaiting_evidence`, `not_applicable` | Requires a release and a follow-up observation held after it. `supported` and `contradicted` require task measures on both sides. A release without an assessed follow-up is `awaiting_evidence`. |

The routing status of a feedback item (`new`, `triaged`, `shared_with_product`) describes
triage inside the vendor. It is not a delivery status and is not evidence of customer value.

## 6. Feedback priority score (`product-feedback-loop`, formula v2)

| Term | Definition |
| --- | --- |
| Severity weight | blocker 4, high 3, medium 2, low 1 |
| Reach | Distinct accounts that raised the theme |
| Account signal | ARR-band weight (0 to 4) × renewal-risk weight (1.0 to 1.5). Unknown when the band is not recorded. |
| Commercial factor | 1 + mean known account signal ÷ 6. Between 1 and 2. |
| Score | Severity weight × reach × commercial factor |

Reach enters once. An account with no contract value has signal 0 and still counts towards
reach. An account without a recorded band is left out of the mean and named in the output.

Themes classed `quality_control` form a separate lane that is listed first and ordered by
severity, then reach. Commercial size does not order that lane.

All weights are judgments. `WEIGHTS["reviewed_on"]` is empty until a named person has
reviewed them, and every output prints that state.

## 7. Health score and expansion

Unchanged by this work. The health score (`lib/health.ts`) summarises licence use, trend
and reviewed completion. Expansion readiness (`lib/engagement/expansion.ts`) is decided
from six evidence criteria and never from the health score. Product-change evidence is
shown in the customer review and is not a seventh criterion.
