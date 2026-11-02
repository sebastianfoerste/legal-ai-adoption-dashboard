import { INTERVENTION_STAGES, stageLabel, type InterventionStage } from "./engagement/interventions";
import { blockerSchema, feedbackItemSchema, severitySchema, type Account, type Blocker, type FeedbackItem } from "./schema";

/**
 * GET filters for the list pages, so a filtered list is a URL that can be bookmarked, shared
 * or saved as a named view (data/views.json, docs/adr/0005-saved-views.md).
 *
 * Rules kept here:
 * - only the keys and values listed below are read; anything else in a query is reported as
 *   ignored, never silently matched to an empty list;
 * - there is no owner, specialist or sort parameter: a view filters, it never ranks people;
 * - filters are applied on the server; nothing is stored per person.
 */

export const LIST_ROUTES = ["/blockers", "/feedback", "/interventions"] as const;
export type ListRoute = (typeof LIST_ROUTES)[number];

export interface FilterOption {
  value: string;
  label: string;
}
export interface FilterField {
  key: string;
  label: string;
  options: FilterOption[];
}

export const blockerCategoryLabel: Record<Blocker["category"], string> = {
  trust_in_output: "Trust in output",
  workflow_fit: "Workflow fit",
  training_gap: "Training gap",
  integration: "Integration",
  change_management: "Change management",
  pricing_value: "Pricing & value",
};

export const productAreaLabel: Record<FeedbackItem["productArea"], string> = {
  drafting: "Drafting",
  review: "Review",
  research: "Research",
  knowledge: "Knowledge",
  integrations: "Integrations",
  admin: "Admin & analytics",
};

export const routingLabel: Record<FeedbackItem["status"], string> = {
  new: "New",
  triaged: "Triaged",
  shared_with_product: "Shared with Product",
};

const severityLabel = { high: "High", medium: "Medium", low: "Low" } as const;

const options = <T extends string>(values: readonly T[], label: Record<T, string>): FilterOption[] =>
  values.map((value) => ({ value, label: label[value] }));

export function filterFields(route: ListRoute, accounts: Account[]): FilterField[] {
  const account: FilterField = {
    key: "account",
    label: "Account",
    options: accounts.map((a) => ({ value: a.id, label: a.name })),
  };
  const severity: FilterField = {
    key: "severity",
    label: "Severity",
    options: options([...severitySchema.options].reverse(), severityLabel),
  };
  switch (route) {
    case "/blockers":
      return [
        account,
        severity,
        { key: "category", label: "Category", options: options(blockerSchema.shape.category.options, blockerCategoryLabel) },
      ];
    case "/feedback":
      return [
        account,
        severity,
        { key: "area", label: "Product area", options: options(feedbackItemSchema.shape.productArea.options, productAreaLabel) },
        { key: "routing", label: "Routing", options: options(feedbackItemSchema.shape.status.options, routingLabel) },
      ];
    case "/interventions":
      return [account, { key: "stage", label: "Stage", options: options(INTERVENTION_STAGES, stageLabel) }];
  }
}

export interface ParsedFilter {
  /** Accepted filters, by key. A key that is absent is not filtered. */
  values: Record<string, string>;
  /** Values that were given for a filter key but are not one of its options. */
  rejected: { key: string; value: string }[];
}

type Query = Record<string, string | string[] | undefined>;

/** Reads only the route's filter keys; other parameters such as `asOf` are left alone. */
export function parseListFilter(route: ListRoute, query: Query, accounts: Account[]): ParsedFilter {
  const values: Record<string, string> = {};
  const rejected: ParsedFilter["rejected"] = [];
  for (const field of filterFields(route, accounts)) {
    const raw = query[field.key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === undefined || value === "") continue;
    if (field.options.some((o) => o.value === value)) values[field.key] = value;
    else rejected.push({ key: field.key, value });
  }
  return { values, rejected };
}

const pass = (filter: string | undefined, actual: string) => filter === undefined || filter === actual;

export const matchesBlocker = (b: Blocker, f: Record<string, string>) =>
  pass(f.account, b.accountId) && pass(f.severity, b.severity) && pass(f.category, b.category);

export const matchesFeedback = (item: FeedbackItem, f: Record<string, string>) =>
  pass(f.account, item.accountId) &&
  pass(f.severity, item.severity) &&
  pass(f.area, item.productArea) &&
  pass(f.routing, item.status);

export const matchesIntervention = (
  intervention: { accountId: string },
  stage: InterventionStage,
  f: Record<string, string>,
) => pass(f.account, intervention.accountId) && pass(f.stage, stage);

/** A link to a filtered list. Keys are written in a fixed order, so equal filters give equal URLs. */
export function listHref(path: string, values: Record<string, string>, keys: string[] = Object.keys(values).sort()): string {
  const params = new URLSearchParams();
  for (const key of keys) if (values[key]) params.set(key, values[key]);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/** One sentence naming the active filters, for the page and for screen readers. */
export function describeFilter(fields: FilterField[], values: Record<string, string>): string {
  const parts = fields
    .filter((field) => values[field.key])
    .map((field) => `${field.label}: ${field.options.find((o) => o.value === values[field.key])?.label}`);
  return parts.length === 0 ? "No filter: showing everything." : `Filtered by ${parts.join("; ")}.`;
}
