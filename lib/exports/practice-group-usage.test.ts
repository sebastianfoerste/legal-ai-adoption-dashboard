import { describe, expect, it } from "vitest";
import { getAccounts } from "../data";
import type { Account } from "../schema";
import { REVIEW_NOTE, csvCell, practiceGroupUsageCsv } from "./practice-group-usage";

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
    expect(employment[10]).toBe(""); // the third week was not recorded for this group
    expect(finance[6]).toBe("0.5000");
    expect(finance[10]).toBe("3");
  });

  it("quotes a cell that holds a comma or quote and leaves null empty", () => {
    expect(csvCell('Tax, "Private"')).toBe('"Tax, ""Private"""');
    expect(csvCell(null)).toBe("");
    expect(csvCell(0)).toBe("0");
  });
});
