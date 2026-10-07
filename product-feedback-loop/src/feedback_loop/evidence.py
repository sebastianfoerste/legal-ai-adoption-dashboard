"""Read the evidence-loop store that the dashboard also reads.

Delivery status, decisions and outcomes live in one file (`data/evidence-loop.json`,
schema `legal-ai-adoption.evidence-loop.v1`). This module never derives a status from a
rank or a score: it reports what the record says, or that no record exists.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

_PACKAGE_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_VOCABULARY = (
    _PACKAGE_ROOT.parent / "packages" / "evidence-loop-contract" / "evidence-loop.v1.vocabulary.json"
)
DEFAULT_STORE = _PACKAGE_ROOT.parent / "data" / "evidence-loop.json"

NO_RECORD = "not recorded"
SYNTHETIC_FIXTURE = "synthetic_fixture"


class EvidenceError(ValueError):
    """The store breaks a rule that the memo relies on."""


@dataclass(frozen=True)
class ChangeStatus:
    change_id: str
    title: str
    requirement: str
    problem_class: str
    decision: str
    confidence: str
    rationale: str
    delivery_status: str
    release_evidence: str | None
    outcome_status: str
    next_decision: str
    owner: str

    def to_dict(self) -> dict[str, Any]:
        return dict(self.__dict__)


def load_vocabulary(path: Path | str = DEFAULT_VOCABULARY) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def outcome_status(change: dict[str, Any]) -> str:
    """A release without an assessed follow-up is awaiting evidence, never a success."""
    if change["delivery"]["status"] != "released":
        return "not_applicable"
    outcome = change.get("outcome")
    return outcome["result"] if outcome else "awaiting_evidence"


def _walk_origins(value: Any, path: str = "$"):
    if isinstance(value, list):
        for index, item in enumerate(value):
            label = item.get("id", index) if isinstance(item, dict) else index
            yield from _walk_origins(item, f"{path}[{label}]")
    elif isinstance(value, dict):
        for key, child in value.items():
            yield (f"{path}.{key}", key, child)
            yield from _walk_origins(child, f"{path}.{key}")


def validate_store(store: dict[str, Any], vocabulary: dict[str, Any]) -> list[str]:
    """The subset of the dashboard's rules that this module depends on."""
    issues: list[str] = []
    if store.get("schema") != vocabulary["schema"]:
        issues.append(f"schema is {store.get('schema')!r}, expected {vocabulary['schema']!r}")
        return issues
    public_kinds = set(vocabulary["publicOriginKinds"])
    forbidden = set(vocabulary["forbiddenKeys"])
    for path, key, child in _walk_origins(store):
        if key in forbidden:
            issues.append(f"{path}: identifying field")
        if key == "origin" and isinstance(child, dict) and child.get("kind") not in public_kinds:
            issues.append(f"{path}: {child.get('kind')!r} records belong in the private research store")
    problems = {problem["id"] for problem in store.get("problems", [])}
    for change in store.get("changes", []):
        cid = change["id"]
        delivery = change["delivery"]
        decision = change["decision"]
        if change["problemId"] not in problems:
            issues.append(f"{cid} names unknown problem {change['problemId']}")
        if delivery["status"] not in vocabulary["deliveryStatuses"]:
            issues.append(f"{cid}: unknown delivery status {delivery['status']!r}")
        if decision["status"] not in vocabulary["decisionStatuses"]:
            issues.append(f"{cid}: unknown decision status {decision['status']!r}")
        if (delivery["status"] == "released") != (delivery.get("release") is not None):
            issues.append(f'{cid}: "released" needs release evidence, and release evidence means released')
        if delivery.get("release") is not None and not delivery["release"].get("evidenceRef"):
            issues.append(f"{cid}: release without an evidence reference")
        if change.get("outcome") and not delivery.get("release"):
            issues.append(f"{cid} has an outcome although nothing was released")
        if change.get("outcome") and change["outcome"]["result"] not in vocabulary["outcomeResults"]:
            issues.append(f"{cid}: unknown outcome {change['outcome']['result']!r}")
    return issues


def load_store(
    path: Path | str = DEFAULT_STORE, vocabulary_path: Path | str = DEFAULT_VOCABULARY
) -> dict[str, Any]:
    store = json.loads(Path(path).read_text(encoding="utf-8"))
    issues = validate_store(store, load_vocabulary(vocabulary_path))
    if issues:
        raise EvidenceError("evidence store rejected:\n- " + "\n- ".join(issues))
    return store


def validate_interviews(doc: dict[str, Any], vocabulary: dict[str, Any]) -> list[str]:
    """An interview file and every interview in it state their origin.

    The file holds synthetic fixtures only. The backlog and the memo label their input as
    synthetic, and practitioner evidence reaches the public tree through the evidence
    store as an approved aggregate, never as an interview.
    """
    issues: list[str] = []
    records = [("$", doc)] + [
        (f"$.interviews[{index}]", interview)
        for index, interview in enumerate(doc.get("interviews", []) if isinstance(doc, dict) else [])
    ]
    for path, record in records:
        origin = record.get("origin") if isinstance(record, dict) else None
        kind = origin.get("kind") if isinstance(origin, dict) else None
        if kind is None:
            issues.append(f'{path}: no origin stated; a name ending in "(synthetic)" does not count')
        elif kind not in vocabulary["originKinds"]:
            issues.append(f"{path}: unknown origin {kind!r}")
        elif kind not in vocabulary["publicOriginKinds"]:
            issues.append(f"{path}: {kind!r} records belong in the private research store")
        elif kind != SYNTHETIC_FIXTURE:
            issues.append(
                f"{path}: interview files hold synthetic fixtures only; "
                f"{kind!r} evidence enters through the evidence store"
            )
    forbidden = set(vocabulary["forbiddenKeys"])
    issues += [f"{path}: identifying field" for path, key, _ in _walk_origins(doc) if key in forbidden]
    return issues


def load_interviews(path: Path | str, vocabulary_path: Path | str = DEFAULT_VOCABULARY) -> dict[str, Any]:
    doc = json.loads(Path(path).read_text(encoding="utf-8"))
    issues = validate_interviews(doc, load_vocabulary(vocabulary_path))
    if issues:
        raise EvidenceError("interview file rejected:\n- " + "\n- ".join(issues))
    return doc


def statuses_by_theme(store: dict[str, Any] | None) -> dict[str, list[ChangeStatus]]:
    """Feedback theme -> the changes recorded against the problem behind it."""
    if not store:
        return {}
    problems = {problem["id"]: problem for problem in store["problems"]}
    by_theme: dict[str, list[ChangeStatus]] = {}
    for change in store["changes"]:
        problem = problems[change["problemId"]]
        release = change["delivery"].get("release")
        status = ChangeStatus(
            change_id=change["id"],
            title=change["title"],
            requirement=change["proposedChange"],
            problem_class=problem["class"],
            decision=change["decision"]["status"],
            confidence=change["decision"]["confidence"],
            rationale=change["decision"]["rationale"],
            delivery_status=change["delivery"]["status"],
            release_evidence=release["evidenceRef"] if release else None,
            outcome_status=outcome_status(change),
            next_decision=change["nextDecision"]["question"],
            owner=change["ownerRole"],
        )
        for theme in problem.get("feedbackThemes", []):
            by_theme.setdefault(theme, []).append(status)
    return by_theme
