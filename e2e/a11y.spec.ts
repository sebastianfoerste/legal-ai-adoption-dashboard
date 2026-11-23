import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Every HTML route, at the two widths the Playwright projects set, must pass axe-core's
 * WCAG 2.0/2.1/2.2 A and AA rules and the two heading rules that sit outside those tags.
 * Page titles must differ between routes (WCAG 2.4.2: tabs and history stay usable).
 */

const ROUTES = [
  "/",
  "/?band=at_risk",
  "/accounts/acct-001",
  "/accounts/acct-005/review",
  "/blockers",
  "/feedback",
  "/research",
  "/interventions",
  "/manager",
  "/insights",
  "/benchmarks",
  "/accounts/no-such-account",
];

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const HEADING_RULES = ["heading-order", "page-has-heading-one"];

type Violation = { id: string; impact?: string | null; help: string; nodes: { target: unknown[] }[] };

const describe = (violations: Violation[]) =>
  violations
    .map((v) => `${v.id} (${v.impact ?? "n/a"}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`)
    .join("\n");

for (const route of ROUTES) {
  test(`${route} has no WCAG 2.2 AA violation and a sound heading outline`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();

    const wcag = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(wcag.violations, describe(wcag.violations)).toEqual([]);

    const headings = await new AxeBuilder({ page }).withRules(HEADING_RULES).analyze();
    expect(headings.violations, describe(headings.violations)).toEqual([]);
  });
}

test("every route has its own page title, suffixed with the app name", async ({ page }) => {
  const titles = new Map<string, string>();
  for (const route of ROUTES) {
    await page.goto(route);
    titles.set(route, await page.title());
  }
  for (const [route, title] of titles) {
    expect(title, route).toMatch(/^(.+ · )?Legal AI Adoption Dashboard$/);
  }
  // A route with a query string is the same route; the filter does not change the title.
  const byPath = new Map<string, string>();
  for (const [route, title] of titles) byPath.set(route.split("?")[0], title);
  const distinct = new Set(byPath.values());
  expect([...distinct].length, JSON.stringify(Object.fromEntries(byPath), null, 2)).toBe(byPath.size);
});
