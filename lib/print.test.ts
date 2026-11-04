import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The print stylesheet is the PDF export (docs/adr/0004-exports.md, option 1). These checks pin
// what it must keep and drop; the rendered PDF is checked by hand in two engines.
const css = readFileSync(join(__dirname, "..", "app", "globals.css"), "utf8");
const print = css.slice(css.indexOf("@media print"));

describe("print stylesheet", () => {
  it("exists", () => {
    expect(css).toContain("@media print");
  });

  it("drops navigation, forms and download controls", () => {
    expect(print).toMatch(/nav\[aria-label="Main"\]/);
    expect(print).toMatch(/\bform\b/);
    expect(print).toMatch(/\[data-print="hide"\]/);
  });

  it("puts the synthetic-data and review notice in every page's margin", () => {
    expect(print).toMatch(/@bottom-center\s*{[^}]*Synthetic data\. Draft for account-owner review; not legal advice\./);
  });

  it("never hides the on-page synthetic notice", () => {
    expect(print).not.toMatch(/aside[^{]*{[^}]*display:\s*none/);
    expect(print).not.toMatch(/Synthetic data notice/);
  });

  it("does not let a scrolling table clip on paper", () => {
    expect(print).toMatch(/\.overflow-x-auto\s*{[^}]*overflow:\s*visible/);
  });
});
