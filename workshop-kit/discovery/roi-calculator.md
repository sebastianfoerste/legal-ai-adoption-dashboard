# Legal AI ROI Calculation Worksheet

**Use this when** you need to show how a time difference would translate into money, and want every assumption behind the figure in view.

> **Correction, 6 October 2026.** Earlier versions called this worksheet "data-backed" and presented its table as value realised. The table is an illustration built from assumed inputs. Its time figures count verification only and leave out the time to produce the AI output and to correct it; its rates are assumed billable rates. No figure below was measured, and none is a forecast. For a measured comparison use per-task observations as defined in the dashboard's measurement dictionary (`docs/MEASUREMENT_DICTIONARY.md` in the dashboard repository): production, review and correction are totalled per task before the median is taken, abandoned attempts stay in the denominator, and a financial figure is calculated only when time fell and quality did not get worse.

This worksheet gives Customer Success Managers (CSMs) and Legal Engineers one consistent way to illustrate the economic effect of a legal-AI rollout ahead of QBRs and renewal conversations.

---

## 1. Key Value Metrics & Formulas

To illustrate the direct value for a practice group, the worksheet multiplies the frequency of a task by the assumed difference between manual processing and AI-assisted work.

### Formula A: Weekly Time Saved (Hours)
$$\text{Hours Saved/Week} = \frac{\text{Weekly Frequency} \times (\text{Manual Baseline Duration (mins)} - \text{AI Verification Duration (mins)})}{60}$$

### Formula B: Annual Direct Value ($)
$$\text{Annual Direct Value} = \text{Weekly Hours Saved} \times 52 \text{ weeks} \times \text{Blended Billable Rate}$$

*Note: Use a blended associate billable rate (typically \$300–\$450 depending on firm tier and region) to represent the billable capacity freed up for strategic client work.*

### Formula C: Net Value & ROI
$$\text{Net Annual Value} = \text{Annual Direct Value} - \text{Annual Software License Cost}$$
$$\text{ROI (\%)} = \left( \frac{\text{Net Annual Value}}{\text{Annual Software License Cost}} \right) \times 100$$

---

## 2. Sample Calculation Table (Corporate & Litigation Rollouts)

Below is an illustration from assumed inputs (taken from `examples/synthetic-input.json` and the dashboard practice groups; nothing in it is calibrated against observed work):

| Practice Group | Target Workflow | Weekly Volume | Manual Time | Verification Time | Net Time Saved | Weekly Hours Saved | Annual Direct Value (@\$350/hr) |
|---|---|---:|---:|---:|---:|---:|---:|
| **Corporate** | NDA first-pass review | 12.5 | 45 min | 10 min | 35 min | 7.3 hrs | \$132,860 |
| **Litigation** | Research memo draft | 3.5 | 180 min | 90 min | 90 min | 5.3 hrs | \$96,460 |
| **Corporate** | Version clause compare | 9.0 | 30 min | 8 min | 22 min | 3.3 hrs | \$60,060 |
| **Corporate** | DPA review (GDPR) | 3.5 | 60 min | 25 min | 35 min | 2.0 hrs | \$36,400 |
| **Total Portfolio** | | **28.5** | | | | **17.9 hrs** | **\$325,780** |

### Annual Economic Return Summary
- **Total Hours Saved per Year:** 930.8 hours
- **Annual Direct Value (Re-allocated Capacity):** \$325,780
- **Assumed Annual License Cost (e.g., 50 seats):** \$75,000
- **Net Annual Value:** \$250,780
- **Total Portfolio ROI:** **334.4%**

---

## 3. Playbook: Leveraging ROI in Renewal Conversations

When preparing for a renewal or seat-expansion discussion, present this worksheet alongside the **Account Health Dashboard** statistics:

0. **State the basis first:** say which inputs are estimates and which were measured. If none was measured, present the table as a hypothesis to test in a pilot.
1. **Reconcile with Utilization Data:** Match the "Weekly Volume" in this worksheet with the active queries and weekly active user counts shown on the dashboard homepage.
2. **Handle Partner Skepticism Proactively:** If a partner questions the value, frame the time savings as "recovered capacity." Say that the illustration assumes **17.9 hours per week** of associate time would be freed and redeployed to other work of the same value. Both the saving and the redeployment are assumptions until measured.
3. **Link to Blocker Mitigation:** If blockers (e.g., `trust_in_output`) were resolved during the quarter, show what was observed after the blocker was resolved, and state that a link between the two is plausible and not established without a comparison group.
