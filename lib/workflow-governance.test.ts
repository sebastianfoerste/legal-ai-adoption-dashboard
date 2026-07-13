import { describe, expect, it } from "vitest";
import { parseWorkflowEvents, workflowGovernanceSnapshot } from "./workflow-governance";

describe("workflow telemetry and governance", () => {
  it("calculates reproducible collaboration metrics", () => {
    const snapshot = workflowGovernanceSnapshot();
    expect(snapshot.workflowAnalytics.events).toBe(12);
    expect(snapshot.collaborationMetrics.commentResolutionMinutes).toBe(90);
    expect(snapshot.collaborationMetrics.lockContention).toBe(1);
    expect(snapshot.workflowAnalytics.timeSavedMinutes).toBe(30);
    expect(snapshot.workflowAnalytics.byPracticeGroup["Financial Regulation"]).toBe(1);
    expect(snapshot.syntheticOnly).toBe(true);
    expect(snapshot.externalMutationAllowed).toBe(false);
  });
  it("flags overbroad and overlong shares", () => {
    const alerts = workflowGovernanceSnapshot().permissionGovernance.alerts;
    expect(alerts.some((alert) => alert.reason.includes("more than 20"))).toBe(true);
    expect(alerts.some((alert) => alert.reason.includes("90-day"))).toBe(true);
    expect(alerts.some((alert) => alert.reason.includes("overdue"))).toBe(true);
    expect(alerts.every((alert) => alert.href.startsWith("#event-"))).toBe(true);
  });
  it("rejects document text and client identifiers", () => {
    expect(() => parseWorkflowEvents([{ schema: "legal-workflow.event.v1", id: "bad", appId: "app", featureId: "feature", eventType: "approved", status: "approved", occurredAt: "2026-07-13T00:00:00Z", synthetic: true, documentText: "secret" }])).toThrow();
    expect(() => parseWorkflowEvents([{ schema: "legal-workflow.event.v1", id: "bad", appId: "app", featureId: "feature", eventType: "approved", status: "approved", occurredAt: "2026-07-13T00:00:00Z", synthetic: true, clientId: "client" }])).toThrow();
  });
  it("returns finite zero metrics for an empty event set", () => {
    const snapshot = workflowGovernanceSnapshot([]);
    expect(snapshot.collaborationMetrics.reviewerCoveragePercent).toBe(0);
    expect(snapshot.workflowAnalytics.byProduct).toEqual({});
    expect(snapshot.workflowAnalytics.byPracticeGroup).toEqual({});
  });
});
