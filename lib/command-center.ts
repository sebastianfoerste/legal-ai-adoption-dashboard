import { adoptionCockpitReport, type AdoptionCockpitReport } from "./adoption-cockpit";

export type CommandCenterEvidence = {
  metric: string;
  value: string;
  sourceRef: string;
};

export type CommandCenterAnswer = {
  schema: "legal-ai-adoption.command-center-answer.v1";
  question: string;
  answer: string;
  evidence: CommandCenterEvidence[];
  status: "answered" | "review_required" | "unsupported_question";
  reviewRequired: true;
  externalActionAllowed: false;
};

export type CapabilityRecommendation = {
  rank: number;
  capability: string;
  audience: string;
  reason: string;
  evidence: string[];
  action: string;
  gate: string;
};

export type CommandCenterReport = {
  schema: "legal-ai-adoption.command-center-report.v1";
  title: string;
  audience: string;
  filters: {
    practiceGroups: string[];
    products: string[];
  };
  sections: {
    heading: string;
    takeaway: string;
    evidence: string[];
  }[];
  generatedFormat: "markdown";
  reviewedConversionTargets: Array<"pdf" | "pptx">;
  markdown: string;
  reviewGate: string;
  externalActionAllowed: false;
};

export function answerCommandCenterQuestion(
  report: AdoptionCockpitReport,
  question: string,
): CommandCenterAnswer {
  const normalized = question.toLowerCase();
  if (normalized.includes("verification") || normalized.includes("verified")) {
    return answer(
      question,
      `The synthetic verification rate is ${report.verificationRate}%. ${report.blockedOutputs} outputs remain blocked.`,
      [
        { metric: "Verification rate", value: `${report.verificationRate}%`, sourceRef: "data/workflows.json" },
        { metric: "Blocked outputs", value: String(report.blockedOutputs), sourceRef: "data/workflows.json" },
      ],
    );
  }
  if (normalized.includes("practice") || normalized.includes("team")) {
    const group = [...report.practiceGroupUsage].sort((left, right) => right.workflowRuns - left.workflowRuns)[0];
    return answer(
      question,
      group
        ? `${group.practiceGroup} has the highest recorded workflow volume at ${group.workflowRuns} runs. Review depth, verified outputs and licensed-user activity before treating volume as value.`
        : "No practice-group usage is available in the synthetic dataset.",
      group
        ? [
            { metric: "Practice group", value: group.practiceGroup, sourceRef: "data/workflows.json" },
            { metric: "Workflow runs", value: String(group.workflowRuns), sourceRef: "data/workflows.json" },
            { metric: "Verified outputs", value: String(group.verifiedOutputs), sourceRef: "data/workflows.json" },
          ]
        : [],
    );
  }
  if (normalized.includes("release") || normalized.includes("enable")) {
    const pilots = report.releaseActions.filter((release) => release.status === "pilot");
    return answer(
      question,
      pilots.length
        ? `${pilots.map((pilot) => pilot.release).join(", ")} remain in pilot status. Account-owner review is required before wider enablement.`
        : "No capability is currently marked as a pilot.",
      pilots.map((pilot) => ({
        metric: pilot.release,
        value: `${pilot.eligibleUsers} eligible users`,
        sourceRef: "data/workflows.json",
      })),
    );
  }
  if (normalized.includes("adoption") || normalized.includes("active")) {
    return answer(
      question,
      `${report.activeUsers} active users generated ${report.workflowRuns} workflow runs in the synthetic reporting period.`,
      [
        { metric: "Active users", value: String(report.activeUsers), sourceRef: "data/workflows.json" },
        { metric: "Workflow runs", value: String(report.workflowRuns), sourceRef: "data/workflows.json" },
      ],
    );
  }
  return {
    schema: "legal-ai-adoption.command-center-answer.v1",
    question,
    answer: "This question is outside the supported synthetic adoption metrics. Select adoption, verification, practice-group usage or release readiness.",
    evidence: [],
    status: "unsupported_question",
    reviewRequired: true,
    externalActionAllowed: false,
  };
}

function answer(question: string, text: string, evidence: CommandCenterEvidence[]): CommandCenterAnswer {
  return {
    schema: "legal-ai-adoption.command-center-answer.v1",
    question,
    answer: text,
    evidence,
    status: evidence.length > 0 ? "answered" : "review_required",
    reviewRequired: true,
    externalActionAllowed: false,
  };
}

