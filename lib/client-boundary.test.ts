import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The data layer stays on the server. A client component that imports it, directly or
 * through one module in between, ships Zod and every synthetic record to the browser (this
 * once put a 419 KB chunk on `/`). The guard reads every "use client" file and fails on such
 * an import.
 */

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SCAN_DIRS = ["app", "components", "lib"];
const SOURCE = /\.(ts|tsx)$/;
const TEST_FILE = /\.(test|spec)\.(ts|tsx)$/;
/** Module ids relative to the repository root, without extension. */
const DATA_LAYER = ["lib/data", "lib/aggregate", "lib/engagement/data", "lib/evidence/data"];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== "node_modules") out.push(...sourceFiles(path));
    } else if (SOURCE.test(name) && !TEST_FILE.test(name)) {
      out.push(path);
    }
  }
  return out;
}

// "use client" must be the first statement; only comments may precede it.
const USE_CLIENT = /^(?:\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/))*\s*["']use client["']/;
const isClientModule = (source: string) => USE_CLIENT.test(source);

// Static imports and re-exports with a runtime effect; `import type` is erased at build.
const IMPORT_FROM = /^\s*(?:import|export)\s+(?!type\s)[^;'"]*?\sfrom\s+["']([^"']+)["']/gm;
const SIDE_EFFECT_IMPORT = /^\s*import\s+["']([^"']+)["']/gm;
const DYNAMIC_IMPORT = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

function importTargets(source: string): string[] {
  return [IMPORT_FROM, SIDE_EFFECT_IMPORT, DYNAMIC_IMPORT].flatMap((pattern) =>
    [...source.matchAll(pattern)].map(([, target]) => target),
  );
}

/** A local module id for `@/x` and relative targets; null for a package. */
function resolveLocal(fromFile: string, target: string): string | null {
  let path: string;
  if (target.startsWith("@/")) path = join(ROOT, target.slice(2));
  else if (target.startsWith(".")) path = resolve(dirname(fromFile), target);
  else return null;
  return relative(ROOT, path).replace(/\\/g, "/").replace(/\.(ts|tsx|js|mjs)$/, "").replace(/\/index$/, "");
}

function moduleFile(id: string): string | null {
  for (const candidate of [`${id}.ts`, `${id}.tsx`, `${id}/index.ts`, `${id}/index.tsx`]) {
    const path = join(ROOT, candidate);
    if (existsSync(path)) return path;
  }
  return null;
}

const localImports = (file: string): string[] =>
  importTargets(readFileSync(file, "utf8"))
    .map((target) => resolveLocal(file, target))
    .filter((id): id is string => id !== null);

describe("client components never import the data layer", () => {
  const clientFiles = SCAN_DIRS.flatMap((dir) => sourceFiles(join(ROOT, dir))).filter((file) =>
    isClientModule(readFileSync(file, "utf8")),
  );

  it("scans the client components the repository has", () => {
    const names = clientFiles.map((file) => relative(ROOT, file).replace(/\\/g, "/"));
    expect(names).toContain("components/NavLinks.tsx");
    expect(names).toContain("app/error.tsx");
  });

  it("finds no data-layer import, directly or one module away", () => {
    const offenders: string[] = [];
    for (const file of clientFiles) {
      const name = relative(ROOT, file).replace(/\\/g, "/");
      for (const direct of localImports(file)) {
        if (DATA_LAYER.includes(direct)) offenders.push(`${name} -> ${direct}`);
        const via = moduleFile(direct);
        if (!via) continue;
        for (const indirect of localImports(via)) {
          if (DATA_LAYER.includes(indirect)) offenders.push(`${name} -> ${direct} -> ${indirect}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
