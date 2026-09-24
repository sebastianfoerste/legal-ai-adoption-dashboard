import { adoptionInsightsSnapshot } from "../../../lib/adoption-insights";

export function GET() {
  const { leadershipReport } = adoptionInsightsSnapshot();
  return new Response(leadershipReport.markdown, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="synthetic-legal-ai-adoption-insights-report.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
