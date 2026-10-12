# Legal AI Pilot Plan — Brightmoor & Associates LLP (synthetic)

**Date:** 2026-06-23  
**Sponsor Group:** Corporate  
**Champion:** Innovation lead, ~0.5 FTE allocated, can reach a sponsoring partner  
**Readiness Band:** READY (Readiness Score: 24/30)

---

## 1. Selected Pilot Workflow

We analyzed the candidate workflows submitted in the discovery intake and selected the highest-ROI opportunity for the initial pilot phase.

### Primary Candidate: NDA first-pass review
* **Trigger:** inbound NDA ahead of a deal
* **Frequency:** 10-15 per week
* **Time Savings:** From ~45 min/instance (associate) down to ~10 min verification (Net saving: 35 mins per instance)
* **Human-in-the-Loop Verification Gate:** partner sign-off on the marked-up NDA
* **Estimated Impact:** **7.3 hours saved per week** across the practice group.

### Other Scored Use Cases
2. **Litigation research memo**
   * Frequency: 3-4 per week | Net saving: 90 mins/instance
   * Impact: 5.2 hours/week saved
3. **Clause comparison across versions**
   * Frequency: 8-10 per week | Net saving: 22 mins/instance
   * Impact: 3.3 hours/week saved
4. **DPA review (GDPR)**
   * Frequency: 3-4 per week | Net saving: 35 mins/instance
   * Impact: 2.0 hours/week saved
5. **Document / issue summary**
   * Frequency: daily | Net saving: 10 mins/instance
   * Impact: 0.0 hours/week saved

---

## 2. Staged Enablement Calendar

To drive successful adoption of **NDA first-pass review** without disrupting client deliverables, we will execute a structured, 3-stage rollout:

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

Pre-filled communications ready to be sent to stakeholders for the **NDA first-pass review** pilot.

### Template A: Pilot Announcement (To Practice Group Associates)
```text
Subject: Launching Legal-AI Pilot: NDA first-pass review automation

All,

As part of our commitment to legal service innovation, we are launching a pilot program targeting the automation of our "NDA first-pass review" workflow within the Corporate practice group.

By utilizing legal AI for the first-pass review, we estimate reducing the baseline task time from ~45 min/instance (associate) down to ~10 min for verification. For our group, this represents an estimated savings of up to 7.3 hours per week, allowing us to spend more time on high-value strategic analysis.

Please note the strict quality policy: the AI output serves as a draft only. The mandatory review gate remains unchanged: partner sign-off on the marked-up NDA.

We will kick off with a hands-on training clinic next week. Keep an eye out for the invite.

Best regards,
CSM / Legal Engineering Team
```

### Template B: Pilot Post-Session Follow-up (To Sponsoring Partner)
```text
Subject: Update: NDA first-pass review AI Pilot Onboarding Completed

Hi,

We completed the associate hands-on clinic for the NDA first-pass review pilot. The team successfully simulated first-pass reviews on synthetic agreements, scoring model risk-flags and practicing citation verification.

Key stats from the training intake:
- Baseline task duration: ~45 min/instance (associate)
- Target verification duration: ~10 min
- Estimated weekly efficiency gain: ~7.3 hours for the group

We will monitor adoption and blockers weekly, routing feedback to Product. I will share our first health assessment in two weeks.

Best,
CSM / Legal Engineering Team
```
