#!/usr/bin/env python3
"""Prepare leakage-separated factual-retrieval baseline run bundles."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BENCHMARK = ROOT / "data/factual-retrieval-cases.json"
LOCAL_RUN_ROOT = ROOT / ".factual-retrieval-runs"
EXPECTED_CASE_COUNT = 64
PROMPT_VERSION = "required-files-only-v1"
GENERIC_ANSWER_INSTRUCTION = """# Required-files-only factual retrieval

Answer the question using only the files inside `required-files/` in this bundle.
Do not access parent directories, sibling case bundles, network resources, or external tools.
Keep identifier kinds and evidence boundaries explicit. Do not infer current state from static,
historical, configured, or source-only evidence. If the supplied files are insufficient, state
the limitation instead of guessing. Return a concise, source-aware answer.
"""
HIDDEN_RUBRIC_FIELDS = (
    "requiredConcepts",
    "provenanceRequirements",
    "forbiddenClaims",
    "expectedLimitations",
    "expectedAnswerMode",
    "liveVerification",
    "reviewerNotes",
)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def git_output(*args: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", *args],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None
    return result.stdout.strip()


def source_revision() -> dict[str, Any]:
    commit = git_output("rev-parse", "HEAD")
    status = git_output("status", "--porcelain")
    return {
        "gitCommit": commit,
        "gitCommitAvailable": commit is not None,
        "gitWorktreeDirty": None if status is None else bool(status),
    }


def parse_iso_date(value: str) -> str:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date().isoformat()
    except ValueError as error:
        raise argparse.ArgumentTypeError("expected YYYY-MM-DD") from error


def parse_timestamp(value: str) -> str:
    normalized = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError as error:
        raise argparse.ArgumentTypeError("expected an ISO-8601 timestamp with timezone") from error
    if parsed.tzinfo is None:
        raise argparse.ArgumentTypeError("timestamp must include a timezone")
    return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def validate_run_directory(path: Path) -> Path:
    resolved = path.resolve()
    if resolved == ROOT:
        raise ValueError("run directory cannot be the repository root")
    if ROOT in resolved.parents:
        relative = resolved.relative_to(ROOT)
        if not relative.parts or relative.parts[0] != LOCAL_RUN_ROOT.name:
            raise ValueError(
                f"run directories inside the repository must be under {LOCAL_RUN_ROOT.relative_to(ROOT)}/"
            )
    if resolved.exists() and any(resolved.iterdir()):
        raise ValueError(f"run directory already exists and is not empty: {resolved}")
    return resolved


def safe_source_path(relative: str) -> Path:
    source = (ROOT / relative).resolve()
    if ROOT not in source.parents or not source.is_file():
        raise ValueError(f"required file is missing or outside the repository: {relative}")
    return source


def grade_template(case: dict[str, Any]) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "caseId": case["id"],
        "difficultyClass": case["difficultyClass"],
        "outcome": None,
        "requiredConceptCoverage": [
            {"concept": concept, "status": None, "reviewerNote": ""}
            for concept in case["requiredConcepts"]
        ],
        "provenanceDistinctionStatus": None,
        "provenanceDistinctions": [
            {"distinction": distinction, "status": None, "reviewerNote": ""}
            for distinction in case["provenanceRequirements"]["mustDistinguish"]
        ],
        "forbiddenClaimViolations": [
            {"claim": claim, "violated": None, "reviewerNote": ""}
            for claim in case["forbiddenClaims"]
        ],
        "expectedLimitationCoverage": [
            {"limitation": limitation, "status": None, "reviewerNote": ""}
            for limitation in case["expectedLimitations"]
        ],
        "liveVerificationBehavior": {"status": None, "reviewerNote": ""},
        "reviewerNotes": "",
        "answerArtifact": {"path": "answer.md", "sha256": None},
        "reviewerFindingsArtifact": {"path": "reviewer-findings.md"},
    }


def prepare_case(run_dir: Path, case: dict[str, Any]) -> dict[str, str]:
    case_id = case["id"]
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", case_id):
        raise ValueError(f"unsafe case id: {case_id!r}")

    bundle = run_dir / "answer-bundles" / case_id
    required_root = bundle / "required-files"
    reviewer = run_dir / "reviewers" / case_id
    required_root.mkdir(parents=True)
    reviewer.mkdir(parents=True)

    (bundle / "INSTRUCTIONS.md").write_text(GENERIC_ANSWER_INSTRUCTION, encoding="utf-8")
    (bundle / "QUESTION.md").write_text(f"# Question\n\n{case['question']}\n", encoding="utf-8")

    copied_hashes: dict[str, str] = {}
    for relative in case["requiredFiles"]:
        source = safe_source_path(relative)
        destination = required_root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        copied_hashes[relative] = sha256_bytes(destination.read_bytes())

    hidden_rubric = {
        "schemaVersion": 1,
        "caseId": case_id,
        "category": case["category"],
        "difficultyClass": case["difficultyClass"],
        **{field: case[field] for field in HIDDEN_RUBRIC_FIELDS},
    }
    write_json(reviewer / "hidden-rubric.json", hidden_rubric)
    write_json(reviewer / "grade.json", grade_template(case))
    (reviewer / "answer.md").write_text("", encoding="utf-8")
    (reviewer / "reviewer-findings.md").write_text("", encoding="utf-8")
    return copied_hashes


def load_benchmark(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    cases = data.get("cases")
    if not isinstance(cases, list) or len(cases) != EXPECTED_CASE_COUNT:
        raise ValueError(f"benchmark must contain exactly {EXPECTED_CASE_COUNT} cases")
    ids = [case.get("id") for case in cases if isinstance(case, dict)]
    if len(ids) != len(cases) or len(ids) != len(set(ids)):
        raise ValueError("benchmark case ids must be present and unique")
    return data


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Prepare 64 leakage-separated, required-files-only factual retrieval bundles."
    )
    parser.add_argument("--run-dir", required=True, type=Path, help="New/empty raw run directory.")
    parser.add_argument("--run-id", required=True, help="Stable identifier for this empirical run.")
    parser.add_argument("--run-date", required=True, type=parse_iso_date, help="Run date as YYYY-MM-DD.")
    parser.add_argument("--model", required=True, help="Intended model name/version.")
    parser.add_argument("--provider-client", required=True, help="Provider and client label.")
    parser.add_argument("--reasoning-level", required=True, help="Reasoning level or equivalent setting.")
    parser.add_argument(
        "--network-tool-policy",
        required=True,
        help="Network/tool policy applied to the answer model, normally 'none'.",
    )
    parser.add_argument("--benchmark", type=Path, default=DEFAULT_BENCHMARK)
    parser.add_argument(
        "--generated-at",
        type=parse_timestamp,
        help="Optional reproducible ISO-8601 generation timestamp; defaults to current UTC time.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    benchmark_path = args.benchmark.resolve()
    if benchmark_path != DEFAULT_BENCHMARK.resolve():
        raise SystemExit(f"ERROR: benchmark must be {DEFAULT_BENCHMARK.relative_to(ROOT)}")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", args.run_id):
        raise SystemExit("ERROR: --run-id must contain only letters, numbers, dots, underscores, or hyphens")
    try:
        run_dir = validate_run_directory(args.run_dir)
        benchmark = load_benchmark(benchmark_path)
        run_dir.mkdir(parents=True, exist_ok=True)
        benchmark_bytes = benchmark_path.read_bytes()
        benchmark_snapshot_path = run_dir / "benchmark-snapshot.json"
        benchmark_snapshot_path.write_bytes(benchmark_bytes)
        benchmark_hash = sha256_bytes(benchmark_bytes)
        required_file_hashes = {
            case["id"]: prepare_case(run_dir, case)
            for case in benchmark["cases"]
        }
    except (OSError, ValueError, json.JSONDecodeError) as error:
        raise SystemExit(f"ERROR: {error}") from error

    class_order = benchmark["enums"]["difficultyClasses"]
    class_counts = Counter(case["difficultyClass"] for case in benchmark["cases"])
    generated_at = args.generated_at or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    metadata = {
        "schemaVersion": 1,
        "status": "prepared-empirical-factual-retrieval-run",
        "runId": args.run_id,
        "runDate": args.run_date,
        "generatedAt": generated_at,
        "sourceKb": source_revision(),
        "benchmark": {
            "path": "benchmark-snapshot.json",
            "canonicalPath": "data/factual-retrieval-cases.json",
            "sha256": benchmark_hash,
            "canonicalSha256AtPreparation": benchmark_hash,
            "schemaVersion": benchmark.get("schemaVersion"),
        },
        "caseCount": len(benchmark["cases"]),
        "classCounts": {name: class_counts[name] for name in class_order},
        "model": {
            "name": args.model,
            "providerClient": args.provider_client,
            "reasoningLevel": args.reasoning_level,
        },
        "answerPrompt": {
            "version": PROMPT_VERSION,
            "sha256": sha256_bytes(GENERIC_ANSWER_INSTRUCTION.encode("utf-8")),
        },
        "isolationPolicy": {
            "name": "required-files-only-sufficiency-baseline",
            "answerModelRoot": "one answer-bundles/<case-id> directory at a time",
            "requiredFilesOnly": True,
            "optionalFilesIncluded": False,
            "hiddenReviewerMaterialSeparated": True,
        },
        "networkToolPolicy": args.network_tool_policy,
        "requiredFileHashes": required_file_hashes,
    }
    write_json(run_dir / "run-metadata.json", metadata)
    print(
        f"Prepared {len(benchmark['cases'])} required-files-only answer bundles and "
        f"{len(benchmark['cases'])} separate reviewer areas at {run_dir}; "
        "pinned benchmark snapshot at benchmark-snapshot.json"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