export function recommendCapabilities(report: AdoptionCockpitReport): CapabilityRecommendation[] {
  const recommendations: Omit<CapabilityRecommendation, "rank">[] = [];
  for (const release of report.releaseActions) {
    if (release.status === "enabled") continue;
    recommendations.push({
      capability: release.release,
      audience: `${release.eligibleUsers} eligible synthetic users`,
      reason: release.recommendedAction,
      evidence: [release.gate, `Status: ${release.status}`],
      action: release.status === "pilot" ? "Evaluate pilot evidence and define the next reviewed cohort." : "Define a small reviewed pilot cohort.",
      gate: "Account owner approval required before enablement.",
    });
  }
  for (const benchmark of report.benchmarks.filter((item) => item.status === "behind")) {
    recommendations.push({
      capability: `Improve ${benchmark.metric}`,
      audience: "Practice groups below the synthetic peer median",
      reason: benchmark.action,
      evidence: [`Firm: ${benchmark.firmValue}`, `Peer median: ${benchmark.peerMedian}`],
      action: "Run a targeted workflow clinic and measure the same metric in the next reporting period.",
      gate: "Account owner approval required before training or account action.",
    });
  }
  return recommendations.slice(0, 6).map((recommendation, index) => ({ rank: index + 1, ...recommendation }));
}

export function buildCommandCenterReport(
  report: AdoptionCockpitReport,
  filters: { practiceGroups?: string[]; products?: string[] } = {},
): CommandCenterReport {
  const practiceGroups = report.practiceGroupUsage.filter(
    (group) => !filters.practiceGroups?.length || filters.practiceGroups.includes(group.practiceGroup),
  );
  const products = report.productUsage.filter(
    (product) => !filters.products?.length || filters.products.includes(product.product),
  );
  const recommendations = recommendCapabilities(report);
  const sections = [
    {
      heading: "Executive summary",
      takeaway: `${report.activeUsers} active users, ${report.workflowRuns} workflow runs and a ${report.verificationRate}% verification rate in synthetic data.`,
      evidence: [`${report.blockedOutputs} blocked outputs`, `${report.reviewTables} review tables`],
    },
    {
      heading: "Practice-group adoption",
      takeaway: practiceGroups.length ? `${practiceGroups.length} practice groups are included in this report.` : "No practice group matches the selected filter.",
      evidence: practiceGroups.map((group) => `${group.practiceGroup}: ${group.workflowRuns} runs, ${group.verifiedOutputs} verified outputs`),
    },
    {
      heading: "Product depth",
      takeaway: products.length ? `${products.length} product surfaces are included.` : "No product matches the selected filter.",
      evidence: products.map((product) => `${product.product}: ${product.runs} runs, ${product.blockedOutputs} blocked outputs`),
    },
    {
      heading: "Recommended actions",
      takeaway: `${recommendations.length} review-gated actions are prioritized.`,
      evidence: recommendations.map((recommendation) => `${recommendation.rank}. ${recommendation.capability}: ${recommendation.action}`),
    },
  ];
  const markdown = [
    "# Synthetic Legal AI Command Center Report",
    "",
    ...sections.flatMap((section) => [
      `## ${section.heading}`,
      "",
      section.takeaway,
      "",
      ...section.evidence.map((item) => `- ${item}`),
      "",
    ]),
    "Review gate: account-owner approval is required before external use or account action.",
  ].join("\n");
  return {
    schema: "legal-ai-adoption.command-center-report.v1",
    title: "Synthetic Legal AI Command Center Report",
    audience: "Innovation, Legal Operations and account leadership",
    filters: { practiceGroups: filters.practiceGroups ?? [], products: filters.products ?? [] },
    sections,
    generatedFormat: "markdown",
    reviewedConversionTargets: ["pdf", "pptx"],
    markdown,
    reviewGate: "Account-owner approval required before external use, renewal, expansion or training action.",
    externalActionAllowed: false,
  };
}

export function commandCenterSnapshot() {
  const report = adoptionCockpitReport();
  return {
    report,
    answer: answerCommandCenterQuestion(report, "Which teams have the deepest adoption and verified output use?"),
    recommendations: recommendCapabilities(report),
    leadershipReport: buildCommandCenterReport(report),
  };
}
