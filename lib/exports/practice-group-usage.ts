import type { Account } from "../schema";

/**
 * Per-practice-group usage for one account, as CSV (docs/product-feedback-notes.md, item 3).
 *
 * The synthetic data holds five undated weekly counts per group, so the window is "the N
 * weeks ending on the as-of date", oldest first, not a calendar quarter. A value that is not
 * there is an empty cell, never 0. Every row says it is synthetic and a draft for
 * account-owner review.
 */

export const REVIEW_NOTE = "Draft for account-owner review; synthetic data";

export const csvCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export interface UsageExport {
  filename: string;
  csv: string;
  weeks: number;
  window: string;
}

export function practiceGroupUsageCsv(account: Account, asOf: string): UsageExport {
  const weeks = Math.max(0, ...account.practiceGroups.map((g) => g.weeklyActiveUsers.length));
  const window = `${weeks} weeks ending ${asOf} (oldest first)`;
  const weekHeaders = Array.from({ length: weeks }, (_, i) =>
    `weekly_active_users_week_${i + 1}${i === 0 ? "_oldest" : i === weeks - 1 ? "_latest" : ""}`,
  );
  const header = [
    "data_class",
    "account_id",
    "practice_group",
    "window",
    "seats",
    "active_users",
    "seat_utilisation",
    "queries_per_week",
    ...weekHeaders,
    "review_status",
  ];
  const rows = account.practiceGroups.map((g) => [
    "synthetic",
    account.id,
    g.name,
    window,
    g.seats,
    g.activeUsers,
    // No seats means no rate: an empty cell, not 0.
    g.seats > 0 ? (g.activeUsers / g.seats).toFixed(4) : null,
    g.queriesPerWeek,
    ...Array.from({ length: weeks }, (_, i) => g.weeklyActiveUsers[i] ?? null),
    REVIEW_NOTE,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  return { filename: `synthetic-practice-group-usage-${account.id}-${asOf}.csv`, csv, weeks, window };
}
