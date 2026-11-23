import { formatDate } from "./engagement/as-of";

/**
 * The window and the lag of each count the dashboard shows (plan item C8).
 *
 * What the synthetic data supports:
 * - an account's and a practice group's `activeUsers` equal the last value of their weekly
 *   series, so they are the latest week's count;
 * - weekly series are undated, so, as in the usage CSV, the last week is read as the week
 *   ending on the as-of date;
 * - a workflow's `runs` equal the sum of its weekly runs, so they cover that series;
 * - persona adoption is defined in the schema as the share active in the last 30 days;
 * - reporting periods carry their own start and end dates.
 *
 * What it does not support: a window for queries per week, workflow active users, review
 * tables, outputs and the peer medians, which the data states without one; and the lag of any
 * count, because no capture or refresh delay is recorded. Those read "not captured", never a
 * guessed window or a lag of 0. `lib/count-windows.test.ts` pins each claim to the data.
 */

export type CountSource =
  | "latest_week"
  | "weekly_series"
  | "first_week"
  | "series_total"
  | "trailing_30_days"
  | "reporting_period"
  | "licences"
  | "not_dated";

export interface WindowContext {
  asOf: string;
  /** Weeks in the series behind the count; null when the series differ in length. */
  weeks: number | null;
}

export interface CountWindow {
  /** A phrase such as "week ending 31 Jul 2026"; null when the data states no window. */
  window: string | null;
  /** Days between the end of the window and the data being available; null: not captured. */
  lagDays: number | null;
}

/** The synthetic data records no capture or refresh delay for any count. */
export const RECORDED_LAG_DAYS: number | null = null;

export const LAG_NOT_CAPTURED = "lag not captured";
export const WINDOW_NOT_CAPTURED = "window not captured";

export const LAG_NOTE =
  "Lag is how long after a window closes its counts arrive. The synthetic data records no capture or refresh delay, so it reads Unknown, not 0.";

export function countWindow(source: CountSource, { asOf, weeks }: WindowContext): CountWindow {
  const end = formatDate(asOf);
  const lagDays = RECORDED_LAG_DAYS;
  switch (source) {
    case "latest_week":
      return { window: `week ending ${end}`, lagDays };
    case "weekly_series":
      return { window: weeks === null ? null : `${weeks} weeks ending ${end}, oldest first`, lagDays };
    case "first_week":
      return { window: weeks === null ? null : `first week of the ${weeks} weeks ending ${end}`, lagDays };
    case "series_total":
      return { window: weeks === null ? null : `total over the ${weeks} weeks ending ${end}`, lagDays };
    case "trailing_30_days":
      return { window: `30 days to ${end}`, lagDays };
    case "reporting_period":
      return { window: "the dates of each reporting period", lagDays };
    case "licences":
      return { window: `licences held on ${end}`, lagDays };
    case "not_dated":
      return { window: null, lagDays };
  }
}

export const formatLag = (lagDays: number | null): string =>
  lagDays === null ? LAG_NOT_CAPTURED : `lag ${lagDays} day${lagDays === 1 ? "" : "s"}`;

export interface CountItem {
  label: string;
  source: CountSource;
}

/**
 * One sentence per panel, placed beside its counts:
 * "Active users: week ending 31 Jul 2026. Review tables and Blocked outputs: window not
 * captured. Lag not captured for any of these counts."
 * Items that share a window are joined, so the line stays short.
 */
export function describeCounts(items: readonly CountItem[], ctx: WindowContext): string {
  if (items.length === 0) return "";
  const groups = new Map<string, { labels: string[]; lag: number | null }>();
  for (const item of items) {
    const w = countWindow(item.source, ctx);
    const key = w.window ?? WINDOW_NOT_CAPTURED;
    const group = groups.get(key) ?? { labels: [], lag: w.lagDays };
    group.labels.push(item.label);
    groups.set(key, group);
  }
  const parts = [...groups].map(([window, g]) => `${joinLabels(g.labels)}: ${window}.`);
  const lags = new Set([...groups.values()].map((g) => g.lag));
  const lag =
    lags.size === 1 && lags.has(null)
      ? `${capitalise(LAG_NOT_CAPTURED)} for ${items.length === 1 ? "this count" : "any of these counts"}.`
      : [...groups.values()].map((g) => `${joinLabels(g.labels)}: ${formatLag(g.lag)}.`).join(" ");
  return `${parts.join(" ")} ${lag}`;
}

/** The common length of several weekly series, or null when they differ. */
export function commonWeeks(series: readonly (readonly number[])[]): number | null {
  const lengths = new Set(series.map((s) => s.length));
  return lengths.size === 1 ? [...lengths][0] : null;
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** For a panel whose window is already stated, such as the dated reporting periods. */
export const LAG_SENTENCE = `${capitalise(formatLag(RECORDED_LAG_DAYS))}.`;

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

/** The counts on each panel, so every page states them the same way. */
export const PANEL_COUNTS = {
  accountUsage: [
    { label: "Seats", source: "licences" },
    { label: "Active users", source: "latest_week" },
    { label: "Weekly active trend", source: "weekly_series" },
    { label: "Queries per week", source: "not_dated" },
  ],
  seatUse: [
    { label: "Seats", source: "licences" },
    { label: "Idle, latest week", source: "latest_week" },
    { label: "Idle, week 1", source: "first_week" },
  ],
  personaAdoption: [
    { label: "Seats per role", source: "licences" },
    { label: "Adoption", source: "trailing_30_days" },
  ],
  cockpit: [
    { label: "Active users", source: "latest_week" },
    { label: "Workflow runs", source: "series_total" },
    { label: "Review tables", source: "not_dated" },
    { label: "Draft outputs", source: "not_dated" },
    { label: "Verified outputs", source: "not_dated" },
    { label: "Blocked outputs", source: "not_dated" },
  ],
  workflowUsage: [
    { label: "Runs", source: "series_total" },
    { label: "Active users", source: "not_dated" },
    { label: "Review tables", source: "not_dated" },
    { label: "Verified", source: "not_dated" },
    { label: "Blocked", source: "not_dated" },
  ],
  peerBenchmarks: [
    { label: "Firm active users", source: "latest_week" },
    { label: "Firm workflow runs", source: "series_total" },
    { label: "Other firm values", source: "not_dated" },
    { label: "Peer medians", source: "not_dated" },
  ],
  practiceGroupBenchmarks: [
    { label: "Runs", source: "series_total" },
    { label: "Active users", source: "not_dated" },
    { label: "Verified", source: "not_dated" },
    { label: "WAU trend", source: "weekly_series" },
  ],
} as const satisfies Record<string, readonly CountItem[]>;

export type Panel = keyof typeof PANEL_COUNTS;
