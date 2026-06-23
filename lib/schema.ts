import { z } from "zod";

export const severitySchema = z.enum(["low", "medium", "high"]);
export type Severity = z.infer<typeof severitySchema>;

export const personaSchema = z.object({
  role: z.enum(["Partner", "Associate", "PSL", "Innovation Lead", "In-house Counsel"]),
  count: z.number().int().nonnegative(),
  adoptionRate: z.number().min(0).max(1), // share of this persona active in last 30d
});
export type Persona = z.infer<typeof personaSchema>;

export const practiceGroupSchema = z.object({
  name: z.enum(["Corporate", "Finance", "Litigation", "Employment"]),
  seats: z.number().int().positive(),
  activeUsers: z.number().int().nonnegative(),
  weeklyActiveUsers: z.array(z.number().int().nonnegative()).min(2),
  queriesPerWeek: z.number().int().nonnegative(),
});
export type PracticeGroup = z.infer<typeof practiceGroupSchema>;

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["law_firm", "in_house"]),
  seats: z.number().int().positive(),
  activeUsers: z.number().int().nonnegative(),
  weeklyActiveUsers: z.array(z.number().int().nonnegative()).min(2),
  practiceGroups: z.array(practiceGroupSchema),
  personas: z.array(personaSchema),
  renewalDate: z.string(),
  previousHealthScore: z.number().int().min(0).max(100),
});
export type Account = z.infer<typeof accountSchema>;

export const blockerSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  category: z.enum([
    "trust_in_output",
    "workflow_fit",
    "training_gap",
    "integration",
    "change_management",
    "pricing_value",
  ]),
  severity: severitySchema,
  status: z.enum(["open", "in_progress", "resolved"]),
  affectedGroups: z.array(z.string()),
  reEngagementAction: z.string(),
  workshopFollowUp: z.string(),
});
export type Blocker = z.infer<typeof blockerSchema>;

export const feedbackItemSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  sourcePersona: personaSchema.shape.role,
  text: z.string(),
  theme: z.string(),
  productArea: z.enum(["drafting", "review", "research", "knowledge", "integrations", "admin"]),
  severity: severitySchema,
  status: z.enum(["new", "triaged", "shared_with_product"]),
});
export type FeedbackItem = z.infer<typeof feedbackItemSchema>;
