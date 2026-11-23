import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Plan item D3: every heading takes a step of the type scale defined in app/globals.css.
const root = join(__dirname, "..");
const STEPS = ["display", "figure", "title", "heading", "label", "eyebrow"];
const RAW_SIZE = /\btext-(?:xs|sm|base|lg|[2-9]?xl|\[[^\]]+\])\b/;

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

const headings = [...tsxFiles(join(root, "app")), ...tsxFiles(join(root, "components"))].flatMap((file) =>
  [...readFileSync(file, "utf8").matchAll(/<(h[1-6]|Title)\b[^>]*?className=(?:"([^"]*)"|\{`([^`]*)`\})/g)].map(
    (m) => ({ file: file.slice(root.length + 1), tag: m[1], cls: m[2] ?? m[3] }),
  ),
);

describe("type scale", () => {
  const css = readFileSync(join(root, "app", "globals.css"), "utf8");

  it("defines every step with a line height", () => {
    for (const step of STEPS) {
      expect(css).toMatch(new RegExp(`--text-${step}:\\s*[\\d.]+rem`));
      expect(css).toMatch(new RegExp(`--text-${step}--line-height:`));
    }
  });

  it("finds the headings it checks", () => {
    expect(headings.length).toBeGreaterThan(50);
  });

  it("gives every heading a step of the scale and no raw size", () => {
    const off = headings.filter(
      (h) => RAW_SIZE.test(h.cls) || !STEPS.some((step) => h.cls.includes(`text-${step}`)),
    );
    expect(off).toEqual([]);
  });

  it("uses one size for every page title", () => {
    const titles = headings.filter((h) => h.tag === "h1");
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.every((h) => h.cls.includes("text-display"))).toBe(true);
  });

  it("keeps no text below 12px", () => {
    const tiny = [...tsxFiles(join(root, "app")), ...tsxFiles(join(root, "components"))].filter((f) =>
      /text-\[(?:[0-9]|1[01])px\]/.test(readFileSync(f, "utf8")),
    );
    expect(tiny).toEqual([]);
  });
});
