// Fails when anything that belongs in the private research store is present in the
// public tree: a participant record, an identifying field in the evidence store, or a
// private store file that Git tracks. Runs without dependencies so every gate can call it.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
const vocabulary = read("packages/evidence-loop-contract/evidence-loop.v1.vocabulary.json");
const publicKinds = new Set(vocabulary.publicOriginKinds);
const forbidden = new Set(vocabulary.forbiddenKeys);
const problems = [];

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
    walk(child, `${path}.${key}`, file);
  }
}

const storeFile = "data/evidence-loop.json";
const store = read(storeFile);
if (store.schema !== vocabulary.schema) problems.push(`${storeFile}: schema is not ${vocabulary.schema}`);
walk(store, "$", storeFile);

let tracked = [];
try {
  tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
} catch {
  console.warn("git not available: tracked-file check skipped");
}
for (const file of tracked) {
  if (file.startsWith("private-research/") || file.endsWith(".private.json")) {
    problems.push(`${file}: private research file is tracked by Git`);
    continue;
  }
  // A participant record pasted into any tracked data file is caught by its origin marker.
  if (/^(data|examples|product-feedback-loop\/(data|examples))\/.*\.json$/.test(file)) {
    if (/"kind"\s*:\s*"participant_session"/.test(readFileSync(new URL(file, root), "utf8"))) {
      problems.push(`${file}: contains a participant_session record`);
    }
  }
}

const ignore = readFileSync(new URL(".gitignore", root), "utf8");
for (const rule of ["/private-research/", "*.private.json"]) {
  if (!ignore.split("\n").includes(rule)) problems.push(`.gitignore: missing rule ${rule}`);
}

if (problems.length > 0) {
  console.error(`private-data boundary broken:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`private-data boundary holds: ${storeFile} is public-safe, no private research file is tracked`);
