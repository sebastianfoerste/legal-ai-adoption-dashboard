import { resolveAsOf } from "../../../lib/engagement/as-of";
import { renderEvidenceBacklogMarkdown } from "../../../lib/evidence/backlog";
import { getEvidenceStore } from "../../../lib/evidence/data";
import { viewChanges } from "../../../lib/evidence/loop";

// The same document as docs/evidence-backlog.md, for the requested as-of date.
export function GET(request: Request) {
  const asOf = resolveAsOf(new URL(request.url).searchParams.get("asOf")).date;
  const store = getEvidenceStore();
  return new Response(renderEvidenceBacklogMarkdown(store, viewChanges(store, asOf), asOf), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="synthetic-evidence-linked-backlog.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
