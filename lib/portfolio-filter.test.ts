import { describe, expect, it } from "vitest";
import { accountHealth } from "./aggregate";
import { getAccounts } from "./data";
import { filterAccounts, portfolioCsvHref } from "./portfolio-filter";

const accounts = getAccounts();

describe("filterAccounts", () => {
  it("returns every account when nothing is filtered", () => {
    expect(filterAccounts(accounts, {}, accountHealth)).toEqual(accounts);
  });

  it("filters by health band, type and a case-insensitive name search", () => {
    const atRisk = filterAccounts(accounts, { band: "at_risk" }, accountHealth);
    expect(atRisk.every((a) => accountHealth(a.id).band === "at_risk")).toBe(true);
    const firms = filterAccounts(accounts, { type: "law_firm" }, accountHealth);
    expect(firms.every((a) => a.type === "law_firm")).toBe(true);
    const needle = accounts[0].name.slice(0, 4).toUpperCase();
    expect(filterAccounts(accounts, { search: needle }, accountHealth)).toContainEqual(accounts[0]);
  });

  it("returns nothing for a band that does not exist, as the page does", () => {
    expect(filterAccounts(accounts, { band: "no_such_band" }, accountHealth)).toEqual([]);
  });
});

describe("portfolioCsvHref", () => {
  it("links to the plain route when nothing is filtered", () => {
    expect(portfolioCsvHref({})).toBe("/accounts.csv");
    expect(portfolioCsvHref({ search: "", type: "", band: "" })).toBe("/accounts.csv");
  });

  it("carries the active filters, encoded", () => {
    expect(portfolioCsvHref({ band: "at_risk", search: "a & b" })).toBe("/accounts.csv?search=a+%26+b&band=at_risk");
  });
});
