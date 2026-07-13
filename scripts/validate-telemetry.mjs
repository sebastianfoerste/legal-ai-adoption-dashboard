import { readFileSync } from "node:fs";
const events = JSON.parse(readFileSync(new URL("../data/legal-workflow-events.json", import.meta.url), "utf8"));
const allowed = new Set(["schema", "id", "appId", "featureId", "eventType", "status", "occurredAt", "durationMs", "timeSavedMs", "reviewerRole", "workflowVersion", "workflowRunId", "productId", "practiceGroup", "resourceCount", "expiresAt", "guestAccess", "accessReviewDueAt", "synthetic"]);
if (!Array.isArray(events) || events.length === 0) throw new Error("Telemetry bundle must be a non-empty array.");
for (const event of events) {
  if (event.schema !== "legal-workflow.event.v1" || event.synthetic !== true) throw new Error(`Invalid telemetry contract: ${event.id || "unknown"}`);
  const forbidden = Object.keys(event).filter((key) => !allowed.has(key));
  if (forbidden.length) throw new Error(`Forbidden telemetry fields on ${event.id}: ${forbidden.join(", ")}`);
}
console.log(`validated ${events.length} synthetic legal workflow events`);
