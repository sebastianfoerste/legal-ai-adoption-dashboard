import { z } from "zod";
import rawEvents from "../data/legal-workflow-events.json";

export const WorkflowEventSchema = z.object({
  schema: z.literal("legal-workflow.event.v1"), id: z.string().min(1), appId: z.string().min(1), featureId: z.string().min(1),
  eventType: z.enum(["workflow_started", "review_started", "approved", "comment_opened", "comment_resolved", "lock_conflict", "source_verified", "review_reopened", "share_created", "share_expired", "share_revoked", "workflow_blocked"]),
  status: z.string().min(1), occurredAt: z.iso.datetime(), durationMs: z.number().int().nonnegative().optional(), reviewerRole: z.string().min(1).optional(), workflowVersion: z.number().int().positive().optional(), resourceCount: z.number().int().nonnegative().optional(), expiresAt: z.iso.datetime().optional(), synthetic: z.literal(true),
}).strict();

export type WorkflowEvent = z.infer<typeof WorkflowEventSchema>;
export function parseWorkflowEvents(input: unknown): WorkflowEvent[] { return z.array(WorkflowEventSchema).min(1).parse(input); }

export function workflowGovernanceSnapshot(events = parseWorkflowEvents(rawEvents)) {
  const durations = (type: string) => events.filter((event) => event.eventType === type && event.durationMs !== undefined).map((event) => event.durationMs as number);
  const averageMinutes = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length / 60000) : 0;
  const approvals = events.filter((event) => event.eventType === "approved").length;
  const reviewerEvents = events.filter((event) => event.reviewerRole);
  const shares = events.filter((event) => event.eventType.startsWith("share_"));
  const now = new Date("2026-07-13T00:00:00Z");
  const alerts = shares.flatMap((share) => {
    const result: Array<{ eventId: string; severity: "high" | "medium"; reason: string }> = [];
    if ((share.resourceCount ?? 0) > 20) result.push({ eventId: share.id, severity: "high", reason: "Share exposes more than 20 resources." });
    if (share.expiresAt && new Date(share.expiresAt).getTime() - now.getTime() > 90 * 86400000) result.push({ eventId: share.id, severity: "medium", reason: "Share expiry exceeds the 90-day review window." });
    if (share.status === "active" && share.expiresAt && new Date(share.expiresAt) <= now) result.push({ eventId: share.id, severity: "high", reason: "Active share is expired." });
    return result;
  });
  return {
    schema: "legal-ai-adoption.workflow-governance.v1" as const,
    workflowAnalytics: { events: events.length, apps: new Set(events.map((event) => event.appId)).size, workflowStarts: events.filter((event) => event.eventType === "workflow_started").length, approvals, blockedEvents: events.filter((event) => event.status === "blocked").length, versions: [...new Set(events.flatMap((event) => event.workflowVersion ? [`v${event.workflowVersion}`] : []))] },
    collaborationMetrics: { timeToFirstReviewMinutes: averageMinutes(durations("review_started")), timeToApprovalMinutes: averageMinutes(durations("approved")), commentResolutionMinutes: averageMinutes(durations("comment_resolved")), reopenRatePercent: approvals ? Math.round(events.filter((event) => event.eventType === "review_reopened").length / approvals * 100) : 0, lockContention: events.filter((event) => event.eventType === "lock_conflict").length, reviewerCoveragePercent: Math.round(reviewerEvents.length / events.length * 100), sourceVerifications: events.filter((event) => event.eventType === "source_verified").length },
    permissionGovernance: { activeShares: shares.filter((event) => event.status === "active").length, expiredShares: shares.filter((event) => event.eventType === "share_expired").length, revokedShares: shares.filter((event) => event.eventType === "share_revoked").length, alerts },
    sourceRef: "data/legal-workflow-events.json", syntheticOnly: true as const, externalMutationAllowed: false as const,
  };
}
