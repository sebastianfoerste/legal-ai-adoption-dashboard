import { describe, it, expect } from "vitest";
import { getAccounts, getBlockers, getFeedback } from "./data";

describe("data layer", () => {
  it("loads and validates accounts", () => {
    const accounts = getAccounts();
    expect(accounts.length).toBeGreaterThanOrEqual(3);
    expect(accounts[0].seats).toBeGreaterThan(0);
  });

  it("every blocker references a known account", () => {
    const ids = new Set(getAccounts().map((a) => a.id));
    expect(getBlockers().every((b) => ids.has(b.accountId))).toBe(true);
  });

  it("every feedback item references a known account", () => {
    const ids = new Set(getAccounts().map((a) => a.id));
    expect(getFeedback().every((f) => ids.has(f.accountId))).toBe(true);
  });
});
