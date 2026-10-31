import { accountHealth } from "../../lib/aggregate";
import { getAccounts } from "../../lib/data";
import { PORTFOLIO_CSV_FILENAME, portfolioCsv } from "../../lib/exports/portfolio";
import { filterAccounts } from "../../lib/portfolio-filter";

// The portfolio CSV behind the Export CSV button on `/`, built on the server so that the
// data layer never ships to the browser. Accepts the page's filters (`search`, `type`,
// `band`) so the file matches what is shown. A download, not an API; nothing is sent anywhere.
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const accounts = filterAccounts(
    getAccounts(),
    {
      search: params.get("search") ?? "",
      type: params.get("type") ?? "",
      band: params.get("band") ?? "",
    },
    accountHealth,
  );
  return new Response(portfolioCsv(accounts, accountHealth), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${PORTFOLIO_CSV_FILENAME}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
