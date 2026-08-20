#!/usr/bin/env python3
"""Validate local snapshot hashes and provenance manifest without network access."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/upstream-snapshot-manifest.json"
SOURCES = ROOT / "data/sources.json"
SHA256 = re.compile(r"^[0-9a-f]{64}$")
GIT_COMMIT = re.compile(r"^[0-9a-f]{40}$")
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


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


def nested_value(value: dict[str, Any], dotted_path: str) -> Any:
    current: Any = value
    for part in dotted_path.split("."):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


def collect_source_refs(value: Any) -> set[str]:
    refs: set[str] = set()
    if isinstance(value, dict):
        source_ref = value.get("sourceRef")
        if isinstance(source_ref, str) and source_ref:
            refs.add(source_ref)
        source_refs = value.get("sourceRefs")
        if isinstance(source_refs, list):
            refs.update(item for item in source_refs if isinstance(item, str) and item)
        provenance = value.get("provenance")
        if isinstance(provenance, dict) and isinstance(provenance.get("sources"), list):
            refs.update(item for item in provenance["sources"] if isinstance(item, str) and item)
        for item in value.values():
            refs.update(collect_source_refs(item))
    elif isinstance(value, list):
        for item in value:
            refs.update(collect_source_refs(item))
    return refs


def main() -> int:
    manifest = json.loads(MANIFEST.read_text())
    source_items = json.loads(SOURCES.read_text())["sources"]
    if not isinstance(source_items, list) or not source_items:
        fail("data/sources.json must contain a non-empty sources array")
    source_entries: dict[str, dict[str, Any]] = {}
    source_paths: dict[str, str] = {}
    for index, item in enumerate(source_items):
        if not isinstance(item, dict) or not isinstance(item.get("id"), str) or not item["id"]:
            fail(f"data/sources.json source {index} requires an ID")
        source_id = item["id"]
        if source_id in source_entries:
            fail(f"data/sources.json has duplicate source ID {source_id}")
        source_entries[source_id] = item
        source_path = item.get("path")
        if source_path is None:
            continue
        if not isinstance(source_path, str) or not source_path or source_path.startswith(("/", "~", "../")):
            fail(f"{source_id}: registered source path must be repository-relative")
        if not (ROOT / source_path).is_file():
            fail(f"{source_id}: registered source path is missing: {source_path}")
        if source_path in source_paths:
            fail(
                f"registered source path {source_path} is claimed by both "
                f"{source_paths[source_path]} and {source_id}"
            )
        source_paths[source_path] = source_id
    source_ids = set(source_entries)
    enums = manifest.get("enums", {})
    entries = manifest.get("entries")
    if not isinstance(entries, list) or not entries:
        fail("entries must be a non-empty array")
    keys = [entry.get("key") for entry in entries]
    if any(not key for key in keys) or len(keys) != len(set(keys)):
        fail("entry keys must be unique and non-empty")
    local_paths = [entry.get("localPath") for entry in entries]
    if len(local_paths) != len(set(local_paths)):
        fail("entry localPath values must be unique")
    entries_by_key = {entry["key"]: entry for entry in entries}
    source_path_links = 0
    metadata_bindings_checked = 0
    incomplete_revision_keys: list[str] = []
    unknown_retrieval_keys: list[str] = []
    unresolved_license_keys: list[str] = []
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
        inventory_config = entry.get("snapshotInventory")
        binding_config = entry.get("snapshotMetadataBindings")
        metadata = None
        if inventory_config is not None or binding_config is not None:
            try:
                metadata = json.loads(path.read_text())
            except (OSError, json.JSONDecodeError) as exc:
                fail(f"{key}: cannot parse snapshot metadata: {exc}")
        if inventory_config is not None:
            if not isinstance(inventory_config, dict):
                fail(f"{key}: snapshotInventory must be an object")
            directory = inventory_config.get("directory")
            field = inventory_config.get("metadataField")
            if not isinstance(directory, str) or not isinstance(field, str) or not (ROOT / directory).is_dir():
                fail(f"{key}: snapshot inventory directory/field is invalid")
            assert isinstance(metadata, dict)
            inventory = metadata.get(field)
            if not isinstance(inventory, list) or not inventory:
                fail(f"{key}: snapshot inventory is required")
            listed = set()
            for item in inventory:
                if not isinstance(item, dict) or not isinstance(item.get("path"), str):
                    fail(f"{key}: invalid snapshot inventory item")
                relative = item["path"]
                if relative in listed:
                    fail(f"{key}: duplicate snapshot inventory path {relative}")
                listed.add(relative)
                snapshot_file = ROOT / directory / relative
                actual_hash, actual_size = digest(snapshot_file) if snapshot_file.is_file() else (None, None)
                if actual_hash != item.get("sha256") or actual_size != item.get("bytes"):
                    fail(f"{key}: snapshot inventory drift at {relative}")
            inventory_mode = inventory_config.get("inventoryMode", "markdown-files")
            if inventory_mode == "markdown-files":
                actual_files = {item.name for item in (ROOT / directory).glob("*.md")}
            elif inventory_mode == "all-files":
                actual_files = {
                    item.relative_to(ROOT / directory).as_posix()
                    for item in (ROOT / directory).rglob("*")
                    if item.is_file()
                }
            elif inventory_mode == "all-files-except-metadata":
                metadata_relative = path.relative_to(ROOT / directory).as_posix()
                actual_files = {
                    item.relative_to(ROOT / directory).as_posix()
                    for item in (ROOT / directory).rglob("*")
                    if item.is_file() and item.relative_to(ROOT / directory).as_posix() != metadata_relative
                }
            else:
                fail(f"{key}: unsupported snapshot inventoryMode")
            if actual_files != listed:
                fail(f"{key}: snapshot inventory does not match copied files")
        if binding_config is not None:
            if not isinstance(binding_config, dict) or not isinstance(metadata, dict):
                fail(f"{key}: snapshotMetadataBindings requires JSON snapshot metadata")
            revision_field = binding_config.get("revisionField")
            if revision_field is not None:
                if nested_value(metadata, revision_field) != entry["upstream"]["revisionEvidence"].get("value"):
                    fail(f"{key}: revision evidence does not match snapshot metadata field {revision_field}")
                metadata_bindings_checked += 1
            retrieval_field = binding_config.get("retrievalDateField")
            if retrieval_field is not None:
                if nested_value(metadata, retrieval_field) != entry["retrievalOrVerification"].get("date"):
                    fail(f"{key}: retrieval date does not match snapshot metadata field {retrieval_field}")
                metadata_bindings_checked += 1
            license_field = binding_config.get("licenseValueField")
            if license_field is not None:
                if nested_value(metadata, license_field) != entry["license"].get("value"):
                    fail(f"{key}: license value does not match snapshot metadata field {license_field}")
                metadata_bindings_checked += 1
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
        if len(refs) != len(set(refs)):
            fail(f"{key}: sourceRefs must be unique")
        if entry.get("contentRole") == "upstream-reference":
            path_ref = entry.get("localPathSourceRef")
            if not isinstance(path_ref, str) or path_ref not in refs:
                fail(f"{key}: upstream references require a localPathSourceRef included in sourceRefs")
            if source_entries[path_ref].get("path") != local_path:
                fail(f"{key}: localPathSourceRef path does not match localPath")
            source_path_links += 1
        copy_of = entry.get("copyOfEntry")
        if copy_of is not None:
            if not isinstance(copy_of, str) or copy_of not in entries_by_key or copy_of == key:
                fail(f"{key}: copyOfEntry must identify another manifest entry")
            copied = entries_by_key[copy_of]
            if entry.get("localSha256") != copied.get("localSha256") or entry.get("localBytes") != copied.get("localBytes"):
                fail(f"{key}: copyOfEntry content identity does not match {copy_of}")
        limitations = entry.get("limitations")
        if not isinstance(limitations, list) or not limitations or not all(isinstance(item, str) and item.strip() for item in limitations):
            fail(f"{key}: explicit limitations are required")
        dependent_files = entry.get("dependentFiles")
        if not isinstance(dependent_files, list) or not dependent_files or len(dependent_files) != len(set(dependent_files)):
            fail(f"{key}: unique dependentFiles are required")
        for dependent_file in dependent_files:
            if not isinstance(dependent_file, str) or not (ROOT / dependent_file).is_file():
                fail(f"{key}: dependent file is missing: {dependent_file}")
        upstream = entry.get("upstream")
        if not isinstance(upstream, dict) or "revisionEvidence" not in upstream:
            fail(f"{key}: upstream revisionEvidence is required")
        revision = upstream["revisionEvidence"]
        revision_status = revision.get("status")
        if revision_status not in enums.get("revisionEvidenceStatuses", []):
            fail(f"{key}: unsupported revision evidence status")
        revision_value = revision.get("value")
        if revision_status in {"pinned-archive-review", "pinned-local-review"}:
            if not isinstance(revision_value, str) or not GIT_COMMIT.fullmatch(revision_value):
                fail(f"{key}: pinned revision evidence requires a 40-character commit")
        elif revision_status == "branch-only":
            if not isinstance(revision_value, str) or not revision_value:
                fail(f"{key}: branch-only revision evidence requires a branch value")
            incomplete_revision_keys.append(key)
        else:
            if revision_value is not None:
                fail(f"{key}: unresolved/repository/comparison revision value must remain null")
            incomplete_revision_keys.append(key)
        if not isinstance(revision.get("evidence"), str) or not revision["evidence"].strip():
            fail(f"{key}: revision evidence explanation is required")
        retrieval = entry.get("retrievalOrVerification")
        if not isinstance(retrieval, dict) or retrieval.get("status") not in enums.get("retrievalOrVerificationStatuses", []):
            fail(f"{key}: unsupported retrieval/verification status")
        if not isinstance(retrieval.get("evidence"), str) or not retrieval["evidence"].strip():
            fail(f"{key}: retrieval/verification evidence is required")
        if retrieval["status"] == "derived-from-pinned-review":
            if not isinstance(retrieval.get("date"), str) or not ISO_DATE.fullmatch(retrieval["date"]):
                fail(f"{key}: pinned review requires an ISO retrieval/verification date")
        else:
            if retrieval.get("date") is not None:
                fail(f"{key}: unknown snapshot date must remain null")
            unknown_retrieval_keys.append(key)
        license_data = entry.get("license")
        if not isinstance(license_data, dict) or license_data.get("status") not in enums.get("licenseStatuses", []):
            fail(f"{key}: unsupported license status")
        if not isinstance(license_data.get("evidence"), str) or not license_data["evidence"].strip():
            fail(f"{key}: license evidence is required")
        if license_data["status"] == "unresolved":
            if license_data.get("value") is not None:
                fail(f"{key}: unresolved license value must remain null")
            unresolved_license_keys.append(key)
        elif not isinstance(license_data.get("value"), str) or not license_data["value"]:
            fail(f"{key}: observed/verified license status requires a value")
        if entry.get("contentRole") in {"derived-review", "source-reference"}:
            try:
                local_data = json.loads(path.read_text())
            except (OSError, json.JSONDecodeError) as exc:
                fail(f"{key}: cannot parse derived local artifact: {exc}")
            embedded_refs = collect_source_refs(local_data)
            if embedded_refs != set(refs):
                fail(
                    f"{key}: manifest sourceRefs {sorted(refs)} do not match "
                    f"embedded local sourceRefs {sorted(embedded_refs)}"
                )
    print(
        f"OK: {len(entries)} provenance entries, {source_path_links} source-path links, "
        f"{metadata_bindings_checked} metadata bindings; residual revisions={len(incomplete_revision_keys)}, "
        f"retrieval dates={len(unknown_retrieval_keys)}, licenses={len(unresolved_license_keys)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
