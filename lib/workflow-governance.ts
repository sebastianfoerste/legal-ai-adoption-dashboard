import { z } from "zod";
import rawEvents from "../data/legal-workflow-events.json";

export const WorkflowEventSchema = z.object({
  schema: z.literal("legal-workflow.event.v1"), id: z.string().min(1), appId: z.string().min(1), featureId: z.string().min(1),
  eventType: z.enum(["workflow_started", "review_started", "approved", "comment_opened", "comment_resolved", "lock_conflict", "source_verified", "review_reopened", "share_created", "share_expired", "share_revoked", "workflow_blocked"]),
  status: z.string().min(1), occurredAt: z.iso.datetime(), durationMs: z.number().int().nonnegative().optional(), timeSavedMs: z.number().int().nonnegative().optional(), reviewerRole: z.string().min(1).optional(), workflowVersion: z.number().int().positive().optional(), workflowRunId: z.string().min(1).optional(), productId: z.string().min(1).optional(), practiceGroup: z.string().min(1).optional(), resourceCount: z.number().int().nonnegative().optional(), expiresAt: z.iso.datetime().optional(), guestAccess: z.boolean().optional(), accessReviewDueAt: z.iso.datetime().optional(), synthetic: z.literal(true),
}).strict();

export type WorkflowEvent = z.infer<typeof WorkflowEventSchema>;
export function parseWorkflowEvents(input: unknown): WorkflowEvent[] { return z.array(WorkflowEventSchema).min(1).parse(input); }

export function workflowGovernanceSnapshot(events = parseWorkflowEvents(rawEvents), now = new Date("2026-07-13T00:00:00Z")) {
  const durations = (type: string) => events.filter((event) => event.eventType === type && event.durationMs !== undefined).map((event) => event.durationMs as number);
  const averageMinutes = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length / 60000) : 0;
  const approvals = events.filter((event) => event.eventType === "approved").length;
  const startedRunIds = new Set(events.filter((event) => event.eventType === "workflow_started" && event.workflowRunId).map((event) => event.workflowRunId as string));
  const completedStartedRuns = new Set(events.filter((event) => event.eventType === "approved" && event.workflowRunId && startedRunIds.has(event.workflowRunId)).map((event) => event.workflowRunId as string));
  const reviewerEvents = events.filter((event) => event.reviewerRole);
  const shares = events.filter((event) => event.eventType.startsWith("share_"));
  const alerts = shares.flatMap((share) => {
    const result: Array<{ eventId: string; severity: "high" | "medium"; reason: string }> = [];
    if ((share.resourceCount ?? 0) > 20) result.push({ eventId: share.id, severity: "high", reason: "Share exposes more than 20 resources." });
    if (share.expiresAt && new Date(share.expiresAt).getTime() - now.getTime() > 90 * 86400000) result.push({ eventId: share.id, severity: "medium", reason: "Share expiry exceeds the 90-day review window." });
    if (share.status === "active" && share.expiresAt && new Date(share.expiresAt) <= now) result.push({ eventId: share.id, severity: "high", reason: "Active share is expired." });
    if (share.status === "active" && share.accessReviewDueAt && new Date(share.accessReviewDueAt) <= now) result.push({ eventId: share.id, severity: "high", reason: "Share access review is overdue." });
    if (share.guestAccess && (share.resourceCount ?? 0) > 10) result.push({ eventId: share.id, severity: "high", reason: "Guest share exposes more than 10 resources." });
    return result;
  });
  return {
    schema: "legal-ai-adoption.workflow-governance.v1" as const,
    workflowAnalytics: { events: events.length, apps: new Set(events.map((event) => event.appId)).size, workflowStarts: events.filter((event) => event.eventType === "workflow_started").length, approvals, completionRatePercent: startedRunIds.size ? Math.round(completedStartedRuns.size / startedRunIds.size * 100) : 0, blockedEvents: events.filter((event) => event.status === "blocked").length, timeSavedMinutes: Math.round(events.reduce((sum, event) => sum + (event.timeSavedMs ?? 0), 0) / 60000), versions: [...new Set(events.flatMap((event) => event.workflowVersion ? [`v${event.workflowVersion}`] : []))], byProduct: countBy(events, (event) => event.productId ?? event.appId), byPracticeGroup: countBy(events.filter((event) => event.practiceGroup), (event) => event.practiceGroup as string) },
    collaborationMetrics: { timeToFirstReviewMinutes: averageMinutes(durations("review_started")), timeToApprovalMinutes: averageMinutes(durations("approved")), commentResolutionMinutes: averageMinutes(durations("comment_resolved")), reopenRatePercent: approvals ? Math.round(events.filter((event) => event.eventType === "review_reopened").length / approvals * 100) : 0, lockContention: events.filter((event) => event.eventType === "lock_conflict").length, reviewerCoveragePercent: Math.round(reviewerEvents.length / events.length * 100), sourceVerifications: events.filter((event) => event.eventType === "source_verified").length },
    permissionGovernance: { activeShares: shares.filter((event) => event.status === "active").length, expiredShares: shares.filter((event) => event.eventType === "share_expired").length, revokedShares: shares.filter((event) => event.eventType === "share_revoked").length, guestShares: shares.filter((event) => event.guestAccess).length, resourcesAcrossShares: shares.reduce((sum, event) => sum + (event.resourceCount ?? 0), 0), overdueAccessReviews: shares.filter((event) => event.status === "active" && event.accessReviewDueAt && new Date(event.accessReviewDueAt) <= now).length, alerts: alerts.map((alert) => ({ ...alert, href: `#event-${alert.eventId}` })) },
    metricDefinitions: {
      completionRatePercent: "Approved events divided by workflow started events.",
      reviewerCoveragePercent: "Events carrying an approved reviewer role divided by all accepted events.",
      reopenRatePercent: "Review reopened events divided by approval events.",
      overdueAccessReviews: "Active shares whose access-review due time is at or before the snapshot time.",
    },
    eventRecords: events.map((event) => ({ id: event.id, appId: event.appId, featureId: event.featureId, eventType: event.eventType, status: event.status, occurredAt: event.occurredAt })),
    sourceRef: "data/legal-workflow-events.json", syntheticOnly: true as const, externalMutationAllowed: false as const,
  };
}

function countBy(events: WorkflowEvent[], key: (event: WorkflowEvent) => string) {
  return Object.fromEntries([...new Set(events.map(key))].sort().map((value) => [value, events.filter((event) => key(event) === value).length]));
}
