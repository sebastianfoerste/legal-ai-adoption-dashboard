import { z } from "zod";
import { practiceGroupSchema, severitySchema } from "../schema";

// Every engagement record is pinned to `synthetic: true` and parsed strictly, the same
// way the telemetry contract rejects unknown keys. A real-data field cannot slip in.
const synthetic = z.literal(true);
const isoDate = z.iso.date();
const practiceGroupName = practiceGroupSchema.shape.name;

// `null` always means "not captured". It is never coerced to zero.
const count = z.number().int().nonnegative().nullable();

export const specialistSchema = z.strictObject({
  id: z.string(),
  label: z.string(), // role label only, never a person's name
  region: z.string(),
  weeklyCapacityHours: z.number().positive(),
  capacityBasis: z.string(),
  synthetic,
});
export type Specialist = z.infer<typeof specialistSchema>;

export const commitmentSchema = z.strictObject({
  id: z.string(),
  accountId: z.string(),
  ownerType: z.enum(["specialist", "customer"]),
  ownerId: z.string().nullable(),
  ownerLabel: z.string(),
  description: z.string(),
  madeOn: isoDate,
  dueOn: isoDate,
  status: z.enum(["open", "done"]),
  completedOn: isoDate.nullable(),
  synthetic,
});
export type Commitment = z.infer<typeof commitmentSchema>;

export const escalationSchema = z.strictObject({
  id: z.string(),
  accountId: z.string(),
  raisedOn: isoDate,
  raisedById: z.string(),
  topic: z.string(),
  severity: severitySchema,
  status: z.enum(["open", "resolved"]),
  decisionNeeded: z.string(),
  decisionOwner: z.string(),
  dueOn: isoDate,
  resolvedOn: isoDate.nullable(),
  synthetic,
});
export type Escalation = z.infer<typeof escalationSchema>;

export const coachingActionSchema = z.strictObject({
  id: z.string(),
  specialistId: z.string(),
  observedOn: isoDate,
  observation: z.string(),
  action: z.string(),
  evidenceRef: z.string(), // an intervention or commitment id, so coaching rests on a record
  status: z.enum(["open", "done"]),
  dueOn: isoDate,
  synthetic,
});
export type CoachingAction = z.infer<typeof coachingActionSchema>;

export const teamSchema = z.strictObject({
  specialists: z.array(specialistSchema).min(1),
  commitments: z.array(commitmentSchema),
  escalations: z.array(escalationSchema),
  coachingActions: z.array(coachingActionSchema),
});
export type Team = z.infer<typeof teamSchema>;

export const interventionEvidenceSchema = z.strictObject({
  kind: z.enum([
    "adoption_metric",
    "value_measurement",
    "specialist_observation",
    "customer_statement",
  ]),
  summary: z.string(),
  ref: z.string().nullable(),
});

export const followUpObservationSchema = z.strictObject({
  observedOn: isoDate,
  summary: z.string(),
  bearing: z.enum(["supports", "contradicts", "mixed"]),
});

export const outcomeSchema = z.strictObject({
  result: z.enum(["achieved", "partly_achieved", "not_achieved", "inconclusive"]),
  rationale: z.string(),
  attribution: z.enum(["not_assessed", "plausible_not_established", "supported_by_comparison"]),
  confounders: z.array(z.string()),
});
export type Outcome = z.infer<typeof outcomeSchema>;

export const interventionSchema = z.strictObject({
  id: z.string(),
  accountId: z.string(),
  workflowId: z.string().nullable(),
  practiceGroup: practiceGroupName.nullable(),
  blockerId: z.string().nullable(),
  observedProblem: z.string(),
  supportingEvidence: z.array(interventionEvidenceSchema).min(1),
  hypothesis: z.string(),
  assignedSpecialistId: z.string(),
  action: z.string(),
  dates: z.strictObject({
    proposedOn: isoDate,
    startedOn: isoDate.nullable(),
    completedOn: isoDate.nullable(),
    followUpDueOn: isoDate.nullable(),
    evaluatedOn: isoDate.nullable(),
  }),
  expectedResult: z.strictObject({
    metric: z.string(),
    target: z.string(),
    byDate: isoDate,
  }),
  followUpObservations: z.array(followUpObservationSchema),
  outcome: outcomeSchema.nullable(),
  synthetic,
});
export type Intervention = z.infer<typeof interventionSchema>;

export const adoptionPeriodSchema = z.strictObject({
  start: isoDate,
  end: isoDate, // inclusive
  phase: z.enum(["onboarding", "baseline", "stalled", "intervention", "follow_up"]),
  licensedUsers: count,
  eligibleUsers: count,
  activeUsers: count,
  repeatUsers: count,
  cohortActiveUsers: count,
  workflowsStarted: count,
  workflowsCompleted: count,
});
export type AdoptionPeriod = z.infer<typeof adoptionPeriodSchema>;

