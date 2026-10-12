import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import vocabulary from "../../packages/evidence-loop-contract/evidence-loop.v1.vocabulary.json";
import { getEvidenceStore } from "./data";
import {
  FORBIDDEN_KEYS,
  PUBLIC_ORIGIN_KINDS,
  assertPublicStore,
  denylistIssues,
  identifierIssues,
  importIssues,
  needsDenylist,
  parseDenylist,
  publicBoundaryIssues,
} from "./private-boundary";
import { evidenceStoreSchema, originSchema } from "./schema";

const store = getEvidenceStore();
const REPO = "/work/legal-ai-adoption-dashboard";
const privateOrigin = { kind: "participant_session", studyId: "study-handoff-r1", consentRef: "consent-P01", storageRef: "notes/P01.json" } as const;
const manifest = {
  studyId: "study-handoff-r1",
  source: "Moderator notes, round 1",
  storageLocation: "/secure/research/study-handoff-r1",
  authorisedUses: ["internal_analysis"],
  consentRefs: ["consent-P01"],
  approvedByRole: "Study owner",
  approvedOn: "2026-10-01",
  retentionReviewOn: "2028-10-01",
};

describe("public boundary", () => {
  it("shares its lists with the contract file", () => {
    expect(vocabulary.publicOriginKinds).toEqual([...PUBLIC_ORIGIN_KINDS]);
    expect(vocabulary.forbiddenKeys).toEqual([...FORBIDDEN_KEYS]);
    expect(vocabulary.originKinds).toEqual(originSchema.options.map((option) => option.shape.kind.value));
  });

  it("accepts the bundled synthetic store", () => {
    expect(publicBoundaryIssues(store)).toEqual([]);
  });

  it("refuses a participant observation, however it is labelled", () => {
    const real = { ...store.observations[0], id: "obs-real", origin: privateOrigin };
    // The schema knows the record shape; the boundary still keeps it out of the public store.
    expect(evidenceStoreSchema.safeParse({ ...store, observations: [...store.observations, real] }).success).toBe(true);
    expect(() => assertPublicStore({ ...store, observations: [...store.observations, real] })).toThrow(
      '$.observations[obs-real].origin: "participant_session" records belong in the private research store',
    );
  });

  it("refuses a real record relabelled as synthetic", () => {
    expect(publicBoundaryIssues({ id: "x", synthetic: true, origin: privateOrigin })).toEqual(
      expect.arrayContaining(['$: marked synthetic although its origin is "participant_session"']),
    );
  });

  it("refuses identifying fields anywhere in a record", () => {
    const issues = publicBoundaryIssues({
      sessions: [{ id: "ses-x", participant: { email: "someone@example.invalid", employer: "Example LLP" } }],
    });
    expect(issues).toEqual([
      "$.sessions[ses-x].participant.email: identifying field in an analytical record",
      "$.sessions[ses-x].participant.employer: identifying field in an analytical record",
    ]);
  });

  it("needs an approval reference on a published aggregate", () => {
    expect(publicBoundaryIssues({ origin: { kind: "approved_aggregate", approvalRef: "" } })).toEqual([
      "$.origin: an approved aggregate needs an approval reference",
    ]);
    expect(
      originSchema.safeParse({ kind: "approved_aggregate", approvalRef: "APP-1", approvedOn: "2026-10-01", approvedByRole: "Study owner" }).success,
    ).toBe(true);
  });
});

describe("import of real observations", () => {
  const record = { id: "obs-p01-1", observed: "…", origin: privateOrigin };

  it("is allowed once source, consent, storage and use are established", () => {
    expect(importIssues(manifest, [record], REPO)).toEqual([]);
  });

  it("is refused when a precondition is missing", () => {
    const withoutConsent: Record<string, unknown> = { ...manifest };
    delete withoutConsent.consentRefs;
    expect(importIssues(withoutConsent, [record], REPO)[0]).toContain("manifest consentRefs");
    expect(importIssues({ ...manifest, authorisedUses: [] }, [record], REPO)[0]).toContain("manifest authorisedUses");
    expect(importIssues({ ...manifest, storageLocation: "" }, [record], REPO)[0]).toContain("manifest storageLocation");
  });

  it("is refused when the store would sit inside the public repository", () => {
    for (const storageLocation of [`${REPO}/private-research`, "private-research", REPO]) {
      expect(importIssues({ ...manifest, storageLocation }, [record], REPO)).toContain(
        "storageLocation must be an absolute path outside the public repository",
      );
    }
  });

  it("is refused for records without covered consent, from another study, or carrying identities", () => {
    expect(importIssues(manifest, [{ ...record, origin: { ...privateOrigin, consentRef: "consent-P09" } }], REPO)).toEqual([
      "obs-p01-1: no consent reference covered by the manifest",
    ]);
    expect(importIssues(manifest, [{ ...record, origin: { ...privateOrigin, studyId: "other" } }], REPO)).toEqual([
      "obs-p01-1: belongs to another study",
    ]);
    expect(importIssues(manifest, [{ ...record, email: "someone@example.invalid" }], REPO)[0]).toContain("identifying field");
    expect(importIssues(manifest, [store.observations[0]], REPO)[0]).toContain("synthetic fixtures stay in the repository");
  });
});

