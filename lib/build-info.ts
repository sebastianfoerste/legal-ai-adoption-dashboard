/**
 * The build stamp shown in the layout footer: which commit a running deployment was built
 * from, so a reviewer can see whether a demo is current. The SHA is resolved at build time in
 * next.config.ts and arrives here through `process.env`; this module only formats it.
 */

export const REPOSITORY_URL = "https://github.com/sebastianfoerste/legal-ai-adoption-dashboard";

export interface BuildStamp {
  /** The full commit SHA, or "unknown". */
  sha: string;
  /** The first seven characters, or "unknown". */
  short: string;
  /** The commit page on GitHub, or null when the commit is unknown. */
  url: string | null;
  /** The build date as YYYY-MM-DD, or null when it was not recorded. */
  date: string | null;
  /** The footer text, e.g. "Build 4fc25c5 (2026-10-31)". */
  label: string;
}

const COMMIT_SHA = /^[0-9a-f]{7,40}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function buildStamp(sha: string | undefined, date: string | undefined): BuildStamp {
  const clean = (sha ?? "").trim().toLowerCase();
  const known = COMMIT_SHA.test(clean);
  const short = known ? clean.slice(0, 7) : "unknown";
  const cleanDate = (date ?? "").trim();
  const buildDate = ISO_DATE.test(cleanDate) ? cleanDate : null;
  return {
    sha: known ? clean : "unknown",
    short,
    url: known ? `${REPOSITORY_URL}/commit/${clean}` : null,
    date: buildDate,
    label: buildDate ? `Build ${short} (${buildDate})` : `Build ${short}`,
  };
}
