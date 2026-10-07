import { z } from "zod";

/**
 * The public repository holds synthetic fixtures and, at most, aggregates or quotations
 * that were explicitly approved for publication. Original participant observations, and
 * anything that identifies a person, stay in the private research store.
 */
export const PUBLIC_ORIGIN_KINDS = ["synthetic_fixture", "approved_aggregate"] as const;

// Keys that only make sense for a real person. None of them belongs in an analytical record.
export const FORBIDDEN_KEYS = [
  "name",
  "fullName",
  "email",
  "phone",
  "employer",
  "firm",
  "contact",
  "contactDetails",
  "consentRecord",
  "signature",
  "recordingUrl",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Why a store must not be published. Empty means it may be. Works on unparsed JSON. */
export function publicBoundaryIssues(value: unknown, path = "$"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      const id = isRecord(item) && typeof item.id === "string" ? item.id : String(index);
      return publicBoundaryIssues(item, `${path}[${id}]`);
    });
  }
  if (!isRecord(value)) return [];
  const issues: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    if ((FORBIDDEN_KEYS as readonly string[]).includes(key)) {
      issues.push(`${path}.${key}: identifying field in an analytical record`);
    }
    if (key === "origin" && isRecord(child)) {
      const kind = child.kind;
      if (!(PUBLIC_ORIGIN_KINDS as readonly unknown[]).includes(kind)) {
        issues.push(`${path}.origin: "${String(kind)}" records belong in the private research store`);
      }
      if (kind === "approved_aggregate" && !child.approvalRef) {
        issues.push(`${path}.origin: an approved aggregate needs an approval reference`);
      }
    }
    // A real record must not be relabelled to pass a synthetic-only schema.
    if (key === "synthetic" && child === true && isRecord(value.origin) && value.origin.kind !== "synthetic_fixture") {
      issues.push(`${path}: marked synthetic although its origin is "${String(value.origin.kind)}"`);
    }
    issues.push(...publicBoundaryIssues(child, `${path}.${key}`));
  }
  return issues;
}

export function assertPublicStore(value: unknown): void {
  const issues = publicBoundaryIssues(value);
  if (issues.length > 0) {
    throw new Error(`Evidence store is not publishable:\n- ${issues.join("\n- ")}`);
  }
}

/**
 * What must be established before real observations are imported into the private store.
 * Nothing here runs an import; it only says whether one would be allowed.
 */
export const importManifestSchema = z.strictObject({
  studyId: z.string().min(1),
  source: z.string().min(1),
  storageLocation: z.string().min(1),
  authorisedUses: z
    .array(z.enum(["internal_analysis", "public_aggregate", "public_quotation"]))
    .min(1),
  consentRefs: z.array(z.string().min(1)).min(1),
  approvedByRole: z.string().min(1),
  approvedOn: z.iso.date(),
  retentionReviewOn: z.iso.date(),
});
export type ImportManifest = z.infer<typeof importManifestSchema>;

export function importIssues(manifest: unknown, records: unknown[], repositoryRoot: string): string[] {
  const parsed = importManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => `manifest ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  const issues: string[] = [];
  const { storageLocation, consentRefs, studyId } = parsed.data;
  const absolute = storageLocation.startsWith("/");
  if (!absolute || storageLocation === repositoryRoot || storageLocation.startsWith(`${repositoryRoot}/`)) {
    issues.push("storageLocation must be an absolute path outside the public repository");
  }
  records.forEach((record, index) => {
    const origin = isRecord(record) && isRecord(record.origin) ? record.origin : null;
    const id = isRecord(record) && typeof record.id === "string" ? record.id : `record ${index}`;
    if (!origin || origin.kind !== "participant_session") {
      issues.push(`${id}: only records with origin "participant_session" are imported; synthetic fixtures stay in the repository`);
      return;
    }
    if (origin.studyId !== studyId) issues.push(`${id}: belongs to another study`);
    if (typeof origin.consentRef !== "string" || !consentRefs.includes(origin.consentRef)) {
      issues.push(`${id}: no consent reference covered by the manifest`);
    }
    for (const issue of publicBoundaryIssues(record)) {
      // The origin kind is expected here; identifying fields are not, in any store.
      if (issue.includes("identifying field")) issues.push(`${id}: ${issue}`);
    }
  });
  return issues;
}
