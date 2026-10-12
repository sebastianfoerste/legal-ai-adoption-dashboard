import { z } from "zod";

export const EVIDENCE_LOOP_SCHEMA = "legal-ai-adoption.evidence-loop.v1";

const isoDate = z.iso.date();
const id = z.string().min(1);

/**
 * Where a record comes from. The engagement layer pins `synthetic: true`; that would force
 * a real observation to lie about itself. Here the origin is stated, and the public store
 * accepts only the first two kinds (see `private-boundary.ts`).
 */
export const originSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("synthetic_fixture") }),
  z.strictObject({
    kind: z.literal("approved_aggregate"),
    approvalRef: z.string().min(1),
    approvedOn: isoDate,
    approvedByRole: z.string().min(1),
  }),
  z.strictObject({
    kind: z.literal("participant_session"),
    studyId: z.string().min(1),
    consentRef: z.string().min(1),
    storageRef: z.string().min(1),
  }),
]);
export type Origin = z.infer<typeof originSchema>;

export const evidenceTypeSchema = z.enum(["past_behaviour", "observed_task", "opinion_on_proposal"]);
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;

export const researchQuestionSchema = z.strictObject({
  id,
  workflow: z.string(),
  question: z.string(),
  evidenceType: evidenceTypeSchema,
  assumptions: z.array(z.string()),
  origin: originSchema,
});
export type ResearchQuestion = z.infer<typeof researchQuestionSchema>;

export const sessionSchema = z.strictObject({
  id,
  studyRound: z.string(),
  kind: z.enum(["interview", "observed_task", "follow_up_task"]),
  heldOn: isoDate,
  // A study code. The key from code to person lives only in the private identity file.
  participantCode: z.string(),
  roleLabel: z.string(),
  experienceBand: z.enum(["0-2 years", "3-7 years", "8+ years"]),
  questionIds: z.array(id).min(1),
  taskPackId: z.string().nullable(),
  origin: originSchema,
});
export type Session = z.infer<typeof sessionSchema>;

const count = z.number().int().nonnegative();

export const taskResultSchema = z.strictObject({
  taskPackId: z.string(),
  completion: z.enum(["completed_unaided", "completed_with_assistance", "not_completed"]),
  assistanceCount: count,
  interpretationErrors: count,
  trustConcerns: count,
  acceptable: z.boolean(),
  // Active minutes to a result that met the task's answer key. `null` if none was reached.
  minutesToAcceptable: z.number().nonnegative().nullable(),
});
export type TaskResult = z.infer<typeof taskResultSchema>;

export const observationSchema = z.strictObject({
  id,
  sessionId: id,
  questionId: id,
  evidenceType: evidenceTypeSchema,
  // What was seen or said. No reading of it: interpretation belongs to the problem record.
  observed: z.string().min(1),
  quotation: z
    .strictObject({
      text: z.string().min(1),
      permission: z.enum(["internal_only", "public_approved"]),
      approvalRef: z.string().nullable(),
    })
    .nullable(),
  taskResult: taskResultSchema.nullable(),
  origin: originSchema,
});
export type Observation = z.infer<typeof observationSchema>;

export const problemSchema = z.strictObject({
  id,
  workflow: z.string(),
  statement: z.string(),
  // The researcher's reading of the observations, kept apart from them and attributed.
  interpretation: z.string(),
  interpretedByRole: z.string(),
  class: z.enum(["quality_control", "workflow_fit", "convenience"]),
  supportingObservationIds: z.array(id),
  contradictingObservationIds: z.array(id),
  feedbackItemIds: z.array(id),
  feedbackThemes: z.array(z.string()),
  accountIds: z.array(id),
  origin: originSchema,
});
export type Problem = z.infer<typeof problemSchema>;

export const decisionStatusSchema = z.enum(["prioritised", "needs_evidence", "deferred", "rejected"]);
export const confidenceSchema = z.enum(["low", "medium", "high"]);
export const deliveryStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "released",
  "deferred",
  "rejected",
]);
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>;
export const outcomeResultSchema = z.enum(["supported", "contradicted", "inconclusive"]);

export const changeSchema = z.strictObject({
  id,
  problemId: id,
  title: z.string(),
  hypothesis: z.string(),
  proposedChange: z.string(),
  ownerRole: z.string(),
  decision: z.strictObject({
    status: decisionStatusSchema,
    confidence: confidenceSchema,
    rationale: z.string().min(1),
    decidedOn: isoDate,
    decidedByRole: z.string(),
    revisitOn: isoDate.nullable(),
  }),
  acceptanceCriteria: z.array(z.strictObject({ id, text: z.string() })),
  criteriaRecordedOn: isoDate.nullable(),
  // The one delivery status. The memo, the feedback queue and the customer review read it here.
  delivery: z.strictObject({
    status: deliveryStatusSchema,
    recordedOn: isoDate,
    implementationRef: z.string().nullable(),
    startedOn: isoDate.nullable(),
    release: z
      .strictObject({
        releasedOn: isoDate,
        evidenceKind: z.enum(["release_note", "changelog", "commit", "demo_recording"]),
        evidenceRef: z.string().min(1),
        criteriaVerified: z.array(id),
      })
      .nullable(),
  }),
  followUp: z
    .strictObject({
      dueOn: isoDate,
      taskPackId: z.string(),
      comparability: z.string(),
      baselineObservationIds: z.array(id),
      followUpObservationIds: z.array(id),
    })
    .nullable(),
  outcome: z
    .strictObject({
      result: outcomeResultSchema,
      assessedOn: isoDate,
      rationale: z.string().min(1),
      alternativeExplanations: z.array(z.string()),
    })
    .nullable(),
  nextDecision: z.strictObject({
    question: z.string(),
    ownerRole: z.string(),
    dueOn: isoDate.nullable(),
  }),
  origin: originSchema,
});
export type Change = z.infer<typeof changeSchema>;

export const studyStatusSchema = z.strictObject({
  id,
  workflow: z.string(),
  plannedParticipants: z.strictObject({ min: count, max: count }),
  recruitmentAuthorised: z.boolean(),
  invitationsSent: count,
  sessionsCompleted: count,
  followUpSessionsCompleted: count,
  packPath: z.string(),
  note: z.string(),
});
export type StudyStatus = z.infer<typeof studyStatusSchema>;

export const evidenceStoreSchema = z.strictObject({
  schema: z.literal(EVIDENCE_LOOP_SCHEMA),
  notice: z.string(),
  study: studyStatusSchema,
  researchQuestions: z.array(researchQuestionSchema),
  sessions: z.array(sessionSchema),
  observations: z.array(observationSchema),
  problems: z.array(problemSchema),
  changes: z.array(changeSchema),
});
export type EvidenceStore = z.infer<typeof evidenceStoreSchema>;
