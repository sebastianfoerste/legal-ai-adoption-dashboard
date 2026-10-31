import { describe, expect, it } from "vitest";
import { getAccounts } from "../data";
import type { Account } from "../schema";
import { REVIEW_NOTE, alignToLatest, csvCell, practiceGroupUsageCsv, usageWindowWeeks } from "./practice-group-usage";

const account = getAccounts().find((a) => a.id === "acct-001")!;
const parse = (csv: string) => csv.trimEnd().split("\r\n").map((line) => line.split(","));

describe("practiceGroupUsageCsv", () => {
  it("names the file as synthetic, with the account and as-of date", () => {
    expect(practiceGroupUsageCsv(account, "2026-07-31").filename).toBe(
      "synthetic-practice-group-usage-acct-001-2026-07-31.csv",
    );
  });

  it("labels the window as weeks ending on the as-of date, not a quarter", () => {
    const { window, weeks } = practiceGroupUsageCsv(account, "2026-07-31");
    expect(weeks).toBe(5);
    expect(window).toBe("5 weeks ending 2026-07-31 (oldest first)");
    expect(window).not.toMatch(/quarter/i);
  });

  it("writes one row per practice group with every weekly count, oldest first", () => {
    const [header, ...rows] = parse(practiceGroupUsageCsv(account, "2026-07-31").csv);
    expect(rows).toHaveLength(account.practiceGroups.length);
    expect(header.at(8)).toBe("weekly_active_users_week_1_oldest");
    expect(header.at(12)).toBe("weekly_active_users_week_5_latest");
    const corporate = rows.find((r) => r[2] === "Corporate")!;
    expect(corporate.slice(8, 13)).toEqual(["10", "12", "14", "16", "17"]);
    expect(rows.every((r) => r[0] === "synthetic" && r.at(-1) === REVIEW_NOTE)).toBe(true);
  });

  it("leaves a missing value empty, never 0", () => {
    const sparse: Account = {
      ...account,
      practiceGroups: [
        { name: "Employment", seats: 0, activeUsers: 0, weeklyActiveUsers: [1, 2], queriesPerWeek: 3 },
        { name: "Finance", seats: 4, activeUsers: 2, weeklyActiveUsers: [1, 2, 3], queriesPerWeek: 5 },
      ],
    };
    const [, employment, finance] = parse(practiceGroupUsageCsv(sparse, "2026-07-31").csv);
    expect(employment[6]).toBe(""); // no seats, no utilisation
    // A shorter series ends at the as-of date too: its oldest week is the one missing.
    expect(employment.slice(8, 11)).toEqual(["", "1", "2"]);
    expect(finance.slice(8, 11)).toEqual(["1", "2", "3"]);
    expect(finance[6]).toBe("0.5000");
  });

  it("quotes a cell that holds a comma or quote and leaves null empty", () => {
    expect(csvCell('Tax, "Private"')).toBe('"Tax, ""Private"""');
    expect(csvCell(null)).toBe("");
    expect(csvCell(0)).toBe("0");
  });

  it("neutralises a string cell that starts like a spreadsheet formula (OWASP)", () => {
    expect(csvCell("=SUM(A1:A9)")).toBe("\"'=SUM(A1:A9)\"");
    expect(csvCell("+1")).toBe("\"'+1\"");
    expect(csvCell("-x")).toBe("\"'-x\"");
    expect(csvCell("@cmd")).toBe("\"'@cmd\"");
    expect(csvCell("\tlead")).toBe("\"'\tlead\"");
    expect(csvCell("\rlead")).toBe("\"'\rlead\"");
    expect(csvCell("\nlead")).toBe("\"'\nlead\"");
    expect(csvCell("=a,\"b\"")).toBe("\"'=a,\"\"b\"\"\"");
  });

  it("passes numbers through unchanged, negative ones included", () => {
    expect(csvCell(-5)).toBe("-5");
    expect(csvCell(0.25)).toBe("0.25");
    expect(csvCell("plain text")).toBe("plain text");
    expect(csvCell("2026-07-31")).toBe("2026-07-31");
  });

  it("puts each group's latest count in the latest column", () => {
    expect(alignToLatest([4, 5, 6], 5)).toEqual([null, null, 4, 5, 6]);
    expect(alignToLatest([1, 2, 3, 4, 5], 5)).toEqual([1, 2, 3, 4, 5]);
    expect(alignToLatest([], 2)).toEqual([null, null]);
  });

  it("states the same window in the file as the account page link uses", () => {
    expect(practiceGroupUsageCsv(account, "2026-07-31").weeks).toBe(usageWindowWeeks(account));
  });
});
