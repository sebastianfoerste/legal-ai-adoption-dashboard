"""Turn synthetic customer interviews into a prioritised product backlog.

The loop is deliberately traceable: a user pain -> a theme -> a severity and
revenue signal -> a priority score -> a mapped product requirement. Nothing here
is legal advice; all data is synthetic.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any

SEVERITY_WEIGHT = {"blocker": 4, "high": 3, "medium": 2, "low": 1}
ARR_WEIGHT = {">1m": 4, "250k-1m": 3, "50k-250k": 2, "<50k": 1, "none": 0}
RENEWAL_WEIGHT = {"high": 1.5, "medium": 1.2, "low": 1.0}

# Pain theme -> the product requirement it maps to. Themes without a mapping are
# surfaced as needing product scoping, never silently dropped.
THEME_TO_REQUIREMENT = {
    "No audit trail for AI-assisted edits":
        "Exportable, append-only audit log of every AI-assisted edit (who, what, when).",
    "Can't restrict who approves sensitive matters":
        "Role-based approval permissions, scoped by practice group and matter value.",
    "Citations not always traceable to the source":
        "Click-through citation grounding: every cited passage links to the source location.",
    "Hard to onboard associates":
        "Guided in-product onboarding flow with role-specific first tasks.",
    "No weekly usage visibility":
        "Weekly per-team usage view with low-usage warnings.",
}

SEVERITY_ORDER = ["blocker", "high", "medium", "low"]


@dataclass
class ThemeScore:
    theme: str
    reach_accounts: int
    max_severity: str
    revenue_signal: float
    priority_score: int
    requirement: str
    representative_quote: str
    raised_by: list[str]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _max_severity(a: str, b: str) -> str:
    return a if SEVERITY_ORDER.index(a) <= SEVERITY_ORDER.index(b) else b


def aggregate_themes(interviews_doc: dict) -> list[ThemeScore]:
    interviews = interviews_doc.get("interviews", [])
    themes: dict[str, dict[str, Any]] = {}

    for iv in interviews:
        account = iv.get("account", "unknown")
        arr = iv.get("arr_band", "none")
        renewal = iv.get("renewal_risk", "low")
        account_signal = ARR_WEIGHT.get(arr, 0) * RENEWAL_WEIGHT.get(renewal, 1.0)
        for pain in iv.get("pains", []):
            theme = pain.get("theme", "Unlabelled")
            severity = pain.get("severity", "low")
            entry = themes.setdefault(theme, {
                "accounts": set(),
                "max_severity": "low",
                "revenue_signal": 0.0,
                "quote": "",
                "quote_severity_rank": len(SEVERITY_ORDER),
            })
            if account not in entry["accounts"]:
                entry["revenue_signal"] += account_signal
            entry["accounts"].add(account)
            entry["max_severity"] = _max_severity(entry["max_severity"], severity)
            # Keep the quote from the most severe mention as representative.
            rank = SEVERITY_ORDER.index(severity)
            if rank < entry["quote_severity_rank"] and pain.get("quote"):
                entry["quote"] = pain["quote"]
                entry["quote_severity_rank"] = rank

    scored: list[ThemeScore] = []
    for theme, e in themes.items():
        reach = len(e["accounts"])
        sev = e["max_severity"]
        revenue = round(e["revenue_signal"], 2)
        score = round(SEVERITY_WEIGHT[sev] * reach * revenue)
        scored.append(ThemeScore(
            theme=theme,
            reach_accounts=reach,
            max_severity=sev,
            revenue_signal=revenue,
            priority_score=score,
            requirement=THEME_TO_REQUIREMENT.get(theme, "Needs product scoping — no mapped requirement yet."),
            representative_quote=e["quote"],
            raised_by=sorted(e["accounts"]),
        ))

    # Rank by priority score, then severity, then reach; stable by theme.
    scored.sort(key=lambda t: (
        -t.priority_score,
        SEVERITY_ORDER.index(t.max_severity),
        -t.reach_accounts,
        t.theme,
    ))
    return scored


def render_backlog_markdown(scored: list[ThemeScore], period: str) -> str:
    lines = [
        "# Prioritised product backlog (from customer feedback)",
        "",
        f"_Period: {period} · {len(scored)} themes from synthetic interviews_",
        "",
        "| Rank | Theme | Reach | Severity | Revenue signal | Score | Mapped requirement |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for i, t in enumerate(scored, start=1):
        lines.append(
            f"| {i} | {t.theme} | {t.reach_accounts} | {t.max_severity} | "
            f"{t.revenue_signal} | {t.priority_score} | {t.requirement} |"
        )
    lines += [
        "",
        "_Score = severity weight × accounts reached × revenue signal "
        "(ARR band × renewal-risk). Synthetic data; not legal advice._",
        "",
    ]
    return "\n".join(lines)


def render_memo_markdown(scored: list[ThemeScore], period: str, top_n: int = 3) -> str:
    # Synthetic status, assigned deterministically by rank for the demo memo.
    status_by_rank = ["shipped", "in progress", "planned"]
    lines = [
        "# What we heard, what we changed",
        "",
        f"_Customer feedback memo · {period} · synthetic_",
        "",
        "A short, repeatable note closing the loop with customers: the top themes we "
        "heard, the requirement each maps to, and where it is.",
        "",
    ]
    for i, t in enumerate(scored[:top_n]):
        status = status_by_rank[i] if i < len(status_by_rank) else "planned"
        lines += [
            f"## {i + 1}. {t.theme}",
            "",
            f"- **What we heard:** “{t.representative_quote}” "
            f"(raised by {t.reach_accounts} accounts: {', '.join(t.raised_by)})",
            f"- **Severity / reach:** {t.max_severity}, {t.reach_accounts} accounts · priority score {t.priority_score}",
            f"- **What we're changing:** {t.requirement}",
            f"- **Status:** {status}",
            "",
        ]
    lines += [
        "---",
        "",
        "_Synthetic customer feedback. Product communication artifact, not legal advice._",
        "",
    ]
    return "\n".join(lines)
