import { describe, expect, it } from "vitest";

import { parseWorkflowEvents } from "./index";

const validEvent = {
  schema: "legal-workflow.event.v1",
  id: "evt-contract-1",
  appId: "synthetic-app",
  featureId: "review",
  eventType: "approved",
  status: "approved",
  occurredAt: "2026-08-26T10:00:00Z",
  synthetic: true,
} as const;

describe("legal-workflow.event.v1", () => {
  it("accepts a minimal synthetic event", () => {
    expect(parseWorkflowEvents([validEvent])).toHaveLength(1);
  });

  it("rejects content outside the allowlist", () => {
    expect(() =>
      parseWorkflowEvents([{ ...validEvent, documentText: "confidential" }]),
    ).toThrow();
  });
});
