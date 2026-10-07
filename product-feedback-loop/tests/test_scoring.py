"""Deterministic tests. Pure stdlib unittest."""

import contextlib
import copy
import io
import json
import tempfile
import unittest
from pathlib import Path

from feedback_loop import cli
from feedback_loop.evidence import (
    DEFAULT_STORE,
    DEFAULT_VOCABULARY,
    EvidenceError,
    NO_RECORD,
    load_store,
    load_vocabulary,
    outcome_status,
    validate_interviews,
    validate_store,
)
from feedback_loop.scoring import (
    MAX_ACCOUNT_SIGNAL,
    WEIGHTS,
    account_signal,
    aggregate_themes,
    commercial_factor,
    priority_score,
    render_backlog_markdown,
    render_memo_markdown,
)

ROOT = Path(__file__).resolve().parents[1]
DOC = json.loads((ROOT / "data" / "interviews.json").read_text(encoding="utf-8"))
STORE = load_store()
VOCABULARY = load_vocabulary()

AUDIT = "No audit trail for AI-assisted edits"


def interview(account, arr, pains, renewal="low"):
    return {"account": account, "arr_band": arr, "renewal_risk": renewal, "pains": pains}


def pain(theme, severity="high", cls=None, quote="q"):
    item = {"theme": theme, "severity": severity, "quote": quote}
    if cls:
        item["class"] = cls
    return item


class Aggregation(unittest.TestCase):
    def setUp(self):
        self.scored = aggregate_themes(DOC, STORE)
        self.by_theme = {t.theme: t for t in self.scored}

    def test_audit_trail_is_top_priority(self):
        self.assertEqual(self.scored[0].theme, AUDIT)
        self.assertEqual(self.scored[0].max_severity, "blocker")
        self.assertEqual(self.scored[0].reach_accounts, 3)

    def test_reach_counts_distinct_accounts(self):
        self.assertEqual(self.by_theme["Hard to onboard associates"].reach_accounts, 2)

    def test_every_theme_maps_to_a_requirement(self):
        for t in self.scored:
            self.assertTrue(t.requirement.strip())
            self.assertNotIn("Needs product scoping", t.requirement)

    def test_deterministic(self):
        a = render_backlog_markdown(aggregate_themes(DOC, STORE), "x")
        b = render_backlog_markdown(aggregate_themes(DOC, STORE), "x")
        self.assertEqual(a, b)

    def test_unmapped_theme_is_surfaced_not_dropped(self):
        doc = {"period": "t", "interviews": [interview("A", "50k-250k", [pain("Totally novel ask")])]}
        scored = aggregate_themes(doc, STORE)
        self.assertEqual(len(scored), 1)
        self.assertIn("Needs product scoping", scored[0].requirement)
        self.assertEqual(scored[0].changes, [])


