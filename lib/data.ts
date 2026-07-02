import accountsJson from "../data/accounts.json";
import benchmarksJson from "../data/benchmarks.json";
import blockersJson from "../data/blockers.json";
import feedbackJson from "../data/feedback.json";
import workflowsJson from "../data/workflows.json";
import {
  accountSchema,
  benchmarkRowSchema,
  blockerSchema,
  feedbackItemSchema,
  workflowUsageSchema,
  type Account,
  type BenchmarkRow,
  type Blocker,
  type FeedbackItem,
  type WorkflowUsage,
} from "./schema";

const accounts: Account[] = accountSchema.array().parse(accountsJson);
const benchmarks: BenchmarkRow[] = benchmarkRowSchema.array().parse(benchmarksJson);
const blockers: Blocker[] = blockerSchema.array().parse(blockersJson);
const feedback: FeedbackItem[] = feedbackItemSchema.array().parse(feedbackJson);
const workflows: WorkflowUsage[] = workflowUsageSchema.array().parse(workflowsJson);

export const getAccounts = (): Account[] => accounts;
export const getBenchmarkRows = (): BenchmarkRow[] => benchmarks;
export const getBlockers = (): Blocker[] => blockers;
export const getFeedback = (): FeedbackItem[] => feedback;
export const getWorkflowUsage = (): WorkflowUsage[] => workflows;
