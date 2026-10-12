import { describe, expect, it } from "vitest";
import vocabulary from "../../packages/evidence-loop-contract/evidence-loop.v1.vocabulary.json";
import { getAccounts, getFeedback } from "../data";
import { getEvidenceStore, practitionerEvidence } from "./data";
import {
  changesForAccount,
  changesForFeedbackItem,
  outcomeStatus,
  summarizeLoop,
  summarizeTaskResults,
  validateStore,
  viewChange,
  viewChanges,
} from "./loop";
import {
  EVIDENCE_LOOP_SCHEMA,
  confidenceSchema,
  decisionStatusSchema,
  deliveryStatusSchema,
  evidenceStoreSchema,
  evidenceTypeSchema,
  outcomeResultSchema,
  problemSchema,
  taskResultSchema,
  type Change,
  type EvidenceStore,
} from "./schema";

const AS_OF = "2026-07-31";
const store = getEvidenceStore();
const change = (id: string): Change => {
  const found = store.changes.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing fixture ${id}`);
  return found;
};
const view = (id: string, asOf = AS_OF) => viewChange(change(id), store, asOf);
const withChange = (id: string, edit: (source: Change) => Change): EvidenceStore => ({
  ...store,
  changes: store.changes.map((candidate) => (candidate.id === id ? edit(candidate) : candidate)),
});

describe("shared vocabulary", () => {
  it("matches the contract file that the Python module reads", () => {
    expect(vocabulary.schema).toBe(EVIDENCE_LOOP_SCHEMA);
    expect(vocabulary.deliveryStatuses).toEqual(deliveryStatusSchema.options);
    expect(vocabulary.decisionStatuses).toEqual(decisionStatusSchema.options);
    expect(vocabulary.confidenceLevels).toEqual(confidenceSchema.options);
    expect(vocabulary.outcomeResults).toEqual(outcomeResultSchema.options);
    expect(vocabulary.evidenceTypes).toEqual(evidenceTypeSchema.options);
    expect(vocabulary.problemClasses).toEqual(problemSchema.shape.class.options);
    expect(vocabulary.taskCompletion).toEqual(taskResultSchema.shape.completion.options);
    expect(vocabulary.outcomeStatuses).toEqual([
      ...outcomeResultSchema.options,
      "awaiting_evidence",
      "not_applicable",
    ]);
  });
});

describe("evidence store fixture", () => {
  it("is consistent", () => {
    expect(validateStore(store)).toEqual([]);
  });

  it("is synthetic throughout and says so", () => {
    const records = [
      ...store.researchQuestions,
      ...store.sessions,
      ...store.observations,
      ...store.problems,
      ...store.changes,
    ];
    expect(records.length).toBeGreaterThan(40);
    expect(records.every((record) => record.origin.kind === "synthetic_fixture")).toBe(true);
    expect(store.notice).toContain("SYNTHETIC DEMONSTRATION CASES");
    expect(store.sessions.every((s) => s.participantCode.startsWith("SYN-"))).toBe(true);
  });

  it("reports no practitioner participation", () => {
    expect(store.study).toMatchObject({
      recruitmentAuthorised: false,
      invitationsSent: 0,
      sessionsCompleted: 0,
      followUpSessionsCompleted: 0,
    });
    expect(practitionerEvidence()).toEqual({ sessions: [], observations: [], changes: [] });
  });

  it("links only to feedback items and accounts that exist", () => {
    const feedbackIds = new Set(getFeedback().map((item) => item.id));
    const accountIds = new Set(getAccounts().map((account) => account.id));
    for (const problem of store.problems) {
      expect(problem.feedbackItemIds.every((id) => feedbackIds.has(id))).toBe(true);
      expect(problem.accountIds.every((id) => accountIds.has(id))).toBe(true);
    }
  });

  it("rejects an unknown key and an unknown schema version", () => {
    expect(evidenceStoreSchema.safeParse({ ...store, extra: 1 }).success).toBe(false);
    expect(evidenceStoreSchema.safeParse({ ...store, schema: "legal-ai-adoption.evidence-loop.v2" }).success).toBe(false);
  });
});

describe("delivery status", () => {
  it("does not follow from priority", () => {
    // The audit log is the first-ranked requirement and it is not released.
    expect(view("chg-003")).toMatchObject({ deliveryStatus: "in_progress", outcomeStatus: "not_applicable" });
    expect(view("chg-004").deliveryStatus).toBe("not_started");
  });

  it("refuses 'released' without release evidence", () => {
    const issues = validateStore(
      withChange("chg-003", (c) => ({ ...c, delivery: { ...c.delivery, status: "released" } })),
    );
    expect(issues).toContain('chg-003: "released" needs release evidence, and release evidence means released');
  });

  it("refuses delivery that was never prioritised or has no criteria", () => {
    expect(
      validateStore(withChange("chg-006", (c) => ({ ...c, delivery: { ...c.delivery, status: "in_progress", startedOn: "2026-05-01" } }))),
    ).toEqual(expect.arrayContaining(["chg-006 is being delivered without a decision to prioritise it"]));
    expect(
      validateStore(withChange("chg-003", (c) => ({ ...c, acceptanceCriteria: [], criteriaRecordedOn: null }))),
    ).toContain("chg-003 is being delivered without acceptance criteria");
  });

  it("requires acceptance criteria before implementation starts", () => {
    const issues = validateStore(withChange("chg-001", (c) => ({ ...c, criteriaRecordedOn: "2026-05-01" })));
    expect(issues).toContain("chg-001: acceptance criteria were recorded after implementation started");
  });

  it("keeps deferred and rejected requirements, with their rationale", () => {
    expect(view("chg-005")).toMatchObject({ deliveryStatus: "deferred", outcomeStatus: "not_applicable" });
    expect(change("chg-005").decision.revisitOn).toBe("2026-10-01");
    expect(view("chg-007").deliveryStatus).toBe("rejected");
    expect(change("chg-007").decision.rationale).toContain("mandatory review point");
    const issues = validateStore(withChange("chg-007", (c) => ({ ...c, delivery: { ...c.delivery, status: "not_started" } })));
    expect(issues).toContain('chg-007: decision and delivery status disagree on "rejected"');
  });

  it("shows what was not verified at release", () => {
    expect(view("chg-009").unverifiedCriteria).toEqual(["Selecting the reference opens the clause in the contract."]);
  });
});

describe("outcome", () => {
  it("covers every status in the fixture", () => {
    expect(Object.fromEntries(store.changes.map((c) => [c.id, outcomeStatus(c)]))).toEqual({
      "chg-001": "supported",
      "chg-002": "contradicted",
      "chg-003": "not_applicable",
      "chg-004": "not_applicable",
      "chg-005": "not_applicable",
      "chg-006": "not_applicable",
      "chg-007": "not_applicable",
      "chg-008": "inconclusive",
      "chg-009": "awaiting_evidence",
    });
  });

  it("is awaiting evidence, never supported, when a release has no assessed follow-up", () => {
    const released = view("chg-009");
    expect(released.outcomeStatus).toBe("awaiting_evidence");
    expect(released.followUpState).toEqual({ state: "overdue", dueOn: "2026-07-28", daysOverdue: 3 });
    expect(released.missingObservations).toContain("Follow-up observation overdue by 3 day(s) (due 28 Jul 2026).");
    expect(view("chg-009", "2026-07-20").followUpState).toEqual({ state: "scheduled", dueOn: "2026-07-28" });
  });

  it("refuses an outcome without a release or without a follow-up observation", () => {
    const outcome = { result: "supported" as const, assessedOn: "2026-07-30", rationale: "x", alternativeExplanations: [] };
    expect(validateStore(withChange("chg-003", (c) => ({ ...c, outcome })))).toContain(
      "chg-003 has an outcome although nothing was released",
    );
    expect(validateStore(withChange("chg-009", (c) => ({ ...c, outcome })))).toContain(
      "chg-009 has an outcome without a follow-up observation",
    );
  });

  it("allows only 'inconclusive' when one side of the comparison has no task measures", () => {
    const issues = validateStore(
      withChange("chg-008", (c) => ({ ...c, outcome: { ...(c.outcome as NonNullable<Change["outcome"]>), result: "supported" } })),
    );
    expect(issues).toContain('chg-008 is "supported" without task measures on both sides of the comparison');
  });

  it("refuses a follow-up observation that predates the release", () => {
    const issues = validateStore(
      withChange("chg-001", (c) => ({
        ...c,
        followUp: { ...(c.followUp as NonNullable<Change["followUp"]>), followUpObservationIds: ["obs-03"] },
      })),
    );
    expect(issues).toContain("chg-001: follow-up observation obs-03 predates the release");
  });
});

describe("follow-up comparison", () => {
  it("sets baseline and follow-up task measures side by side", () => {
    const { comparison } = view("chg-001");
    expect(comparison?.baseline).toMatchObject({ sessions: 2, acceptable: 0, notCompleted: 1, assistance: 1, interpretationErrors: 2, trustConcerns: 3, medianMinutesToAcceptable: null });
    expect(comparison?.followUp).toMatchObject({ sessions: 2, acceptable: 2, completedUnaided: 1, assistance: 1, interpretationErrors: 0, medianMinutesToAcceptable: 12.5 });
  });

  it("names learning effects, task differences and the sample", () => {
    const caveats = view("chg-001").comparison?.caveats.join(" ") ?? "";
    expect(caveats).toContain("2 of 2 follow-up participant(s) also took part in the baseline");
    expect(caveats).toContain("different documents");
    expect(caveats).toContain("Read these as cases, not as rates.");
    expect(caveats).toContain("TP-B's definitions clause is shorter.");
    expect(view("chg-002").comparison?.caveats.join(" ")).toContain("Some follow-up participants are new.");
  });

  it("records a contradicted hypothesis as plainly as a supported one", () => {
    const contradicted = view("chg-002");
    expect(contradicted.outcomeStatus).toBe("contradicted");
    expect(contradicted.comparison?.baseline.assistance).toBe(2);
    expect(contradicted.comparison?.followUp.assistance).toBe(5);
  });

  it("has no comparison before a follow-up task was observed", () => {
    expect(view("chg-009").comparison).toBeNull();
    expect(view("chg-003").comparison).toBeNull();
    expect(view("chg-008").comparison?.caveats[0]).toContain("No baseline task was observed");
  });

  it("returns no median when no session reached an acceptable result", () => {
    expect(summarizeTaskResults([]).medianMinutesToAcceptable).toBeNull();
    expect(summarizeTaskResults([]).sessions).toBe(0);
  });
});

describe("observations and interpretation", () => {
  it("keeps what was observed apart from how it was read", () => {
    for (const problem of store.problems) {
      expect(problem.interpretation.length).toBeGreaterThan(20);
      expect(problem.interpretedByRole).toBeTruthy();
    }
    expect(Object.keys(store.observations[0])).not.toContain("interpretation");
  });

  it("supports contradictory findings and counts them as open", () => {
    const conflicted = view("chg-006");
    expect(conflicted.supporting.map((o) => o.id)).toEqual(["obs-04", "obs-09"]);
    expect(conflicted.contradicting.map((o) => o.id)).toEqual(["obs-07"]);
    expect(conflicted.change.decision.status).toBe("needs_evidence");
    expect(conflicted.missingObservations).toEqual([
      "Nobody was observed meeting this problem in a task. The support is reported behaviour or opinion.",
      "1 contradicting observation(s) not yet explained.",
    ]);
  });

  it("flags a problem that no study observation supports", () => {
    expect(view("chg-003").missingObservations[0]).toContain("rests on account feedback alone");
  });

  it("rejects a duplicated observation", () => {
    const copy = { ...store.observations[0], id: "obs-99" };
    expect(validateStore({ ...store, observations: [...store.observations, copy] })).toContain("obs-99 duplicates obs-01");
    expect(validateStore({ ...store, observations: [...store.observations, store.observations[0]] })).toContain(
      "duplicate observation id obs-01",
    );
  });

  it("rejects task measures on an interview answer and a broken reference", () => {
    const taskResult = store.observations[0].taskResult;
    const edited = store.observations.map((o) => (o.id === "obs-04" ? { ...o, taskResult } : o));
    expect(validateStore({ ...store, observations: edited })).toContain(
      "obs-04 carries task measures but is not an observed task",
    );
    const orphan = { ...store.observations[1], id: "obs-98", sessionId: "ses-77", observed: "Different note." };
    expect(validateStore({ ...store, observations: [...store.observations, orphan] })).toContain(
      "obs-98 names unknown session ses-77",
    );
  });

  it("does not let a priority rest on opinions about a proposal alone", () => {
    const opinionOnly: EvidenceStore = {
      ...store,
      problems: store.problems.map((p) => (p.id === "prb-01" ? { ...p, supportingObservationIds: ["obs-08"] } : p)),
    };
    expect(validateStore(opinionOnly)).toContain("chg-001 is prioritised on opinions about a proposal alone");
  });

  it("needs an approval reference for a public quotation", () => {
    const edited = store.observations.map((o) =>
      o.id === "obs-02" && o.quotation ? { ...o, quotation: { ...o.quotation, permission: "public_approved" as const } } : o,
    );
    expect(validateStore({ ...store, observations: edited })).toContain(
      "obs-02 marks a quotation as public without an approval reference",
    );
  });
});

describe("lookups", () => {
  const views = viewChanges(store, AS_OF);

  it("finds the changes behind a feedback item and an account", () => {
    expect(changesForFeedbackItem(views, "fb-001").map((v) => v.change.id)).toEqual(["chg-001"]);
    expect(changesForFeedbackItem(views, "fb-002")).toEqual([]);
    expect(changesForAccount(views, "acct-005").map((v) => v.change.id)).toEqual(["chg-006", "chg-007"]);
  });

  it("summarises the loop", () => {
    expect(summarizeLoop(views)).toEqual({
      changes: 9,
      byDelivery: { not_started: 2, in_progress: 1, released: 4, deferred: 1, rejected: 1 },
      byOutcome: { supported: 1, contradicted: 1, inconclusive: 1, awaiting_evidence: 1, not_applicable: 5 },
      followUpsOverdue: 1,
    });
  });
});
