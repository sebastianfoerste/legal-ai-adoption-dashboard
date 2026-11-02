import type { Account } from "./schema";

/**
 * Seats without an active user, per account and practice group.
 *
 * What the synthetic data supports: seats, active users and weekly active users. An account's
 * `activeUsers` is its latest weekly count, so "idle in the latest week" is seats minus that
 * count, and the same subtraction on the first week of the series gives the earlier figure.
 *
 * What it does not support: telling a seat that was never used from one that lapsed, or how
 * long a seat has been idle. That needs a last-activity date per seat, which is not captured,
 * so those figures are `null` (shown as Unknown), never 0 and never estimated.
 *
 * Rules: counts only, never a list of people; an idle-seat count is context for the account
 * owner, not a recommendation to remove seats and not an input to expansion or renewal.
 */

export interface SeatUse {
  label: string;
  seats: number;
  /** Seats without an active user in the latest week; null when the counts do not reconcile. */
  idleLatest: number | null;
  /** The same count in the first week of the series. */
  idleFirst: number | null;
  weeks: number;
  /** Never-used versus lapsed seats: not captured, so always null. */
  neverUsed: null;
  lapsed: null;
  /** Set when active users exceed seats in a week, so the subtraction would go negative. */
  inconsistent: boolean;
}

export const SEAT_SPLIT_NOTE =
  "Whether an idle seat was never used or has lapsed needs a last-activity date per seat, which is not captured.";
export const SEAT_CONTEXT_NOTE =
  "Idle seats are context for the account owner. They are not a recommendation to remove seats and not an input to expansion or renewal.";

const idle = (seats: number, active: number | undefined): number | null =>
  active === undefined || active > seats ? null : seats - active;

function seatUse(label: string, seats: number, weekly: number[], latestActive: number): SeatUse {
  const first = weekly[0];
  return {
    label,
    seats,
    idleLatest: idle(seats, latestActive),
    idleFirst: idle(seats, first),
    weeks: weekly.length,
    neverUsed: null,
    lapsed: null,
    inconsistent: latestActive > seats || weekly.some((w) => w > seats),
  };
}

export function accountSeatUse(account: Account): { account: SeatUse; groups: SeatUse[] } {
  return {
    account: seatUse("All practice groups", account.seats, account.weeklyActiveUsers, account.activeUsers),
    groups: account.practiceGroups.map((g) => seatUse(g.name, g.seats, g.weeklyActiveUsers, g.activeUsers)),
  };
}

/** "32 of 40 seats", or "Unknown" when the counts do not reconcile. */
export const formatIdle = (count: number | null, seats: number): string =>
  count === null ? "Unknown" : `${count} of ${seats} seats`;
