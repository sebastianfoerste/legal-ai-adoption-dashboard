// Fails when anything that belongs in the private research store is present in the
// public tree: a participant record, an identifying field in the evidence store, a record
// that does not state its origin, a name from the private denylist, or a private store
// file that Git tracks. Runs without dependencies so every gate can call it.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const vocabulary = read("packages/evidence-loop-contract/evidence-loop.v1.vocabulary.json");
const publicKinds = new Set(vocabulary.publicOriginKinds);
const forbidden = new Set(vocabulary.forbiddenKeys);
const problems = [];

const identifierPatterns = vocabulary.identifierPatterns.map(({ label, pattern }) => [label, new RegExp(pattern)]);

// Free text of a record that came out of real sessions is read for obvious identifiers.
// Reference fields such as approvalRef may hold a link and are left out.
function scanText(value, path, file) {
  if (typeof value === "string") {
    for (const [label, pattern] of identifierPatterns) {
      if (pattern.test(value)) problems.push(`${file} ${path}: contains ${label}`);
    }
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => scanText(item, `${path}[${index}]`, file));
  } else if (typeof value === "object" && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      if (!/Refs?$/.test(key)) scanText(child, `${path}.${key}`, file);
    }
  }
}

function walk(value, path, file) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${item?.id ?? index}]`, file));
    return;
  }
  if (typeof value !== "object" || value === null) return;
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(key)) problems.push(`${file} ${path}.${key}: identifying field`);
    if (key === "origin" && child && typeof child === "object" && !publicKinds.has(child.kind)) {
      problems.push(`${file} ${path}.origin: "${child.kind}" belongs in the private research store`);
    }
    if (key === "origin" && child?.kind === "approved_aggregate") scanText(value, path, file);
    walk(child, `${path}.${key}`, file);
  }
}

const storeFile = "data/evidence-loop.json";
const store = read(storeFile);
if (store.schema !== vocabulary.schema) problems.push(`${storeFile}: schema is not ${vocabulary.schema}`);
walk(store, "$", storeFile);

// Feedback items and interviews feed the evidence loop from outside the store. Each must
// say where it comes from; a name suffix such as "(synthetic)" is not a statement of origin.
function requireOrigin(record, path, file) {
  if (!record || typeof record !== "object" || !record.origin || typeof record.origin !== "object") {
    problems.push(`${file} ${path}: no origin stated`);
  }
}
const feedbackFile = "data/feedback.json";
const feedback = read(feedbackFile);
feedback.forEach((item, index) => requireOrigin(item, `$[${item?.id ?? index}]`, feedbackFile));
walk(feedback, "$", feedbackFile);

const interviewsFile = "product-feedback-loop/data/interviews.json";
const interviews = read(interviewsFile);
requireOrigin(interviews, "$", interviewsFile);
(interviews.interviews ?? []).forEach((interview, index) => {
  requireOrigin(interview, `$.interviews[${index}]`, interviewsFile);
  if (interview?.origin?.kind !== interviews.origin?.kind) {
    problems.push(`${interviewsFile} $.interviews[${index}]: origin differs from the file's; one origin per file`);
  }
});
walk(interviews, "$", interviewsFile);

let tracked = [];
try {
  tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
} catch {
  console.warn("git not available: tracked-file check skipped");
}
const isDataFile = (file) => /^(data|examples|product-feedback-loop\/(data|examples))\/.*\.json$/.test(file);
let publishesRealEvidence = false;
for (const file of tracked) {
  if (file.startsWith("private-research/") || file.endsWith(".private.json")) {
    problems.push(`${file}: private research file is tracked by Git`);
    continue;
  }
  // A participant record pasted into any tracked data file is caught by its origin marker.
  if (isDataFile(file)) {
    const text = readFileSync(new URL(file, root), "utf8");
    if (/"kind"\s*:\s*"participant_session"/.test(text)) {
      problems.push(`${file}: contains a participant_session record`);
    }
    if (/"kind"\s*:\s*"approved_aggregate"/.test(text)) publishesRealEvidence = true;
  }
}

const ignore = readFileSync(new URL(".gitignore", root), "utf8");
for (const rule of ["/private-research/", "*.private.json"]) {
  if (!ignore.split("\n").includes(rule)) problems.push(`.gitignore: missing rule ${rule}`);
}

// The names of participants, employers and clients are known only to the private store.
// PRIVATE_RESEARCH_DENYLIST points at that list: one name per line, `#` for comments.
// A match is reported by entry number, so the name itself never reaches a log.
const escapePattern = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const denylistPattern = (entry) =>
  new RegExp(`(?<![\\p{L}\\p{N}])${entry.split(/\s+/).map(escapePattern).join("\\s+")}(?![\\p{L}\\p{N}])`, "iu");
const denylistPath = process.env.PRIVATE_RESEARCH_DENYLIST;
let denylistNote = "no name check needed (synthetic fixtures only)";
if (denylistPath) {
  const absolute = resolve(denylistPath);
  const inside = relative(rootPath, absolute);
  if (!isAbsolute(denylistPath) || !inside.startsWith("..")) {
    problems.push("PRIVATE_RESEARCH_DENYLIST must be an absolute path outside the public repository");
  } else {
    const entries = readFileSync(absolute, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#"));
    if (entries.length === 0) problems.push("PRIVATE_RESEARCH_DENYLIST is empty: the name check cannot be made");
    const patterns = entries.map(denylistPattern);
    for (const file of tracked.filter((name) => /\.(json|md|txt|csv|html)$/.test(name))) {
      const text = readFileSync(new URL(file, root), "utf8");
      patterns.forEach((pattern, index) => {
        if (pattern.test(text)) problems.push(`${file}: matches denylist entry ${index + 1}`);
      });
    }
    denylistNote = `denylist checked (${entries.length} ${entries.length === 1 ? "entry" : "entries"})`;
  }
} else if (publishesRealEvidence) {
  // Fail closed: an approved aggregate has passed through real sessions.
  problems.push(
    "an approved aggregate is published but PRIVATE_RESEARCH_DENYLIST is not set: the name check cannot be made",
  );
}

if (problems.length > 0) {
  console.error(`private-data boundary broken:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(
  `private-data boundary holds: ${storeFile} is public-safe, feedback items and interviews state their origin, ` +
    `no private research file is tracked, ${denylistNote}`,
);
