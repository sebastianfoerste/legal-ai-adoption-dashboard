import type { Engagement, Specialist } from "./schema";

export type ComplexityBand = "low" | "medium" | "high";

export interface ComplexityAssessment {
  points: number;
  band: ComplexityBand;
  drivers: string[];
}

/**
 * Account complexity as a transparent point count, so that two specialists with the same
 * number of accounts are not read as carrying the same load.
 */
export function assessComplexity(complexity: Engagement["complexity"]): ComplexityAssessment {
  const drivers: string[] = [];
  let points = 0;
  if (complexity.practiceGroupsInScope >= 3) {
    points += 1;
    drivers.push(`${complexity.practiceGroupsInScope} practice groups in scope`);
  }
  if (complexity.workingLanguages >= 2) {
    points += 1;
    drivers.push(`${complexity.workingLanguages} working languages`);
  }
  if (complexity.integrationsInFlight > 0) {
    points += Math.min(complexity.integrationsInFlight, 2);
    drivers.push(`${complexity.integrationsInFlight} integration(s) in flight`);
  }
  if (complexity.stakeholderGroups >= 4) {
    points += 1;
    drivers.push(`${complexity.stakeholderGroups} stakeholder groups`);
  }
  if (complexity.regulatedSector) {
    points += 1;
    drivers.push("regulated sector");
  }
  const band: ComplexityBand = points >= 4 ? "high" : points >= 2 ? "medium" : "low";
  return { points, band, drivers };
}

export function plannedHours(specialistId: string, engagements: Engagement[]): number {
  return engagements
    .flatMap((engagement) => engagement.assignments)
    .filter((assignment) => assignment.specialistId === specialistId)
    .reduce((sum, assignment) => sum + assignment.plannedHoursPerWeek, 0);
}

export interface CapacityCheck {
  status: "met" | "not_met" | "unknown";
  detail: string;
  missing: string[];
}

/** Can the lead specialist absorb the extra weekly hours an expansion would need? */
export function checkDeliveryCapacity(
  engagement: Engagement,
  engagements: Engagement[],
  specialists: Specialist[],
): CapacityCheck {
  const lead = engagement.assignments.find((assignment) => assignment.role === "lead");
  const specialist = specialists.find((candidate) => candidate.id === lead?.specialistId);
  if (!engagement.expansionCase) {
    return {
      status: "unknown",
      detail: "No expansion scope is recorded, so the delivery effort cannot be estimated.",
      missing: ["Expansion scope with an estimate of weekly delivery hours"],
    };
  }
  if (!specialist) {
    return {
      status: "unknown",
      detail: "No lead specialist is assigned.",
      missing: ["Lead specialist assignment"],
    };
  }
  const planned = plannedHours(specialist.id, engagements);
  const needed = engagement.expansionCase.additionalDeliveryHoursPerWeek;
  const total = planned + needed;
  const sentence = `${specialist.label} has ${planned} of ${specialist.weeklyCapacityHours} assignable hours planned per week; the expansion needs ${needed} more (${total} in total).`;
  return {
    status: total <= specialist.weeklyCapacityHours ? "met" : "not_met",
    detail: `${sentence} Capacity figures are planning assumptions.`,
    missing: [],
  };
}
