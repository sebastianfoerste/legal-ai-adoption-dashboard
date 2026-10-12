import { adoptionInsightsSnapshot } from "../../../lib/adoption-insights";
import { resolveAsOf } from "../../../lib/engagement/as-of";
import { buildCustomerReview } from "../../../lib/engagement/customer-review";

function markdownDownload(body: string, filename: string) {
  return new Response(body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

// Without a query this serves the portfolio report. With ?account=<id> it serves that
// account's customer review. Both are synthetic drafts for account-owner review.
export function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const accountId = query.get("account");
  if (accountId) {
    const review = buildCustomerReview(accountId, resolveAsOf(query.get("asOf")).date);
    if (!review) {
      return new Response("Unknown synthetic account.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    // The id is safe in a filename only because it matched a known account above.
    return markdownDownload(review.markdown, `synthetic-customer-review-${review.accountId}.md`);
  }
  const { leadershipReport } = adoptionInsightsSnapshot();
  return markdownDownload(leadershipReport.markdown, "synthetic-legal-ai-adoption-insights-report.md");
}