describe("identifiers in free text", () => {
  const aggregate = { kind: "approved_aggregate", approvalRef: "https://approvals.example.invalid/APP-1", approvedOn: "2026-10-01", approvedByRole: "Study owner" };
  const published = (observed: string) => ({
    ...store,
    observations: [{ ...store.observations[0], id: "obs-agg", observed, origin: aggregate }],
  });

  it("shares its patterns with the contract file", () => {
    expect(vocabulary.identifierPatterns.map((p) => p.label)).toEqual([
      "an email address",
      "a web address",
      "a phone number",
      "a company legal form",
      "a personal title before a name",
    ]);
  });

  it("refuses obvious identifiers in an approved aggregate", () => {
    const cases: Record<string, string> = {
      "Write to someone@example.invalid for the file.": "an email address",
      "See www.example.invalid for context.": "a web address",
      "Call +49 30 1234567 to confirm.": "a phone number",
      "Their employer is a GmbH in Hamburg.": "a company legal form",
      "Dr. Beispiel asked for the clause number.": "a personal title before a name",
    };
    for (const [observed, label] of Object.entries(cases)) {
      expect(publicBoundaryIssues(published(observed))).toContain(`$.observations[obs-agg].observed: contains ${label}`);
    }
  });

  it("accepts plain findings, dates and reference fields", () => {
    expect(publicBoundaryIssues(published("Three of five reviewers re-read the contract on 2026-01-12."))).toEqual([]);
    expect(identifierIssues({ approvalRef: "https://approvals.example.invalid/APP-1" })).toEqual([]);
  });

  it("leaves synthetic fixtures alone, legal forms included", () => {
    expect(identifierIssues({ account: "Example LLP" })).toEqual(["$.account: contains a company legal form"]);
    expect(publicBoundaryIssues({ id: "x", account: "Example LLP", origin: { kind: "synthetic_fixture" } })).toEqual([]);
  });

  it("is applied to participant records before an import", () => {
    const named = { id: "obs-p01-2", observed: "Dr. Beispiel checked every quote.", origin: privateOrigin };
    expect(importIssues(manifest, [named], REPO)).toEqual([
      "obs-p01-2: $.observed: contains a personal title before a name",
    ]);
  });
});

describe("denylist", () => {
  // Invented names standing in for the private list.
  const entries = parseDenylist("# participants\nJordan Example\n\nExample & Partner\n");

  it("reads one entry per line and skips comments and blanks", () => {
    expect(entries).toEqual(["Jordan Example", "Example & Partner"]);
  });

  it("reports a match by entry number and never by name", () => {
    const issues = denylistIssues(
      { observations: [{ id: "obs-1", observed: "As jordan  example put it, the source was hard to find." }] },
      entries,
    );
    expect(issues).toEqual(["$.observations[obs-1].observed: matches denylist entry 1"]);
    expect(issues.join(" ").toLowerCase()).not.toContain("jordan");
  });

  it("matches whole words only", () => {
    expect(denylistIssues("Jordan Examples are common.", entries)).toEqual([]);
    expect(denylistIssues("Sent by Example & Partner.", entries)).toEqual(["$: matches denylist entry 2"]);
  });

  it("is needed as soon as a record is not a synthetic fixture", () => {
    expect(needsDenylist(store)).toBe(false);
    const aggregate = { kind: "approved_aggregate", approvalRef: "APP-1", approvedOn: "2026-10-01", approvedByRole: "Study owner" };
    expect(needsDenylist({ ...store, observations: [{ ...store.observations[0], origin: aggregate }] })).toBe(true);
  });
});

describe("repository", () => {
  const cwd = new URL("../..", import.meta.url);
  const run = (denylist?: string) =>
    spawnSync("node", ["scripts/check-private-boundary.mjs"], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, PRIVATE_RESEARCH_DENYLIST: denylist ?? "" },
    });
  const temp = mkdtempSync(join(tmpdir(), "denylist-"));
  const listFile = (name: string, text: string) => {
    const path = join(temp, name);
    writeFileSync(path, text, "utf8");
    return path;
  };

  it("ignores the private research folder and local store files", () => {
    const ignore = readFileSync(new URL("../../.gitignore", import.meta.url), "utf8");
    expect(ignore).toContain("/private-research/");
    expect(ignore).toContain("*.private.json");
  });

  it("passes the boundary check script", () => {
    const out = execFileSync("node", ["scripts/check-private-boundary.mjs"], { cwd, encoding: "utf8" });
    expect(out).toContain("private-data boundary holds");
    expect(out).toContain("feedback items and interviews state their origin");
  });

  it("passes with a denylist that matches nothing", () => {
    const result = run(listFile("clean.txt", "Nobody Atall\n"));
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("denylist checked (1 entry)");
  });

  it("fails on a denylisted name in a tracked file, without printing the name", () => {
    // "Globex LLP" is an invented account in the synthetic interviews.
    const result = run(listFile("hit.txt", "Nobody Atall\nglobex llp\n"));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("product-feedback-loop/data/interviews.json: matches denylist entry 2");
    expect(result.stderr.toLowerCase()).not.toContain("globex");
  });

  it("refuses a denylist kept inside the repository, and an empty one", () => {
    expect(run(fileURLToPath(new URL("../../data/README.md", import.meta.url))).stderr).toContain(
      "must be an absolute path outside the public repository",
    );
    expect(run(listFile("empty.txt", "# nothing yet\n")).stderr).toContain("the name check cannot be made");
  });
});
