# Legal AI ROI Calculation Worksheet

This worksheet provides Customer Success Managers (CSMs) and Legal Engineers with a standardized, data-backed framework to calculate the economic impact and return on investment (ROI) of legal-AI rollouts ahead of QBRs and renewal conversations.

---

## 1. Key Value Metrics & Formulas

To compute the direct value realized by a practice group, we measure the frequency of tasks and the net duration delta between manual processing and AI-assisted drafting/verification.

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

Below is an economic model based on typical usage inputs (calibrated against `examples/synthetic-input.json` and the dashboard practice groups):

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

1. **Reconcile with Utilization Data:** Match the "Weekly Volume" in this worksheet with the active queries and weekly active user counts shown on the dashboard homepage.
2. **Handle Partner Skepticism Proactively:** If a partner questions the value, frame the time savings as "recovered capacity." Instead of cutting associate heads, emphasize that associates saved **17.9 hours per week** which was re-allocated to high-value briefing memos and client deal strategy.
3. **Link to Blocker Mitigation:** If blockers (e.g., `trust_in_output`) were resolved during the quarter, show how resolving that blocker (e.g., via a citation grounding clinic) unlocked the corresponding practice group's ROI in the table above.