export const adoptionSeriesSchema = z.strictObject({
  id: z.string(),
  accountId: z.string(),
  workflowId: z.string(),
  workflowName: z.string(),
  practiceGroup: practiceGroupName,
  trainingCohort: z.strictObject({ trainedOn: isoDate, size: z.number().int().positive() }).nullable(),
  dataNotes: z.array(z.string()),
  periods: z.array(adoptionPeriodSchema).min(1),
  synthetic,
});
export type AdoptionSeries = z.infer<typeof adoptionSeriesSchema>;

const minutes = z.number().nonnegative().nullable();

const effortComponents = z.strictObject({
  producing: minutes,
  humanReview: minutes,
  correction: minutes,
});

/** One attempt at the task, whether or not it reached an accepted result. */
export const taskObservationSchema = z.strictObject({
  id: z.string(),
  startedOn: isoDate,
  // `abandoned`: given up before review finished. `rejected`: reviewed and not accepted.
  status: z.enum(["accepted", "abandoned", "rejected"]),
  // Hands-on effort. Time spent waiting in a queue is not effort and is recorded apart.
  activeMinutes: effortComponents,
  waitingMinutes: minutes,
  elapsedMinutes: minutes,
  reworked: z.boolean().nullable(),
  qualityFailure: z.boolean().nullable(),
});
export type TaskObservation = z.infer<typeof taskObservationSchema>;

const phaseWindow = { label: z.string(), periodStart: isoDate, periodEnd: isoDate };

export const phaseMeasurementSchema = z.discriminatedUnion("basis", [
  z.strictObject({
    ...phaseWindow,
    basis: z.literal("task_observations"),
    tasks: z.array(taskObservationSchema),
  }),
  // Legacy shape: one median per component, no per-task rows. A median of task totals
  // cannot be recovered from it, so `value.ts` never reports one for this basis.
  z.strictObject({
    ...phaseWindow,
    basis: z.literal("component_summary"),
    sampleSize: z.number().int().nonnegative(),
    medianMinutes: effortComponents,
    qualityFailures: count,
    reworkedResults: count,
  }),
]);
export type PhaseMeasurement = z.infer<typeof phaseMeasurementSchema>;

export const valueMeasurementSchema = z.strictObject({
  id: z.string(),
  accountId: z.string(),
  workflowId: z.string(),
  workflowName: z.string(),
  practiceGroup: practiceGroupName,
  acceptableResultDefinition: z.string(),
  measurementMethod: z.string(),
  preToolEstimate: z.strictObject({ minutes: z.number().positive(), basis: z.string() }).nullable(),
  baseline: phaseMeasurementSchema,
  followUp: phaseMeasurementSchema.nullable(),
  concurrentChanges: z.array(z.string()),
  comparisonGroup: z.strictObject({ description: z.string() }).nullable(),
  financialAssumptions: z
    .strictObject({
      hourlyCostEur: z.number().positive(),
      hourlyCostBasis: z.string(),
      annualResults: z.number().int().positive(),
      annualResultsBasis: z.string(),
    })
    .nullable(),
  synthetic,
});
export type ValueMeasurement = z.infer<typeof valueMeasurementSchema>;

export const objectiveSchema = z.strictObject({
  id: z.string(),
  statement: z.string(),
  workflowId: z.string(),
  metric: z.enum([
    "repeat_users_min",
    "completion_rate_min",
    "median_minutes_max",
    "quality_failure_rate_max",
  ]),
  target: z.number().nonnegative(),
});
export type Objective = z.infer<typeof objectiveSchema>;

export const engagementSchema = z.strictObject({
  accountId: z.string(),
  scenario: z
    .strictObject({ id: z.string(), label: z.string(), summary: z.string() })
    .nullable(),
  assignments: z
    .array(
      z.strictObject({
        specialistId: z.string(),
        role: z.enum(["lead", "support"]),
        plannedHoursPerWeek: z.number().nonnegative(),
      }),
    )
    .min(1),
  complexity: z.strictObject({
    practiceGroupsInScope: z.number().int().positive(),
    workingLanguages: z.number().int().positive(),
    integrationsInFlight: z.number().int().nonnegative(),
    stakeholderGroups: z.number().int().positive(),
    regulatedSector: z.boolean(),
  }),
  sponsor: z.strictObject({
    status: z.enum(["active", "changed_unconfirmed", "disengaged", "not_recorded"]),
    evidence: z.string().nullable(),
    recordedOn: isoDate.nullable(),
  }),
  demand: z.strictObject({
    status: z.enum(["requested", "declined", "not_recorded"]),
    evidence: z.string().nullable(),
    recordedOn: isoDate.nullable(),
  }),
  expansionCase: z
    .strictObject({
      proposedScope: z.string(),
      basedOnWorkflowId: z.string(),
      targetGroups: z.array(practiceGroupName),
      additionalDeliveryHoursPerWeek: z.number().nonnegative(),
    })
    .nullable(),
  objectives: z.array(objectiveSchema),
  customerOwnerRole: z.string(),
  reviewOwnerId: z.string(),
  nextReviewDate: isoDate,
  synthetic,
});
export type Engagement = z.infer<typeof engagementSchema>;