class Formula(unittest.TestCase):
    def test_reach_enters_the_score_once(self):
        # Three identical accounts: the mean signal does not move, so the score is linear in reach.
        one = aggregate_themes({"interviews": [interview("A", "250k-1m", [pain("T")])]})[0]
        three = aggregate_themes({"interviews": [
            interview(name, "250k-1m", [pain("T")]) for name in ("A", "B", "C")
        ]})[0]
        self.assertEqual(one.commercial_factor, three.commercial_factor)
        self.assertAlmostEqual(three.priority_score, 3 * one.priority_score, places=1)

    def test_an_account_raising_a_theme_twice_counts_once(self):
        doc = {"interviews": [interview("A", ">1m", [pain("T"), pain("T", "blocker")])]}
        scored = aggregate_themes(doc)[0]
        self.assertEqual(scored.reach_accounts, 1)
        self.assertEqual(scored.max_severity, "blocker")

    def test_commercial_factor_is_bounded(self):
        self.assertEqual(commercial_factor([0.0]), (1.0, "complete"))
        self.assertEqual(commercial_factor([MAX_ACCOUNT_SIGNAL]), (2.0, "complete"))
        self.assertEqual(commercial_factor([]), (1.0, "unknown"))

    def test_zero_revenue_does_not_erase_a_theme(self):
        scored = aggregate_themes({"interviews": [interview("Pilot", "none", [pain("T", "blocker")])]})[0]
        self.assertEqual(scored.commercial_factor, 1.0)
        self.assertEqual(scored.commercial_basis, "complete")
        self.assertEqual(scored.priority_score, WEIGHTS["severity"]["blocker"] * 1 * 1.0)

    def test_missing_revenue_is_unknown_not_zero(self):
        self.assertEqual(account_signal("none", "low"), 0)
        self.assertIsNone(account_signal(None, "low"))
        self.assertIsNone(account_signal("about a million", "high"))
        doc = {"interviews": [
            {"account": "NoBand", "pains": [pain("T")]},
            interview("Known", ">1m", [pain("T")], renewal="high"),
        ]}
        scored = aggregate_themes(doc)[0]
        self.assertEqual(scored.commercial_basis, "partial")
        self.assertEqual(scored.accounts_without_revenue_data, ["NoBand"])
        # The mean is taken over the known account only; the unknown one is not averaged in as zero.
        self.assertEqual(scored.commercial_factor, 2.0)
        self.assertEqual(scored.reach_accounts, 2)
        self.assertIn("Accounts without revenue data: NoBand.", render_backlog_markdown([scored], "t"))

    def test_score_decomposes(self):
        for t in aggregate_themes(DOC, STORE):
            self.assertEqual(t.priority_score, priority_score(t.max_severity, t.reach_accounts, t.commercial_factor))

    def test_weights_are_marked_as_unreviewed_judgments(self):
        self.assertIsNone(WEIGHTS["reviewed_on"])
        self.assertIn("not yet reviewed", render_backlog_markdown(aggregate_themes(DOC, STORE), "t"))


class QualityAndControl(unittest.TestCase):
    def test_a_control_failure_at_a_small_account_outranks_a_large_convenience_item(self):
        doc = {"interviews": [
            interview("Small", "<50k", [pain("Wrong clause signed off", "high", "quality_control")]),
            interview("Large1", ">1m", [pain("Export button", "high", "convenience")], renewal="high"),
            interview("Large2", ">1m", [pain("Export button", "high", "convenience")], renewal="high"),
        ]}
        scored = aggregate_themes(doc)
        self.assertEqual([t.theme for t in scored], ["Wrong clause signed off", "Export button"])
        self.assertLess(scored[0].priority_score, scored[1].priority_score)
        self.assertEqual(scored[0].lane, "quality_control")

    def test_commercial_size_does_not_order_the_quality_lane(self):
        doc = {"interviews": [
            interview("Small", "none", [pain("Blocker at a pilot", "blocker", "quality_control")]),
            interview("Large", ">1m", [pain("High at a large account", "high", "quality_control")], renewal="high"),
        ]}
        self.assertEqual(aggregate_themes(doc)[0].theme, "Blocker at a pilot")

    def test_class_recorded_in_the_store_applies_without_an_interview_label(self):
        doc = {"interviews": [interview("A", "50k-250k", [pain(AUDIT, "medium")])]}
        self.assertEqual(aggregate_themes(doc, STORE)[0].lane, "quality_control")
        self.assertEqual(aggregate_themes(doc)[0].problem_classes, ["unclassified"])

    def test_fixture_lanes(self):
        lanes = {t.theme: t.lane for t in aggregate_themes(DOC, STORE)}
        self.assertEqual(lanes["Hard to onboard associates"], "commercial")
        self.assertEqual(lanes["Citations not always traceable to the source"], "quality_control")


