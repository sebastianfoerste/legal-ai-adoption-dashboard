import { describe, it, expect } from "vitest";
import { getAccounts, getBlockers, getFeedback, getWorkflowUsage } from "./data";
import { assertPublicStore } from "./evidence/private-boundary";
import { feedbackItemSchema } from "./schema";

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

  it("every feedback item states its origin, and the bundled ones are synthetic fixtures", () => {
    expect(getFeedback().every((f) => f.origin.kind === "synthetic_fixture")).toBe(true);
  });

  it("refuses a feedback item without an origin, and a participant record", () => {
    const [item] = getFeedback();
    const { origin, ...unlabelled } = item;
    expect(origin).toEqual({ kind: "synthetic_fixture" });
    expect(feedbackItemSchema.safeParse(unlabelled).success).toBe(false);
    expect(feedbackItemSchema.safeParse({ ...item, evidenceClass: "synthetic_example" }).success).toBe(false);
    const real = { ...item, origin: { kind: "participant_session", studyId: "s", consentRef: "c", storageRef: "r" } };
    expect(() => assertPublicStore([real], "Feedback queue")).toThrow(
      `Feedback queue is not publishable:\n- $[${item.id}].origin: "participant_session" records belong in the private research store`,
    );
  });

  it("every workflow usage row references a known account", () => {
    const ids = new Set(getAccounts().map((a) => a.id));
    expect(getWorkflowUsage().every((workflow) => ids.has(workflow.accountId))).toBe(true);
  });
});
