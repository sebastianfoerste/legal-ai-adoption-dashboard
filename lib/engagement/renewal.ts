import { getAccounts, getBlockers } from "../data";
import type { Account, Blocker } from "../schema";
import { REVIEW_AS_OF, daysBetween } from "./as-of";
import { getEngagement, getTeam } from "./data";
import { expansionEvidenceFor } from "./expansion";
import type { Engagement } from "./schema";
import type { ValueAssessment } from "./value";

export interface RenewalSignal {
  label: string;
  bearing: "favourable" | "adverse" | "unknown";
  evidence: string;
}

export type ReviewPriority = "review_now" | "review_soon" | "routine";

export const reviewPriorityLabel: Record<ReviewPriority, string> = {
  review_now: "Hold the renewal review now",
  review_soon: "Schedule the renewal review",
  routine: "Routine review cadence",
};

export interface RenewalAid {
  accountId: string;
  renewalDate: string;
  daysToRenewal: number;
  reviewPriority: ReviewPriority;
  signals: RenewalSignal[];
  adverse: number;
  unknown: number;
  disclaimer: string;
}

export const RENEWAL_DISCLAIMER =
  "Decision aid for scheduling a human renewal review. It lists recorded signals and does not predict the renewal outcome.";

export interface RenewalInput {
  account: Account;
  engagement: Engagement;
  blockers: Blocker[];
  value: ValueAssessment | null;
  overdueCommitments: number;
}

export function renewalAid(input: RenewalInput, asOf = REVIEW_AS_OF): RenewalAid {
  const { account, engagement } = input;
  const weekly = account.weeklyActiveUsers;
  const first = weekly[0];
  const last = weekly[weekly.length - 1];
  const openHigh = input.blockers.filter(
    (blocker) => blocker.status !== "resolved" && blocker.severity === "high",
  ).length;

  const signals: RenewalSignal[] = [
    {
      label: "Weekly active users",
      bearing: last >= first ? "favourable" : "adverse",
      evidence: `${first} to ${last} of ${account.seats} licensed seats over ${weekly.length} weeks.`,
    },
    {
      label: "High-severity blockers",
      bearing: openHigh === 0 ? "favourable" : "adverse",
      evidence: openHigh === 0 ? "None open." : `${openHigh} open.`,
    },
    {
      label: "Sponsor",
      bearing:
        engagement.sponsor.status === "active"
          ? "favourable"
          : engagement.sponsor.status === "disengaged"
            ? "adverse"
            : "unknown",
      evidence: engagement.sponsor.evidence ?? "No sponsor position recorded.",
    },
    {
      label: "Workflow value",
      bearing: !input.value
        ? "unknown"
        : input.value.verdict === "demonstrated"
          ? "favourable"
          : input.value.verdict === "not_demonstrated"
            ? "adverse"
            : "unknown",
      evidence: input.value
        ? (input.value.observed[0] ?? "Measurement incomplete.")
        : "No measurement of time to an acceptable result.",
    },
    {
      label: "Commitments",
      bearing: input.overdueCommitments === 0 ? "favourable" : "adverse",
      evidence:
        input.overdueCommitments === 0
          ? "No overdue commitment."
          : `${input.overdueCommitments} overdue commitment(s).`,
    },
  ];

  const adverse = signals.filter((signal) => signal.bearing === "adverse").length;
  const unknown = signals.filter((signal) => signal.bearing === "unknown").length;
  const daysToRenewal = daysBetween(asOf, account.renewalDate);
  const reviewPriority: ReviewPriority =
    daysToRenewal <= 45 || (daysToRenewal <= 90 && adverse >= 2)
      ? "review_now"
      : daysToRenewal <= 90 || (daysToRenewal <= 180 && adverse >= 1)
        ? "review_soon"
        : "routine";

  return {
    accountId: account.id,
    renewalDate: account.renewalDate,
    daysToRenewal,
    reviewPriority,
    signals,
    adverse,
    unknown,
    disclaimer: RENEWAL_DISCLAIMER,
  };
}

export function accountRenewalAid(accountId: string, asOf = REVIEW_AS_OF): RenewalAid {
  const account = getAccounts().find((candidate) => candidate.id === accountId);
  const engagement = getEngagement(accountId);
  if (!account || !engagement) throw new Error(`no engagement record for ${accountId}`);
  return renewalAid(
    {
      account,
      engagement,
      blockers: getBlockers().filter((blocker) => blocker.accountId === accountId),
      value: expansionEvidenceFor(accountId, asOf).value,
      overdueCommitments: getTeam().commitments.filter(
        (commitment) =>
          commitment.accountId === accountId &&
          commitment.status === "open" &&
          daysBetween(commitment.dueOn, asOf) > 0,
      ).length,
    },
    asOf,
  );
}