class DeliveryStatus(unittest.TestCase):
    def setUp(self):
        self.scored = aggregate_themes(DOC, STORE)
        self.memo = render_memo_markdown(self.scored, "Q2 2026 (synthetic)")

    def test_top_ranked_requirement_is_not_shipped_automatically(self):
        top = self.scored[0]
        self.assertEqual(top.theme, AUDIT)
        self.assertEqual([c["delivery_status"] for c in top.changes], ["in_progress"])
        section = self.memo.split("## 2.")[0]
        self.assertIn("**Status:** in progress", section)
        self.assertNotIn("shipped", self.memo)
        self.assertIn("**Outcome:** not applicable", section)

    def test_status_is_the_same_whatever_the_rank(self):
        reordered = list(reversed(self.scored))
        for position, theme in enumerate(reordered):
            again = [t for t in self.scored if t.theme == theme.theme][0]
            self.assertEqual(theme.changes, again.changes, position)
        memo = render_memo_markdown(reordered, "t", top_n=5)
        self.assertIn("**Status:** deferred", memo.split("## 2.")[0])

    def test_without_a_record_the_status_is_not_recorded(self):
        memo = render_memo_markdown(aggregate_themes(DOC), "t")
        self.assertEqual(memo.count(f"**Status:** {NO_RECORD}"), 3)
        for word in ("shipped", "in progress", "planned", "released"):
            self.assertNotIn(f"**Status:** {word}", memo)

    def test_released_prints_its_evidence_and_its_outcome(self):
        memo = render_memo_markdown(self.scored, "t", top_n=5)
        self.assertIn("**Status:** released, release evidence: synthetic-release-notes/2026-07#clause-references", memo)
        self.assertIn("**Outcome:** awaiting evidence", memo)
        self.assertIn("**Outcome:** contradicted", memo)

    def test_released_without_evidence_is_rejected(self):
        broken = copy.deepcopy(STORE)
        change = next(c for c in broken["changes"] if c["id"] == "chg-003")
        change["delivery"]["status"] = "released"
        issues = validate_store(broken, VOCABULARY)
        self.assertIn('chg-003: "released" needs release evidence, and release evidence means released', issues)

    def test_unknown_status_and_wrong_schema_are_rejected(self):
        broken = copy.deepcopy(STORE)
        broken["changes"][0]["delivery"]["status"] = "shipped"
        self.assertTrue(any("unknown delivery status 'shipped'" in i for i in validate_store(broken, VOCABULARY)))
        self.assertEqual(len(validate_store({**STORE, "schema": "something.else.v9"}, VOCABULARY)), 1)

    def test_outcome_without_release_is_rejected(self):
        broken = copy.deepcopy(STORE)
        change = next(c for c in broken["changes"] if c["id"] == "chg-004")
        change["outcome"] = {"result": "supported", "assessedOn": "2026-07-30", "rationale": "x", "alternativeExplanations": []}
        self.assertIn("chg-004 has an outcome although nothing was released", validate_store(broken, VOCABULARY))


class SharedStore(unittest.TestCase):
    def test_reads_the_same_files_as_the_dashboard(self):
        self.assertEqual(DEFAULT_STORE.name, "evidence-loop.json")
        self.assertEqual(DEFAULT_STORE.parent.name, "data")
        self.assertEqual(STORE["schema"], VOCABULARY["schema"])
        self.assertTrue(DEFAULT_VOCABULARY.exists())

    def test_outcome_statuses_match_the_dashboard_test(self):
        # lib/evidence/loop.test.ts pins the same map on the same fixture.
        self.assertEqual({c["id"]: outcome_status(c) for c in STORE["changes"]}, {
            "chg-001": "supported",
            "chg-002": "contradicted",
            "chg-003": "not_applicable",
            "chg-004": "not_applicable",
            "chg-005": "not_applicable",
            "chg-006": "not_applicable",
            "chg-007": "not_applicable",
            "chg-008": "inconclusive",
            "chg-009": "awaiting_evidence",
        })
        for status in {outcome_status(c) for c in STORE["changes"]}:
            self.assertIn(status, VOCABULARY["outcomeStatuses"])

    def test_private_records_are_refused(self):
        private = copy.deepcopy(STORE)
        private["observations"][0]["origin"] = {
            "kind": "participant_session", "studyId": "s", "consentRef": "c", "storageRef": "r",
        }
        self.assertTrue(any("private research store" in i for i in validate_store(private, VOCABULARY)))
        leaked = copy.deepcopy(STORE)
        leaked["sessions"][0]["email"] = "someone@example.invalid"
        self.assertTrue(any("identifying field" in i for i in validate_store(leaked, VOCABULARY)))
        with self.assertRaises(EvidenceError):
            tmp = ROOT / ".check-out-private.json"
            try:
                tmp.write_text(json.dumps(private), encoding="utf-8")
                load_store(tmp)
            finally:
                tmp.unlink(missing_ok=True)

    def test_an_approved_aggregate_is_read_for_obvious_identifiers(self):
        aggregate = {
            "kind": "approved_aggregate", "approvalRef": "https://approvals.example.invalid/APP-1",
            "approvedOn": "2026-10-01", "approvedByRole": "Study owner",
        }
        published = copy.deepcopy(STORE)
        published["observations"][0]["origin"] = aggregate
        self.assertEqual(validate_store(published, VOCABULARY), [])
        published["observations"][0]["observed"] = "Write to someone@example.invalid for the file."
        observation = published["observations"][0]["id"]
        self.assertEqual(
            validate_store(published, VOCABULARY),
            [f"$.observations[{observation}].observed: contains an email address"],
        )

    def test_every_interview_theme_has_a_delivery_record(self):
        for t in aggregate_themes(DOC, STORE):
            self.assertTrue(t.changes, t.theme)


