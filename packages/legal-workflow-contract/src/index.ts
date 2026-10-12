import { z } from "zod";

export const workflowEventTypes = [
  "workflow_started",
  "review_started",
  "approved",
  "comment_opened",
  "comment_resolved",
  "lock_conflict",
  "source_verified",
  "review_reopened",
  "share_created",
  "share_expired",
  "share_revoked",
  "workflow_blocked",
] as const;

export const WorkflowEventSchema = z
  .object({
    schema: z.literal("legal-workflow.event.v1"),
    id: z.string().min(1),
    appId: z.string().min(1),
    featureId: z.string().min(1),
    eventType: z.enum(workflowEventTypes),
    status: z.string().min(1),
    occurredAt: z.iso.datetime(),
    durationMs: z.number().int().nonnegative().optional(),
    timeSavedMs: z.number().int().nonnegative().optional(),
    reviewerRole: z.string().min(1).optional(),
    workflowVersion: z.number().int().positive().optional(),
    workflowRunId: z.string().min(1).optional(),
    productId: z.string().min(1).optional(),
    practiceGroup: z.string().min(1).optional(),
    resourceCount: z.number().int().nonnegative().optional(),
    expiresAt: z.iso.datetime().optional(),
    guestAccess: z.boolean().optional(),
    accessReviewDueAt: z.iso.datetime().optional(),
    synthetic: z.literal(true),
  })
  .strict();

export type WorkflowEvent = z.infer<typeof WorkflowEventSchema>;

export function parseWorkflowEvents(input: unknown): WorkflowEvent[] {
  return z.array(WorkflowEventSchema).min(1).parse(input);
}
