"""feedback_loop: turn synthetic customer interviews into a prioritised, traceable
product backlog and a memo whose delivery status comes from the shared evidence store.
Not legal advice."""

from feedback_loop.evidence import ChangeStatus, EvidenceError, load_store, outcome_status
from feedback_loop.scoring import (
    ThemeScore,
    aggregate_themes,
    render_backlog_markdown,
    render_memo_markdown,
)

__all__ = [
    "ChangeStatus",
    "EvidenceError",
    "ThemeScore",
    "aggregate_themes",
    "load_store",
    "outcome_status",
    "render_backlog_markdown",
    "render_memo_markdown",
]
__version__ = "0.2.0"
