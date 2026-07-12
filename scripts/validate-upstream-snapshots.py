#!/usr/bin/env python3
"""Validate local snapshot hashes and provenance manifest without network access."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/upstream-snapshot-manifest.json"
SOURCES = ROOT / "data/sources.json"
SHA256 = re.compile(r"^[0-9a-f]{64}$")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def digest(path: Path) -> tuple[str, int]:
    h = hashlib.sha256()
    size = 0
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            size += len(block)
            h.update(block)
    return h.hexdigest(), size


def main() -> int:
    manifest = json.loads(MANIFEST.read_text())
    source_ids = {item["id"] for item in json.loads(SOURCES.read_text())["sources"]}
    enums = manifest.get("enums", {})
    entries = manifest.get("entries")
    if not isinstance(entries, list) or not entries:
        fail("entries must be a non-empty array")
    keys = [entry.get("key") for entry in entries]
    if any(not key for key in keys) or len(keys) != len(set(keys)):
        fail("entry keys must be unique and non-empty")
    for entry in entries:
        key = entry["key"]
        local_path = entry.get("localPath")
        if not isinstance(local_path, str) or not local_path:
            fail(f"{key}: localPath is required")
        path = ROOT / local_path
        if not path.is_file():
            fail(f"{key}: missing localPath {local_path}")
        expected = entry.get("localSha256")
        if not isinstance(expected, str) or not SHA256.fullmatch(expected):
            fail(f"{key}: invalid localSha256")
        actual, size = digest(path)
        if actual != expected:
            fail(f"{key}: SHA-256 drift (manifest {expected}, local {actual})")
        if entry.get("localBytes") != size:
            fail(f"{key}: localBytes does not match local file")
        if entry.get("contentRole") not in enums.get("contentRoles", []):
            fail(f"{key}: unsupported contentRole")
        if entry.get("copyStatus") not in enums.get("copyStatuses", []):
            fail(f"{key}: unsupported copyStatus")
        if entry.get("provenanceConfidence") not in enums.get("provenanceConfidence", []):
            fail(f"{key}: unsupported provenanceConfidence")
        if entry.get("freshnessStatus") not in enums.get("freshnessStatuses", []):
            fail(f"{key}: unsupported freshnessStatus")
        refs = entry.get("sourceRefs")
        if not isinstance(refs, list) or not refs or not set(refs) <= source_ids:
            fail(f"{key}: sourceRefs must resolve through data/sources.json")
        limitations = entry.get("limitations")
        if not isinstance(limitations, list) or not limitations or not all(isinstance(item, str) and item.strip() for item in limitations):
            fail(f"{key}: explicit limitations are required")
        upstream = entry.get("upstream")
        if not isinstance(upstream, dict) or "revisionEvidence" not in upstream:
            fail(f"{key}: upstream revisionEvidence is required")
        revision = upstream["revisionEvidence"]
        if revision.get("status") in {"unresolved", "repository-only", "comparison-only", "branch-only"} and not limitations:
            fail(f"{key}: incomplete revision evidence requires limitations")
        if not isinstance(revision.get("evidence"), str) or not revision["evidence"].strip():
            fail(f"{key}: revision evidence explanation is required")
    print(f"OK: {len(entries)} snapshot entries, hashes and provenance references validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
