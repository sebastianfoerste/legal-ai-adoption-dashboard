import { getAccounts, getBenchmarkRows, getBlockers, getWorkflowUsage } from "./data";

export type ReviewGate = {
  requiredReviewer: "account_owner";
  state: "draft";
  externalActionAllowed: false;
  note: string;
};

export type ProductUsageSummary = {
  product: string;
  runs: number;
  activeUsers: number;
  reviewTables: number;
  draftOutputs: number;
  verifiedOutputs: number;
  blockedOutputs: number;
};

export type PowerUserGroup = {
  accountId: string;
  accountName: string;
  practiceGroup: string;
  activeUsers: number;
  runs: number;
  verifiedOutputs: number;
};

export type PracticeGroupUsageSummary = {
  practiceGroup: string;
  activeUsers: number;
  dailyUsageAmongLicensedUsers: number;
  workflowRuns: number;
  reviewTables: number;
  draftOutputs: number;
  verifiedOutputs: number;
  blockedOutputs: number;
};

export type BenchmarkInsight = {
  metric: string;
  firmValue: number;
  peerMedian: number;
  status: "ahead" | "near_peer" | "behind";
  action: string;
};

export type ReleaseAction = {
  release: string;
  status: "enabled" | "pilot" | "not_enabled";
  eligibleUsers: number;
  recommendedAction: string;
  gate: string;
  reviewGateControl: ReviewGate;
};

export type LeadershipBrief = {
  title: string;
  headline: string;
  slides: string[];
  reviewGate: string;
  reviewGateControl: ReviewGate;
};

export type CommandCenterDeckSlide = {
  title: string;
  takeaway: string;
  evidence: string[];
  reviewGate: string;
  reviewGateControl: ReviewGate;
};

export type CommandCenterPresentationDeck = {
  schema: "legal-ai-adoption.command-center-deck.v1";
  sourceMode: "local_synthetic_json";
  generatedFrom: string[];
  title: string;
  audience: string;
  exportFormats: Array<"pptx" | "pdf" | "markdown_report">;
  slides: CommandCenterDeckSlide[];
  evidenceList: string[];
  accountOwnerReviewGate: string;
  exportGate: string;
  reviewGateControl: ReviewGate;
  markdownReport: string;
};

export type GovernancePanel = {
  schema: "legal-ai-adoption.governance-panel.v1";
  sourceMode: "local_synthetic_json";
  generatedFrom: string[];
  auditTrailEntries: Array<{
    id: string;
    type: "tool_call" | "file_access" | "agent_action";
    subject: string;
    provenanceRef: string;
    externalActionAllowed: false;
  }>;
  ethicalWalls: {
    enabled: true;
    matterIsolation: "synthetic_account_boundaries";
    crossMatterAccess: "blocked";
  };
  outputTraceability: {
    provenanceRefs: string[];
    promptRefs: string[];
    externalActionAllowed: false;
  };
  reviewGateControl: ReviewGate;
};

export type CommandCenterAOSLayer = {
  key:
    | "large_language_models"
    | "agentic_harness"
    | "data_integrations"
    | "context_knowledge"
    | "legal_capabilities"
    | "products_interfaces"
    | "security_governance";
  label: string;
  status: "implemented" | "metadata_only" | "blocked";
  evidence: string;
  gate: string;
};

export type CommandCenterAOSSkill = {
  id: string;
  label: string;
  objective: string;
  outputSchema: string[];
  reviewGate: string;
  externalActionAllowed: boolean;
};

export type CommandCenterProductSurfaceCoverage = {
  surface:
    | "Agent"
    | "Tabular Review"
    | "Workflows"
    | "Legal Research"
    | "Word"
    | "Outlook"
    | "Portal"
    | "Monitors"
    | "Lists"
    | "Mobile handoff";
  status: "implemented" | "pilot" | "metadata_only" | "blocked";
  usageSignal: number;
  reviewGate: string;
};

