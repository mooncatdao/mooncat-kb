#!/usr/bin/env python3
"""Validate bounded MoonCat materialization-parity fixtures and generated results."""

import importlib.util
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASES = ROOT / "data/materialization-parity-cases.json"
RESULTS = ROOT / "data/materialization-parity-results.json"
SOURCES = ROOT / "data/sources.json"
CAT_ID = re.compile(r"^0x[0-9a-f]{10}$")
SHA256 = re.compile(r"^[0-9a-f]{64}$")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    cases = json.loads(CASES.read_text())
    results = json.loads(RESULTS.read_text())
    source_ids = {item["id"] for item in json.loads(SOURCES.read_text())["sources"]}
    if cases.get("version") != 1 or results.get("version") != 1:
        fail("fixture and result versions must be 1")
    if not set(cases.get("sourceRefs", [])) <= source_ids or not set(results.get("sourceRefs", [])) <= source_ids:
        fail("fixture or result sourceRefs are unresolved")
    fixture_by_key = {item["key"]: item for item in cases["fixtures"]}
    result_by_key = {item["key"]: item for item in results.get("results", [])}
    if not 8 <= len(fixture_by_key) <= 16 or set(fixture_by_key) != set(result_by_key):
        fail("fixture/result set must match and contain 8 through 16 cases")
    coverage = set()
    intentional_differences = 0
    for key, fixture in fixture_by_key.items():
        row = result_by_key[key]
        if not CAT_ID.fullmatch(fixture["catIdBytes5"]) or row["catIdBytes5"] != fixture["catIdBytes5"] or row["rescueOrder"] != fixture["rescueOrder"]:
            fail(f"identity mismatch for {key}")
        if not set(fixture.get("sourceRefs", [])) <= source_ids or not set(row.get("sourceRefs", [])) <= source_ids:
            fail(f"unresolved sourceRefs for {key}")
        coverage.update(fixture["coverage"])
        parity = row["parity"]
        for level, definition in cases["parityLevels"].items():
            if level not in parity or parity[level]["status"] not in definition["statusValues"]:
                fail(f"invalid {level} status for {key}")
        if parity["identifier"]["status"] != "passed" or parity["sourceTrait"]["status"] != fixture["expectedSourceTraitStatus"]:
            fail(f"unexpected executable parity status for {key}")
        if parity["structuralRender"]["status"] != "passed":
            fail(f"structural render did not pass for {key}")
        normalization = parity["structuralRender"].get("normalization", {})
        if normalization.get("rowCount", 0) <= 0 or normalization.get("occupiedCellCount", 0) <= 0 or not normalization.get("widths") or normalization.get("distinctColorCount", 0) <= 0:
            fail(f"empty structural normalization for {key}")
        if not SHA256.fullmatch(normalization.get("occupiedCoordinateSha256", "")) or not SHA256.fullmatch(normalization.get("colorPartitionSha256", "")):
            fail(f"invalid structural fingerprint for {key}")
        if parity["colorPalette"]["status"] != "not-executable-evidence-insufficient" or parity["exactSerialization"]["status"] != "not-executable" or parity["documentedMaterialization"]["status"] != "documented-only" or parity["accessoryComposition"]["status"] != "deferred-insufficient-deterministic-inputs":
            fail(f"unavailable materialization layer is not explicit for {key}")
        intentional_differences += len(parity["sourceTrait"].get("differences", []))
    required_coverage = {"first-rescue", "last-rescue", "genesis", "black", "white", "pale", "non-pale", "left-facing", "right-facing", "pouncing", "stalking", "standing", "sleeping", "skyblue-skyBlue-mismatch", "hue-sentinel-mismatch"}
    if not required_coverage <= coverage:
        fail(f"fixture coverage is incomplete: {sorted(required_coverage - coverage)}")
    summary = results["summary"]
    if summary["fixtureCount"] != len(result_by_key) or summary["intentionalDifferenceCount"] != intentional_differences:
        fail("result summary counts are inconsistent")
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("materialization_generator", ROOT / "scripts/generate-materialization-parity.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    rendered = json.dumps(module.generate(), indent=2, ensure_ascii=False) + "\n"
    if RESULTS.read_text() != rendered:
        fail("generated result is not deterministic/current")
    print(f"OK: {len(result_by_key)} fixtures, {summary['structuralRenderPassed']} structural normalizations, {intentional_differences} intentional trait differences, and explicit unavailable layers")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
