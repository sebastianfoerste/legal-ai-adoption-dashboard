import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PRINT_NOTICE } from "./print";

// The print stylesheet is the PDF export (docs/adr/0004-exports.md, option 1). These checks pin
// what it must keep and drop; the rendered PDF was checked in Chromium and Firefox (2026-11-17).
const css = readFileSync(join(__dirname, "..", "app", "globals.css"), "utf8");
const print = css.slice(css.indexOf("@media print"));
const layout = readFileSync(join(__dirname, "..", "app", "layout.tsx"), "utf8");

describe("print stylesheet", () => {
  it("exists", () => {
    expect(css).toContain("@media print");
  });

  it("drops navigation, forms and download controls", () => {
    expect(print).toMatch(/nav\[aria-label="Main"\]/);
    expect(print).toMatch(/\bform\b/);
    expect(print).toMatch(/\[data-print="hide"\]/);
  });

  it("repeats the synthetic-data and review notice at the foot of every printed page", () => {
    // Chromium prints the page margin box; Firefox ignores margin boxes but repeats a table
    // footer group on each page. Both routes carry the same line.
    expect(PRINT_NOTICE).toBe("Synthetic data. Draft for account-owner review; not legal advice.");
    expect(layout).toMatch(/className="print-frame[^"]*"/);
    expect(layout).toMatch(/className="print-notice hidden"[\s\S]*\{PRINT_NOTICE\}/);
    expect(print).toMatch(/\.print-frame\s*{[^}]*display:\s*table\b/);
    expect(print).toMatch(/\.print-notice\s*{[^}]*display:\s*table-footer-group/);
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
