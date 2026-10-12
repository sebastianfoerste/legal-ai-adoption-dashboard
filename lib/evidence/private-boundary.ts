import { z } from "zod";
import vocabulary from "../../packages/evidence-loop-contract/evidence-loop.v1.vocabulary.json";

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

/**
 * Text that is likely to identify a person or an organisation. The patterns live in the
 * contract file, so the dashboard, the boundary script and the Python module apply the
 * same list. They catch the obvious cases; the denylist and the approver's reading catch
 * the rest.
 */
const IDENTIFIER_PATTERNS = vocabulary.identifierPatterns.map(
  ({ label, pattern }) => [label, new RegExp(pattern)] as const,
);

// A field such as `approvalRef` or `implementationRef` holds a reference, which may be a link.
const isReferenceKey = (key: string) => /Refs?$/.test(key);

/** Why the free text of a record may identify someone. Synthetic fixtures are not checked. */
export function identifierIssues(value: unknown, path = "$"): string[] {
  if (typeof value === "string") {
    return IDENTIFIER_PATTERNS.flatMap(([label, pattern]) =>
      pattern.test(value) ? [`${path}: contains ${label}`] : [],
    );
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => identifierIssues(item, `${path}[${index}]`));
  }
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    isReferenceKey(key) ? [] : identifierIssues(child, `${path}.${key}`),
  );
}

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
      // An approved aggregate has passed through real sessions, so its text is read for names.
      if (kind === "approved_aggregate") issues.push(...identifierIssues(value, path));
    }
    // A real record must not be relabelled to pass a synthetic-only schema.
    if (key === "synthetic" && child === true && isRecord(value.origin) && value.origin.kind !== "synthetic_fixture") {
      issues.push(`${path}: marked synthetic although its origin is "${String(value.origin.kind)}"`);
    }
    issues.push(...publicBoundaryIssues(child, `${path}.${key}`));
  }
  return issues;
}

export function assertPublicStore(value: unknown, label = "Evidence store"): void {
  const issues = publicBoundaryIssues(value);
  if (issues.length > 0) {
    throw new Error(`${label} is not publishable:\n- ${issues.join("\n- ")}`);
  }
}

/** One entry per line. Blank lines and lines starting with `#` are ignored. */
export function parseDenylist(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"));
}

const escapePattern = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whole words, any case, any run of whitespace between the words of an entry. */
export const denylistPattern = (entry: string): RegExp =>
  new RegExp(`(?<![\\p{L}\\p{N}])${entry.split(/\s+/).map(escapePattern).join("\\s+")}(?![\\p{L}\\p{N}])`, "iu");

/**
 * The names of participants, their employers and their clients are known only to the
 * private research store. This checks public text against that list. A match is reported
 * by entry number, so the name itself never reaches a log.
 */
export function denylistIssues(value: unknown, entries: readonly string[], path = "$"): string[] {
  if (typeof value === "string") {
    return entries.flatMap((entry, index) =>
      denylistPattern(entry).test(value) ? [`${path}: matches denylist entry ${index + 1}`] : [],
    );
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      const id = isRecord(item) && typeof item.id === "string" ? item.id : String(index);
      return denylistIssues(item, entries, `${path}[${id}]`);
    });
  }
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, child]) => denylistIssues(child, entries, `${path}.${key}`));
}

/**
 * Synthetic fixtures were never near a real name. Anything else has passed through real
 * sessions, so publishing it without the name check is refused.
 */
export function needsDenylist(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(needsDenylist);
  if (!isRecord(value)) return false;
  if (isRecord(value.origin) && value.origin.kind !== "synthetic_fixture") return true;
  return Object.values(value).some(needsDenylist);
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
    // An analytical record names nobody: no employer, client or contact detail in its text.
    for (const issue of identifierIssues(record)) issues.push(`${id}: ${issue}`);
  });
  return issues;
}
