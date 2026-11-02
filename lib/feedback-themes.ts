import type { ChangeView } from "./evidence/loop";
import type { DeliveryStatus } from "./evidence/schema";
import type { FeedbackItem, Severity } from "./schema";

/**
 * Feedback grouped by theme, for the Product Feedback Queue.
 *
 * "Votes" here are the accounts and persona roles that raised a theme, each shown as a count
 * with its denominator ("2 of 5 accounts"). The rules this module keeps:
 * - themes are listed by name, never ordered by how many raised them: a count is context for
 *   a product decision, not a rank;
 * - routing (`new`, `triaged`, `shared_with_product`) is triage only and is never reported as
 *   delivery or value;
 * - delivery is read only from the change records in the evidence store, joined through the
 *   problems that cite a theme's item ids. Theme names are not matched against the problems'
 *   own `feedbackThemes`, which use a different vocabulary;
 * - a theme no change record covers has no delivery status, not "not started".
 */

export interface ThemeCount {
  count: number;
  of: number;
}

export interface ThemeDelivery {
  changeId: string;
  title: string;
  deliveryStatus: DeliveryStatus;
  view: ChangeView;
}

export interface FeedbackTheme {
  theme: string;
  itemIds: string[];
  accountIds: string[];
  accounts: ThemeCount;
  personaRoles: FeedbackItem["sourcePersona"][];
  personas: ThemeCount;
  highestSeverity: Severity;
  routing: Record<FeedbackItem["status"], number>;
  /** Change records linked to any of the theme's items, each once. Empty: no delivery status. */
  changes: ThemeDelivery[];
  /** Items no change record cites, so their delivery is unknown. */
  itemsWithoutChange: string[];
}

const SEVERITY_ORDER: Severity[] = ["low", "medium", "high"];

export function summarizeThemes(
  items: FeedbackItem[],
  views: ChangeView[],
  denominators: { accounts: number; personaRoles: number },
): FeedbackTheme[] {
  const byTheme = new Map<string, FeedbackItem[]>();
  for (const item of items) byTheme.set(item.theme, [...(byTheme.get(item.theme) ?? []), item]);

  return [...byTheme.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([theme, themeItems]) => {
      const itemIds = themeItems.map((i) => i.id);
      const accountIds = [...new Set(themeItems.map((i) => i.accountId))].sort();
      const personaRoles = [...new Set(themeItems.map((i) => i.sourcePersona))].sort();
      const linked = views.filter((v) => v.problem.feedbackItemIds.some((id) => itemIds.includes(id)));
      const changes = [...new Map(linked.map((v) => [v.change.id, v])).values()]
        .sort((a, b) => a.change.id.localeCompare(b.change.id))
        .map((view) => ({ changeId: view.change.id, title: view.change.title, deliveryStatus: view.deliveryStatus, view }));
      const cited = new Set(linked.flatMap((v) => v.problem.feedbackItemIds));
      return {
        theme,
        itemIds,
        accountIds,
        accounts: { count: accountIds.length, of: denominators.accounts },
        personaRoles,
        personas: { count: personaRoles.length, of: denominators.personaRoles },
        highestSeverity: themeItems
          .map((i) => i.severity)
          .reduce((a, b) => (SEVERITY_ORDER.indexOf(b) > SEVERITY_ORDER.indexOf(a) ? b : a)),
        routing: {
          new: themeItems.filter((i) => i.status === "new").length,
          triaged: themeItems.filter((i) => i.status === "triaged").length,
          shared_with_product: themeItems.filter((i) => i.status === "shared_with_product").length,
        },
        changes,
        itemsWithoutChange: itemIds.filter((id) => !cited.has(id)),
      };
    });
}

export const formatCount = ({ count, of }: ThemeCount, noun: string): string => `${count} of ${of} ${noun}`;
