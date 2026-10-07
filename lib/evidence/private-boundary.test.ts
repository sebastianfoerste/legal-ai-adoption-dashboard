import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import vocabulary from "../../packages/evidence-loop-contract/evidence-loop.v1.vocabulary.json";
import { getEvidenceStore } from "./data";
import {
  FORBIDDEN_KEYS,
  PUBLIC_ORIGIN_KINDS,
  assertPublicStore,
  importIssues,
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

describe("repository", () => {
  it("ignores the private research folder and local store files", () => {
    const ignore = readFileSync(new URL("../../.gitignore", import.meta.url), "utf8");
    expect(ignore).toContain("/private-research/");
    expect(ignore).toContain("*.private.json");
  });

  it("passes the boundary check script", () => {
    const out = execFileSync("node", ["scripts/check-private-boundary.mjs"], {
      cwd: new URL("../..", import.meta.url),
      encoding: "utf8",
    });
    expect(out).toContain("private-data boundary holds");
  });
});
