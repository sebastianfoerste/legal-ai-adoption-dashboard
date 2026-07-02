import { describe, expect, it } from "vitest";

import { commandCenterReport } from "./command-center";

describe("command center report", () => {
  it("builds a synthetic aggregate report with review-gated output metrics", () => {
    const report = commandCenterReport();

    expect(report.schema).toBe("legal-ai-adoption.command-center.v1");
    expect(report.sourceMode).toBe("synthetic_aggregate");
    expect(report.workflowRuns).toBeGreaterThan(0);
    expect(report.reviewTables).toBeGreaterThan(0);
    expect(report.verifiedOutputs).toBeLessThanOrEqual(report.draftOutputs);
    expect(report.blockedOutputs).toBeGreaterThan(0);
    expect(report.recommendedActions.length).toBeGreaterThan(0);
    expect(report.benchmarks.some((benchmark) => benchmark.metric === "Verified output rate")).toBe(true);
    expect(report.practiceGroupUsage.length).toBeGreaterThan(0);
    expect(report.practiceGroupUsage[0].workflowRuns).toBeGreaterThan(0);
    expect(report.practiceGroupUsage.every((group) => group.activeUsers > 0)).toBe(true);
    expect(report.practiceGroupUsage.every((group) => group.dailyUsageAmongLicensedUsers > 0)).toBe(true);
    expect(report.releaseActions.some((release) => release.status === "pilot")).toBe(true);
    expect(report.releaseActions.every((release) => release.gate.includes("owner review"))).toBe(true);
    expect(report.releaseActions.every((release) => release.reviewGateControl.externalActionAllowed === false)).toBe(true);
    expect(report.promptReadiness.length).toBeGreaterThan(0);
    expect(report.promptReadiness[0].suggestedPrompt).toContain("Review gate: human review required");
    expect(report.promptReadiness.every((item) => item.reviewGate.includes("Account owner review"))).toBe(true);
    expect(report.promptReadiness.every((item) => item.reviewGateControl.state === "draft")).toBe(true);
    expect(report.leadershipBrief.reviewGate).toContain("Synthetic report only");
    expect(report.leadershipBrief.reviewGateControl.requiredReviewer).toBe("account_owner");
    expect(report.presentationDeck.schema).toBe("legal-ai-adoption.command-center-deck.v1");
    expect(report.presentationDeck.sourceMode).toBe("local_synthetic_json");
    expect(report.presentationDeck.generatedFrom).toContain("data/workflows.json");
    expect(report.presentationDeck.generatedFrom).toContain("data/benchmarks.json");
    expect(report.presentationDeck.exportFormats).toContain("pptx");
    expect(report.presentationDeck.slides.length).toBeGreaterThanOrEqual(4);
    expect(report.presentationDeck.evidenceList).toEqual(
      expect.arrayContaining([expect.stringContaining("Verification rate")]),
    );
    expect(report.presentationDeck.accountOwnerReviewGate).toContain("Account owner review");
    expect(report.presentationDeck.slides.every((slide) => slide.reviewGate.includes("Draft deck only"))).toBe(true);
    expect(report.presentationDeck.slides.every((slide) => slide.reviewGateControl.state === "draft")).toBe(true);
    expect(report.presentationDeck.exportGate).toContain("Account owner review");
    expect(report.presentationDeck.markdownReport).toContain("# Synthetic leadership report");
    expect(report.governancePanel.schema).toBe("legal-ai-adoption.governance-panel.v1");
    expect(report.governancePanel.sourceMode).toBe("local_synthetic_json");
    expect(report.governancePanel.auditTrailEntries.map((entry) => entry.type)).toEqual(
      expect.arrayContaining(["tool_call", "file_access", "agent_action"]),
    );
    expect(report.governancePanel.ethicalWalls.crossMatterAccess).toBe("blocked");
    expect(report.governancePanel.outputTraceability.externalActionAllowed).toBe(false);
    expect(report.reviewGateControl.externalActionAllowed).toBe(false);
    expect(report.aosProfile.schema).toBe("legal-ai-adoption.command-center-aos.v1");
    expect(report.aosProfile.sourceMode).toBe("local_synthetic_json");
    expect(report.aosProfile.generatedFrom).toEqual(
      expect.arrayContaining(["data/accounts.json", "data/blockers.json", "data/workflows.json"]),
    );
    expect(report.aosProfile.legoraIntegration).toBe("none");
    expect(report.aosProfile.externalActionAllowed).toBe(false);
    expect(report.aosProfile.productSurfaceCoverage.map((surface) => surface.surface)).toEqual(
      expect.arrayContaining(["Agent", "Tabular Review", "Portal", "Monitors", "Lists", "Mobile handoff"]),
    );
    expect(report.aosProfile.productSurfaceCoverage.find((surface) => surface.surface === "Mobile handoff")?.status).toBe(
      "blocked",
    );
    expect(report.aosProfile.trustedSources.syntheticEvidenceOnly).toBe(true);
    expect(report.aosProfile.wordExportPackage.externalActionAllowed).toBe(false);
    expect(report.aosProfile.adoptionSignals.deckPackageReady).toBe(true);
    expect(report.aosProfile.reviewNotice).toContain("no Legora integration or dependency");
  });
});
