#!/usr/bin/env python3
"""Validate the compact MoonCatRescue ADR index without network access."""

from __future__ import annotations

import json
import re
import sys
import hashlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "data/architecture-decisions.json"
SOURCES = ROOT / "data/sources.json"
ID_PATTERN = re.compile(r"^adr-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*$")
NUMBER_PATTERN = re.compile(r"^\d{4}$")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def nonempty_strings(value: object) -> bool:
    return isinstance(value, list) and bool(value) and all(isinstance(item, str) and item.strip() for item in value)


def digest_and_size(path: Path) -> tuple[str, int]:
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            size += len(chunk)
            digest.update(chunk)
    return digest.hexdigest(), size


def main() -> int:
    data = json.loads(INDEX.read_text(encoding="utf-8"))
    sources = {item["id"]: item for item in json.loads(SOURCES.read_text(encoding="utf-8"))["sources"]}
    snapshot = data.get("snapshot", {})
    metadata_path = snapshot.get("metadataPath")
    if not isinstance(metadata_path, str) or not (ROOT / metadata_path).is_file():
        fail("snapshot metadataPath is required and must exist")
    metadata = json.loads((ROOT / metadata_path).read_text(encoding="utf-8"))
    if snapshot.get("resolvedCommit") != metadata.get("resolvedCommit") or snapshot.get("adrDirectory") != metadata.get("adrDirectory"):
        fail("index snapshot does not match snapshot metadata")
    inventory = {item["path"]: item for item in metadata.get("inventory", []) if isinstance(item, dict)}
    snapshot_dir = ROOT / "references/upstream/mooncatrescue-dev-environment-adr"
    snapshot_markdown = {path.name for path in snapshot_dir.glob("*.md")}
    if snapshot_markdown != set(inventory):
        fail("snapshot metadata inventory must list every and only copied Markdown file")
    for path, item in inventory.items():
        local = snapshot_dir / path
        actual_hash, actual_size = digest_and_size(local) if local.is_file() else (None, None)
        if actual_hash != item.get("sha256") or actual_size != item.get("bytes"):
            fail(f"snapshot inventory drift: {path}")
    schema = data.get("schema", {})
    decisions = data.get("decisions")
    if not isinstance(decisions, list) or not decisions:
        fail("decisions must be a non-empty array")
    if not set(data.get("sourceRefs", [])) <= set(sources):
        fail("index sourceRefs must resolve through data/sources.json")
    enums = {
        "decisionStatus": set(schema.get("decisionStatuses", [])),
        "decisionDateStatus": set(schema.get("decisionDateStatuses", [])),
        "supersessionStatus": set(schema.get("supersessionStatuses", [])),
        "confidence": set(schema.get("confidenceLevels", [])),
        "evidenceStatus": set(schema.get("evidenceStatuses", [])),
        "sourceKind": set(schema.get("sourceLocationKinds", [])),
    }
    if any(not values for values in enums.values()):
        fail("schema enums are required")
    required = schema.get("requiredRecordFields", [])
    ids, numbers = set(), set()
    for decision in decisions:
        if not isinstance(decision, dict):
            fail("decision records must be objects")
        missing = [field for field in required if field not in decision]
        if missing:
            fail(f"decision record missing fields: {', '.join(missing)}")
        identifier, number = decision["id"], decision["number"]
        if not isinstance(identifier, str) or not ID_PATTERN.fullmatch(identifier) or identifier in ids:
            fail(f"invalid or duplicate decision id: {identifier}")
        if not isinstance(number, str) or not NUMBER_PATTERN.fullmatch(number) or number in numbers:
            fail(f"invalid or duplicate ADR number: {number}")
        ids.add(identifier)
        numbers.add(number)
        if decision.get("sourceRef") not in sources:
            fail(f"{identifier}: unknown sourceRef")
        source = decision.get("source")
        if not isinstance(source, dict) or source.get("kind") not in enums["sourceKind"]:
            fail(f"{identifier}: invalid source location")
        if source["kind"] == "registered-url":
            if source.get("url") != sources[decision["sourceRef"]].get("url") or source.get("localPath") is not None:
                fail(f"{identifier}: registered URL must match its sourceRef and have no localPath")
        if source["kind"] == "local-reference-path":
            local_path = source.get("localPath")
            if not isinstance(local_path, str) or not (ROOT / local_path).is_file() or source.get("url") is not None:
                fail(f"{identifier}: local reference path is invalid")
            prefix = "references/upstream/mooncatrescue-dev-environment-adr/"
            if not local_path.startswith(prefix):
                fail(f"{identifier}: local reference path is outside the ADR snapshot")
            item = inventory.get(local_path.removeprefix(prefix))
            if not item or item.get("role") != "decision":
                fail(f"{identifier}: local reference path is not a snapshot decision file")
        for key in ("decisionStatus", "decisionDateStatus", "supersessionStatus", "confidence", "evidenceStatus"):
            if decision.get(key) not in enums[key]:
                fail(f"{identifier}: invalid {key}")
        date = decision.get("decisionDate")
        if date is not None and (not isinstance(date, str) or not DATE_PATTERN.fullmatch(date)):
            fail(f"{identifier}: decisionDate must be null or YYYY-MM-DD")
        if decision["decisionDateStatus"] == "explicit" and date is None:
            fail(f"{identifier}: explicit decision date is missing")
        if decision["decisionDateStatus"] == "not-available-from-reviewed-evidence" and date is not None:
            fail(f"{identifier}: unresolved decision date must be null")
        if not isinstance(decision.get("title"), str) or not decision["title"].strip():
            fail(f"{identifier}: title is required")
        for key in ("topics", "implementationConsequences", "relatedFiles", "limitations"):
            if not nonempty_strings(decision.get(key)):
                fail(f"{identifier}: {key} must be a non-empty string array")
        if not isinstance(decision.get("decisionSummary"), str) or not decision["decisionSummary"].strip():
            fail(f"{identifier}: decisionSummary is required")
        for field in ("affectedRepositories", "affectedContracts", "affectedSystems"):
            values = decision.get(field)
            required_keys = ("name", "evidence") if field != "affectedSystems" else ("kind", "name", "evidence")
            if not isinstance(values, list) or (field == "affectedSystems" and not values) or any(not isinstance(item, dict) or not all(isinstance(item.get(key), str) and item[key].strip() for key in required_keys) for item in values):
                fail(f"{identifier}: {field} must be valid objects")
        history = decision.get("historicalContext")
        if not isinstance(history, dict) or history.get("status") not in {"explicit", "not-indexed-from-reviewed-evidence"}:
            fail(f"{identifier}: invalid historicalContext")
        if history["status"] == "not-indexed-from-reviewed-evidence" and history.get("summary") is not None:
            fail(f"{identifier}: unresolved historical context must be null")
        for path in decision["relatedFiles"]:
            if not (ROOT / path).is_file():
                fail(f"{identifier}: missing related file {path}")
        for link_key in ("supersedes", "supersededBy"):
            links = decision.get(link_key)
            if not isinstance(links, list) or not all(isinstance(link, str) for link in links):
                fail(f"{identifier}: {link_key} must be a string array")
            if identifier in links:
                fail(f"{identifier}: self-link in {link_key}")
    by_id = {decision["id"]: decision for decision in decisions}
    snapshot_decision_files = {
        f"references/upstream/mooncatrescue-dev-environment-adr/{path}"
        for path, item in inventory.items() if item.get("role") == "decision"
    }
    indexed_files = {decision["source"]["localPath"] for decision in decisions}
    if indexed_files != snapshot_decision_files:
        fail("every snapshot decision file must be indexed exactly once with no extra records")
    if metadata.get("counts", {}).get("decisionFileCount") != len(snapshot_decision_files):
        fail("snapshot decisionFileCount does not match inventory")
    for decision in decisions:
        identifier = decision["id"]
        for target in decision["supersedes"]:
            if target not in by_id or identifier not in by_id[target]["supersededBy"]:
                fail(f"{identifier}: broken reciprocal supersedes link {target}")
        for target in decision["supersededBy"]:
            if target not in by_id or identifier not in by_id[target]["supersedes"]:
                fail(f"{identifier}: broken reciprocal supersededBy link {target}")
        if decision["supersessionStatus"] == "explicit-links-indexed" and not (decision["supersedes"] or decision["supersededBy"]):
            fail(f"{identifier}: explicit supersession status requires a link")
        if decision["supersessionStatus"] == "not-evidenced" and (decision["supersedes"] or decision["supersededBy"]):
            fail(f"{identifier}: unresolved supersession cannot contain links")
    if data.get("coverage", {}).get("evidencedAdrCount") != len(decisions):
        fail("coverage evidencedAdrCount must match decisions")
    print(f"OK: {len(decisions)} ADR records, IDs, sources, paths, enums, and claimed supersession links validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
