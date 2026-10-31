import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const README = "README.md";
const README_MAX_WORDS = 350;
// The docs index and the docs that hold the sections moved out of the README.
const MOVED_SECTION_DOCS = [
  "docs/README.md",
  "docs/overview.md",
  "docs/FEATURES.md",
  "docs/how-it-works.md",
  "docs/screenshots.md",
];

const read = (file: string) => readFileSync(join(ROOT, file), "utf8");

// A closing fence repeats the opening character at least as often; nothing inside is Markdown.
const withoutFences = (markdown: string) =>
  markdown.replace(/^[ \t]*((`|~)\2{2,})[^\n]*\n[\s\S]*?^[ \t]*\1\2*[ \t]*$/gm, "");

// A code span opens and closes with equal backtick runs and may wrap a line, not a paragraph.
const withoutCode = (markdown: string) =>
  withoutFences(markdown)
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, ""))
    .join("\n\n");

// Counted as `wc -w` counts an ASCII file: runs of non-whitespace.
const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

// Inline links and images with any title form, reference definitions, and HTML src and href.
const INLINE = /\]\(\s*(<[^>\n]*>|[^)\s]+)(?:\s+(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\([^)]*\)))?\s*\)/g;
const DEFINITION = /^ {0,3}\[[^\]]+\]:\s*(<[^>\n]*>|\S+)/gm;
const HTML_ATTRIBUTE = /\b(?:src|href)\s*=\s*["']([^"']+)["']/g;
const isExternal = (target: string) => /^[a-z][a-z0-9+.-]*:/i.test(target);

function linkTargets(markdown: string): { targets: string[]; unread: number } {
  const text = withoutCode(markdown);
  const inline = [...text.matchAll(INLINE)].map(([, target]) => target);
  const targets = [...inline, ...[...text.matchAll(DEFINITION), ...text.matchAll(HTML_ATTRIBUTE)].map(([, target]) => target)];
  // Every `](` opens an inline link; one the pattern cannot read must fail, not pass unchecked.
  const unread = (text.match(/\]\(/g) ?? []).length - inline.length;
  return { targets: targets.map((target) => target.replace(/^<|>$/g, "")), unread };
}

const relativeLinks = (markdown: string) => linkTargets(markdown).targets.filter((target) => !isExternal(target));

// The anchors GitHub renders for a file's headings, with -1, -2 for repeats. Covers headings
// written as plain text, code and links, as this repository's are.
function headingAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>();
  for (const line of withoutFences(markdown).split("\n")) {
    const heading = /^ {0,3}#{1,6}\s+(.*?)(?:\s+#+)?\s*$/.exec(line);
    if (!heading) continue;
    const text = heading[1]
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, "");
    const slug = text.toLowerCase().replace(/[^\p{L}\p{M}\p{Nd}\s_-]/gu, "").replace(/ /g, "-");
    let anchor = slug;
    for (let repeat = 1; anchors.has(anchor); repeat++) anchor = `${slug}-${repeat}`;
    anchors.add(anchor);
  }
  return anchors;
}

// A path starting with / is relative to the repository root, as GitHub resolves it.
const resolveLink = (file: string, path: string) => (path.startsWith("/") ? path.slice(1) : join(dirname(file), path));

function brokenLinks(file: string): string[] {
  const { unread } = linkTargets(read(file));
  const broken = unread > 0 ? [`${unread} link(s) in a form this test cannot read`] : [];
  for (const target of relativeLinks(read(file))) {
    const [path, anchor] = decodeURIComponent(target).split("#");
    const resolved = path ? resolveLink(file, path) : file;
    if (relative(ROOT, join(ROOT, resolved)).startsWith("..")) {
      broken.push(`${target}: leaves the repository`);
    } else if (!existsSync(join(ROOT, resolved))) {
      broken.push(`${target}: no file ${resolved}`);
    } else if (anchor && resolved.endsWith(".md") && !headingAnchors(read(resolved)).has(anchor)) {
      broken.push(`${target}: no heading #${anchor} in ${resolved}`);
    }
  }
  return broken;
}

describe("README", () => {
  it(`stays within the ${README_MAX_WORDS}-word budget`, () => {
    expect(wordCount(read(README))).toBeLessThanOrEqual(README_MAX_WORDS);
  });

  it("has relative links and images that resolve to existing files and headings", () => {
    expect(relativeLinks(read(README)).length).toBeGreaterThan(0);
    expect(brokenLinks(README)).toEqual([]);
  });

  it("links the docs that hold its moved sections, the case study, the demo guide, the data statement and the licence", () => {
    const targets = relativeLinks(read(README)).map((target) => target.split("#")[0]);
    for (const file of [...MOVED_SECTION_DOCS, "CASE_STUDY.md", "docs/DEMO_GUIDE.md", "data/README.md", "LICENSE"]) {
      expect(targets).toContain(file);
    }
  });
});

// Every tracked Markdown file outside workshop-kit/, which has its own link checker
// (workshop-kit/scripts/link_checker.py). Read from git so an untracked draft is not checked.
const trackedMarkdown = (): string[] =>
  execFileSync("git", ["ls-files", "-z", "--", "*.md", "**/*.md"], { cwd: ROOT, encoding: "utf8" })
    .split("\0")
    .filter((file) => file.endsWith(".md") && !file.startsWith("workshop-kit/"));

describe("every tracked Markdown file outside workshop-kit/", () => {
  const files = trackedMarkdown();

  it("is a list this test actually read", () => {
    expect(files.length).toBeGreaterThan(30);
    expect(files).toContain("CASE_STUDY.md");
    expect(files).toContain("docs/API.md");
  });

  it.each(files)("%s has relative links that resolve to existing files and headings", (file) => {
    expect(brokenLinks(file)).toEqual([]);
  });
});

describe("the docs index and the docs holding the README's moved sections", () => {
  it.each(MOVED_SECTION_DOCS)("%s has relative links that resolve to existing files and headings", (file) => {
    expect(relativeLinks(read(file)).length).toBeGreaterThan(0);
    expect(brokenLinks(file)).toEqual([]);
  });

  it("the docs index lists every guide in docs/", () => {
    const listed = new Set(relativeLinks(read("docs/README.md")).map((target) => join("docs", target.split("#")[0])));
    const guides = readdirSync(join(ROOT, "docs")).filter((name) => name.endsWith(".md") && name !== "README.md");
    expect(guides.filter((guide) => !listed.has(join("docs", guide)))).toEqual([]);
  });
});