export type CommandCenterAOSProfile = {
  schema: "legal-ai-adoption.command-center-aos.v1";
  sourceMode: "local_synthetic_json";
  generatedFrom: string[];
  aosLayers: CommandCenterAOSLayer[];
  agentPlan: Record<"plan" | "execute" | "review" | "deliver", string>;
  skills: CommandCenterAOSSkill[];
  tabularReview: Record<string, string | number | boolean>;
  trustedSources: Record<string, string | number | boolean>;
  editorDraft: Record<string, string | number | boolean>;
  wordExportPackage: Record<string, string | string[] | boolean>;
  portalRoom: Record<string, string | number | boolean>;
  monitors: Record<string, string | number | boolean>;
  lists: Record<string, string | number | boolean>;
  securityGovernance: Record<string, string | boolean>;
  productSurfaceCoverage: CommandCenterProductSurfaceCoverage[];
  adoptionSignals: {
    powerUserGroups: number;
    reviewGatesTracked: number;
    deckPackageReady: boolean;
    syntheticEvidenceOnly: boolean;
  };
  legoraIntegration: "none";
  externalActionAllowed: boolean;
  reviewNotice: string;
};

export type PromptReadinessItem = {
  workflow: string;
  accountName: string;
  status: "ready" | "needs_structure" | "blocked";
  missingFields: string[];
  suggestedPrompt: string;
  reviewGate: string;
  reviewGateControl: ReviewGate;
};

export type CommandCenterReport = {
  schema: "legal-ai-adoption.command-center.v1";
  generatedAt: string;
  sourceMode: "synthetic_aggregate";
  activeUsers: number;
  workflowRuns: number;
  reviewTables: number;
  draftOutputs: number;
  verifiedOutputs: number;
  blockedOutputs: number;
  verificationRate: number;
  productUsage: ProductUsageSummary[];
  practiceGroupUsage: PracticeGroupUsageSummary[];
  powerUserGroups: PowerUserGroup[];
  needsAttention: string[];
  recommendedActions: string[];
  releaseReadiness: string[];
  benchmarks: BenchmarkInsight[];
  releaseActions: ReleaseAction[];
  promptReadiness: PromptReadinessItem[];
  leadershipBrief: LeadershipBrief;
  presentationDeck: CommandCenterPresentationDeck;
  governancePanel: GovernancePanel;
  reviewGateControl: ReviewGate;
  aosProfile: CommandCenterAOSProfile;
};

const GENERATED_AT = "2026-07-01T09:00:00.000Z";
const SOURCE_FILES = [
  "data/accounts.json",
  "data/blockers.json",
  "data/workflows.json",
  "data/benchmarks.json",
];

function reviewGateControl(note: string): ReviewGate {
  return {
    requiredReviewer: "account_owner",
    state: "draft",
    externalActionAllowed: false,
    note,
  };
}

