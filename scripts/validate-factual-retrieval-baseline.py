#!/usr/bin/env python3
"""Mechanically validate a completed factual-retrieval baseline run."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BENCHMARK = ROOT / "data/factual-retrieval-cases.json"
EXPECTED_CASE_COUNT = 64
OUTCOMES = {"pass", "partial", "fail", "correct-stop"}
COVERAGE_STATUSES = {"covered", "partial", "missing"}
PROVENANCE_STATUSES = {"met", "partial", "missing"}
LIVE_BEHAVIORS = {"not-required", "correct-stop", "failed-to-stop"}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_preparer() -> Any:
    path = ROOT / "scripts/prepare-factual-retrieval-baseline.py"
    spec = importlib.util.spec_from_file_location("factual_baseline_preparer", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def error(errors: list[str], label: str, message: str) -> None:
    errors.append(f"{label}: {message}")


def required_string(value: Any, errors: list[str], label: str) -> str | None:
    if not isinstance(value, str) or not value.strip():
        error(errors, label, "must be a non-empty string")
        return None
    return value


def directory_names(path: Path, errors: list[str], label: str) -> set[str]:
    if not path.is_dir():
        error(errors, label, "directory is missing")
        return set()
    names: set[str] = set()
    for child in path.iterdir():
        if child.is_symlink() or not child.is_dir():
            error(errors, label, f"unexpected non-directory entry {child.name}")
        else:
            names.add(child.name)
    return names


def validate_dimension_list(
    grade: dict[str, Any],
    field: str,
    key: str,
    expected_values: list[str],
    errors: list[str],
    label: str,
) -> list[str]:
    values = grade.get(field)
    if not isinstance(values, list) or len(values) != len(expected_values):
        error(errors, f"{label}.{field}", "must have one entry for every benchmark item")
        return []
    statuses: list[str] = []
    actual_values: list[Any] = []
    for index, item in enumerate(values):
        item_label = f"{label}.{field}[{index}]"
        if not isinstance(item, dict):
            error(errors, item_label, "must be an object")
            continue
        actual_values.append(item.get(key))
        status = item.get("status")
        if status not in COVERAGE_STATUSES:
            error(errors, f"{item_label}.status", f"must be one of {sorted(COVERAGE_STATUSES)}")
        else:
            statuses.append(status)
        note = item.get("reviewerNote")
        if not isinstance(note, str):
            error(errors, f"{item_label}.reviewerNote", "must be a string")
        elif status in {"partial", "missing"} and not note.strip():
            error(errors, f"{item_label}.reviewerNote", f"is required when status is {status}")
    if actual_values != expected_values:
        error(errors, f"{label}.{field}", "benchmark items or order do not match the hidden rubric")
    return statuses


def validate_grade(
    grade: Any,
    case: dict[str, Any],
    answer_path: Path,
    errors: list[str],
) -> None:
    label = f"reviewers/{case['id']}/grade.json"
    if not isinstance(grade, dict):
        error(errors, label, "must contain an object")
        return
    if grade.get("schemaVersion") != 1:
        error(errors, f"{label}.schemaVersion", "must equal 1")
    if grade.get("caseId") != case["id"]:
        error(errors, f"{label}.caseId", "does not match the benchmark")
    if grade.get("difficultyClass") != case["difficultyClass"]:
        error(errors, f"{label}.difficultyClass", "does not match the benchmark")

    outcome = grade.get("outcome")
    if outcome not in OUTCOMES:
        error(errors, f"{label}.outcome", f"must be one of {sorted(OUTCOMES)}")

    concept_statuses = validate_dimension_list(
        grade,
        "requiredConceptCoverage",
        "concept",
        case["requiredConcepts"],
        errors,
        label,
    )
    distinction_statuses = validate_dimension_list(
        grade,
        "provenanceDistinctions",
        "distinction",
        case["provenanceRequirements"]["mustDistinguish"],
        errors,
        label,
    )
    limitation_statuses = validate_dimension_list(
        grade,
        "expectedLimitationCoverage",
        "limitation",
        case["expectedLimitations"],
        errors,
        label,
    )

    provenance_status = grade.get("provenanceDistinctionStatus")
    if provenance_status not in PROVENANCE_STATUSES:
        error(
            errors,
            f"{label}.provenanceDistinctionStatus",
            f"must be one of {sorted(PROVENANCE_STATUSES)}",
        )
    if distinction_statuses:
        expected_provenance_status = (
            "met"
            if all(status == "covered" for status in distinction_statuses)
            else "missing"
            if "missing" in distinction_statuses
            else "partial"
        )
        if provenance_status != expected_provenance_status:
            error(
                errors,
                f"{label}.provenanceDistinctionStatus",
                f"must be {expected_provenance_status!r} for the recorded distinction statuses",
            )

    violations = grade.get("forbiddenClaimViolations")
    violation_flags: list[bool] = []
    if not isinstance(violations, list) or len(violations) != len(case["forbiddenClaims"]):
        error(errors, f"{label}.forbiddenClaimViolations", "must cover every forbidden claim")
    else:
        actual_claims: list[Any] = []
        for index, item in enumerate(violations):
            item_label = f"{label}.forbiddenClaimViolations[{index}]"
            if not isinstance(item, dict):
                error(errors, item_label, "must be an object")
                continue
            actual_claims.append(item.get("claim"))
            violated = item.get("violated")
            if not isinstance(violated, bool):
                error(errors, f"{item_label}.violated", "must be a boolean")
            else:
                violation_flags.append(violated)
            note = item.get("reviewerNote")
            if not isinstance(note, str):
                error(errors, f"{item_label}.reviewerNote", "must be a string")
            elif violated is True and not note.strip():
                error(errors, f"{item_label}.reviewerNote", "is required for a recorded violation")
        if actual_claims != case["forbiddenClaims"]:
            error(errors, f"{label}.forbiddenClaimViolations", "claims or order do not match the rubric")

    live = grade.get("liveVerificationBehavior")
    live_status = None
    if not isinstance(live, dict):
        error(errors, f"{label}.liveVerificationBehavior", "must be an object")
    else:
        live_status = live.get("status")
        if live_status not in LIVE_BEHAVIORS:
            error(errors, f"{label}.liveVerificationBehavior.status", f"must be one of {sorted(LIVE_BEHAVIORS)}")
        if not isinstance(live.get("reviewerNote"), str):
            error(errors, f"{label}.liveVerificationBehavior.reviewerNote", "must be a string")

    live_required = case["liveVerification"]["required"]
    if live_required and live_status == "not-required":
        error(errors, f"{label}.liveVerificationBehavior.status", "cannot be not-required for a live-verification case")
    if not live_required and live_status != "not-required":
        error(errors, f"{label}.liveVerificationBehavior.status", "must be not-required for a static case")
    if outcome == "correct-stop":
        if not live_required or case["expectedAnswerMode"] != "stop-for-live-verification":
            error(errors, f"{label}.outcome", "correct-stop is only valid for live-verification stop cases")
        if live_status != "correct-stop":
            error(errors, f"{label}.outcome", "correct-stop requires liveVerificationBehavior.status=correct-stop")
    if live_required and outcome == "pass":
        error(errors, f"{label}.outcome", "a successful live-verification stop must use correct-stop, not pass")

    if outcome in {"pass", "correct-stop"}:
        if any(status != "covered" for status in concept_statuses):
            error(errors, f"{label}.outcome", "cannot be successful with a partial or missing required concept")
        if provenance_status != "met" or any(status != "covered" for status in distinction_statuses):
            error(errors, f"{label}.outcome", "cannot be successful without all provenance distinctions")
        if any(violation_flags):
            error(errors, f"{label}.outcome", "cannot be successful with a forbidden-claim violation")
        if any(status != "covered" for status in limitation_statuses):
            error(errors, f"{label}.outcome", "cannot be successful with a partial or missing expected limitation")
        if live_status == "failed-to-stop":
            error(errors, f"{label}.outcome", "cannot be successful after failing the live-verification stop")

    required_string(grade.get("reviewerNotes"), errors, f"{label}.reviewerNotes")

    artifact = grade.get("answerArtifact")
    if not isinstance(artifact, dict) or artifact.get("path") != "answer.md":
        error(errors, f"{label}.answerArtifact", "must identify answer.md")
    else:
        expected_hash = artifact.get("sha256")
        if not isinstance(expected_hash, str) or not re.fullmatch(r"[0-9a-f]{64}", expected_hash):
            error(errors, f"{label}.answerArtifact.sha256", "must be a lowercase SHA-256 digest")
        elif answer_path.is_file() and sha256_bytes(answer_path.read_bytes()) != expected_hash:
            error(errors, f"{label}.answerArtifact.sha256", "does not match answer.md")
    findings = grade.get("reviewerFindingsArtifact")
    if not isinstance(findings, dict) or findings.get("path") != "reviewer-findings.md":
        error(errors, f"{label}.reviewerFindingsArtifact", "must identify reviewer-findings.md")


def current_repo_drift(
    metadata: dict[str, Any],
    current_benchmark_path: Path = DEFAULT_BENCHMARK,
    current_source_root: Path = ROOT,
) -> dict[str, Any]:
    """Report current repository differences without affecting archival validity."""
    benchmark_meta = metadata["benchmark"]
    recorded_benchmark_hash = benchmark_meta["sha256"]
    current_benchmark_path = current_benchmark_path.resolve()
    if current_benchmark_path.is_file():
        current_benchmark_hash = sha256_bytes(current_benchmark_path.read_bytes())
        benchmark_status = {
            "path": str(current_benchmark_path),
            "recordedSha256": recorded_benchmark_hash,
            "currentSha256": current_benchmark_hash,
            "matches": current_benchmark_hash == recorded_benchmark_hash,
        }
    else:
        benchmark_status = {
            "path": str(current_benchmark_path),
            "recordedSha256": recorded_benchmark_hash,
            "currentSha256": None,
            "matches": False,
            "missing": True,
        }

    current_source_root = current_source_root.resolve()
    required_hashes = metadata["requiredFileHashes"]
    unique_required_files = sorted({relative for hashes in required_hashes.values() for relative in hashes})
    drifted: list[dict[str, str]] = []
    missing: list[str] = []
    for relative in unique_required_files:
        current_path = current_source_root / relative
        recorded_hash = next(hashes[relative] for hashes in required_hashes.values() if relative in hashes)
        if not current_path.is_file():
            missing.append(relative)
            continue
        current_hash = sha256_bytes(current_path.read_bytes())
        if current_hash != recorded_hash:
            drifted.append(
                {
                    "path": relative,
                    "recordedSha256": recorded_hash,
                    "currentSha256": current_hash,
                }
            )
    source_status = {
        "root": str(current_source_root),
        "checkedCount": len(unique_required_files),
        "drifted": drifted,
        "missing": missing,
    }
    has_drift = (
        not benchmark_status["matches"]
        or bool(drifted)
        or bool(missing)
    )
    return {
        "status": "drift" if has_drift else "match",
        "informationalOnly": True,
        "benchmark": benchmark_status,
        "requiredFiles": source_status,
    }


def validate_run(
    run_dir: Path,
    report_current_drift: bool = False,
    current_benchmark_path: Path = DEFAULT_BENCHMARK,
    current_source_root: Path = ROOT,
) -> dict[str, Any]:
    run_dir = run_dir.resolve()
    errors: list[str] = []
    if not run_dir.is_dir():
        raise ValueError(f"run directory is missing: {run_dir}")

    metadata_path = run_dir / "run-metadata.json"
    try:
        metadata = load_json(metadata_path)
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot load run-metadata.json: {exc}") from exc
    if not isinstance(metadata, dict):
        raise ValueError("run-metadata.json must contain an object")
    benchmark_meta = metadata.get("benchmark")
    if not isinstance(benchmark_meta, dict):
        raise ValueError("run-metadata.json.benchmark must contain the pinned snapshot metadata")
    if benchmark_meta.get("path") != "benchmark-snapshot.json":
        raise ValueError("run-metadata.json.benchmark.path must be benchmark-snapshot.json")
    if benchmark_meta.get("canonicalPath") != "data/factual-retrieval-cases.json":
        raise ValueError("run-metadata.json.benchmark.canonicalPath must identify the canonical benchmark")
    snapshot_path = run_dir / "benchmark-snapshot.json"
    if not snapshot_path.is_file():
        raise ValueError("benchmark-snapshot.json is missing from the run")
    snapshot_hash = sha256_bytes(snapshot_path.read_bytes())
    if benchmark_meta.get("sha256") != snapshot_hash:
        raise ValueError("benchmark-snapshot.json hash does not match run metadata")
    if benchmark_meta.get("canonicalSha256AtPreparation") != snapshot_hash:
        raise ValueError("canonical benchmark preparation hash does not match benchmark snapshot")
    try:
        benchmark = load_json(snapshot_path)
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot load benchmark-snapshot.json: {exc}") from exc
    cases = benchmark.get("cases")
    if not isinstance(cases, list) or len(cases) != EXPECTED_CASE_COUNT:
        raise ValueError(f"benchmark snapshot must contain exactly {EXPECTED_CASE_COUNT} cases")
    case_by_id = {case["id"]: case for case in cases}
    if len(case_by_id) != len(cases):
        raise ValueError("benchmark case ids must be unique")
    case_ids = set(case_by_id)

    if metadata.get("schemaVersion") != 1:
        error(errors, "run-metadata.json.schemaVersion", "must equal 1")
    if metadata.get("status") != "prepared-empirical-factual-retrieval-run":
        error(errors, "run-metadata.json.status", "unexpected status")
    for field in ("runId", "runDate", "generatedAt", "networkToolPolicy"):
        required_string(metadata.get(field), errors, f"run-metadata.json.{field}")
    source = metadata.get("sourceKb")
    if not isinstance(source, dict):
        error(errors, "run-metadata.json.sourceKb", "must be an object")
    else:
        commit = source.get("gitCommit")
        available = source.get("gitCommitAvailable")
        dirty = source.get("gitWorktreeDirty")
        if not isinstance(available, bool):
            error(errors, "run-metadata.json.sourceKb.gitCommitAvailable", "must be a boolean")
        if available and (not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit)):
            error(errors, "run-metadata.json.sourceKb.gitCommit", "must be a 40-character commit when available")
        if not available and commit is not None:
            error(errors, "run-metadata.json.sourceKb.gitCommit", "must be null when unavailable")
        if dirty is not None and not isinstance(dirty, bool):
            error(errors, "run-metadata.json.sourceKb.gitWorktreeDirty", "must be boolean or null")
    benchmark_meta = metadata.get("benchmark")
    if benchmark_meta.get("schemaVersion") != benchmark.get("schemaVersion"):
        error(errors, "run-metadata.json.benchmark.schemaVersion", "does not match the benchmark snapshot")
    if metadata.get("caseCount") != EXPECTED_CASE_COUNT:
        error(errors, "run-metadata.json.caseCount", f"must equal {EXPECTED_CASE_COUNT}")
    expected_class_counts = Counter(case["difficultyClass"] for case in cases)
    if metadata.get("classCounts") != {
        name: expected_class_counts[name] for name in benchmark["enums"]["difficultyClasses"]
    }:
        error(errors, "run-metadata.json.classCounts", "does not match benchmark class counts")
    model = metadata.get("model")
    if not isinstance(model, dict):
        error(errors, "run-metadata.json.model", "must be an object")
    else:
        for field in ("name", "providerClient", "reasoningLevel"):
            required_string(model.get(field), errors, f"run-metadata.json.model.{field}")
    isolation = metadata.get("isolationPolicy")
    expected_isolation = {
        "name": "required-files-only-sufficiency-baseline",
        "answerModelRoot": "one answer-bundles/<case-id> directory at a time",
        "requiredFilesOnly": True,
        "optionalFilesIncluded": False,
        "hiddenReviewerMaterialSeparated": True,
    }
    if isolation != expected_isolation:
        error(errors, "run-metadata.json.isolationPolicy", "must record the required-files-only separation policy")

    bundle_ids = directory_names(run_dir / "answer-bundles", errors, "answer-bundles")
    reviewer_ids = directory_names(run_dir / "reviewers", errors, "reviewers")
    if bundle_ids != case_ids:
        error(errors, "answer-bundles", f"case ids differ from benchmark: missing={sorted(case_ids - bundle_ids)}, extra={sorted(bundle_ids - case_ids)}")
    if reviewer_ids != case_ids:
        error(errors, "reviewers", f"case ids differ from benchmark: missing={sorted(case_ids - reviewer_ids)}, extra={sorted(reviewer_ids - case_ids)}")

    preparer = load_preparer()
    prompt_meta = metadata.get("answerPrompt")
    expected_prompt_hash = sha256_bytes(preparer.GENERIC_ANSWER_INSTRUCTION.encode("utf-8"))
    if not isinstance(prompt_meta, dict) or prompt_meta.get("version") != preparer.PROMPT_VERSION or prompt_meta.get("sha256") != expected_prompt_hash:
        error(errors, "run-metadata.json.answerPrompt", "does not match the maintained generic prompt/version")
    required_hashes = metadata.get("requiredFileHashes")
    if not isinstance(required_hashes, dict) or set(required_hashes) != case_ids:
        error(errors, "run-metadata.json.requiredFileHashes", "must contain exactly the benchmark case ids")
        required_hashes = {}

    grades: list[dict[str, Any]] = []
    for case in cases:
        case_id = case["id"]
        bundle = run_dir / "answer-bundles" / case_id
        reviewer = run_dir / "reviewers" / case_id
        if not bundle.is_dir() or not reviewer.is_dir():
            continue
        if any(path.is_symlink() for path in (*bundle.rglob("*"), *reviewer.rglob("*"))):
            error(errors, case_id, "symlinks are not allowed in bundle or reviewer artifacts")

        expected_bundle_files = {
            "INSTRUCTIONS.md",
            "QUESTION.md",
            *(f"required-files/{relative}" for relative in case["requiredFiles"]),
        }
        actual_bundle_files = {
            path.relative_to(bundle).as_posix() for path in bundle.rglob("*") if path.is_file()
        }
        if actual_bundle_files != expected_bundle_files:
            error(errors, f"answer-bundles/{case_id}", f"unexpected file set: missing={sorted(expected_bundle_files - actual_bundle_files)}, extra={sorted(actual_bundle_files - expected_bundle_files)}")
        instruction_path = bundle / "INSTRUCTIONS.md"
        question_path = bundle / "QUESTION.md"
        if instruction_path.is_file():
            instruction = instruction_path.read_text(encoding="utf-8")
            if instruction != preparer.GENERIC_ANSWER_INSTRUCTION:
                error(errors, f"answer-bundles/{case_id}/INSTRUCTIONS.md", "does not match the generic prompt")
            for hidden_field in preparer.HIDDEN_RUBRIC_FIELDS:
                if hidden_field in instruction:
                    error(errors, f"answer-bundles/{case_id}/INSTRUCTIONS.md", f"contains hidden rubric field name {hidden_field}")
        if question_path.is_file() and question_path.read_text(encoding="utf-8") != f"# Question\n\n{case['question']}\n":
            error(errors, f"answer-bundles/{case_id}/QUESTION.md", "does not match the visible benchmark question")

        expected_case_hashes = required_hashes.get(case_id, {})
        if not isinstance(expected_case_hashes, dict):
            error(errors, f"run-metadata.json.requiredFileHashes.{case_id}", "must be an object")
            expected_case_hashes = {}
        if set(expected_case_hashes) != set(case["requiredFiles"]):
            error(
                errors,
                f"run-metadata.json.requiredFileHashes.{case_id}",
                "does not contain exactly the snapshot's required files",
            )
        for relative in case["requiredFiles"]:
            copied_path = bundle / "required-files" / relative
            if copied_path.is_file():
                copied_hash = sha256_bytes(copied_path.read_bytes())
                if copied_hash != expected_case_hashes.get(relative):
                    error(errors, f"answer-bundles/{case_id}/required-files/{relative}", "does not match its recorded preparation hash")
        if required_hashes.get(case_id) != expected_case_hashes:
            error(errors, f"run-metadata.json.requiredFileHashes.{case_id}", "does not match the snapshot's required file list")

        expected_reviewer_files = {"answer.md", "grade.json", "hidden-rubric.json", "reviewer-findings.md"}
        actual_reviewer_files = {
            path.relative_to(reviewer).as_posix() for path in reviewer.rglob("*") if path.is_file()
        }
        if actual_reviewer_files != expected_reviewer_files:
            error(errors, f"reviewers/{case_id}", f"unexpected file set: missing={sorted(expected_reviewer_files - actual_reviewer_files)}, extra={sorted(actual_reviewer_files - expected_reviewer_files)}")
        rubric_path = reviewer / "hidden-rubric.json"
        expected_rubric = {
            "schemaVersion": 1,
            "caseId": case_id,
            "category": case["category"],
            "difficultyClass": case["difficultyClass"],
            **{field: case[field] for field in preparer.HIDDEN_RUBRIC_FIELDS},
        }
        try:
            rubric = load_json(rubric_path)
        except (OSError, json.JSONDecodeError) as exc:
            error(errors, f"reviewers/{case_id}/hidden-rubric.json", f"cannot load: {exc}")
        else:
            if rubric != expected_rubric:
                error(errors, f"reviewers/{case_id}/hidden-rubric.json", "does not exactly match benchmark grading fields")

        answer_path = reviewer / "answer.md"
        if not answer_path.is_file() or not answer_path.read_text(encoding="utf-8").strip():
            error(errors, f"reviewers/{case_id}/answer.md", "completed run requires a non-empty raw answer")
        grade_path = reviewer / "grade.json"
        try:
            grade = load_json(grade_path)
        except (OSError, json.JSONDecodeError) as exc:
            error(errors, f"reviewers/{case_id}/grade.json", f"cannot load: {exc}")
        else:
            validate_grade(grade, case, answer_path, errors)
            if isinstance(grade, dict):
                grades.append(grade)

    if errors:
        raise ValueError("\n".join(errors))
    validated = {"runDir": run_dir, "benchmark": benchmark, "metadata": metadata, "grades": grades}
    if report_current_drift:
        validated["currentRepoDrift"] = current_repo_drift(
            metadata,
            current_benchmark_path=current_benchmark_path,
            current_source_root=current_source_root,
        )
    return validated


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate structure, identities, hashes, enums, and completed reviewer grades without grading prose."
    )
    parser.add_argument("--run-dir", required=True, type=Path, help="Completed raw baseline run directory.")
    parser.add_argument(
        "--report-current-drift",
        action="store_true",
        help="After archival validation, report informational drift against today's repository.",
    )
    parser.add_argument(
        "--current-benchmark",
        type=Path,
        default=DEFAULT_BENCHMARK,
        help="Benchmark path for --report-current-drift (defaults to the current KB benchmark).",
    )
    parser.add_argument(
        "--current-source-root",
        type=Path,
        default=ROOT,
        help="Source root for --report-current-drift (defaults to the current KB checkout).",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        validated = validate_run(
            args.run_dir,
            report_current_drift=args.report_current_drift,
            current_benchmark_path=args.current_benchmark,
            current_source_root=args.current_source_root,
        )
    except (OSError, RuntimeError, ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print(
        f"Completed factual-retrieval baseline validation passed: {len(validated['grades'])} cases; "
        "checked isolation structure, source identities, answer hashes, grade enums, and mechanical consistency; "
        "answer prose was not semantically graded"
    )
    if args.report_current_drift:
        print(json.dumps(validated["currentRepoDrift"], indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
