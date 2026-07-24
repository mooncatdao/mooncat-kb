#!/usr/bin/env python3
"""Validate the offline MoonCat factual-retrieval benchmark contract."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data/factual-retrieval-cases.json"
REQUIRED_CASE_KEYS = {
    "id", "question", "category", "difficultyClass", "expectedAnswerMode",
    "requiredConcepts", "requiredFiles", "optionalFiles", "forbiddenClaims",
    "provenanceRequirements", "liveVerification", "expectedLimitations", "reviewerNotes",
}
REQUIRED_BOUNDARY_TERMS = {
    "architecture-decisions": {"design intent", "implementation evidence"},
    "live-state-boundaries": {"current"},
}


def fail(errors: list[str]) -> int:
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    return 1


def as_string_list(value: Any, label: str, errors: list[str]) -> list[str]:
    if not isinstance(value, list) or not value or not all(isinstance(item, str) and item.strip() for item in value):
        errors.append(f"{label} must be a non-empty list of strings")
        return []
    return value


def contains_unsupported_current_expectation(case: dict[str, Any]) -> bool:
    text = " ".join(
        value for key, value in case.items()
        if key not in {"forbiddenClaims", "expectedLimitations", "reviewerNotes"} and isinstance(value, str)
    ).lower()
    return bool(re.search(r"\b(current owner is|current price is|endpoint is available|deployment is live)\b", text))


def validate_case(case: Any, data: dict[str, Any], errors: list[str]) -> None:
    if not isinstance(case, dict):
        errors.append("each case must be an object")
        return
    case_id = case.get("id", "<missing id>")
    missing = sorted(REQUIRED_CASE_KEYS - set(case))
    if missing:
        errors.append(f"{case_id}: missing fields {', '.join(missing)}")
        return
    enums = data["enums"]
    if not isinstance(case["id"], str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]+", case["id"]):
        errors.append(f"{case_id}: id must be lowercase kebab case")
    if not isinstance(case["question"], str) or len(case["question"].strip()) < 20:
        errors.append(f"{case_id}: question must be a useful string")
    if not isinstance(case["category"], str) or not case["category"]:
        errors.append(f"{case_id}: category must be a string")
    if case["difficultyClass"] not in enums["difficultyClasses"]:
        errors.append(f"{case_id}: unknown difficultyClass")
    if case["expectedAnswerMode"] not in enums["answerModes"]:
        errors.append(f"{case_id}: unknown expectedAnswerMode")
    required_files = as_string_list(case["requiredFiles"], f"{case_id}.requiredFiles", errors)
    optional_files = case["optionalFiles"]
    if not isinstance(optional_files, list) or not all(isinstance(item, str) and item.strip() for item in optional_files):
        errors.append(f"{case_id}.optionalFiles must be a list of strings")
        optional_files = []
    if set(required_files) & set(optional_files):
        errors.append(f"{case_id}: requiredFiles and optionalFiles overlap")
    for path in required_files + optional_files:
        if not (ROOT / path).is_file():
            errors.append(f"{case_id}: referenced file does not exist: {path}")
    as_string_list(case["requiredConcepts"], f"{case_id}.requiredConcepts", errors)
    as_string_list(case["forbiddenClaims"], f"{case_id}.forbiddenClaims", errors)
    as_string_list(case["expectedLimitations"], f"{case_id}.expectedLimitations", errors)
    if not isinstance(case["reviewerNotes"], str) or not case["reviewerNotes"].strip():
        errors.append(f"{case_id}: reviewerNotes must be non-empty")

    provenance = case["provenanceRequirements"]
    if not isinstance(provenance, dict):
        errors.append(f"{case_id}: provenanceRequirements must be an object")
        provenance = {}
    distinctions = as_string_list(provenance.get("mustDistinguish"), f"{case_id}.provenanceRequirements.mustDistinguish", errors)
    source_classes = as_string_list(provenance.get("expectedSourceClasses"), f"{case_id}.provenanceRequirements.expectedSourceClasses", errors)
    unknown_sources = set(source_classes) - set(enums["sourceClasses"])
    if unknown_sources:
        errors.append(f"{case_id}: unknown source classes {', '.join(sorted(unknown_sources))}")

    live = case["liveVerification"]
    if not isinstance(live, dict) or not isinstance(live.get("required"), bool) or not isinstance(live.get("reason"), str) or not live["reason"].strip():
        errors.append(f"{case_id}: liveVerification requires boolean required and non-empty reason")
        return
    is_live = live["required"]
    if case["difficultyClass"] == "live-verification-stop":
        if not is_live or case["expectedAnswerMode"] != "stop-for-live-verification":
            errors.append(f"{case_id}: live-verification-stop cases must require live verification and stop mode")
        if "live-verification-required" not in source_classes:
            errors.append(f"{case_id}: live-verification-stop cases must require live-verification-required provenance")
        if not any("static" in item.lower() or "current" in item.lower() or "live" in item.lower() for item in case["expectedLimitations"]):
            errors.append(f"{case_id}: live-verification-stop cases must state a static/current/live limitation")
    elif is_live or case["expectedAnswerMode"] == "stop-for-live-verification":
        errors.append(f"{case_id}: only live-verification-stop cases may use required live verification or stop mode")
    if contains_unsupported_current_expectation(case):
        errors.append(f"{case_id}: contains unsupported positive current-state expectation")
    if case["category"] == "architecture-decisions":
        if case["expectedAnswerMode"] != "distinguish-intent-from-implementation":
            errors.append(f"{case_id}: ADR case must use distinguish-intent-from-implementation")
        missing_terms = REQUIRED_BOUNDARY_TERMS["architecture-decisions"] - set(distinctions)
        if missing_terms:
            errors.append(f"{case_id}: ADR provenance must distinguish {', '.join(sorted(missing_terms))}")
    if case["category"] == "genesis-history" and "technical mechanism" in " ".join(case["requiredConcepts"]).lower():
        if not any("unresolved" in item.lower() for item in case["expectedLimitations"]):
            errors.append(f"{case_id}: Genesis lock-mechanism case must preserve unresolved status")


def main() -> int:
    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    errors: list[str] = []
    if data.get("schemaVersion") != 1:
        errors.append("schemaVersion must be 1")
    if data.get("status") != "deterministic-provenance-aware-factual-retrieval-benchmark":
        errors.append("status must identify the factual-retrieval benchmark")
    enums = data.get("enums")
    if not isinstance(enums, dict):
        return fail([*errors, "enums must be an object"])
    for key in ("difficultyClasses", "answerModes", "sourceClasses"):
        as_string_list(enums.get(key), f"enums.{key}", errors)
    policy = data.get("coveragePolicy", {})
    cases = data.get("cases")
    if not isinstance(cases, list):
        return fail([*errors, "cases must be a list"])
    case_count_range = policy.get("caseCountRange")
    if case_count_range != [32, 40] or not 32 <= len(cases) <= 40:
        errors.append("benchmark must contain 32 through 40 cases with policy range [32, 40]")
    counts = Counter(case.get("difficultyClass") for case in cases if isinstance(case, dict))
    minimum = policy.get("minimumCasesPerDifficultyClass")
    if minimum != 8:
        errors.append("minimumCasesPerDifficultyClass must be 8")
    for difficulty in enums.get("difficultyClasses", []):
        if counts[difficulty] < 8:
            errors.append(f"difficulty class {difficulty} has fewer than eight cases")
    categories = {case.get("category") for case in cases if isinstance(case, dict)}
    required_domains = set(policy.get("requiredDomains", []))
    missing_domains = required_domains - categories
    if missing_domains:
        errors.append(f"benchmark is missing required domains: {', '.join(sorted(missing_domains))}")
    ids = [case.get("id") for case in cases if isinstance(case, dict)]
    if len(ids) != len(set(ids)):
        errors.append("case IDs must be unique")
    questions = [case.get("question", "").strip().lower() for case in cases if isinstance(case, dict)]
    if len(questions) != len(set(questions)):
        errors.append("case questions must be unique")
    for case in cases:
        validate_case(case, data, errors)
    if errors:
        return fail(errors)
    print(f"Factual retrieval benchmark validation passed: {len(cases)} cases; " + ", ".join(f"{key}={counts[key]}" for key in enums["difficultyClasses"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