export function commandCenterReport(): CommandCenterReport {
  const accounts = getAccounts();
  const workflows = getWorkflowUsage();
  const blockers = getBlockers().filter((blocker) => blocker.status !== "resolved");
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const productMap = new Map<string, ProductUsageSummary>();

  for (const workflow of workflows) {
    const current = productMap.get(workflow.product) ?? {
      product: workflow.product,
      runs: 0,
      activeUsers: 0,
      reviewTables: 0,
      draftOutputs: 0,
      verifiedOutputs: 0,
      blockedOutputs: 0,
    };
    current.runs += workflow.runs;
    current.activeUsers += workflow.activeUsers;
    current.reviewTables += workflow.reviewTables;
    current.draftOutputs += workflow.draftOutputs;
    current.verifiedOutputs += workflow.verifiedOutputs;
    current.blockedOutputs += workflow.blockedOutputs;
    productMap.set(workflow.product, current);
  }

  const workflowRuns = workflows.reduce((total, workflow) => total + workflow.runs, 0);
  const draftOutputs = workflows.reduce((total, workflow) => total + workflow.draftOutputs, 0);
  const verifiedOutputs = workflows.reduce((total, workflow) => total + workflow.verifiedOutputs, 0);
  const blockedOutputs = workflows.reduce((total, workflow) => total + workflow.blockedOutputs, 0);

  const activeUsers = accounts.reduce((total, account) => total + account.activeUsers, 0);
  const reviewTables = workflows.reduce((total, workflow) => total + workflow.reviewTables, 0);
  const verificationRate = draftOutputs === 0 ? 0 : verifiedOutputs / draftOutputs;
  const productUsage = [...productMap.values()].sort((a, b) => b.runs - a.runs);
  const practiceGroupUsage = buildPracticeGroupUsage(workflows);
  const powerUserGroups = workflows
    .map((workflow) => ({
      accountId: workflow.accountId,
      accountName: accountById.get(workflow.accountId)?.name ?? workflow.accountId,
      practiceGroup: workflow.practiceGroup,
      activeUsers: workflow.activeUsers,
      runs: workflow.runs,
      verifiedOutputs: workflow.verifiedOutputs,
    }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 5);
  const recommendedActions = workflows
    .filter((workflow) => workflow.blockedOutputs > 0 || workflow.verifiedOutputs < workflow.draftOutputs * 0.75)
    .map((workflow) => `${accountById.get(workflow.accountId)?.name ?? workflow.accountId}: ${workflow.recommendedAction}`)
    .slice(0, 6);
  const releaseReadiness = [...new Set(workflows.map((workflow) => workflow.lastReleaseEnabled))].sort();
  const benchmarks = buildBenchmarks({
    activeUsers,
    workflowRuns,
    reviewTables,
    verificationRate,
    blockedOutputs,
  });
  const releaseActions = buildReleaseActions({
    workflows,
    releaseReadiness,
    activeUsers,
  });
  const promptReadiness = buildPromptReadiness({ workflows, accountById });
  const leadershipBrief = buildLeadershipBrief({
    verificationRate,
    powerUserGroups,
    recommendedActions,
    releaseActions,
  });
  const presentationDeck = buildPresentationDeck({
    leadershipBrief,
    verificationRate,
    productUsage,
    benchmarks,
    powerUserGroups,
    recommendedActions,
    releaseActions,
    promptReadiness,
  });
  const governancePanel = buildGovernancePanel({
    workflows,
    promptReadiness,
    presentationDeck,
  });
  const gate = reviewGateControl(
    "Synthetic Command Center report remains draft-only until account owner review.",
  );
  const aosProfile = buildAOSProfile({
    activeUsers,
    workflowRuns,
    reviewTables,
    draftOutputs,
    verifiedOutputs,
    blockedOutputs,
    verificationRate,
    productUsage,
    practiceGroupUsage,
    powerUserGroups,
    releaseActions,
    promptReadiness,
    presentationDeck,
    governancePanel,
  });

  return {
    schema: "legal-ai-adoption.command-center.v1",
    generatedAt: GENERATED_AT,
    sourceMode: "synthetic_aggregate",
    activeUsers,
    workflowRuns,
    reviewTables,
    draftOutputs,
    verifiedOutputs,
    blockedOutputs,
    verificationRate,
    productUsage,
    practiceGroupUsage,
    powerUserGroups,
    needsAttention: blockers
      .filter((blocker) => blocker.severity === "high")
      .map((blocker) => `${accountById.get(blocker.accountId)?.name ?? blocker.accountId}: ${blocker.reEngagementAction}`)
      .slice(0, 5),
    recommendedActions,
    releaseReadiness,
    benchmarks,
    releaseActions,
    promptReadiness,
    leadershipBrief,
    presentationDeck,
    governancePanel,
    reviewGateControl: gate,
    aosProfile,
  };
}

function buildPracticeGroupUsage(workflows: ReturnType<typeof getWorkflowUsage>): PracticeGroupUsageSummary[] {
  const groups = new Map<string, PracticeGroupUsageSummary>();
  for (const workflow of workflows) {
	    const current = groups.get(workflow.practiceGroup) ?? {
	      practiceGroup: workflow.practiceGroup,
	      activeUsers: 0,
      dailyUsageAmongLicensedUsers: 0,
	      workflowRuns: 0,
      reviewTables: 0,
      draftOutputs: 0,
      verifiedOutputs: 0,
      blockedOutputs: 0,
    };
    current.activeUsers += workflow.activeUsers;
    current.workflowRuns += workflow.runs;
    current.reviewTables += workflow.reviewTables;
    current.draftOutputs += workflow.draftOutputs;
    current.verifiedOutputs += workflow.verifiedOutputs;
    current.blockedOutputs += workflow.blockedOutputs;
    groups.set(workflow.practiceGroup, current);
	  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      dailyUsageAmongLicensedUsers:
        group.activeUsers === 0 ? 0 : Math.round((group.workflowRuns / (group.activeUsers * 5)) * 100) / 100,
    }))
    .sort((left, right) => right.workflowRuns - left.workflowRuns);
}

