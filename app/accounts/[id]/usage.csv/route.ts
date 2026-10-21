import { getAccounts } from "../../../../lib/data";
import { resolveAsOf } from "../../../../lib/engagement/as-of";
import { practiceGroupUsageCsv } from "../../../../lib/exports/practice-group-usage";

// A download, like /insights/report: per-practice-group usage for one synthetic account,
// a draft for account-owner review. Not an API; nothing is sent anywhere.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = getAccounts().find((a) => a.id === id);
  if (!account) {
    return new Response("Unknown synthetic account.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const asOf = resolveAsOf(new URL(request.url).searchParams.get("asOf")).date;
  const { csv, filename } = practiceGroupUsageCsv(account, asOf);
  // The id is safe in a filename only because it matched a known account above.
  return new Response(csv, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
