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

/**
 * One CSV cell. A string that a spreadsheet would read as a formula (it starts with =, +, -,
 * @, tab, CR or LF) is prefixed with a single quote inside a quoted field, as OWASP
 * recommends against CSV injection; numbers pass through unchanged.
 */
export const csvCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(text) || text !== value ? `"${text.replace(/"/g, '""')}"` : text;
};

const FORMULA_START = /^[=+\-@\t\r\n]/;

/** The window, in weeks, that the export and the link to it both state. */
export const usageWindowWeeks = (account: Account): number =>
  Math.max(0, ...account.practiceGroups.map((g) => g.weeklyActiveUsers.length));

/**
 * The last count of every series is the week ending on the as-of date, so a shorter series
 * is padded at the oldest end. Weeks a group has no count for are empty, never 0.
 */
export function alignToLatest(series: number[], weeks: number): (number | null)[] {
  const pad = Math.max(0, weeks - series.length);
  return [...Array<null>(pad).fill(null), ...series.slice(-weeks)];
}

export interface UsageExport {
  filename: string;
  csv: string;
  weeks: number;
  window: string;
}

export function practiceGroupUsageCsv(account: Account, asOf: string): UsageExport {
  const weeks = usageWindowWeeks(account);
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
    ...alignToLatest(g.weeklyActiveUsers, weeks),
    REVIEW_NOTE,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  return { filename: `synthetic-practice-group-usage-${account.id}-${asOf}.csv`, csv, weeks, window };
}
