import { getAccounts, getBlockers, getWorkflowUsage } from "./data";
import { computeHealth, type HealthResult } from "./health";

export function accountHealth(accountId: string): HealthResult {
  const account = getAccounts().find((a) => a.id === accountId);
  if (!account) throw new Error(`unknown account ${accountId}`);
  const openBlockers = getBlockers()
    .filter((b) => b.accountId === accountId && b.status !== "resolved")
    .map((b) => b.severity);
  const workflows = getWorkflowUsage().filter((w) => w.accountId === accountId);
  return computeHealth({
    seats: account.seats,
    activeUsers: account.activeUsers,
    weeklyActiveUsers: account.weeklyActiveUsers,
    openBlockers,
    draftOutputs: workflows.reduce((sum, w) => sum + w.draftOutputs, 0),
    verifiedOutputs: workflows.reduce((sum, w) => sum + w.verifiedOutputs, 0),
  });
}