function buildPromptReadiness({
  workflows,
  accountById,
}: {
  workflows: ReturnType<typeof getWorkflowUsage>;
  accountById: Map<string, ReturnType<typeof getAccounts>[number]>;
}): PromptReadinessItem[] {
  return workflows
    .map((workflow) => {
      const missingFields = [
        workflow.verifiedOutputs < workflow.draftOutputs * 0.8 ? "quality standard" : null,
        workflow.blockedOutputs > 0 ? "failure conditions" : null,
        workflow.reviewTables === 0 ? "review table output" : null,
        workflow.lastReleaseEnabled === "Prompt library" ? null : "source hierarchy",
      ].filter((field): field is string => Boolean(field));
      const status: PromptReadinessItem["status"] =
        workflow.blockedOutputs > 2
          ? "blocked"
          : missingFields.length > 0
            ? "needs_structure"
            : "ready";
	      return {
        workflow: workflow.workflow,
        accountName: accountById.get(workflow.accountId)?.name ?? workflow.accountId,
        status,
        missingFields,
        suggestedPrompt: [
          "Role: supervised legal AI user.",
          `Objective: complete ${workflow.workflow} with source-grounded draft output.`,
          `Practice group: ${workflow.practiceGroup}.`,
          "Context: approved source hierarchy, actor, jurisdiction, known facts and open facts.",
          "Output: draft answer, citations, review-table row, verification state and next action.",
          "Review gate: human review required before client, public or external use.",
        ].join("\n"),
	        reviewGate:
	          "Synthetic adoption signal only. Account owner review is required before enablement or client-facing use.",
        reviewGateControl: reviewGateControl(
          "Account owner must review prompt readiness before enablement or client-facing use.",
        ),
	      };
    })
    .sort((left, right) => {
      const rank = { blocked: 2, needs_structure: 1, ready: 0 };
      return rank[right.status] - rank[left.status] || right.missingFields.length - left.missingFields.length;
    })
    .slice(0, 6);
}

function benchmarkStatus(value: number, peerMedian: number, higherIsBetter = true): BenchmarkInsight["status"] {
  const ratio = peerMedian === 0 ? 1 : value / peerMedian;
  if (higherIsBetter) {
    if (ratio >= 1.1) return "ahead";
    if (ratio >= 0.9) return "near_peer";
    return "behind";
  }
  if (ratio <= 0.9) return "ahead";
  if (ratio <= 1.1) return "near_peer";
  return "behind";
}

function buildBenchmarks({
  activeUsers,
  workflowRuns,
  reviewTables,
  verificationRate,
  blockedOutputs,
}: {
  activeUsers: number;
  workflowRuns: number;
  reviewTables: number;
  verificationRate: number;
  blockedOutputs: number;
}): BenchmarkInsight[] {
  const valueByMetric = new Map([
    ["Active users", activeUsers],
    ["Workflow runs", workflowRuns],
    ["Review tables", reviewTables],
    ["Verified output rate", Math.round(verificationRate * 100)],
    ["Blocked outputs", blockedOutputs],
  ]);
  const rows = getBenchmarkRows().map((row) => ({
    ...row,
    firmValue: valueByMetric.get(row.metric) ?? 0,
  }));

  return rows.map((row) => ({
    metric: row.metric,
    firmValue: row.firmValue,
    peerMedian: row.peerMedian,
    status: benchmarkStatus(row.firmValue, row.peerMedian, row.higherIsBetter ?? true),
    action: row.action,
  }));
}

function buildReleaseActions({
  workflows,
  releaseReadiness,
  activeUsers,
}: {
  workflows: ReturnType<typeof getWorkflowUsage>;
  releaseReadiness: string[];
  activeUsers: number;
}): ReleaseAction[] {
  const enabled = new Set(releaseReadiness);
  const releasePlan = [
    "Prompt library",
    "Citation export",
    "Knowledge sources",
    "Pinpoint citations",
    "Workflow agents",
    "Writing styles",
    "Review table export",
    "Shared review spaces",
  ];

  return releasePlan.map((release) => {
    const matching = workflows.filter((workflow) => workflow.lastReleaseEnabled === release);
    const eligibleUsers =
      matching.reduce((total, workflow) => total + workflow.activeUsers, 0) || Math.max(3, Math.round(activeUsers / 5));
    const status: ReleaseAction["status"] = enabled.has(release)
      ? "enabled"
      : release === "Review table export" || release === "Shared review spaces"
        ? "pilot"
        : "not_enabled";
	    return {
	      release,
      status,
      eligibleUsers,
      recommendedAction:
        status === "enabled"
          ? "Measure verified output use and identify the next workflow candidate."
          : status === "pilot"
            ? "Run a supervised pilot with synthetic or approved matter examples."
            : "Prepare an enablement brief before opening access.",
	      gate: "No customer-facing expansion, outreach or external output without account owner review.",
      reviewGateControl: reviewGateControl(
        "Account owner review is required before release enablement, outreach or external output.",
      ),
	    };
	  });
	}

