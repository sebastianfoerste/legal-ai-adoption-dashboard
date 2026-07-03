"""feedback_loop — turn synthetic customer interviews into a prioritised, traceable
product backlog and a 'what we heard, what we changed' memo. Not legal advice."""

from feedback_loop.scoring import (
    aggregate_themes,
    render_backlog_markdown,
    render_memo_markdown,
    ThemeScore,
)

__all__ = ["aggregate_themes", "render_backlog_markdown", "render_memo_markdown", "ThemeScore"]
__version__ = "0.1.0"
