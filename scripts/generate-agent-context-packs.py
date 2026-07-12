#!/usr/bin/env python3
"""Generate minimal, deterministic coding-agent context packs without network access."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASES = ROOT / "data/agent-query-cases.json"
PACKS = ROOT / "data/agent-context-packs.json"
AGENT_INDEX = ROOT / "data/agent-index.json"
RECIPES = ROOT / "data/task-recipes.json"
SOURCES = ROOT / "data/sources.json"
ROUTE_RECIPES = {
    "call-api-endpoints": "use-api-examples",
    "look-up-contracts": "choose-contract-surface",
    "review-upstream-snapshot-provenance": "review-upstream-snapshots",
    "review-mooncat-accessory-lifecycle": "trace-mooncat-accessory-lifecycle"
}


def file_metric(path: str) -> dict:
    local = ROOT / path
    return {"path": path, "bytes": local.stat().st_size}


def generate() -> dict:
    cases = json.loads(CASES.read_text())
    routes = {item["key"]: item for item in json.loads(AGENT_INDEX.read_text())["tasks"]}
    recipes = {item["key"]: item for item in json.loads(RECIPES.read_text())["recipes"]}
    sources = {item["id"]: item for item in json.loads(SOURCES.read_text())["sources"]}
    packs = []
    for case in cases["cases"]:
        route = routes[case["route"]]
        recipe_key = case["route"] if case["route"] in recipes else ROUTE_RECIPES.get(case["route"])
        recipe = recipes.get(recipe_key, {})
        primary = route.get("primaryFiles", [])
        extras = [path for path in case["requiredFiles"] if path not in primary]
        optional = [path for path in case.get("optionalFiles", []) if path not in primary and path not in extras and (ROOT / path) != PACKS]
        files = primary + extras + optional
        metrics = [file_metric(path) for path in files]
        source_guidance = [{"id": source_id, "label": sources[source_id]["label"], "status": sources[source_id].get("status")} for source_id in case.get("sourceRefs", cases["sourceRefs"]) if source_id in sources]
        packs.append({
            "caseId": case["id"],
            "category": case["category"],
            "taskSummary": case["query"],
            "route": case["route"],
            "recipe": recipe_key,
            "primaryFiles": primary,
            "additionalRequiredFiles": extras,
            "explicitOptionalFiles": optional,
            "filesToLoad": files,
            "terminology": case["terminology"],
            "requiredFacts": case["requiredFacts"],
            "implementationGuardrails": recipe.get("guardrails", []) + case["requiredWarnings"],
            "forbiddenClaims": case["forbiddenClaims"],
            "knownLimitations": case["requiredWarnings"],
            "stopConditions": case["stopConditions"],
            "validationCommands": case["validationCommands"],
            "sourceGuidance": source_guidance,
            "sizeMetrics": {"fileCount": len(files), "estimatedByteCount": sum(item["bytes"] for item in metrics), "files": metrics, "softFileLimit": cases["sizePolicy"]["softFileLimit"], "softEstimatedByteLimit": cases["sizePolicy"]["softEstimatedByteLimit"], "rationale": case["contextIntent"]}
        })
    return {
        "version": 1,
        "updated": "2026-07-12",
        "status": "generated-minimal-agent-context-packs",
        "scope": "Task-specific references, guardrails, limits, and commands generated from routing and benchmark contracts. No source contents, snapshots, model calls, token counts, or live state are included.",
        "sourceRefs": cases["sourceRefs"],
        "generation": {"script": "scripts/generate-agent-context-packs.py", "command": "python scripts/generate-agent-context-packs.py", "networkDependency": "none", "caseCount": len(packs), "sizePolicy": cases["sizePolicy"]},
        "packs": packs
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if the generated context packs are stale")
    args = parser.parse_args()
    rendered = json.dumps(generate(), indent=2, ensure_ascii=False) + "\n"
    if args.check:
        if not PACKS.exists() or PACKS.read_text() != rendered:
            print(f"out of date: {PACKS.relative_to(ROOT)}", file=sys.stderr)
            return 1
        print(f"OK: {PACKS.relative_to(ROOT)} is deterministic and current")
        return 0
    PACKS.write_text(rendered)
    print(f"wrote {PACKS.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
