#!/usr/bin/env python3
"""Summarize a validated empirical factual-retrieval baseline run."""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUTCOME_ORDER = ("pass", "partial", "fail", "correct-stop")


def load_validator() -> Any:
    path = ROOT / "scripts/validate-factual-retrieval-baseline.py"
    spec = importlib.util.spec_from_file_location("factual_baseline_validator", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def count_summary(outcomes: list[str]) -> dict[str, Any]:
    counts = Counter(outcomes)
    total = len(outcomes)
    return {
        "total": total,
        "outcomes": {
            outcome: {
                "count": counts[outcome],
                "percentage": round((counts[outcome] / total) * 100, 2) if total else 0.0,
            }
            for outcome in OUTCOME_ORDER
        },
    }


def concise_note(value: str, limit: int = 180) -> str:
    normalized = " ".join(value.split())
    if len(normalized) <= limit:
        return normalized
    return normalized[: limit - 1].rstrip() + "…"


def markdown_cell(value: Any) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


def build_result(validated: dict[str, Any], generated_at: str) -> dict[str, Any]:
    benchmark = validated["benchmark"]
    metadata = validated["metadata"]
    grades_by_id = {grade["caseId"]: grade for grade in validated["grades"]}
    cases = benchmark["cases"]
    class_order = benchmark["enums"]["difficultyClasses"]
    case_results = [
        {
            "id": case["id"],
            "difficultyClass": case["difficultyClass"],
            "outcome": grades_by_id[case["id"]]["outcome"],
            "reviewerNote": concise_note(grades_by_id[case["id"]]["reviewerNotes"]),
        }
        for case in cases
    ]
    return {
        "schemaVersion": 1,
        "status": "empirical-model-specific-factual-retrieval-result",
        "generatedAt": generated_at,
        "statement": (
            "This is an empirical result for the recorded model, configuration, source commit, "
            "and required-files-only isolation policy; it is not a deterministic KB integrity score."
        ),
        "runMetadata": metadata,
        "totals": count_summary([item["outcome"] for item in case_results]),
        "byDifficultyClass": {
            class_name: count_summary(
                [item["outcome"] for item in case_results if item["difficultyClass"] == class_name]
            )
            for class_name in class_order
        },
        "cases": case_results,
    }


def render_markdown(result: dict[str, Any]) -> str:
    metadata = result["runMetadata"]
    model = metadata["model"]
    source = metadata["sourceKb"]
    commit = source["gitCommit"] or "unavailable"
    lines = [
        f"# Factual retrieval empirical baseline: {metadata['runId']}",
        "",
        "> This is an empirical, model/version-specific result under the recorded configuration and",
        "> required-files-only isolation policy. It is not a deterministic KB integrity score.",
        "",
        "## Run metadata",
        "",
        "| Field | Value |",
        "| --- | --- |",
        f"| Run date | {markdown_cell(metadata['runDate'])} |",
        f"| Model | {markdown_cell(model['name'])} |",
        f"| Provider/client | {markdown_cell(model['providerClient'])} |",
        f"| Reasoning level | {markdown_cell(model['reasoningLevel'])} |",
        f"| Source KB commit | `{markdown_cell(commit)}` |",
        f"| Source worktree dirty at preparation | {str(source['gitWorktreeDirty']).lower()} |",
        f"| Benchmark input | `{markdown_cell(metadata['benchmark']['path'])}` |",
        f"| Benchmark SHA-256 | `{metadata['benchmark']['sha256']}` |",
        f"| Answer prompt version | {markdown_cell(metadata['answerPrompt']['version'])} |",
        f"| Isolation | {markdown_cell(metadata['isolationPolicy']['name'])} |",
        f"| Optional files included | {str(metadata['isolationPolicy']['optionalFilesIncluded']).lower()} |",
        f"| Network/tool policy | {markdown_cell(metadata['networkToolPolicy'])} |",
        "",
        "## Totals",
        "",
        "| Outcome | Count | Percentage |",
        "| --- | ---: | ---: |",
    ]
    for outcome in OUTCOME_ORDER:
        value = result["totals"]["outcomes"][outcome]
        lines.append(f"| {outcome} | {value['count']} | {value['percentage']:.2f}% |")
    lines.extend(
        [
            "",
            "## Breakdown by difficulty class",
            "",
            "| Difficulty class | Pass | Partial | Fail | Correct stop | Total |",
            "| --- | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for class_name, value in result["byDifficultyClass"].items():
        outcomes = value["outcomes"]
        lines.append(
            f"| {class_name} | {outcomes['pass']['count']} | {outcomes['partial']['count']} | "
            f"{outcomes['fail']['count']} | {outcomes['correct-stop']['count']} | {value['total']} |"
        )
    lines.extend(
        [
            "",
            "## Cases",
            "",
            "| Case | Difficulty class | Outcome | Reviewer note |",
            "| --- | --- | --- | --- |",
        ]
    )
    for case in result["cases"]:
        lines.append(
            f"| `{markdown_cell(case['id'])}` | {markdown_cell(case['difficultyClass'])} | "
            f"{markdown_cell(case['outcome'])} | {markdown_cell(case['reviewerNote'])} |"
        )
    lines.extend(
        [
            "",
            "The validator checked artifacts, identities, hashes, enums, and mechanically knowable grade",
            "consistency. Human reviewers supplied the semantic judgments recorded in the grades.",
            "",
        ]
    )
    return "\n".join(lines)


def parse_timestamp(value: str) -> str:
    normalized = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError as error:
        raise argparse.ArgumentTypeError("expected an ISO-8601 timestamp with timezone") from error
    if parsed.tzinfo is None:
        raise argparse.ArgumentTypeError("timestamp must include a timezone")
    return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def write_output(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        raise ValueError(f"output already exists (use --force to replace): {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate completed reviewer grades and emit model-specific JSON and Markdown summaries."
    )
    parser.add_argument("--run-dir", required=True, type=Path)
    parser.add_argument("--output-json", type=Path, help="Defaults to <run-dir>/summary/result.json.")
    parser.add_argument("--output-markdown", type=Path, help="Defaults to <run-dir>/summary/report.md.")
    parser.add_argument("--generated-at", type=parse_timestamp, help="Optional reproducible report timestamp.")
    parser.add_argument("--force", action="store_true", help="Replace existing summary outputs.")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    validator = load_validator()
    try:
        validated = validator.validate_run(args.run_dir)
        generated_at = args.generated_at or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        result = build_result(validated, generated_at)
        output_json = (args.output_json or args.run_dir / "summary/result.json").resolve()
        output_markdown = (args.output_markdown or args.run_dir / "summary/report.md").resolve()
        if output_json == output_markdown:
            raise ValueError("JSON and Markdown outputs must use different paths")
        write_output(output_json, json.dumps(result, indent=2, ensure_ascii=False) + "\n", args.force)
        write_output(output_markdown, render_markdown(result), args.force)
    except (OSError, RuntimeError, ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print(f"Wrote validated empirical baseline summaries: {output_json} and {output_markdown}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
