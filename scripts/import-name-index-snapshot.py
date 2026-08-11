#!/usr/bin/env python3
"""Import minimal finalized CC0 name-index inputs from a local checkout only."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import tempfile
from pathlib import Path

from mooncat_population_lib import (
    NAME_CURRENT_PATH,
    NAME_METADATA_PATH,
    NAME_SNAPSHOT_DIR,
    NAME_SNAPSHOT_PATH,
    PopulationError,
    file_digest,
    json_bytes,
    read_json,
    validate_current_names,
)


def git_value(source: Path, *args: str) -> str:
    try:
        return subprocess.run(
            ["git", "-C", str(source), *args], check=True, capture_output=True, text=True
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError) as exc:
        raise PopulationError(f"cannot resolve source git metadata: {exc}") from exc


def atomic_write(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=f".{path.name}.", delete=False) as handle:
        handle.write(content)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Path to a local mooncatdao/name-index checkout; no network access is used.")
    parser.add_argument("--check", action="store_true", help="Validate and compare the candidate snapshot without replacing local files.")
    args = parser.parse_args()
    source = args.source.resolve()
    package_path = source / "package.json"
    current_path = source / "data/current-names.json"
    metadata_path = source / "data/metadata.json"
    for path in (package_path, current_path, metadata_path):
        if not path.is_file():
            raise PopulationError(f"required local source file is missing: {path}")
    package = read_json(package_path)
    if package.get("name") != "@mooncatdao/name-index" or package.get("license") != "CC0-1.0":
        raise PopulationError("source package identity/license must be @mooncatdao/name-index / CC0-1.0")
    records = read_json(current_path)
    metadata = read_json(metadata_path)
    validate_current_names(records, metadata)
    revision = git_value(source, "rev-parse", "HEAD")
    commit_timestamp = git_value(source, "show", "-s", "--format=%cI", "HEAD")

    if NAME_CURRENT_PATH.is_file() and NAME_METADATA_PATH.is_file():
        old = validate_current_names(read_json(NAME_CURRENT_PATH), read_json(NAME_METADATA_PATH))
        old_by_id = {record["catId"]: record for record in old}
        for record in records:
            previous = old_by_id.get(record["catId"])
            if previous and previous["nameRaw"] != record["nameRaw"]:
                raise PopulationError(
                    f"fatal finalized-name invariant violation for {record['catId']}: "
                    f"{previous['nameRaw']} -> {record['nameRaw']}"
                )
        new_ids = {record["catId"] for record in records}
        removed = sorted(set(old_by_id) - new_ids)
        if removed:
            raise PopulationError(f"fatal finalized-name removal detected: {removed[:10]}")

    current_content = current_path.read_bytes()
    metadata_content = metadata_path.read_bytes()
    inventory = []
    for name, content, source_path in (
        ("current-names.json", current_content, "data/current-names.json"),
        ("metadata.json", metadata_content, "data/metadata.json"),
    ):
        import hashlib
        inventory.append({"path": name, "sourcePath": source_path, "sha256": hashlib.sha256(content).hexdigest(), "bytes": len(content)})
    snapshot = {
        "schemaVersion": 1,
        "status": "pinned-finalized-name-index-inputs",
        "sourceRepository": "https://github.com/mooncatdao/name-index",
        "sourceRevision": revision,
        "sourceCommitTimestamp": commit_timestamp,
        "license": "CC0-1.0",
        "sourceCheckout": "local-explicit-import; path intentionally not retained",
        "importCommand": "python scripts/import-name-index-snapshot.py --source /path/to/name-index",
        "networkDependency": "none",
        "finalizedOnly": True,
        "inventory": inventory,
        "exclusions": ["data/events.jsonl", "data/pending-events.json", "*-live.json", "webhook state", "reports", "provisional data"],
        "metadataObservation": metadata,
        "limitations": ["Pinned finalized snapshot only; it does not claim freshness beyond sourceRevision or live chain state."],
    }
    candidate = {
        NAME_CURRENT_PATH: current_content,
        NAME_METADATA_PATH: metadata_content,
        NAME_SNAPSHOT_PATH: json_bytes(snapshot),
    }
    if args.check:
        changed = [str(path.relative_to(NAME_SNAPSHOT_DIR.parent.parent.parent)) for path, content in candidate.items() if not path.is_file() or path.read_bytes() != content]
        print(json.dumps({"sourceRevision": revision, "namedCatCount": len(records), "changedFiles": changed}, indent=2))
        return 1 if changed else 0
    for path, content in candidate.items():
        atomic_write(path, content)
    digest, _ = file_digest(NAME_SNAPSHOT_PATH)
    print(f"Imported {len(records)} finalized current names at {revision}; SNAPSHOT sha256={digest}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PopulationError as exc:
        print(f"ERROR: {exc}")
        raise SystemExit(1)
