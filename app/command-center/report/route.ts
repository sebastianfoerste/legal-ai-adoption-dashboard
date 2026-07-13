import { commandCenterSnapshot } from "../../../lib/command-center";

export function GET() {
  const { leadershipReport } = commandCenterSnapshot();
  return new Response(leadershipReport.markdown, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="synthetic-legal-ai-command-center-report.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
