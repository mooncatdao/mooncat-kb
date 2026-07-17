#!/usr/bin/env python3
"""Validate the generated MoonCat KB maintained-file manifest without network access."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "data/kb-manifest.json"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def digest_and_size(path: Path) -> tuple[str, int]:
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            size += len(chunk)
            digest.update(chunk)
    return digest.hexdigest(), size


def command_path(command: str) -> str | None:
    parts = command.split()
    if len(parts) >= 2 and parts[0] == "python" and parts[1].startswith("scripts/"):
        return parts[1]
    return None


def load_generator() -> Any:
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("kb_manifest_generator", ROOT / "scripts/generate-kb-manifest.py")
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


def main() -> int:
    if not MANIFEST_PATH.is_file():
        fail("data/kb-manifest.json is missing")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    generator = load_generator()
    rendered = json.dumps(generator.build_manifest(), indent=2, ensure_ascii=False) + "\n"
    if MANIFEST_PATH.read_text(encoding="utf-8") != rendered:
        fail("manifest is not deterministic/current; run python scripts/generate-kb-manifest.py")

    policy = manifest.get("generationPolicy", {})
    roles = set(policy.get("fileRoleEnums", []))
    modes = set(policy.get("curationModeEnums", []))
    statuses = set(policy.get("fileStatusEnums", []))
    entries = manifest.get("entries")
    exclusions = manifest.get("excludedFiles")
    if not roles or not modes or not statuses or not isinstance(entries, list) or not isinstance(exclusions, list):
        fail("manifest enums, entries, and excludedFiles are required")

    paths = [entry.get("path") for entry in entries if isinstance(entry, dict)]
    if len(paths) != len(entries) or any(not isinstance(path, str) or not path for path in paths):
        fail("every manifest entry needs a non-empty path")
    if len(paths) != len(set(paths)):
        fail("manifest entry paths must be unique")
    excluded_paths = [entry.get("path") for entry in exclusions if isinstance(entry, dict)]
    if len(excluded_paths) != len(exclusions) or len(excluded_paths) != len(set(excluded_paths)):
        fail("excluded paths must be unique and non-empty")
    if set(paths) & set(excluded_paths):
        fail("a path cannot be both maintained and excluded")

    route_keys = {item["key"] for item in json.loads((ROOT / "data/agent-index.json").read_text())["tasks"]}
    recipe_keys = {item["key"] for item in json.loads((ROOT / "data/task-recipes.json").read_text())["recipes"]}
    for artifact in manifest.get("generatedArtifactRegistry", []):
        path_label = artifact.get("path")
        if not isinstance(path_label, str) or not path_label:
            fail("generated artifact registration requires a path")
        for command in [artifact.get("generatorCommand"), artifact.get("checkCommand"), *artifact.get("validatorCommands", [])]:
            if command is None:
                continue
            if not isinstance(command, str):
                fail(f"{path_label}: artifact command metadata must be a string")
            script = command_path(command)
            if script and not (ROOT / script).is_file():
                fail(f"{path_label}: artifact command references missing script {script}")
    for entry in entries:
        path_label = entry["path"]
        local = ROOT / path_label
        if not local.is_file():
            fail(f"{path_label}: maintained file is missing")
        if entry.get("fileRole") not in roles:
            fail(f"{path_label}: invalid fileRole")
        if entry.get("curationMode") not in modes:
            fail(f"{path_label}: invalid curationMode")
        entry_statuses = entry.get("statuses")
        if not isinstance(entry_statuses, list) or not entry_statuses or not set(entry_statuses) <= statuses:
            fail(f"{path_label}: invalid statuses")
        topics = entry.get("topics")
        if not isinstance(topics, list) or not topics or not all(isinstance(topic, str) and topic for topic in topics):
            fail(f"{path_label}: topics are required")
        actual_hash, actual_size = digest_and_size(local)
        if entry.get("sha256") != actual_hash or entry.get("sizeBytes") != actual_size:
            fail(f"{path_label}: hash or size drift")
        if not set(entry.get("agentRoutes", [])) <= route_keys:
            fail(f"{path_label}: unresolved agent route")
        if not set(entry.get("taskRecipes", [])) <= recipe_keys:
            fail(f"{path_label}: unresolved task recipe")
        for command in [entry.get("generatorCommand"), entry.get("checkCommand"), *entry.get("validatorCommands", [])]:
            if command is None:
                continue
            if not isinstance(command, str):
                fail(f"{path_label}: command metadata must be a string")
            script = command_path(command)
            if script and not (ROOT / script).is_file():
                fail(f"{path_label}: command references missing script {script}")
        if entry.get("sourceBackedStatus") not in {"registered-source", "contains-source-reference", "not-applicable"}:
            fail(f"{path_label}: invalid sourceBackedStatus")
        if not isinstance(entry.get("directAgentLoadRecommended"), bool):
            fail(f"{path_label}: directAgentLoadRecommended must be boolean")

    expected_paths = {entry["path"] for entry in generator.build_manifest()["entries"]}
    if set(paths) != expected_paths:
        fail("manifest does not provide complete maintained-file coverage")
    for exclusion in exclusions:
        path_label, reason = exclusion.get("path"), exclusion.get("reason")
        if not isinstance(path_label, str) or not isinstance(reason, str) or not reason:
            fail("excluded files require path and reason")
        if not (ROOT / path_label).is_file():
            fail(f"excluded path is not a current file: {path_label}")
    coverage = manifest.get("coverage", {})
    if coverage.get("maintainedFileCount") != len(entries) or coverage.get("excludedFileCount") != len(exclusions):
        fail("coverage counts do not match entries/exclusions")
    if coverage.get("unclassifiedMaintainedFileCount") != 0:
        fail("unclassified maintained files are not allowed")
    print(f"OK: {len(entries)} maintained files, {len(exclusions)} explicit exclusions, hashes, routes, and commands validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
