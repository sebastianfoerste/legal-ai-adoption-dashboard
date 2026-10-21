import { existsSync, readFileSync, readdirSync } from "node:fs";
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

  it("has route states for errors and unknown addresses", () => {
    for (const file of ["error.tsx", "not-found.tsx"]) {
      expect(existsSync(join(APP, file))).toBe(true);
    }
  });

  // A loading.tsx wraps the page below it in Suspense, so the response streams and
  // notFound() can no longer set the status: an unknown account would return 200, not 404.
  // Every page reads bundled JSON, so there is nothing slow to show a loading state for.
  it("puts no loading.tsx above a route that calls notFound()", () => {
    const callers = ["accounts/[id]", "accounts/[id]/review"];
    for (const route of callers) {
      expect(readFileSync(join(APP, route, "page.tsx"), "utf8")).toMatch(/notFound\(\)/);
      const segments = route.split("/");
      for (let depth = 0; depth <= segments.length; depth++) {
        const dir = join(APP, ...segments.slice(0, depth));
        expect(existsSync(join(dir, "loading.tsx")), `${dir}/loading.tsx`).toBe(false);
      }
    }
  });
});
