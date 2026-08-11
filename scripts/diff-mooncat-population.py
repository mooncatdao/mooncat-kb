#!/usr/bin/env python3
"""Summarize candidate population changes and reject finalized-name mutations."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from mooncat_population_lib import (
    POPULATION_DIR,
    PopulationError,
    build_population_artifacts,
    compare_rows,
    load_committed_population,
)


def rows_from_artifacts(artifacts: dict[str, bytes]) -> list[dict]:
    manifest = json.loads(artifacts["manifest.json"])
    rows: list[dict] = []
    for shard in manifest["layout"]["shards"]:
        relative = "shards/" + Path(shard["path"]).name
        rows.extend(json.loads(artifacts[relative])["rows"])
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidate-dir", type=Path, help="Compare a prepared population directory instead of rebuilding from repo-local inputs.")
    parser.add_argument("--check", action="store_true", help="Fail if any routine candidate changes are present.")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    args = parser.parse_args()
    old_manifest, old_rows = load_committed_population()
    if args.candidate_dir:
        new_manifest, new_rows = load_committed_population(args.candidate_dir.resolve())
    else:
        artifacts = build_population_artifacts()
        new_manifest = json.loads(artifacts["manifest.json"])
        new_rows = rows_from_artifacts(artifacts)
    summary = compare_rows(old_rows, new_rows)
    old_sources = {item["path"]: item["sha256"] for item in old_manifest.get("sourceFiles", [])}
    new_sources = {item["path"]: item["sha256"] for item in new_manifest.get("sourceFiles", [])}
    summary["changedInputPaths"] = sorted(path for path in set(old_sources) | set(new_sources) if old_sources.get(path) != new_sources.get(path))
    old_report = json.loads((POPULATION_DIR / "validation-report.json").read_text())
    if args.candidate_dir:
        new_report = json.loads((args.candidate_dir / "validation-report.json").read_text())
    else:
        new_report = json.loads(artifacts["validation-report.json"])
    summary["mismatchCountChange"] = {
        "old": old_report["javascriptChecks"]["mismatchCount"],
        "new": new_report["javascriptChecks"]["mismatchCount"],
    }
    if args.json:
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    else:
        print(f"Changed rows: {summary['changedRowCount']}")
        print(f"Newly named: {summary['newlyNamedCount']}")
        print(f"Changes by field group: {summary['changesByFieldGroup']}")
        print(f"Changed inputs: {summary['changedInputPaths']}")
        print(f"Mismatch count: {summary['mismatchCountChange']['old']} -> {summary['mismatchCountChange']['new']}")
    if summary["immutableNameMutationCount"]:
        raise PopulationError(
            "fatal finalized-name invariant violation: "
            + json.dumps(summary["immutableNameMutations"][:10], ensure_ascii=False)
        )
    if args.check and (summary["changedRowCount"] or summary["changedInputPaths"] or summary["mismatchCountChange"]["old"] != summary["mismatchCountChange"]["new"]):
        return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PopulationError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
