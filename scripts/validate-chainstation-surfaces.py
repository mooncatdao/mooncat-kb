#!/usr/bin/env python3
"""Validate the compact, pinned ChainStation implementation-surface audit offline."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data/chainstation-surfaces.json"
SNAPSHOT_PATH = ROOT / "references/upstream/chainstation-web-audit/SNAPSHOT.json"
EVIDENCE_DIR = ROOT / "references/upstream/chainstation-web-audit/evidence"
SOURCES_PATH = ROOT / "data/sources.json"
ADR_PATH = ROOT / "data/architecture-decisions.json"
SHA256 = re.compile(r"^[0-9a-f]{64}$")
COMMIT = re.compile(r"^[0-9a-f]{40}$")
UNSUPPORTED_LIVE_CLAIMS = (
    "is currently deployed",
    "is current production",
    "provides a live api",
    "proves live chain state",
    "proves production deployment",
)


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def digest(path: Path) -> tuple[str, int, int]:
    hasher = hashlib.sha256()
    size = 0
    lines = 0
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            size += len(block)
            lines += block.count(b"\n")
            hasher.update(block)
    return hasher.hexdigest(), size, lines


def required_string(value: object, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        fail(f"{label} must be a non-empty string")
    return value


def required_strings(value: object, label: str) -> list[str]:
    if not isinstance(value, list) or not value or not all(isinstance(item, str) and item.strip() for item in value):
        fail(f"{label} must be a non-empty array of strings")
    return value


def main() -> int:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    snapshot = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
    source_ids = {item["id"] for item in json.loads(SOURCES_PATH.read_text(encoding="utf-8"))["sources"]}
    adr_ids = {item["id"] for item in json.loads(ADR_PATH.read_text(encoding="utf-8"))["decisions"]}

    if data.get("sourceRef") not in source_ids:
        fail("data sourceRef must resolve through data/sources.json")
    metadata = data.get("snapshot")
    if not isinstance(metadata, dict):
        fail("data snapshot metadata is required")
    for key in ("metadataPath", "repository", "branch", "resolvedCommit"):
        required_string(metadata.get(key), f"data snapshot {key}")
    if ROOT / metadata["metadataPath"] != SNAPSHOT_PATH:
        fail("data snapshot metadataPath must identify the ChainStation snapshot")
    if metadata["repository"] != snapshot.get("repository") or metadata["branch"] != snapshot.get("defaultBranch"):
        fail("data snapshot repository/branch must match SNAPSHOT.json")
    if metadata["resolvedCommit"] != snapshot.get("resolvedCommit") or not COMMIT.fullmatch(metadata["resolvedCommit"]):
        fail("data snapshot resolvedCommit must match a full commit in SNAPSHOT.json")

    for key in ("repository", "project", "defaultBranch", "defaultBranchEvidence", "commitEvidence", "retrievalDate"):
        required_string(snapshot.get(key), f"SNAPSHOT.json {key}")
    if not COMMIT.fullmatch(snapshot.get("resolvedCommit", "")):
        fail("SNAPSHOT.json resolvedCommit must be a full lowercase commit SHA")
    if not isinstance(snapshot.get("retrievalMethod"), list) or len(snapshot["retrievalMethod"]) < 2:
        fail("SNAPSHOT.json retrievalMethod must retain the resolution and clone commands")
    license_data = snapshot.get("license")
    if not isinstance(license_data, dict) or not all(required_string(license_data.get(key), f"SNAPSHOT.json license {key}") for key in ("status", "value", "evidence")):
        fail("SNAPSHOT.json license evidence is required")

    inventory = snapshot.get("inventory")
    if not isinstance(inventory, list) or not inventory:
        fail("SNAPSHOT.json inventory must be a non-empty array")
    inventory_paths: set[str] = set()
    for index, item in enumerate(inventory):
        if not isinstance(item, dict):
            fail(f"inventory[{index}] must be an object")
        path = required_string(item.get("path"), f"inventory[{index}].path")
        if path in inventory_paths or path.startswith("/") or ".." in Path(path).parts:
            fail(f"inventory[{index}] has an invalid or duplicate path")
        inventory_paths.add(path)
        if required_string(item.get("sourcePath"), f"inventory[{index}].sourcePath") != path:
            fail(f"inventory[{index}] sourcePath must match exact copied path")
        if not SHA256.fullmatch(required_string(item.get("sha256"), f"inventory[{index}].sha256")):
            fail(f"inventory[{index}] has invalid sha256")
        if item.get("copyStatus") != "exact-copy":
            fail(f"inventory[{index}] must be an exact-copy")
        if not isinstance(item.get("bytes"), int) or item["bytes"] <= 0:
            fail(f"inventory[{index}] bytes must be positive")
        if not isinstance(item.get("lineStart"), int) or item["lineStart"] != 1 or not isinstance(item.get("lineEnd"), int) or item["lineEnd"] < 1:
            fail(f"inventory[{index}] must have a whole-file 1..lineEnd range")
        local = EVIDENCE_DIR / path
        if not local.is_file():
            fail(f"inventory[{index}] missing evidence file {path}")
        actual_hash, actual_bytes, actual_lines = digest(local)
        if actual_hash != item["sha256"] or actual_bytes != item["bytes"] or actual_lines != item["lineEnd"]:
            fail(f"inventory[{index}] evidence hash, byte size, or line range drift at {path}")
    actual_paths = {path.relative_to(EVIDENCE_DIR).as_posix() for path in EVIDENCE_DIR.rglob("*") if path.is_file()}
    if actual_paths != inventory_paths:
        fail("SNAPSHOT.json inventory must cover exactly all ChainStation evidence files")

    enums = data.get("enums")
    if not isinstance(enums, dict):
        fail("data enums object is required")
    categories = set(required_strings(enums.get("categories"), "enums.categories"))
    data_statuses = set(required_strings(enums.get("dataStatuses"), "enums.dataStatuses"))
    execution_roles = set(required_strings(enums.get("executionRoles"), "enums.executionRoles"))
    confidences = set(required_strings(enums.get("confidences"), "enums.confidences"))
    surfaces = data.get("surfaces")
    if not isinstance(surfaces, list) or not surfaces:
        fail("surfaces must be a non-empty array")
    seen_ids: set[str] = set()
    for index, surface in enumerate(surfaces):
        if not isinstance(surface, dict):
            fail(f"surfaces[{index}] must be an object")
        surface_id = required_string(surface.get("id"), f"surfaces[{index}].id")
        if surface_id in seen_ids:
            fail(f"duplicate surface id {surface_id}")
        seen_ids.add(surface_id)
        for key in ("purpose", "implementationStatus"):
            required_string(surface.get(key), f"{surface_id}.{key}")
        for key in ("evidenceSnapshotPaths", "symbolsRoutesOrConfigKeys", "inputs", "outputs", "dependencies", "relatedContractsApisOrDataFiles", "relatedKbFiles", "limitations"):
            required_strings(surface.get(key), f"{surface_id}.{key}")
        if surface.get("category") not in categories:
            fail(f"{surface_id} has unsupported category")
        if surface.get("dataStatus") not in data_statuses or surface.get("executionRole") not in execution_roles or surface.get("confidence") not in confidences:
            fail(f"{surface_id} has unsupported enum value")
        if not set(surface["evidenceSnapshotPaths"]) <= inventory_paths:
            fail(f"{surface_id} references unknown snapshot evidence")
        related_adrs = surface.get("relatedAdrs")
        if not isinstance(related_adrs, list) or not all(isinstance(item, str) for item in related_adrs) or not set(related_adrs) <= adr_ids:
            fail(f"{surface_id} has unknown related ADR")
        for path in surface["relatedKbFiles"]:
            if not (ROOT / path).is_file():
                fail(f"{surface_id} references missing related KB file {path}")
        wording = surface["implementationStatus"].lower()
        if "pinned commit" not in wording or "not establish" not in wording:
            fail(f"{surface_id} implementationStatus must identify the pinned-source boundary")
        if any(claim in wording for claim in UNSUPPORTED_LIVE_CLAIMS):
            fail(f"{surface_id} contains unsupported live/deployment wording")
    print(f"OK: {len(surfaces)} ChainStation surfaces and {len(inventory)} exact evidence files validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
