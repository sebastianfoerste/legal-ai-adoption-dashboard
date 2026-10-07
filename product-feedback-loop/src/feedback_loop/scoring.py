"""Turn synthetic customer interviews into a prioritised product backlog.

The loop is deliberately traceable: a user pain -> a theme -> severity, reach and a
commercial signal -> a score -> the requirement and the delivery record held in the
evidence store. Nothing here is legal advice; all data is synthetic.

Version 2 of the formula. Version 1 multiplied severity by reach and by the *sum* of the
account signals, so reach counted twice, and an account without recorded revenue pulled
its theme's score to zero. The outputs produced with it are kept under
`examples/superseded/` with a correction note.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict, field
from typing import Any

from feedback_loop.evidence import NO_RECORD, ChangeStatus, statuses_by_theme

FORMULA_VERSION = "feedback-loop.score.v2"

# Every number below is a judgment, not a calibration. `reviewed_on` stays None until a
# named person has reviewed the weights; the outputs print that state.
WEIGHTS: dict[str, Any] = {
    "severity": {"blocker": 4, "high": 3, "medium": 2, "low": 1},
    # "none" is a recorded fact (no contract value yet, for example a pilot). A missing or
    # unrecognised band is unknown and is never treated as zero.
    "arr_band": {">1m": 4, "250k-1m": 3, "50k-250k": 2, "<50k": 1, "none": 0},
    "renewal_risk": {"high": 1.5, "medium": 1.2, "low": 1.0},
    "status": "uncalibrated judgment",
    "reviewed_on": None,
    "reviewed_by": None,
}

SEVERITY_ORDER = ["blocker", "high", "medium", "low"]
MAX_ACCOUNT_SIGNAL = max(WEIGHTS["arr_band"].values()) * max(WEIGHTS["renewal_risk"].values())

QUALITY_CONTROL = "quality_control"
LANE_LABEL = {
    QUALITY_CONTROL: "Quality and control failures",
    "commercial": "Commercially weighted backlog",
}
NEEDS_SCOPING = "Needs product scoping: no mapped requirement yet."


@dataclass
class ThemeScore:
    theme: str
    lane: str
    problem_classes: list[str]
    reach_accounts: int
    max_severity: str
    commercial_factor: float
    commercial_basis: str
    accounts_without_revenue_data: list[str]
    priority_score: float
    requirement: str
    representative_quote: str
    raised_by: list[str]
    changes: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _max_severity(a: str, b: str) -> str:
    return a if SEVERITY_ORDER.index(a) <= SEVERITY_ORDER.index(b) else b


def account_signal(arr_band: str | None, renewal_risk: str | None) -> float | None:
    """Commercial weight of one account. `None` when the revenue band is not known."""
    if arr_band not in WEIGHTS["arr_band"]:
        return None
    return WEIGHTS["arr_band"][arr_band] * WEIGHTS["renewal_risk"].get(renewal_risk or "low", 1.0)


def commercial_factor(signals: list[float | None]) -> tuple[float, str]:
    """Between 1 and 2: the mean known account signal, scaled.

    A mean, so that adding an account does not raise it (reach already counts accounts).
    At least 1, so that a theme raised only by accounts with no or unknown revenue keeps
    its severity-and-reach score.
    """
    known = [signal for signal in signals if signal is not None]
    if not known:
        return 1.0, "unknown"
    factor = 1 + (sum(known) / len(known)) / MAX_ACCOUNT_SIGNAL
    return round(factor, 2), "complete" if len(known) == len(signals) else "partial"


def priority_score(severity: str, reach: int, factor: float) -> float:
    return round(WEIGHTS["severity"][severity] * reach * factor, 1)


def lane_sort_key(theme: ThemeScore) -> tuple:
    # TODO(human): review this ordering. It is the judgment the whole backlog rests on.
    # Default: quality and control failures are listed first and ordered by severity, then
    # reach, so the commercial size of the accounts cannot move one of them below another.
    # The commercial lane is ordered by score.
    if theme.lane == QUALITY_CONTROL:
        return (0, SEVERITY_ORDER.index(theme.max_severity), -theme.reach_accounts, theme.theme)
    return (
        1,
        -theme.priority_score,
        SEVERITY_ORDER.index(theme.max_severity),
        -theme.reach_accounts,
        theme.theme,
    )


def aggregate_themes(interviews_doc: dict, evidence: dict | None = None) -> list[ThemeScore]:
    interviews = interviews_doc.get("interviews", [])
    recorded = statuses_by_theme(evidence)
    themes: dict[str, dict[str, Any]] = {}

    for iv in interviews:
        account = iv.get("account", "unknown")
        signal = account_signal(iv.get("arr_band"), iv.get("renewal_risk"))
        for pain in iv.get("pains", []):
            theme = pain.get("theme", "Unlabelled")
            severity = pain.get("severity", "low")
            entry = themes.setdefault(theme, {
                "signals": {},
                "classes": set(),
                "max_severity": "low",
                "quote": "",
                "quote_severity_rank": len(SEVERITY_ORDER),
            })
            entry["signals"][account] = signal  # one entry per account, however often it raised the theme
            if pain.get("class"):
                entry["classes"].add(pain["class"])
            entry["max_severity"] = _max_severity(entry["max_severity"], severity)
            # Keep the quote from the most severe mention as representative.
            rank = SEVERITY_ORDER.index(severity)
            if rank < entry["quote_severity_rank"] and pain.get("quote"):
                entry["quote"] = pain["quote"]
                entry["quote_severity_rank"] = rank

    scored: list[ThemeScore] = []
    for theme, e in themes.items():
        changes: list[ChangeStatus] = recorded.get(theme, [])
        classes = e["classes"] | {change.problem_class for change in changes}
        reach = len(e["signals"])
        factor, basis = commercial_factor(list(e["signals"].values()))
        scored.append(ThemeScore(
            theme=theme,
            lane=QUALITY_CONTROL if QUALITY_CONTROL in classes else "commercial",
            problem_classes=sorted(classes) or ["unclassified"],
            reach_accounts=reach,
            max_severity=e["max_severity"],
            commercial_factor=factor,
            commercial_basis=basis,
            accounts_without_revenue_data=sorted(a for a, s in e["signals"].items() if s is None),
            priority_score=priority_score(e["max_severity"], reach, factor),
            requirement="; ".join(change.requirement for change in changes) or NEEDS_SCOPING,
            representative_quote=e["quote"],
            raised_by=sorted(e["signals"]),
            changes=[change.to_dict() for change in changes],
        ))

    scored.sort(key=lane_sort_key)
    return scored


def _weights_note() -> str:
    reviewed = WEIGHTS["reviewed_on"]
    state = f"reviewed on {reviewed} by {WEIGHTS['reviewed_by']}" if reviewed else "not yet reviewed"
    return (
        f"Weights are documented judgments ({WEIGHTS['status']}, {state}). "
        "Change them in `scoring.WEIGHTS` and record who reviewed them."
    )


def _status_text(theme: ThemeScore) -> str:
    if not theme.changes:
        return NO_RECORD
    return "; ".join(
        f"{c['delivery_status'].replace('_', ' ')} ({c['change_id']})" for c in theme.changes
    )


def render_backlog_markdown(scored: list[ThemeScore], period: str) -> str:
    lines = [
        "# Prioritised product backlog (from customer feedback)",
        "",
        f"_Period: {period} · {len(scored)} themes from synthetic interviews · formula {FORMULA_VERSION}_",
        "",
    ]
    rank = 0
    for lane in (QUALITY_CONTROL, "commercial"):
        rows = [t for t in scored if t.lane == lane]
        lines += [f"## {LANE_LABEL[lane]}", ""]
        if lane == QUALITY_CONTROL:
            lines += [
                "Reviewed first, whatever the commercial size of the accounts that raised them. "
                "Ordered by severity, then reach. The score is shown for reference and does not order this lane.",
                "",
            ]
        else:
            lines += ["Ordered by score.", ""]
        if not rows:
            lines += ["None in this period.", ""]
            continue
        lines += [
            "| Rank | Theme | Severity | Reach | Commercial factor | Score | Requirement | Delivery status |",
            "| --- | --- | --- | --- | --- | --- | --- | --- |",
        ]
        for t in rows:
            rank += 1
            factor = f"{t.commercial_factor} ({t.commercial_basis})"
            lines.append(
                f"| {rank} | {t.theme} | {t.max_severity} | {t.reach_accounts} | {factor} | "
                f"{t.priority_score} | {t.requirement} | {_status_text(t)} |"
            )
        lines.append("")
    missing = sorted({a for t in scored for a in t.accounts_without_revenue_data})
    lines += [
        "## How to read this",
        "",
        "- Score = severity weight × accounts reached × commercial factor.",
        "- Commercial factor = 1 + mean account signal ÷ "
        f"{MAX_ACCOUNT_SIGNAL:g}, where account signal = ARR-band weight × renewal-risk weight. "
        "It lies between 1 and 2. Reach enters the score once.",
        "- An account with no contract value has signal 0 and still counts towards reach. "
        "An account whose revenue band is not recorded is left out of the mean and named below.",
        f"- Accounts without revenue data: {', '.join(missing) if missing else 'none'}.",
        "- Delivery status is read from the evidence store. Rank never sets it. "
        f"\"{NO_RECORD}\" means no delivery record exists.",
        f"- {_weights_note()}",
        "",
        "_Synthetic data; not legal advice._",
        "",
    ]
    return "\n".join(lines)


def render_memo_markdown(scored: list[ThemeScore], period: str, top_n: int = 3) -> str:
    lines = [
        "# What we heard, and where each requirement stands",
        "",
        f"_Customer feedback memo · {period} · synthetic_",
        "",
        "The top themes we heard, the requirement each maps to, and its recorded status. "
        "A status is printed only when a delivery record exists; a release is described as a "
        "change that helped only when a follow-up observation supports that.",
        "",
    ]
    for i, t in enumerate(scored[:top_n], start=1):
        lines += [
            f"## {i}. {t.theme}",
            "",
            f"- **What we heard:** “{t.representative_quote}” "
            f"(raised by {t.reach_accounts} accounts: {', '.join(t.raised_by)})",
            f"- **Class / severity / reach:** {', '.join(c.replace('_', ' ') for c in t.problem_classes)}, "
            f"{t.max_severity}, {t.reach_accounts} accounts · score {t.priority_score}",
        ]
        if not t.changes:
            lines += [
                f"- **Requirement:** {t.requirement}",
                f"- **Status:** {NO_RECORD}. No delivery record exists for this theme.",
                "",
            ]
            continue
        for c in t.changes:
            evidence = f", release evidence: {c['release_evidence']}" if c["release_evidence"] else ""
            lines += [
                f"- **Requirement ({c['change_id']}):** {c['requirement']}",
                f"- **Decision:** {c['decision'].replace('_', ' ')}, confidence {c['confidence']}. {c['rationale']}",
                f"- **Status:** {c['delivery_status'].replace('_', ' ')}{evidence}",
                f"- **Outcome:** {c['outcome_status'].replace('_', ' ')}",
                f"- **Next decision:** {c['next_decision']} ({c['owner']})",
            ]
        lines.append("")
    lines += [
        "---",
        "",
        "_Synthetic customer feedback and synthetic delivery records. "
        "Product communication artifact, not legal advice._",
        "",
    ]
    return "\n".join(lines)
