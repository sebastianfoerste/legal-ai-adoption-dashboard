"""Command-line entry point.

    python -m feedback_loop.cli --input data/interviews.json --out examples

Writes prioritized-backlog.md/.json and product-memo.md.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from feedback_loop.scoring import aggregate_themes, render_backlog_markdown, render_memo_markdown


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Customer feedback -> prioritised product backlog.")
    parser.add_argument("--input", required=True, help="Path to interviews JSON.")
    parser.add_argument("--out", default=None, help="Output directory.")
    parser.add_argument("--quiet", action="store_true", help="Do not print to stdout.")
    args = parser.parse_args(argv)

    doc = json.loads(Path(args.input).read_text(encoding="utf-8"))
    period = doc.get("period", "current period")
    scored = aggregate_themes(doc)

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
        (out_dir / "prioritized-backlog.json").write_text(
            json.dumps({"period": period, "themes": [t.to_dict() for t in scored]}, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
