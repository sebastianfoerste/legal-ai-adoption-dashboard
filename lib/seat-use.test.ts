import { describe, expect, it } from "vitest";
import { getAccounts } from "./data";
import type { Account } from "./schema";
import { SEAT_CONTEXT_NOTE, accountSeatUse, formatIdle } from "./seat-use";

const accounts = getAccounts();
const byId = (id: string) => accounts.find((a) => a.id === id)!;

describe("accountSeatUse", () => {
  it("counts seats without an active user in the latest and first week", () => {
    const { account } = accountSeatUse(byId("acct-003"));
    expect(account.seats).toBe(40);
    expect(account.idleLatest).toBe(32); // 40 seats, 8 active
    expect(account.idleFirst).toBe(20); // 40 seats, 20 active five weeks earlier
    expect(account.weeks).toBe(5);
    expect(formatIdle(account.idleLatest, account.seats)).toBe("32 of 40 seats");
  });

  it("gives every practice group its own count, which sums to the account", () => {
    for (const a of accounts) {
      const use = accountSeatUse(a);
      const sum = use.groups.reduce((s, g) => s + (g.idleLatest ?? 0), 0);
      expect(sum).toBe(use.account.idleLatest);
    }
  });

  it("never reports never-used or lapsed seats: the data has no last-activity dates", () => {
    for (const a of accounts) {
      const use = accountSeatUse(a);
      for (const s of [use.account, ...use.groups]) {
        expect(s.neverUsed).toBeNull();
        expect(s.lapsed).toBeNull();
      }
    }
  });

  it("returns Unknown, not a negative or zero count, when active users exceed seats", () => {
    const broken: Account = { ...byId("acct-001"), seats: 40, activeUsers: 45 };
    const { account } = accountSeatUse(broken);
    expect(account.idleLatest).toBeNull();
    expect(account.inconsistent).toBe(true);
    expect(formatIdle(account.idleLatest, account.seats)).toBe("Unknown");
  });

  it("keeps a real zero as zero", () => {
    const full: Account = { ...byId("acct-001"), seats: 45 };
    expect(accountSeatUse(full).account.idleLatest).toBe(0);
    expect(formatIdle(0, 45)).toBe("0 of 45 seats");
  });

  it("says idle seats are not an expansion or renewal input", () => {
    expect(SEAT_CONTEXT_NOTE).toMatch(/not an input to expansion or renewal/);
  });
});