function buildLeadershipBrief({
  verificationRate,
  powerUserGroups,
  recommendedActions,
  releaseActions,
}: {
  verificationRate: number;
  powerUserGroups: PowerUserGroup[];
  recommendedActions: string[];
  releaseActions: ReleaseAction[];
}): LeadershipBrief {
  const pilotCount = releaseActions.filter((action) => action.status === "pilot").length;
  return {
    title: "Synthetic leadership report",
    headline: `${Math.round(verificationRate * 100)}% of draft outputs are verified, with ${pilotCount} release pilot(s) ready for owner review.`,
	    slides: [
      `Power users: ${powerUserGroups.slice(0, 2).map((group) => `${group.accountName} ${group.practiceGroup}`).join("; ")}`,
      `Priority risks: ${recommendedActions.slice(0, 2).join("; ")}`,
      `Release plan: ${releaseActions.slice(0, 3).map((action) => `${action.release} ${action.status}`).join("; ")}`,
    ],
    reviewGate:
      "Synthetic report only. Account owners must review before use in renewal, expansion or client-facing materials.",
    reviewGateControl: reviewGateControl(
      "Account owner must review this leadership brief before renewal, expansion or client-facing use.",
    ),
  };
}

function buildPresentationDeck({
  leadershipBrief,
  verificationRate,
  productUsage,
  benchmarks,
  powerUserGroups,
  recommendedActions,
  releaseActions,
  promptReadiness,
}: {
  leadershipBrief: LeadershipBrief;
  verificationRate: number;
  productUsage: ProductUsageSummary[];
  benchmarks: BenchmarkInsight[];
  powerUserGroups: PowerUserGroup[];
  recommendedActions: string[];
  releaseActions: ReleaseAction[];
  promptReadiness: PromptReadinessItem[];
}): CommandCenterPresentationDeck {
  const reviewGate =
    "Draft deck only. Account owner review is required before renewal, expansion or client-facing use.";
  const topProduct = productUsage[0];
  const blockedBenchmark = benchmarks.find((benchmark) => benchmark.metric === "Blocked outputs");
  const pilotReleases = releaseActions.filter((release) => release.status === "pilot");
  const slideGate = reviewGateControl(
    "Account owner review is required before using deck slides externally.",
  );
  return {
    schema: "legal-ai-adoption.command-center-deck.v1",
    sourceMode: "local_synthetic_json",
    generatedFrom: SOURCE_FILES,
    title: leadershipBrief.title,
    audience: "firm leadership, innovation leads and account owners",
    exportFormats: ["pptx", "pdf", "markdown_report"],
    slides: [
      {
        title: "Executive signal",
        takeaway: leadershipBrief.headline,
        evidence: [
          `${Math.round(verificationRate * 100)}% verified output rate`,
          `${pilotReleases.length} release pilot(s) ready for owner review`,
        ],
        reviewGate,
        reviewGateControl: slideGate,
      },
      {
        title: "Usage concentration",
        takeaway: topProduct
          ? `${topProduct.product.replace("_", " ")} is the highest-use product in the synthetic snapshot.`
          : "No product usage rows are present in the synthetic snapshot.",
        evidence: topProduct
          ? [
              `${topProduct.runs} workflow run(s)`,
              `${topProduct.reviewTables} review table(s)`,
              `${topProduct.verifiedOutputs} verified output(s)`,
            ]
          : ["No usage evidence."],
        reviewGate,
        reviewGateControl: slideGate,
      },
      {
        title: "Trust and blockers",
        takeaway: blockedBenchmark?.action ?? "Review blocked outputs before any expansion narrative.",
        evidence: recommendedActions.slice(0, 3),
        reviewGate,
        reviewGateControl: slideGate,
      },
      {
        title: "Enablement plan",
        takeaway: "Convert prompt and review-table gaps into supervised workflow enablement.",
        evidence: [
          ...powerUserGroups.slice(0, 2).map((group) => `${group.accountName}: ${group.runs} run(s)`),
          ...promptReadiness.slice(0, 2).map((item) => `${item.workflow}: ${item.status}`),
	        ],
        reviewGate,
        reviewGateControl: slideGate,
      },
    ],
    evidenceList: [
      `Verification rate: ${Math.round(verificationRate * 100)}%`,
      `Top product: ${topProduct?.product ?? "none"} with ${topProduct?.runs ?? 0} run(s)`,
      `Blocked-output benchmark: ${blockedBenchmark?.status ?? "not_available"}`,
      `Pilot releases: ${pilotReleases.map((release) => release.release).join(", ") || "none"}`,
      `Prompt readiness backlog: ${promptReadiness.length} workflow(s)`,
    ],
    accountOwnerReviewGate: reviewGate,
    exportGate: reviewGate,
    reviewGateControl: slideGate,
    markdownReport: renderCommandCenterMarkdown({
      leadershipBrief,
      verificationRate,
      productUsage,
      benchmarks,
      powerUserGroups,
      recommendedActions,
      releaseActions,
      promptReadiness,
    }),
	  };
	}

