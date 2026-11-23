import { z } from "zod";
import viewsJson from "../data/views.json";
import { getAccounts } from "./data";
import { LIST_ROUTES, listHref, parseListFilter, type ListRoute } from "./list-filters";

/**
 * Named views: committed query strings for the list pages and Account Health, shown as links.
 * They are shared presets, not personal state; a person's own views are bookmarks.
 *
 * A view is refused at load when it uses a filter key or value its page does not accept, when
 * it carries a sort or owner parameter (a view filters, it never ranks people), or when it is
 * presented as an expansion or renewal list while filtering by health band: expansion never
 * follows from the health score.
 */

const PORTFOLIO_KEYS: Record<string, readonly string[] | null> = {
  search: null, // free text
  type: ["law_firm", "in_house"],
  band: ["at_risk", "needs_attention", "steady", "healthy"],
};

export const viewSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1),
  description: z.string().min(1),
  path: z.enum(["/", ...LIST_ROUTES]),
  query: z.record(z.string(), z.string().min(1)),
  synthetic: z.literal(true),
});
export type SavedView = z.infer<typeof viewSchema> & { href: string };

const FORBIDDEN_KEYS = /^(sort|order|rank|owner|specialist|lead)$/i;
const EXPANSION_WORDS = /\b(expan|upsell|renewal|seat growth)/i;

export function validateViews(raw: unknown, accountIds = getAccounts()): SavedView[] {
  const views = z.array(viewSchema).parse(raw);
  const ids = new Set<string>();
  return views.map((view) => {
    const where = `data/views.json ${view.id}`;
    if (ids.has(view.id)) throw new Error(`${where}: duplicate id`);
    ids.add(view.id);
    for (const key of Object.keys(view.query)) {
      if (FORBIDDEN_KEYS.test(key)) throw new Error(`${where}: "${key}" ranks or assigns people; views only filter`);
    }
    if (view.path === "/") {
      for (const [key, value] of Object.entries(view.query)) {
        if (!(key in PORTFOLIO_KEYS)) throw new Error(`${where}: "${key}" is not a filter on /`);
        const allowed = PORTFOLIO_KEYS[key];
        if (allowed && !allowed.includes(value)) throw new Error(`${where}: "${value}" is not a ${key}`);
      }
      if ("band" in view.query && EXPANSION_WORDS.test(`${view.label} ${view.description.replace(/not an expansion or renewal signal/i, "")}`)) {
        throw new Error(`${where}: a health-band view cannot be an expansion or renewal list`);
      }
    } else {
      const parsed = parseListFilter(view.path as ListRoute, view.query, accountIds);
      const unknown = Object.keys(view.query).filter((key) => !(key in parsed.values));
      if (parsed.rejected.length > 0 || unknown.length > 0) {
        throw new Error(`${where}: not a filter on ${view.path}: ${[...unknown].join(", ")}`);
      }
    }
    return { ...view, href: listHref(view.path, view.query) };
  });
}

const views = validateViews(viewsJson);

export const getSavedViews = (path?: string): SavedView[] =>
  path === undefined ? views : views.filter((view) => view.path === path);
