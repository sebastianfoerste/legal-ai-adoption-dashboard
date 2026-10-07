import type { Account, Blocker } from "./schema";
import type { HealthResult } from "./health";
import type { Recommendation } from "./engagement/expansion";

export interface RecommendedAction {
  title: string;
  description: string;
  deliverable: string;
  targetGroups: string[];
  blockerId?: string;
}

export function recommendAction(
  account: Account,
  blockers: Blocker[],
  health: HealthResult,
  // Review recommendation from the expansion evidence model. Health alone never triggers
  // an expansion play.
  expansion?: Recommendation,
): RecommendedAction {
  // Find open blockers for this account, sorting by severity (high > medium > low)
  const openBlockers = blockers
    .filter((b) => b.accountId === account.id && b.status !== "resolved")
    .sort((a, b) => {
      const severityWeight = { high: 3, medium: 2, low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity];
    });

  // A low-severity blocker is a caveat on an expansion proposal, not a reason to hold it,
  // which mirrors the blocker criterion in the evidence model.
  if (expansion === "expand" && openBlockers.every((b) => b.severity === "low")) {
    return {
      title: "Prepare Bounded Expansion Proposal",
      description: `All six expansion criteria are met on the recorded evidence. Prepare the proposal with its caveats for account-owner review.`,
      deliverable: "Customer Review Report",
      targetGroups: account.practiceGroups.map((g) => g.name),
    };
  }

  if (openBlockers.length > 0) {
    const primaryBlocker = openBlockers[0];

    // Map blocker category to recommended actions
    switch (primaryBlocker.category) {
      case "trust_in_output":
        return {
          title: "Run Citation Grounding Clinic",
          description: `Verify cited quotes and citations in the ${primaryBlocker.affectedGroups.join(" & ")} practice group to address high-severity output concerns.`,
          deliverable: "90-minute Associate Hands-on",
          targetGroups: primaryBlocker.affectedGroups,
          blockerId: primaryBlocker.id,
        };
      case "workflow_fit":
        return {
          title: "Map Custom Workflows",
          description: `Conduct use-case mapping for ${primaryBlocker.affectedGroups.join(" & ")} to align tool capabilities with daily contract templates.`,
          deliverable: "Workflow Discovery Template",
          targetGroups: primaryBlocker.affectedGroups,
          blockerId: primaryBlocker.id,
        };
      case "training_gap":
        return {
          title: "Schedule prompt Fluency Workshop",
          description: `Book a structured Associate hands-on session for ${primaryBlocker.affectedGroups.join(" & ")} to raise prompting proficiency.`,
          deliverable: "90-minute Associate Hands-on",
          targetGroups: primaryBlocker.affectedGroups,
          blockerId: primaryBlocker.id,
        };
      case "integration":
        return {
          title: "Align on Systems Integration",
          description: `Coordinate with the Innovation Lead and IT to resolve technical integration blockers affecting ${primaryBlocker.affectedGroups.join(" & ")}.`,
          deliverable: "30-minute Partner Briefing",
          targetGroups: primaryBlocker.affectedGroups,
          blockerId: primaryBlocker.id,
        };
      case "change_management":
        return {
          title: "Secure Partner Sponsorship",
          description: `Conduct a partner-briefing session on rollout economics to drive change management in ${primaryBlocker.affectedGroups.join(" & ")}.`,
          deliverable: "30-minute Partner Briefing",
          targetGroups: primaryBlocker.affectedGroups,
          blockerId: primaryBlocker.id,
        };
      case "pricing_value":
        return {
          title: "Conduct Value & ROI Review",
          description: `Review utilization metrics and construct a value scorecard to address pricing concerns ahead of renewal.`,
          deliverable: "Use-case Prioritization Matrix",
          targetGroups: primaryBlocker.affectedGroups,
          blockerId: primaryBlocker.id,
        };
    }
  }

  // No open blockers, look at health and expansion readiness
  if (health.band === "at_risk" || health.band === "needs_attention") {
    // Collect all unique practice group names
    const allGroups = account.practiceGroups.map((g) => g.name);
    return {
      title: "Stakeholder Pulse Check",
      description: `Account health has dropped to ${health.band === "at_risk" ? "At Risk" : "Needs Attention"}. Proactively schedule a touchpoint to uncover hidden blockers.`,
      deliverable: "Adoption Questionnaire",
      targetGroups: allGroups,
    };
  }

  // Steady / healthy state
  return {
    title: "Maintain Standard Engagement",
    description: "Account is in a steady and healthy state. Continue sharing feature release notes and checking in on standard QBR cadence.",
    deliverable: "60-minute Workshop Agenda",
    targetGroups: account.practiceGroups.map((g) => g.name),
  };
}
