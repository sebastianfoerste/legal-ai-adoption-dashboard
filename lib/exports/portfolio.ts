import type { HealthResult } from "../health";
import type { Account } from "../schema";
import { csvCell } from "./practice-group-usage";

export const PORTFOLIO_CSV_FILENAME = "synthetic_legal_ai_adoption_accounts_export.csv";

const HEADERS = [
  "Account ID",
  "Account Name",
  "Account Type",
  "Total Seats",
  "Active Users",
  "Utilization Rate",
  "Health Score",
  "Health Band",
  "Renewal Date",
  "Data Class",
];

/**
 * The portfolio CSV behind the Export CSV button on `/`. Pure: the caller supplies each
 * account's health. An account without seats has no utilisation rate, so the cell is empty,
 * never 0.
 */
export function portfolioCsv(accounts: Account[], healthOf: (accountId: string) => HealthResult): string {
  const rows = accounts.map((a) => {
    const health = healthOf(a.id);
    return [
      a.id,
      a.name,
      a.type,
      a.seats,
      a.activeUsers,
      a.seats > 0 ? (a.activeUsers / a.seats).toFixed(4) : null,
      health.score,
      health.band,
      a.renewalDate,
      "synthetic",
    ];
  });
  // CRLF line ends, as RFC 4180 and the usage CSV.
  return [HEADERS, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
