// The demo fixtures were written against this date. Overdue items, incomplete reporting
// periods and renewal countdowns only reproduce the documented scenarios on it.
export const DEMO_AS_OF = "2026-07-31";

const DAY_MS = 86_400_000;
const toUtc = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);

/** A real calendar date in YYYY-MM-DD form. Rejects 2026-02-30 and anything looser. */
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = toUtc(value);
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
}

export interface AsOf {
  date: string;
  source: "query" | "environment" | "demo_default";
  /** A requested date that was not a valid ISO date and was ignored. */
  rejected: string | null;
}

export const asOfSourceLabel: Record<AsOf["source"], string> = {
  query: "set by the asOf query parameter",
  environment: "set by the ADOPTION_AS_OF environment variable",
  demo_default: "demo fixture default",
};

/**
 * Order of precedence: a valid `?asOf=` on the request, then `ADOPTION_AS_OF`, then the
 * demo date. A malformed query value is ignored and reported; a malformed environment
 * value is a deployment mistake and throws.
 */
export function resolveAsOf(
  requested?: string | string[] | null,
  environment: string | undefined = process.env.ADOPTION_AS_OF,
): AsOf {
  if (environment !== undefined && environment !== "" && !isIsoDate(environment)) {
    throw new Error(`ADOPTION_AS_OF must be an ISO date (YYYY-MM-DD), got "${environment}".`);
  }
  const fallback: Pick<AsOf, "date" | "source"> = environment
    ? { date: environment, source: "environment" }
    : { date: DEMO_AS_OF, source: "demo_default" };
  const candidate = Array.isArray(requested) ? requested[0] : requested;
  if (!candidate) return { ...fallback, rejected: null };
  return isIsoDate(candidate)
    ? { date: candidate, source: "query", rejected: null }
    : { ...fallback, rejected: candidate };
}

// One "today" for every engagement view, so overdue items, incomplete reporting periods
// and renewal countdowns agree with each other. Library functions default to it; pages
// pass the per-request date from `resolveAsOf`.
export const REVIEW_AS_OF = resolveAsOf().date;

/** Whole days from `from` to `to`. Negative when `to` lies before `from`. */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

export function formatDate(isoDate: string): string {
  return new Date(toUtc(isoDate)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
