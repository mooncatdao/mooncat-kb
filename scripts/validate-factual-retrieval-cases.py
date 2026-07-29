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
GENESIS_SYNTHESIS_CASE_ID = "synthesis-genesis-collection-rationale"
GENESIS_SYNTHESIS_QUESTION = "Why did only 96 of the 256 planned Genesis Cats enter the final 25,440-Cat collection?"
GENESIS_SYNTHESIS_CONCEPTS = {
    "256 Genesis Cats planned",
    "96 released and entered the collection",
    "six released groups of 16",
    "160 permanently locked and unreleased",
    "25,344 Rescue Cats + 96 Genesis Cats = 25,440",
}
GENESIS_SYNTHESIS_DISTINCTIONS = {
    "contract-planned or formula-derivable population",
    "released collection membership",
    "official post-vote outcome",
    "deterministic arithmetic",
    "unresolved final technical locking mechanism",
}
GENESIS_SYNTHESIS_FORBIDDEN = {
    "all 256 were minted",
    "the remaining 160 have rescue orders, owners, or collection membership",
    "private-key destruction is the verified final locking mechanism",
}
ONCHAIN_SYNTHESIS_CASE_ID = "synthesis-fully-on-chain-materialization-path"
ONCHAIN_SYNTHESIS_QUESTION = "Which eight core reviewed contracts—MoonCatRescue, MoonCatAcclimator, MoonCatReference, MoonCatTraits, MoonCatColors, MoonCatSVGs, MoonCatAccessories, and MoonCatAccessoryImages—form the MoonCat on-chain materialization path, and which adjacent reviewed contracts such as MoonCatsWrapped/WMCR must be kept separate from that core path; what do the supplied files establish or leave unresolved about design intent, source implementation, historical deployment evidence, current chain state, and API, hosting, IPFS, Firebase, marketplace, and frontend availability?"
ONCHAIN_SYNTHESIS_REQUIRED_FILES = [
    "data/architecture-decisions.json",
    "docs/architecture-decisions.md",
    "data/contracts.json",
    "docs/contracts.md",
    "data/contract-surfaces.json",
    "data/materialization-internals.json",
]
ONCHAIN_SYNTHESIS_CONCEPTS = {
    "MoonCatRescue", "MoonCatAcclimator", "MoonCatReference", "MoonCatTraits",
    "MoonCatColors", "MoonCatSVGs", "MoonCatAccessories", "MoonCatAccessoryImages",
    "ADR/design intent", "source implementation",
    "historical deployed-address/source evidence", "live/current chain state",
    "direct source statements", "deterministic derivations",
    "reviewer synthesis across multiple contracts", "on-chain materialization surfaces",
    "off-chain API/hosting/IPFS/Firebase/marketplace/frontend boundary",
}
ONCHAIN_SYNTHESIS_DISTINCTIONS = {
    "ADR/design intent", "source implementation",
    "historical deployed-address/source evidence", "live/current chain state",
    "direct source statements", "deterministic derivations",
    "reviewer synthesis across multiple contracts", "on-chain materialization surfaces",
    "off-chain availability",
}
ONCHAIN_SYNTHESIS_FORBIDDEN = {
    "ADRs prove implementation or deployment",
    "verified source proves current bytecode equivalence or active deployment",
    "recorded addresses prove current admin, owner, proxy, storage, supply, or token ownership state",
    "source-described SVG/palette/trait/accessory paths prove current retrievability or exact output",
    "the contract set proves every MoonCat asset is currently fully on-chain",
    "configured endpoints are presently available without live verification",
}
ONCHAIN_SYNTHESIS_LIMITATIONS = {
    "The KB lacks full ABIs and Solidity bodies.",
    "The KB lacks bytecode and constructor verification.",
    "The KB lacks storage snapshots.",
    "The KB lacks complete mappings.",
    "The KB lacks generated outputs.",
    "The KB lacks current admin/ownership reads.",
    "The KB lacks current endpoint/content checks.",
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
    if case_id == GENESIS_SYNTHESIS_CASE_ID:
        if case["question"] != GENESIS_SYNTHESIS_QUESTION:
            errors.append(f"{case_id}: question does not match the required Genesis collection rationale")
        if case["difficultyClass"] != "cross-source-synthesis":
            errors.append(f"{case_id}: Genesis collection rationale must be cross-source-synthesis")
        if case["requiredFiles"] != ["data/genesis-cats.json", "docs/genesis-cats.md"]:
            errors.append(f"{case_id}: requiredFiles must be the Genesis data and documentation pair")
        missing_concepts = GENESIS_SYNTHESIS_CONCEPTS - set(case["requiredConcepts"])
        if missing_concepts:
            errors.append(f"{case_id}: missing required population concepts: {', '.join(sorted(missing_concepts))}")
        missing_distinctions = GENESIS_SYNTHESIS_DISTINCTIONS - set(distinctions)
        if missing_distinctions:
            errors.append(f"{case_id}: missing required provenance distinctions: {', '.join(sorted(missing_distinctions))}")
        missing_forbidden = GENESIS_SYNTHESIS_FORBIDDEN - set(case["forbiddenClaims"])
        if missing_forbidden:
            errors.append(f"{case_id}: missing required forbidden claims: {', '.join(sorted(missing_forbidden))}")
    if case_id == ONCHAIN_SYNTHESIS_CASE_ID:
        if case["question"] != ONCHAIN_SYNTHESIS_QUESTION:
            errors.append(f"{case_id}: question does not match the readiness audit recommendation")
        if case["difficultyClass"] != "cross-source-synthesis" or case["category"] != "contracts-materialization":
            errors.append(f"{case_id}: bounded on-chain case must be contracts-materialization cross-source-synthesis")
        if case["expectedAnswerMode"] != "answer-with-qualified-uncertainty":
            errors.append(f"{case_id}: bounded on-chain case must use qualified uncertainty")
        if case["requiredFiles"] != ONCHAIN_SYNTHESIS_REQUIRED_FILES or case["optionalFiles"] != []:
            errors.append(f"{case_id}: requiredFiles/optionalFiles must match the six-file readiness audit set")
        missing_concepts = ONCHAIN_SYNTHESIS_CONCEPTS - set(case["requiredConcepts"])
        if missing_concepts:
            errors.append(f"{case_id}: missing required concepts: {', '.join(sorted(missing_concepts))}")
        missing_distinctions = ONCHAIN_SYNTHESIS_DISTINCTIONS - set(distinctions)
        if missing_distinctions:
            errors.append(f"{case_id}: missing required provenance distinctions: {', '.join(sorted(missing_distinctions))}")
        missing_forbidden = ONCHAIN_SYNTHESIS_FORBIDDEN - set(case["forbiddenClaims"])
        if missing_forbidden:
            errors.append(f"{case_id}: missing required forbidden claims: {', '.join(sorted(missing_forbidden))}")
        missing_limitations = ONCHAIN_SYNTHESIS_LIMITATIONS - set(case["expectedLimitations"])
        if missing_limitations:
            errors.append(f"{case_id}: missing required limitations: {', '.join(sorted(missing_limitations))}")


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
    expected_case_count = policy.get("expectedCaseCount")
    if case_count_range != [34, 40] or not 34 <= len(cases) <= 40:
        errors.append("benchmark must contain 34 through 40 cases with policy range [34, 40]")
    if expected_case_count != 38 or len(cases) != expected_case_count:
        errors.append("benchmark must contain exactly 38 cases")
    counts = Counter(case.get("difficultyClass") for case in cases if isinstance(case, dict))
    minimum = policy.get("minimumCasesPerDifficultyClass")
    if minimum != 8:
        errors.append("minimumCasesPerDifficultyClass must be 8")
    for difficulty in enums.get("difficultyClasses", []):
        if counts[difficulty] < 8:
            errors.append(f"difficulty class {difficulty} has fewer than eight cases")
    expected_counts = policy.get("expectedDifficultyCounts")
    if not isinstance(expected_counts, dict) or any(counts[difficulty] != expected_counts.get(difficulty) for difficulty in enums.get("difficultyClasses", [])):
        errors.append("difficulty class counts must remain exactly 10, 10, 10, 8 in enum order")
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
