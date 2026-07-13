import { describe, expect, it } from "vitest";

import {
  answerCommandCenterQuestion,
  buildCommandCenterReport,
  commandCenterSnapshot,
  recommendCapabilities,
} from "./command-center";
import { adoptionCockpitReport } from "./adoption-cockpit";
import { GET as downloadReport } from "../app/command-center/report/route";

describe("command center", () => {
  it("answers supported questions with evidence and review controls", () => {
    const report = adoptionCockpitReport();
    const answer = answerCommandCenterQuestion(report, "What is the verified output rate?");
    expect(answer.status).toBe("answered");
    expect(answer.evidence.some((item) => item.metric === "Verification rate")).toBe(true);
    expect(answer.reviewRequired).toBe(true);
    expect(answer.externalActionAllowed).toBe(false);
  });

  it("declines unsupported questions without inventing evidence", () => {
    const answer = answerCommandCenterQuestion(adoptionCockpitReport(), "Forecast next year's legal budget");
    expect(answer.status).toBe("unsupported_question");
    expect(answer.evidence).toEqual([]);
  });

  it("prioritizes review-gated capability recommendations", () => {
    const recommendations = recommendCapabilities(adoptionCockpitReport());
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.map((item) => item.rank)).toEqual(recommendations.map((_, index) => index + 1));
    expect(recommendations.every((item) => item.gate.includes("approval"))).toBe(true);
  });

  it("generates a filterable leadership report with blocked external action", () => {
    const report = adoptionCockpitReport();
    const practiceGroup = report.practiceGroupUsage[0].practiceGroup;
    const output = buildCommandCenterReport(report, { practiceGroups: [practiceGroup] });
    expect(output.filters.practiceGroups).toEqual([practiceGroup]);
    expect(output.markdown).toContain("# Synthetic Legal AI Command Center Report");
    expect(output.generatedFormat).toBe("markdown");
    expect(output.reviewedConversionTargets).toEqual(["pdf", "pptx"]);
    expect(output.externalActionAllowed).toBe(false);
  });

  it("builds the complete command center snapshot", () => {
    const snapshot = commandCenterSnapshot();
    expect(snapshot.answer.evidence.length).toBeGreaterThan(0);
    expect(snapshot.recommendations.length).toBeGreaterThan(0);
    expect(snapshot.leadershipReport.sections).toHaveLength(4);
  });

  it("serves the generated Markdown report as a reviewable download", async () => {
    const response = downloadReport();
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("content-disposition")).toContain("synthetic-legal-ai-command-center-report.md");
    expect(await response.text()).toContain("# Synthetic Legal AI Command Center Report");
  });
});
