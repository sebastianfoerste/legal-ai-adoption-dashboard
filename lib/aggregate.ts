import { getAccounts, getBlockers, getFeedback } from "./data";
import { computeHealth, type HealthResult } from "./health";

export function accountHealth(accountId: string): HealthResult {
  const account = getAccounts().find((a) => a.id === accountId);
  if (!account) throw new Error(`unknown account ${accountId}`);
  const openBlockers = getBlockers()
    .filter((b) => b.accountId === accountId && b.status !== "resolved")
    .map((b) => b.severity);
  const feedback = getFeedback().filter((f) => f.accountId === accountId);
  return computeHealth({
    seats: account.seats,
    activeUsers: account.activeUsers,
    weeklyActiveUsers: account.weeklyActiveUsers,
    openBlockers,
    feedbackSharedWithProduct: feedback.filter((f) => f.status === "shared_with_product").length,
    feedbackTotal: feedback.length,
  });
}
