"""Deterministic tests. Pure stdlib unittest."""

import json
import unittest
from pathlib import Path

from feedback_loop.scoring import aggregate_themes, render_backlog_markdown, render_memo_markdown

ROOT = Path(__file__).resolve().parents[1]
DOC = json.loads((ROOT / "data" / "interviews.json").read_text(encoding="utf-8"))


class Aggregation(unittest.TestCase):
    def setUp(self):
        self.scored = aggregate_themes(DOC)
        self.by_theme = {t.theme: t for t in self.scored}

    def test_audit_trail_is_top_priority(self):
        # Raised by 3 high-ARR accounts with a blocker — should rank first.
        self.assertEqual(self.scored[0].theme, "No audit trail for AI-assisted edits")
        self.assertEqual(self.scored[0].max_severity, "blocker")
        self.assertEqual(self.scored[0].reach_accounts, 3)

    def test_reach_counts_distinct_accounts(self):
        self.assertEqual(self.by_theme["Hard to onboard associates"].reach_accounts, 2)

    def test_every_theme_maps_to_a_requirement(self):
        for t in self.scored:
            self.assertTrue(t.requirement.strip())

    def test_scores_are_descending(self):
        scores = [t.priority_score for t in self.scored]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_deterministic(self):
        a = render_backlog_markdown(aggregate_themes(DOC), "x")
        b = render_backlog_markdown(aggregate_themes(DOC), "x")
        self.assertEqual(a, b)

    def test_memo_includes_top_theme_and_status(self):
        memo = render_memo_markdown(self.scored, "Q2 2026 (synthetic)")
        self.assertIn("No audit trail for AI-assisted edits", memo)
        self.assertIn("Status:", memo)
        self.assertIn("What we're changing", memo)

    def test_unmapped_theme_is_surfaced_not_dropped(self):
        doc = {"period": "t", "interviews": [
            {"account": "A", "arr_band": "50k-250k", "renewal_risk": "low",
             "pains": [{"theme": "Totally novel ask", "severity": "high", "quote": "q"}]}
        ]}
        scored = aggregate_themes(doc)
        self.assertEqual(len(scored), 1)
        self.assertIn("Needs product scoping", scored[0].requirement)


if __name__ == "__main__":
    unittest.main()