export function renderCommandCenterMarkdown({
  leadershipBrief,
  verificationRate,
  productUsage,
  benchmarks,
  powerUserGroups,
  recommendedActions,
  releaseActions,
  promptReadiness,
}: {
  leadershipBrief: LeadershipBrief;
  verificationRate: number;
  productUsage: ProductUsageSummary[];
  benchmarks: BenchmarkInsight[];
  powerUserGroups: PowerUserGroup[];
  recommendedActions: string[];
  releaseActions: ReleaseAction[];
  promptReadiness: PromptReadinessItem[];
}) {
  return [
    `# ${leadershipBrief.title}`,
    "",
    leadershipBrief.headline,
    "",
    `Verified output rate: ${Math.round(verificationRate * 100)}%.`,
    "",
    "## Product Usage",
    ...productUsage.slice(0, 5).map((item) => `- ${item.product}: ${item.runs} run(s), ${item.reviewTables} table(s)`),
    "",
    "## Benchmarks",
    ...benchmarks.map((item) => `- ${item.metric}: ${item.firmValue} vs peer ${item.peerMedian}, ${item.status}`),
    "",
    "## Power Users",
    ...powerUserGroups.map((item) => `- ${item.accountName}, ${item.practiceGroup}: ${item.runs} run(s)`),
    "",
    "## Recommended Actions",
    ...recommendedActions.map((action) => `- ${action}`),
    "",
    "## Release Actions",
    ...releaseActions.map((action) => `- ${action.release}: ${action.status}, ${action.gate}`),
    "",
    "## Prompt Readiness",
    ...promptReadiness.map((item) => `- ${item.workflow}: ${item.status}`),
    "",
    "Review gate: draft only. Account owner review is required before use outside this synthetic dashboard.",
  ].join("\n");
}

function buildGovernancePanel({
  workflows,
  promptReadiness,
  presentationDeck,
}: {
  workflows: ReturnType<typeof getWorkflowUsage>;
  promptReadiness: PromptReadinessItem[];
  presentationDeck: CommandCenterPresentationDeck;
}): GovernancePanel {
  const gate = reviewGateControl(
    "Account owner review is required before operational use of governance analytics.",
  );
  return {
    schema: "legal-ai-adoption.governance-panel.v1",
    sourceMode: "local_synthetic_json",
    generatedFrom: SOURCE_FILES,
    auditTrailEntries: [
      ...workflows.slice(0, 4).map((workflow, index) => ({
        id: `audit-tool-call-${index + 1}`,
        type: "tool_call" as const,
        subject: workflow.workflow,
        provenanceRef: `workflow:${workflow.accountId}:${workflow.practiceGroup}`,
        externalActionAllowed: false as const,
      })),
      ...promptReadiness.slice(0, 3).map((item, index) => ({
        id: `audit-agent-action-${index + 1}`,
        type: "agent_action" as const,
        subject: item.workflow,
        provenanceRef: `prompt-readiness:${item.status}`,
        externalActionAllowed: false as const,
      })),
      {
        id: "audit-file-access-1",
        type: "file_access" as const,
        subject: presentationDeck.title,
        provenanceRef: presentationDeck.generatedFrom.join(","),
        externalActionAllowed: false as const,
      },
    ],
    ethicalWalls: {
      enabled: true,
      matterIsolation: "synthetic_account_boundaries",
      crossMatterAccess: "blocked",
    },
    outputTraceability: {
      provenanceRefs: presentationDeck.evidenceList,
      promptRefs: promptReadiness.map((item) => item.workflow),
      externalActionAllowed: false,
    },
    reviewGateControl: gate,
  };
}