class InterviewOrigin(unittest.TestCase):
    def issues(self, doc):
        return validate_interviews(doc, VOCABULARY)

    def test_the_bundled_interviews_state_their_origin(self):
        self.assertEqual(self.issues(DOC), [])
        self.assertEqual(DOC["origin"], {"kind": "synthetic_fixture"})

    def test_a_name_suffix_does_not_stand_in_for_an_origin(self):
        doc = copy.deepcopy(DOC)
        del doc["interviews"][0]["origin"]
        self.assertIn("(synthetic)", doc["interviews"][0]["account"])
        self.assertEqual(
            self.issues(doc),
            ['$.interviews[0]: no origin stated; a name ending in "(synthetic)" does not count'],
        )
        del doc["origin"]
        self.assertEqual(len(self.issues(doc)), 2)

    def test_participant_records_and_aggregates_do_not_belong_in_an_interview_file(self):
        private = copy.deepcopy(DOC)
        private["interviews"][0]["origin"] = {
            "kind": "participant_session", "studyId": "s", "consentRef": "c", "storageRef": "r",
        }
        self.assertIn("private research store", self.issues(private)[0])
        aggregate = copy.deepcopy(DOC)
        aggregate["interviews"][0]["origin"] = {
            "kind": "approved_aggregate", "approvalRef": "APP-1",
            "approvedOn": "2026-10-01", "approvedByRole": "Study owner",
        }
        self.assertIn("enters through the evidence store", self.issues(aggregate)[0])

    def test_identifying_fields_are_refused(self):
        doc = copy.deepcopy(DOC)
        doc["interviews"][0]["email"] = "someone@example.invalid"
        self.assertEqual(self.issues(doc), ["$.interviews[0].email: identifying field"])

    def test_the_cli_refuses_an_unlabelled_file_and_labels_its_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            unlabelled = copy.deepcopy(DOC)
            del unlabelled["origin"]
            source = Path(tmp) / "interviews.json"
            source.write_text(json.dumps(unlabelled), encoding="utf-8")
            stderr = io.StringIO()
            with contextlib.redirect_stderr(stderr):
                code = cli.main(["--input", str(source), "--out", str(Path(tmp) / "out"), "--quiet"])
            self.assertEqual(code, 2)
            self.assertIn("interview file rejected", stderr.getvalue())
            self.assertFalse((Path(tmp) / "out").exists())

            source.write_text(json.dumps(DOC), encoding="utf-8")
            self.assertEqual(cli.main(["--input", str(source), "--out", str(Path(tmp) / "out"), "--quiet"]), 0)
            backlog = json.loads((Path(tmp) / "out" / "prioritized-backlog.json").read_text(encoding="utf-8"))
            self.assertEqual(backlog["origin"], {"kind": "synthetic_fixture"})


if __name__ == "__main__":
    unittest.main()
