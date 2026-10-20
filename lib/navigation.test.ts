import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { navGroups } from "./navigation";

const APP = fileURLToPath(new URL("../app/", import.meta.url));

// Top-level page routes. /accounts/[id] is reached from the account cards, not the nav.
const topLevelRoutes = () => [
  "/",
  ...readdirSync(APP, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(APP, entry.name, "page.tsx")))
    .map((entry) => `/${entry.name}`),
];

describe("navigation", () => {
  const hrefs = navGroups.flatMap((group) => group.items.map((item) => item.href));

  it("lists every top-level page exactly once", () => {
    expect([...hrefs].sort()).toEqual(topLevelRoutes().sort());
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("links only to routes that exist", () => {
    for (const href of hrefs) expect(topLevelRoutes()).toContain(href);
  });

  it("has route states for loading, errors and unknown addresses", () => {
    for (const file of ["loading.tsx", "error.tsx", "not-found.tsx"]) {
      expect(existsSync(join(APP, file))).toBe(true);
    }
  });
});
