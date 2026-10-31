"""Tests for scripts/compile_kit.py: valid heading ids, readable formulas, no third-party
request in the compiled HTML. Pure stdlib unittest."""

import os
import re
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path

from compile_kit import (
    compile_kit,
    formula_paragraph_to_html,
    latex_to_text,
    parse_inline,
    parse_markdown_to_html,
    slugify_heading,
)

KIT_ROOT = Path(__file__).resolve().parent.parent


@contextmanager
def chdir(path):
    previous = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(previous)


class HeadingIdTest(unittest.TestCase):
    def test_ids_are_lowercase_hyphenated_and_free_of_other_punctuation(self):
        self.assertEqual(slugify_heading("Formula A: Weekly Time Saved (hours)"), "formula-a-weekly-time-saved-hours")
        self.assertEqual(slugify_heading("What's inside"), "whats-inside")
        self.assertEqual(slugify_heading("0:16–0:24 — Risk and confidentiality posture"), "016024--risk-and-confidentiality-posture")
        self.assertEqual(slugify_heading("`make check` and **bold** _text_"), "make-check-and-bold-text")

    def test_heading_id_keeps_the_file_heading_scheme_and_matches_links(self):
        html = parse_markdown_to_html("## Formula A: Weekly Time Saved (hours)\n", {}, "discovery-roi-calculator")
        self.assertIn('id="discovery-roi-calculator--formula-a-weekly-time-saved-hours"', html)
        link = parse_inline(
            "[formula](roi-calculator.md#formula-a-weekly-time-saved-hours)",
            {"discovery/roi-calculator.md": "discovery-roi-calculator"},
        )
        self.assertIn('href="#discovery-roi-calculator--formula-a-weekly-time-saved-hours"', link)


class FormulaTest(unittest.TestCase):
    def test_latex_becomes_readable_text(self):
        self.assertEqual(
            latex_to_text(r"\text{Hours Saved/Week} = \frac{\text{Weekly Frequency} \times 2}{60}"),
            "Hours Saved/Week = (Weekly Frequency × 2) / (60)",
        )
        self.assertEqual(latex_to_text(r"\text{ROI (\%)} = \left( \frac{a}{b} \right) \times 100"), "ROI (%) = ( (a) / (b) ) × 100")

    def test_a_formula_paragraph_renders_as_a_code_block_per_formula(self):
        html = formula_paragraph_to_html(r"$$\text{A} = 1$$ $$\text{B} = 2$$")
        self.assertEqual(html.count('<pre class="formula"><code>'), 2)
        self.assertNotIn("$$", html)
        self.assertNotIn("\\text", html)

    def test_escaped_dollar_signs_are_plain_in_html(self):
        self.assertEqual(parse_inline(r"from \$1 to \$2", {}), "from $1 to $2")


class CompiledHtmlTest(unittest.TestCase):
    """Compile the real kit into a temporary copy and check the HTML as a whole."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        root = Path(cls.tmp.name)
        for path in KIT_ROOT.rglob("*.md"):
            if "__pycache__" in path.parts:
                continue
            target = root / path.relative_to(KIT_ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
        with chdir(root):
            compile_kit()
        cls.html = (root / "enablement" / "workshop-kit-unified.html").read_text(encoding="utf-8")

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_no_third_party_request(self):
        self.assertNotIn("fonts.googleapis.com", self.html)
        self.assertNotIn("fonts.gstatic.com", self.html)
        self.assertNotRegex(self.html, r'(href|src)="https?://')

    def test_no_whitespace_inside_any_id(self):
        ids = re.findall(r'id="([^"]*)"', self.html)
        self.assertTrue(ids)
        self.assertEqual([i for i in ids if re.search(r"\s", i)], [])

    def test_no_literal_escaped_dollar_or_raw_latex(self):
        self.assertNotIn("\\$", self.html)
        self.assertNotIn("$$", self.html)
        self.assertIn('<pre class="formula">', self.html)


if __name__ == "__main__":
    unittest.main()
