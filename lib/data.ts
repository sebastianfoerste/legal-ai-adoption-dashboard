import accountsJson from "../data/accounts.json";
import blockersJson from "../data/blockers.json";
import feedbackJson from "../data/feedback.json";
import {
  accountSchema,
  blockerSchema,
  feedbackItemSchema,
  type Account,
  type Blocker,
  type FeedbackItem,
} from "./schema";

const accounts: Account[] = accountSchema.array().parse(accountsJson);
const blockers: Blocker[] = blockerSchema.array().parse(blockersJson);
const feedback: FeedbackItem[] = feedbackItemSchema.array().parse(feedbackJson);

export const getAccounts = (): Account[] => accounts;
export const getBlockers = (): Blocker[] => blockers;
export const getFeedback = (): FeedbackItem[] => feedback;
