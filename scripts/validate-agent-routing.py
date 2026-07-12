#!/usr/bin/env python3
"""Validate coding-agent routing benchmark and generated context packs without network access."""

import importlib.util
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASES = ROOT / "data/agent-query-cases.json"
PACKS = ROOT / "data/agent-context-packs.json"
AGENT_INDEX = ROOT / "data/agent-index.json"
SOURCES = ROOT / "data/sources.json"
PROTECTED = {
    "wmcr-tokenid-vs-rescueorder",
    "derived-color-label-vs-palette-rgb",
    "contract-capability-vs-current-state",
    "accessory-ownership-vs-wear-state",
    "parser-determinism-vs-cross-render-parity",
    "rescue-mining-vs-current-availability-ownership"
}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def command_path(command: str) -> str | None:
    parts = command.split()
    if len(parts) >= 2 and parts[0] == "python" and parts[1].startswith("scripts/"):
        return parts[1]
    return None


def main() -> int:
    cases_data = json.loads(CASES.read_text())
    packs_data = json.loads(PACKS.read_text())
    routes = {item["key"]: item for item in json.loads(AGENT_INDEX.read_text())["tasks"]}
    source_ids = {item["id"] for item in json.loads(SOURCES.read_text())["sources"]}
    cases = cases_data.get("cases", [])
    packs = {item["caseId"]: item for item in packs_data.get("packs", [])}
    if not 12 <= len(cases) <= 20 or len(packs) != len(cases):
        fail("benchmark must contain 12 through 20 cases with one pack each")
    if not set(cases_data.get("sourceRefs", [])) <= source_ids or not set(packs_data.get("sourceRefs", [])) <= source_ids:
        fail("benchmark or context-pack sourceRefs are unresolved")
    seen_ids, categories, boundaries = set(), set(), set()
    for case in cases:
        case_id = case.get("id")
        if not case_id or case_id in seen_ids or case_id not in packs:
            fail("case IDs must be unique and have generated packs")
        seen_ids.add(case_id)
        categories.add(case.get("category"))
        if case.get("protectedBoundary"):
            boundaries.add(case["protectedBoundary"])
        route = routes.get(case.get("route"))
        if not route:
            fail(f"{case_id} references missing route")
        for key in ["requiredFiles", "requiredFacts", "requiredWarnings", "forbiddenClaims", "stopConditions", "validationCommands", "terminology"]:
            if not case.get(key):
                fail(f"{case_id} lacks {key}")
        for path in case["requiredFiles"] + case.get("optionalFiles", []):
            if not (ROOT / path).is_file():
                fail(f"{case_id} references missing file {path}")
        for command in case["validationCommands"]:
            script = command_path(command)
            if script and not (ROOT / script).is_file():
                fail(f"{case_id} references missing validation script {script}")
        pack = packs[case_id]
        primary = route.get("primaryFiles", [])
        if pack["primaryFiles"] != primary or pack["filesToLoad"][:len(primary)] != primary:
            fail(f"{case_id} does not load route primary files first")
        if not set(case["requiredFiles"]) <= set(pack["filesToLoad"]):
            fail(f"{case_id} omitted required context files")
        allowed = set(primary) | set(case["requiredFiles"]) | set(case.get("optionalFiles", []))
        if not set(pack["filesToLoad"]) <= allowed:
            fail(f"{case_id} includes unexplained context expansion")
        metrics = pack["sizeMetrics"]
        if metrics["fileCount"] != len(pack["filesToLoad"]) or metrics["estimatedByteCount"] != sum(item["bytes"] for item in metrics["files"]):
            fail(f"{case_id} has invalid size metrics")
        if metrics["fileCount"] > metrics["softFileLimit"] or metrics["estimatedByteCount"] > metrics["softEstimatedByteLimit"]:
            fail(f"{case_id} exceeds documented soft context limits")
        if any(path.startswith("references/") for path in pack["filesToLoad"]):
            fail(f"{case_id} context pack loads a reference snapshot directly")
    required_categories = {"local-rendering", "api-use", "identifiers", "acclimated-boundary", "wmcr-boundary", "traits", "color-labels", "rescue-mining", "materialization", "accessories", "contracts", "provenance", "agent-workflow"}
    if not required_categories <= categories or not PROTECTED <= boundaries:
        fail("benchmark lacks required domain or dangerous-conflation coverage")
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("agent_context_generator", ROOT / "scripts/generate-agent-context-packs.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    rendered = json.dumps(module.generate(), indent=2, ensure_ascii=False) + "\n"
    if PACKS.read_text() != rendered:
        fail("generated context packs are not deterministic/current")
    print(f"OK: {len(cases)} query cases, {len(categories)} categories, {len(boundaries)} protected boundaries, and minimal deterministic packs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
