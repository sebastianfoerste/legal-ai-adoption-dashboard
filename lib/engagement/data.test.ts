import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getAccounts, getBlockers } from "../data";
import {
  ENGAGEMENT_SOURCE_FILES,
  getAdoptionSeries,
  getEngagements,
  getInterventions,
  getTeam,
  getValueMeasurements,
} from "./data";
import { daysBetween } from "./as-of";
import { engagementSchema } from "./schema";

const accountIds = new Set(getAccounts().map((account) => account.id));
const specialistIds = new Set(getTeam().specialists.map((specialist) => specialist.id));

describe("engagement data", () => {
  it("marks every record as synthetic", () => {
    const records = [
      ...getAdoptionSeries(),
      ...getEngagements(),
      ...getInterventions(),
      ...getValueMeasurements(),
      ...getTeam().specialists,
      ...getTeam().commitments,
      ...getTeam().escalations,
      ...getTeam().coachingActions,
    ];
    expect(records.length).toBeGreaterThan(20);
    expect(records.every((record) => record.synthetic === true)).toBe(true);
  });

  it("has one engagement record per account and no orphans", () => {
    expect(getEngagements().map((e) => e.accountId).sort()).toEqual([...accountIds].sort());
    const referenced = [
      ...getAdoptionSeries(),
      ...getInterventions(),
      ...getValueMeasurements(),
      ...getTeam().commitments,
      ...getTeam().escalations,
    ].map((record) => record.accountId);
    expect(referenced.every((id) => accountIds.has(id))).toBe(true);
  });

  it("references only known specialists and blockers", () => {
    const blockerIds = new Set(getBlockers().map((blocker) => blocker.id));
    for (const engagement of getEngagements()) {
      expect(engagement.assignments.every((a) => specialistIds.has(a.specialistId))).toBe(true);
      expect(engagement.assignments.filter((a) => a.role === "lead")).toHaveLength(1);
      expect(specialistIds.has(engagement.reviewOwnerId)).toBe(true);
    }
    for (const intervention of getInterventions()) {
      expect(specialistIds.has(intervention.assignedSpecialistId)).toBe(true);
      if (intervention.blockerId) expect(blockerIds.has(intervention.blockerId)).toBe(true);
    }
    const interventionIds = new Set(getInterventions().map((i) => i.id));
    expect(getTeam().coachingActions.every((c) => interventionIds.has(c.evidenceRef))).toBe(true);
  });

  it("names specialists by role label only", () => {
    expect(getTeam().specialists.map((s) => s.label)).toEqual([
      "Specialist A",
      "Specialist B",
      "Specialist C",
    ]);
  });

  it("uses contiguous four-week reporting periods with consistent counts", () => {
    for (const series of getAdoptionSeries()) {
      series.periods.forEach((period, index) => {
        expect(daysBetween(period.start, period.end)).toBe(27);
        if (index > 0) expect(daysBetween(series.periods[index - 1].end, period.start)).toBe(1);
        const { licensedUsers, eligibleUsers, activeUsers, repeatUsers } = period;
        if (licensedUsers !== null && eligibleUsers !== null) {
          expect(eligibleUsers).toBeLessThanOrEqual(licensedUsers);
        }
        if (eligibleUsers !== null && activeUsers !== null) {
          expect(activeUsers).toBeLessThanOrEqual(eligibleUsers);
        }
        if (activeUsers !== null && repeatUsers !== null) {
          expect(repeatUsers).toBeLessThanOrEqual(activeUsers);
        }
        if (period.workflowsStarted !== null && period.workflowsCompleted !== null) {
          expect(period.workflowsCompleted).toBeLessThanOrEqual(period.workflowsStarted);
        }
      });
    }
  });

  it("includes the two scenarios, each labelled synthetic", () => {
    const scenarios = getEngagements().flatMap((e) => (e.scenario ? [e.scenario] : []));
    expect(scenarios.map((s) => s.id).sort()).toEqual(["scenario-a", "scenario-b"]);
    expect(scenarios.every((s) => s.label.startsWith("Synthetic scenario"))).toBe(true);
  });

  it("rejects unknown keys such as client identifiers", () => {
    const [engagement] = getEngagements();
    expect(engagementSchema.safeParse({ ...engagement, clientContact: "x" }).success).toBe(false);
  });

  it("lists every engagement source file that exists on disk", () => {
    for (const file of ENGAGEMENT_SOURCE_FILES) {
      expect(() => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8")).not.toThrow();
    }
  });
});

describe("shared telemetry allowlist", () => {
  it("is unchanged by the engagement model", () => {
    const contract = JSON.parse(
      readFileSync(
        new URL(
          "../../packages/legal-workflow-contract/schema/legal-workflow.event.v1.schema.json",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    expect(contract.items.additionalProperties).toBe(false);
    expect(Object.keys(contract.items.properties)).toEqual([
      "schema",
      "id",
      "appId",
      "featureId",
      "eventType",
      "status",
      "occurredAt",
      "durationMs",
      "timeSavedMs",
      "reviewerRole",
      "workflowVersion",
      "workflowRunId",
      "productId",
      "practiceGroup",
      "resourceCount",
      "expiresAt",
      "guestAccess",
      "accessReviewDueAt",
      "synthetic",
    ]);
  });
});
