# Ten-minute demonstration guide

A walk through the dashboard for someone who manages legal engineers or product specialists
after the sale. It follows two synthetic accounts: one where adoption stalled and recovered,
and one where heavy use hides a workflow that does not yet deliver value.

Everything shown is synthetic. The accounts, specialists and figures are invented, and the
dashboard connects to no vendor system.

## Before you start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. All views default to one as-of date, 31 July 2026, so the
numbers below match what is on screen. Add `?asOf=YYYY-MM-DD` to a page to see the same
records on another date; each page prints the date and where it came from.

Correction, 6 October 2026: earlier versions of this document gave 150 to 80 minutes for scenario A and 210 to 245 minutes for scenario B. Those figures were the sum of three component medians, which is not a median. The figures here are medians of per-task totals. See [the measurement dictionary](MEASUREMENT_DICTIONARY.md).

For the research-to-change part of the product, continue with the
[evidence-loop demonstration](#evidence-loop-demonstration-six-minutes) below.

## The walk-through

### 0:00 to 1:00. Portfolio (`/`)

Five accounts with a health band each. Point to two tiles in the status strip: one account
is "Healthy", and one account has "Expansion evidence met". Scroll to the account cards and
show that these are different accounts. Brightmoor & Associates is healthy at 81 and carries
the recommendation "Adjust". Stadtwerke Aurich is steady at 67 and carries "Expand".

The point to make: the health score measures use and reviewed output. It is a triage aid
and is not an input to the expansion recommendation.

### 1:00 to 3:30. Scenario A: stalled adoption, diagnosed and recovered (`/accounts/acct-005`)

Scroll to **Adoption over time**.

- Onboarding period: 7 of 8 eligible lawyers active, 5 of 8 repeat users. Training worked.
- Two periods later: 3 of 8 active, 1 of 8 repeat users, drop-off after training 5 of 8.
- Open "Definitions and denominators". Licensed (10), eligible (8) and active users are
  separate columns. Repeat use is divided by eligible users, so the rate cannot rise while
  the active group shrinks.
- The first period shows "Unknown" for completed workflows because the sign-off step was
  not yet configured. The last row is marked incomplete. Every rate on fewer than ten users
  carries a small-cohort mark.

Scroll to **Interventions**, card `int-001`. Read the chain aloud: observed problem,
three pieces of evidence, the hypothesis that training is not the constraint, the action,
the expected result with a date, three follow-up observations, and the evaluated outcome.

Scroll up to **Customer value**. Median active time per accepted result fell from 167.5
to 90 minutes. Each task's production, review and correction time is totalled first and
the median is taken over those totals; the three component columns are shown beside it and
do not add up to it. Ten of 12 attempts were accepted before and 30 of 31 after. Elapsed
time, waiting included, barely moved, and the page keeps it out of the verdict. Quality failures fell from 3 of 10 to 2 of
30 and rework from 5 of 10 to 4 of 30. Then read the right-hand column, "Assumed, not
established": there is no comparison group, and a clause-library release landed inside the
follow-up window. The financial illustration below prints its formula and five assumptions.

### 3:30 to 4:30. Interventions across the portfolio (`/interventions`)

Seven interventions in four stages. Two cards carry the argument:

- `int-002` is completed and amber. The session was delivered; no follow-up observation
  exists; the card states that success is not established.
- `int-004` is evaluated with the result "not achieved". The refresher training was
  delivered in full and activity rose, while completion fell and correction time grew.

### 4:30 to 6:30. Scenario B: high activity, expansion inappropriate (`/accounts/acct-004`)

The customer asks for 40 further seats. Start at **Expansion readiness**:

- Demonstrated workflow value: not met. Median active time per accepted draft rose from
  222.5 to 260 minutes; 26 of 32 attempts were accepted against 24 of 27; quality failures rose from 5 of 24 to 9 of 26.
- Sustained use: unknown. Repeat users for one period were not captured, and the panel
  lists that as missing evidence instead of treating it as a pass.
- Unresolved blocker: not met. Customer demand: met, with the caveat that a request is not
  evidence of value. Sponsor support: unknown after a sponsor change. Delivery capacity:
  not met.

Scroll to **Adoption over time**: 19 of 20 eligible users active, and 45 of 141 started
runs completed. Then show `int-005`, the scoped six-week trial that replaces the failed
training hypothesis. The recommendation is "Adjust": change the programme before any
further investment.

### 6:30 to 8:00. Manager decisions (`/manager`)

- **Why each account receives attention.** Ardent & Roe is first with three act-now
  reasons: an open escalation, a commitment 21 days overdue and a renewal date in 30 days.
  Each reason names the record it rests on. Account size is not part of the order.
- **Specialist assignments and capacity.** Specialist B has 28 of 30 assignable hours
  planned and one high-complexity account. The card says that late commitments may reflect
  load before they reflect practice. Specialists appear in roster order and carry no score.
- **Coaching actions.** Each links to an intervention. One recognises good diagnostic
  practice; two address practice to change.

### 8:00 to 9:15. Customer review report (`/accounts/acct-005/review`)

Seven sections: objectives, adoption trends, intervention outcomes, quality evidence,
unresolved problems, recommendation, owners and next review dates. Click "Download
Markdown". The file name starts with `synthetic-` and the first and last lines carry the
synthetic notice. Open `/accounts/acct-004/review` for the contrasting report, or the
Command Center for the list of all five.

### 9:15 to 10:00. What holds this together

```bash
pnpm test
```

The rules shown on screen are small pure functions under `lib/engagement/`, each with
tests: stage derivation, denominators, the value verdict, the six expansion criteria and
the decision rule. Close with the limits below.

## Evidence-loop demonstration (six minutes)

This part shows how an observation becomes a product change and how a follow-up tests it.
Every case is synthetic. No practitioner has taken part and no change shown was shipped.

### 0:00 to 1:00. The empty state (`/research`)

Start at **Practitioner study**. Recruitment is not authorised, no invitation has been sent
and no session has been held. The page lists what has to happen first and shows no
practitioner finding. Say that the cases below it are fixtures that exercise the workflow.

### 1:00 to 3:00. One chain, end to end (`/research#chg-001`)

Read the card from top to bottom: research questions RQ1 and RQ3, three observations with
their evidence type, the interpretation and who wrote it, the hypothesis, the priority
decision with its confidence and rationale, two acceptance criteria recorded before
implementation started, the release with its evidence reference, and the follow-up. In the
comparison table neither baseline session reached an acceptable result and both follow-up
sessions did. Then read "Other plausible causes": both participants had seen the defect type
before, and the second document is shorter. The outcome is "supported" for two cases.
Select an observation id to jump to its source row at the foot of the page.

### 3:00 to 4:30. What the loop refuses to say

- `chg-002` is released and **contradicted**: prompts and misreadings did not fall.
- `chg-003` ranks first in the feedback backlog and is **in progress**. Rank does not ship.
- `chg-009` is released and **awaiting evidence**; the follow-up is three days overdue and
  one acceptance criterion was not verified at release. Add `?asOf=2026-07-20` and the
  follow-up is merely due. It is still not a result.
- `chg-006` has two supporting reports and one contradicting, so the decision is "needs
  evidence". `chg-007` is rejected because it removes the review point. `chg-005` is
  deferred with a revisit date.

### 4:30 to 5:15. The same record in the queue and the review

Open `/feedback`. Each item shows its routing separately from the change record: evidence,
confidence, delivery, outcome, owner, missing observations and the next decision. Ten of
sixteen items have no change record and say so. Open `/accounts/acct-003/review`, section 5:
the released change appears as "awaiting evidence" and does not enter the recommendation.

### 5:15 to 6:00. One source of status

Run the feedback pipeline:

```bash
make feedback-check
```

Open `product-feedback-loop/examples/product-memo.md`. The memo reads its status from
`data/evidence-loop.json`, the file the dashboard reads. The superseded memo in
`product-feedback-loop/examples/superseded/` printed "shipped" for whatever ranked first.

## Questions a reviewer may ask

**Why does the healthy account not get an expansion recommendation?** Health counts licence
use, usage trend and the share of outputs that passed human review. It does not measure
whether a workflow reaches an acceptable result faster or with fewer errors.

**What happened to feedback in the health score?** The earlier formula gave 20% of the
score to the share of feedback items forwarded to Product. Forwarding is a vendor process
step, so it was removed. The count is still displayed, labelled as not counted.

**Is the EUR figure a saving?** No. It is an illustration that holds only if all five
printed assumptions hold, including the one the page itself marks as not established.

**Does the renewal panel predict churn?** No. It lists recorded signals and suggests when
to hold a human review. It outputs no probability and no score.

## Limits to state in the room

- The data is invented to make the logic visible. It shows how the model reasons and says
  nothing about what happens in real accounts.
- Thresholds are judgment calls and are uncalibrated: ten for a small cohort or sample, 50%
  of eligible users for sustained use over three periods, 10% for a time improvement.
- Medians are compared without dispersion or a significance test.
- The evidence-loop cases are fixtures. They show that the record can hold a supported, a
  contradicted, an inconclusive and an open result; they are not findings.
- Nothing has been used by a real specialist team or shown to a real customer.
