import { describe, expect, it } from "vitest";
import { accountHealth } from "../aggregate";
import { getAccounts } from "../data";
import type { Account } from "../schema";
import { portfolioCsv } from "./portfolio";

const accounts = getAccounts();
const rows = (csv: string) => csv.split("\r\n").map((line) => line.split(","));

describe("portfolioCsv", () => {
  it("writes a header and one synthetic row per account", () => {
    const [header, ...body] = rows(portfolioCsv(accounts, accountHealth, "2026-07-31"));
    expect(header[5]).toBe("Utilization Rate");
    expect(body).toHaveLength(accounts.length);
    expect(body.every((r) => r.at(-1) === "synthetic")).toBe(true);
  });

  it("writes utilisation to four decimals and the account's own health", () => {
    const [, first] = rows(portfolioCsv(accounts.slice(0, 1), accountHealth, "2026-07-31"));
    const a = accounts[0];
    expect(first[5]).toBe((a.activeUsers / a.seats).toFixed(4));
    expect(first[6]).toBe(String(accountHealth(a.id).score));
  });

  it("leaves utilisation empty for an account without seats, never 0", () => {
    const seatless: Account = { ...accounts[0], seats: 0, activeUsers: 0 };
    const [, row] = rows(portfolioCsv([seatless], accountHealth, "2026-07-31"));
    expect(row[5]).toBe("");
    expect(row[5]).not.toMatch(/^0/);
  });

  it("states the active-user week and leaves the unrecorded lag empty, never 0", () => {
    const [header, row] = rows(portfolioCsv(accounts.slice(0, 1), accountHealth, "2026-07-31"));
    expect(header.slice(9, 11)).toEqual(["Active Users Window", "Lag Days"]);
    expect(row.slice(9, 11)).toEqual(["week ending 2026-07-31", ""]);
  });

  it("ends every line with CRLF, like the usage CSV (RFC 4180)", () => {
    const csv = portfolioCsv(accounts.slice(0, 2), accountHealth, "2026-07-31");
    expect(csv.split("\r\n")).toHaveLength(3);
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("neutralises a name a spreadsheet would read as a formula", () => {
    const odd: Account = { ...accounts[0], name: "=HYPERLINK(\"https://example.invalid\")" };
    const [, row] = rows(portfolioCsv([odd], accountHealth, "2026-07-31"));
    expect(row[1]).toBe("\"'=HYPERLINK(\"\"https://example.invalid\"\")\"");
  });

  it("quotes a name that holds a comma or quote", () => {
    const odd: Account = { ...accounts[0], name: 'Smith, "Jones" & Co' };
    expect(portfolioCsv([odd], accountHealth, "2026-07-31")).toContain('"Smith, ""Jones"" & Co"');
  });
});
