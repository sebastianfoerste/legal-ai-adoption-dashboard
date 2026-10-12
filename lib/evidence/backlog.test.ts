import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEMO_AS_OF } from "../engagement/as-of";
import { renderEvidenceBacklogMarkdown } from "./backlog";
import { getEvidenceStore } from "./data";
import { viewChanges } from "./loop";

const COMMITTED = new URL("../../docs/evidence-backlog.md", import.meta.url);
const store = getEvidenceStore();
const markdown = renderEvidenceBacklogMarkdown(store, viewChanges(store, DEMO_AS_OF), DEMO_AS_OF);

describe("evidence-linked backlog", () => {
  it("matches the committed document (regenerate with pnpm evidence:backlog)", () => {
    if (process.env.UPDATE_EVIDENCE_BACKLOG === "1") writeFileSync(COMMITTED, markdown);
    expect(existsSync(COMMITTED)).toBe(true);
    expect(readFileSync(COMMITTED, "utf8")).toBe(markdown);
  });

  it("opens and closes with the synthetic notice and reports no practitioner sessions", () => {
    const lines = markdown.trim().split("\n");
    expect(lines[2]).toContain("SYNTHETIC DEMONSTRATION CASES");
    expect(lines.at(-1)).toContain("SYNTHETIC DEMONSTRATION CASES");
    expect(markdown).toContain("0 sessions completed, 0 invitations sent, recruitment not authorised");
  });

  it("traces every change from research question to outcome", () => {
    for (const change of store.changes) {
      const section = markdown.split(`## ${change.id}: `)[1]?.split("\n## ")[0] ?? "";
      for (const label of ["Research questions:", "Problem (", "**Observed**", "**Interpretation**", "Hypothesis:", "Decision:", "Acceptance criteria", "Implementation reference:", "Delivery:", "Outcome:", "**Missing observations**", "**Next decision:**"]) {
        expect(section, `${change.id} ${label}`).toContain(label);
      }
    }
  });

  it("never prints a release or a success that the record does not hold", () => {
    expect(markdown).toContain("| chg-003 Exportable audit log of AI-assisted edits | Quality or control failure | no study observation | Prioritised | medium | In progress | No outcome: not released |");
    expect(markdown).toContain("| Released | Awaiting evidence |");
    expect(markdown).not.toMatch(/In progress \| Supported/);
  });
});
