#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

def parse_frequency(freq_str):
    freq_str = freq_str.lower()
    # Extract numbers (handles ranges like "10-15" or single values like "8")
    numbers = [float(x) for x in re.findall(r'\d+\.?\d*', freq_str)]
    if not numbers:
        return 0.0
    avg = sum(numbers) / len(numbers)
    if "daily" in freq_str or "day" in freq_str:
        return avg * 5.0  # 5 working days in a week
    return avg

def parse_duration_to_mins(dur_str):
    dur_str = dur_str.lower()
    numbers = [float(x) for x in re.findall(r'\d+\.?\d*', dur_str)]
    if not numbers:
        return 0.0
    val = numbers[0]
    if "hour" in dur_str or "hr" in dur_str:
        return val * 60.0
    return val

def generate_plan(input_path, output_path):
    # Load input JSON
    try:
        data = json.loads(Path(input_path).read_text(encoding="utf-8"))
    except Exception as e:
        print(f"Error reading/parsing input file {input_path}: {e}")
        sys.exit(1)

    account_name = data.get("account", "Unnamed Account")
    group_name = data.get("group", "General")
    champion_info = data.get("champion", "No champion info listed")
    readiness = data.get("readinessScore", {})
    readiness_score = readiness.get("total", 0)
    readiness_band = readiness.get("band", "unknown")

    # Score workflows
    scored_workflows = []
    for wf in data.get("candidateWorkflows", []):
        name = wf.get("name", "Unnamed Workflow")
        freq_val = parse_frequency(wf.get("frequency", ""))
        time_val = parse_duration_to_mins(wf.get("timeCost", ""))
        verify_val = parse_duration_to_mins(wf.get("verificationCost", ""))
        saving_mins = max(0.0, time_val - verify_val)
        roi_hours = (saving_mins * freq_val) / 60.0

        scored_workflows.append({
            "name": name,
            "trigger": wf.get("trigger", "N/A"),
            "frequency": wf.get("frequency", "N/A"),
            "timeCost": wf.get("timeCost", "N/A"),
            "verificationCost": wf.get("verificationCost", "N/A"),
            "mandatoryReview": wf.get("mandatoryReview", "N/A"),
            "saving_mins": saving_mins,
            "roi_hours": roi_hours,
            "raw": wf
        })

    # Sort by ROI descending
    scored_workflows.sort(key=lambda x: x["roi_hours"], reverse=True)

    if not scored_workflows:
        print("No candidate workflows found in input.")
        sys.exit(1)

    top_wf = scored_workflows[0]

    # Render other use cases
    other_cases = []
    for idx, wf in enumerate(scored_workflows[1:], start=2):
        other_cases.append(
            f"{idx}. **{wf['name']}**\n"
            f"   * Frequency: {wf['frequency']} | Net saving: {wf['saving_mins']:.0f} mins/instance\n"
            f"   * Impact: {wf['roi_hours']:.1f} hours/week saved"
        )
    scored_list_str = "\n".join(other_cases) if other_cases else "*None.*"

    # Fill Markdown template
    markdown_template = f"""# Legal AI Pilot Plan — {account_name}

**Date:** 2026-06-23  
**Sponsor Group:** {group_name}  
**Champion:** {champion_info}  
**Readiness Band:** {readiness_band.upper()} (Readiness Score: {readiness_score}/30)

---

## 1. Selected Pilot Workflow

We analyzed the candidate workflows submitted in the discovery intake and selected the highest-ROI opportunity for the initial pilot phase.

### Primary Candidate: {top_wf['name']}
* **Trigger:** {top_wf['trigger']}
* **Frequency:** {top_wf['frequency']}
* **Time Savings:** From {top_wf['timeCost']} down to {top_wf['verificationCost']} verification (Net saving: {top_wf['saving_mins']:.0f} mins per instance)
* **Human-in-the-Loop Verification Gate:** {top_wf['mandatoryReview']}
* **Estimated Impact:** **{top_wf['roi_hours']:.1f} hours saved per week** across the practice group.

### Other Scored Use Cases
{scored_list_str}

---

## 2. Staged Enablement Calendar

To drive successful adoption of **{top_wf['name']}** without disrupting client deliverables, we will execute a structured, 3-stage rollout:

```mermaid
gantt
    title Pilot Rollout Timeline
    dateFormat  D
    axisFormat Day %d
    section Scoping
    Partner Briefing (30 min) :active, d1, 0, 1d
    section Enablement
    Team Workshop (60 min)    : d2, 1d, 2d
    Associate Hands-on (90 min) : d3, 3d, 4d
    section Review
    ROI Assessment & Sign-off : d4, 7d, 8d
```

### Stage 1: Partner Briefing (30 Minutes)
* **Goal:** Secure partner alignment, confirm risk gates, and establish use-case prioritizations.
* **Agenda:** Rollout economics, verification mandate, and path-to-pilot approval.
* **Objection Handling:** Refer to `enablement/skeptical-partner-objections.md` for grounding-rate and liability arguments.

### Stage 2: Team Rollout Workshop (60 Minutes)
* **Goal:** Get the practice group active on the platform and demonstrate baseline prompts.
* **Agenda:** Live demo of the primary workflow, prompt library introduction, and verification guidelines.
* **Asset:** `sessions/60-min-workshop-agenda.md`

### Stage 3: Associate Hands-on Clinic (90 Minutes)
* **Goal:** Build deep prompt fluency and verification discipline through synthetic document drills.
* **Agenda:** Interactive review exercise, scoring mock model outputs, and identifying hallucination edge cases.
* **Asset:** `sessions/90-min-associate-hands-on.md`

---

## 3. Onboarding & Enablement Communication Templates

Pre-filled communications ready to be sent to stakeholders for the **{top_wf['name']}** pilot.

### Template A: Pilot Announcement (To Practice Group Associates)
```text
Subject: Launching Legal-AI Pilot: {top_wf['name']} automation

All,

As part of our commitment to legal service innovation, we are launching a pilot program targeting the automation of our "{top_wf['name']}" workflow within the {group_name} practice group.

By utilizing legal AI for the first-pass review, we estimate reducing the baseline task time from {top_wf['timeCost']} down to {top_wf['verificationCost']} for verification. For our group, this represents an estimated savings of up to {top_wf['roi_hours']:.1f} hours per week, allowing us to spend more time on high-value strategic analysis.

Please note the strict quality policy: the AI output serves as a draft only. The mandatory review gate remains unchanged: {top_wf['mandatoryReview']}.

We will kick off with a hands-on training clinic next week. Keep an eye out for the invite.

Best regards,
CSM / Legal Engineering Team
```

### Template B: Pilot Post-Session Follow-up (To Sponsoring Partner)
```text
Subject: Update: {top_wf['name']} AI Pilot Onboarding Completed

Hi,

We completed the associate hands-on clinic for the {top_wf['name']} pilot. The team successfully simulated first-pass reviews on synthetic agreements, scoring model risk-flags and practicing citation verification.

Key stats from the training intake:
- Baseline task duration: {top_wf['timeCost']}
- Target verification duration: {top_wf['verificationCost']}
- Estimated weekly efficiency gain: ~{top_wf['roi_hours']:.1f} hours for the group

We will monitor adoption and blockers weekly, routing feedback to Product. I will share our first health assessment in two weeks.

Best,
CSM / Legal Engineering Team
```
"""

    # Write out plan
    Path(output_path).write_text(markdown_template, encoding="utf-8")
    print(f"Successfully generated pilot plan at {output_path} based on top workflow: {top_wf['name']}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        # Default paths
        generate_plan("examples/synthetic-input.json", "examples/generated-pilot-plan.md")
    else:
        generate_plan(sys.argv[1], sys.argv[2])
