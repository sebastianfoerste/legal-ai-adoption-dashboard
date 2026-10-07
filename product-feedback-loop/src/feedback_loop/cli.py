"""Command-line entry point.

    python -m feedback_loop.cli --input data/interviews.json --out examples

Writes prioritized-backlog.md/.json and product-memo.md. Delivery status comes from the
evidence store (default: ../data/evidence-loop.json); pass --no-evidence to run without it,
in which case every status reads "not recorded".
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from feedback_loop.evidence import (
    DEFAULT_STORE,
    DEFAULT_VOCABULARY,
    EvidenceError,
    load_interviews,
    load_store,
)
from feedback_loop.scoring import (
    FORMULA_VERSION,
    WEIGHTS,
    aggregate_themes,
    render_backlog_markdown,
    render_memo_markdown,
)

BACKLOG_SCHEMA = "feedback-loop.backlog.v2"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Customer feedback -> prioritised product backlog.")
    parser.add_argument("--input", required=True, help="Path to interviews JSON.")
    parser.add_argument("--out", default=None, help="Output directory.")
    parser.add_argument("--evidence", default=str(DEFAULT_STORE), help="Path to the evidence-loop store.")
    parser.add_argument("--vocabulary", default=str(DEFAULT_VOCABULARY), help="Path to the shared vocabulary.")
    parser.add_argument("--no-evidence", action="store_true", help="Run without delivery records.")
    parser.add_argument("--quiet", action="store_true", help="Do not print to stdout.")
    args = parser.parse_args(argv)

    try:
        doc = load_interviews(args.input, args.vocabulary)
    except (OSError, EvidenceError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    period = doc.get("period", "current period")
    evidence = None
    if not args.no_evidence:
        try:
            evidence = load_store(args.evidence, args.vocabulary)
        except (OSError, EvidenceError) as error:
            print(f"error: {error}", file=sys.stderr)
            return 2
    scored = aggregate_themes(doc, evidence)

    backlog_md = render_backlog_markdown(scored, period)
    memo_md = render_memo_markdown(scored, period)

    if not args.quiet:
        print(backlog_md)
        print(memo_md)

    if args.out:
        out_dir = Path(args.out)
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "prioritized-backlog.md").write_text(backlog_md, encoding="utf-8")
        (out_dir / "product-memo.md").write_text(memo_md, encoding="utf-8")
        payload = {
            "schema": BACKLOG_SCHEMA,
            "formula": FORMULA_VERSION,
            "evidence_schema": evidence["schema"] if evidence else None,
            "origin": doc["origin"],
            "period": period,
            "weights": WEIGHTS,
            "themes": [t.to_dict() for t in scored],
        }
        (out_dir / "prioritized-backlog.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
