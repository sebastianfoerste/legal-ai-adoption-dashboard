export type Urgency = "act_now" | "this_week" | "watch";

export interface AttentionSortKey {
  urgencies: Urgency[];
  daysToRenewal: number;
}

const countOf = (key: AttentionSortKey, urgency: Urgency) =>
  key.urgencies.filter((candidate) => candidate === urgency).length;

/**
 * Order of the manager's attention list. Negative puts `a` first.
 *
 * Ranks hierarchically by recorded reasons: act-now items first, then this-week items,
 * then watch items, then the nearer renewal date. Account size, seat count and activity
 * volume are deliberately absent from the sort key.
 */
export function compareAttention(a: AttentionSortKey, b: AttentionSortKey): number {
  return (
    countOf(b, "act_now") - countOf(a, "act_now") ||
    countOf(b, "this_week") - countOf(a, "this_week") ||
    countOf(b, "watch") - countOf(a, "watch") ||
    a.daysToRenewal - b.daysToRenewal
  );
}