function buildAOSProfile({
  activeUsers,
  workflowRuns,
  reviewTables,
  draftOutputs,
  verifiedOutputs,
  blockedOutputs,
  verificationRate,
  productUsage,
  practiceGroupUsage,
  powerUserGroups,
  releaseActions,
  promptReadiness,
  presentationDeck,
  governancePanel,
}: {
  activeUsers: number;
  workflowRuns: number;
  reviewTables: number;
  draftOutputs: number;
  verifiedOutputs: number;
  blockedOutputs: number;
  verificationRate: number;
  productUsage: ProductUsageSummary[];
  practiceGroupUsage: PracticeGroupUsageSummary[];
  powerUserGroups: PowerUserGroup[];
  releaseActions: ReleaseAction[];
  promptReadiness: PromptReadinessItem[];
  presentationDeck: CommandCenterPresentationDeck;
  governancePanel: GovernancePanel;
}): CommandCenterAOSProfile {
  const releaseStatus = new Map(releaseActions.map((release) => [release.release, release.status]));
  const productRuns = new Map(productUsage.map((product) => [product.product, product.runs]));
  const reviewGate =
    "Synthetic adoption signal only. Account owner review is required before enablement or client-facing use.";
  const productSurfaceCoverage: CommandCenterProductSurfaceCoverage[] = [
    {
      surface: "Agent",
      status: releaseStatus.get("Workflow agents") === "enabled" ? "implemented" : "pilot",
      usageSignal: productRuns.get("agents") ?? 0,
      reviewGate,
    },
    {
      surface: "Tabular Review",
      status: reviewTables > 0 ? "implemented" : "metadata_only",
      usageSignal: reviewTables,
      reviewGate,
    },
    {
      surface: "Workflows",
      status: workflowRuns > 0 ? "implemented" : "metadata_only",
      usageSignal: workflowRuns,
      reviewGate,
    },
    {
      surface: "Legal Research",
      status: releaseStatus.get("Pinpoint citations") === "enabled" ? "implemented" : "pilot",
      usageSignal: productUsage.find((product) => product.product === "assistant")?.runs ?? 0,
      reviewGate,
    },
    {
      surface: "Word",
      status: "metadata_only",
      usageSignal: presentationDeck.exportFormats.includes("markdown_report") ? 1 : 0,
      reviewGate: presentationDeck.exportGate,
    },
    {
      surface: "Outlook",
      status: productRuns.has("outlook") ? "implemented" : "metadata_only",
      usageSignal: productRuns.get("outlook") ?? 0,
      reviewGate,
    },
    {
      surface: "Portal",
      status: releaseStatus.get("Shared review spaces") === "pilot" ? "pilot" : "metadata_only",
      usageSignal: releaseActions.find((release) => release.release === "Shared review spaces")?.eligibleUsers ?? 0,
      reviewGate,
    },
    {
      surface: "Monitors",
      status: "metadata_only",
      usageSignal: blockedOutputs,
      reviewGate,
    },
    {
      surface: "Lists",
      status: promptReadiness.length > 0 ? "implemented" : "metadata_only",
      usageSignal: promptReadiness.length + releaseActions.length,
      reviewGate,
    },
    {
      surface: "Mobile handoff",
      status: "blocked",
      usageSignal: 0,
      reviewGate: "Mobile handoff is not implemented in this synthetic dashboard.",
    },
  ];

  return {
    schema: "legal-ai-adoption.command-center-aos.v1",
    sourceMode: "local_synthetic_json",
    generatedFrom: SOURCE_FILES,
    aosLayers: [
      {
        key: "large_language_models",
        label: "Large language model routing",
        status: "metadata_only",
        evidence: "The dashboard tracks LLM-facing product usage without calling models.",
        gate: "No model output is generated or sent from this app.",
      },
      {
        key: "agentic_harness",
        label: "Agentic harness",
        status: "implemented",
        evidence: `${workflowRuns} supervised workflow run(s) and ${promptReadiness.length} prompt contract(s).`,
        gate: reviewGate,
      },
      {
        key: "data_integrations",
        label: "Data and integrations",
        status: "implemented",
        evidence: SOURCE_FILES.join(", "),
        gate: "Local synthetic JSON only.",
      },
      {
        key: "context_knowledge",
        label: "Context and knowledge",
        status: "implemented",
        evidence: `${practiceGroupUsage.length} practice group summary row(s).`,
        gate: "Knowledge signals are aggregate adoption metadata.",
      },
      {
        key: "legal_capabilities",
        label: "Legal capabilities",
        status: "metadata_only",
        evidence: `${verifiedOutputs} verified draft output(s), ${blockedOutputs} blocked output(s).`,
        gate: "This app measures adoption and review state, not legal correctness.",
      },
      {
        key: "products_interfaces",
        label: "Products and interfaces",
        status: "implemented",
        evidence: `${productSurfaceCoverage.length} product surface row(s).`,
        gate: "Expansion actions remain recommended signals.",
      },
      {
        key: "security_governance",
        label: "Security and governance",
        status: "implemented",
        evidence: "External actions are blocked and evidence is synthetic.",
        gate: "Account-owner review is required before external use.",
      },
    ],
    agentPlan: {
      plan: "Identify product surface, practice group and adoption metric from local JSON.",
      execute: "Aggregate runs, review tables, output states and release actions.",
      review: "Check power users, prompt gaps, blocked outputs and owner review gates.",
      deliver: "Prepare a draft leadership report or deck package after account-owner review.",
    },
    skills: [
      {
        id: "adoption-signal-brief",
        label: "Adoption signal brief",
        objective: "Turn synthetic usage rows into a leadership-ready adoption summary.",
        outputSchema: ["headline", "slides", "evidence", "review gate"],
        reviewGate,
        externalActionAllowed: false,
      },
      {
        id: "prompt-readiness-review",
        label: "Prompt readiness review",
        objective: "Identify workflows that need source hierarchy, failure conditions or review rows.",
        outputSchema: ["workflow", "missing fields", "suggested prompt", "review gate"],
        reviewGate,
        externalActionAllowed: false,
      },
      {
        id: "release-action-routing",
        label: "Release action routing",
        objective: "Convert release status into owner-reviewed enablement actions.",
        outputSchema: ["release", "status", "eligible users", "gate"],
        reviewGate,
        externalActionAllowed: false,
      },
    ],
    tabularReview: {
      reviewTables,
      practiceGroupRows: practiceGroupUsage.length,
      productRows: productUsage.length,
      externalActionAllowed: false,
    },
    trustedSources: {
      sourceMode: "local_synthetic_json",
      sourceFileCount: SOURCE_FILES.length,
      syntheticEvidenceOnly: true,
      externalActionAllowed: false,
    },
    editorDraft: {
      status: "draft_only",
      draftOutputs,
      verifiedOutputs,
      verificationRate: Math.round(verificationRate * 100),
      approvalRequired: true,
    },
    wordExportPackage: {
      status: "draft_package_ready",
      formats: presentationDeck.exportFormats,
      externalActionAllowed: false,
    },
    portalRoom: {
      accessMode: "dashboard_local",
      activeUsers,
      roleBasedAccess: false,
      externalGuestAccessAllowed: false,
    },
    monitors: {
      status: "metadata_only",
      blockedOutputs,
      deliveryStatus: "blocked_without_owner_review",
    },
    lists: {
      status: "implemented",
      releaseActions: releaseActions.length,
      promptReadinessItems: promptReadiness.length,
      ownerReviewRequired: true,
    },
    securityGovernance: {
      zeroTrust: true,
      noFoundationModelTraining: true,
      dataRetention: "local_synthetic_json",
      auditTrail: "static_report_generation",
      approvalGate: "account_owner_review_required",
      governancePanel: governancePanel.schema,
    },
    productSurfaceCoverage,
    adoptionSignals: {
      powerUserGroups: powerUserGroups.length,
      reviewGatesTracked: releaseActions.length + promptReadiness.length + presentationDeck.slides.length,
      deckPackageReady: presentationDeck.slides.length > 0,
      syntheticEvidenceOnly: true,
    },
    legoraIntegration: "none",
    externalActionAllowed: false,
    reviewNotice:
      "Legora-inspired product pattern, no Legora integration or dependency. Synthetic Command Center evidence only.",
  };
}
