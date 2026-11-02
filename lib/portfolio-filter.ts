import type { HealthResult } from "./health";
import type { Account } from "./schema";

/** The filters of the Account Health page; the same ones the portfolio CSV route accepts. */
export interface AccountFilter {
  search?: string;
  type?: string;
  band?: string;
}

/** Pure: the page and the CSV route filter the same way, so an export matches what is shown. */
export function filterAccounts(
  accounts: Account[],
  filter: AccountFilter,
  healthOf: (accountId: string) => HealthResult,
): Account[] {
  const { search = "", type = "", band = "" } = filter;
  return accounts.filter((a) => {
    if (type && a.type !== type) return false;
    if (band && healthOf(a.id).band !== band) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

export const PORTFOLIO_CSV_PATH = "/accounts.csv";

/** The export link for the current filters; no query string when nothing is filtered. */
/** `asOf`: passed on only when the page was given one, so the file states the same window. */
export function portfolioCsvHref(filter: AccountFilter, asOf?: string): string {
  const params = new URLSearchParams();
  for (const key of ["search", "type", "band"] as const) {
    const value = filter[key];
    if (value) params.set(key, value);
  }
  if (asOf) params.set("asOf", asOf);
  const query = params.toString();
  return query ? `${PORTFOLIO_CSV_PATH}?${query}` : PORTFOLIO_CSV_PATH;
}
