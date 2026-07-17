#!/usr/bin/env python3
"""Generate the deterministic maintained-file manifest for the MoonCat KB."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data/kb-manifest.json"

FILE_ROLES = [
    "canonical-data", "documentation", "entrypoint", "example", "generator",
    "license-notice", "project-metadata", "source-index", "validator", "workflow-data",
]
CURATION_MODES = ["curated", "generated", "local-policy"]
FILE_STATUSES = ["curated", "doc", "example", "generated", "script"]

# These are explicit policy exclusions, not unclassified files. The two generated
# audit outputs cannot include a self-hash without making the manifest recursive.
EXCLUDED_EXACT = {
    "data/kb-manifest.json": "recursive-generated-manifest-output",
    "data/kb-audit-report.json": "dynamic-generated-audit-report",
}
EXCLUDED_PREFIXES = {
    ".git/": "git-internal-data",
    ".chatgpt/": "local-generated-run-artifact",
    ".agents/": "local-agent-workflow-artifact",
    ".codex/": "local-agent-workflow-artifact",
    "references/": "reference-snapshot-not-curated-kb-content",
    "examples/rescue-mining-widget/vendor/": "vendored-example-dependency",
    "node_modules/": "dependency-directory",
    ".venv/": "local-virtual-environment",
    "venv/": "local-virtual-environment",
    "__pycache__/": "python-cache",
}

GENERATED_ARTIFACTS = {
    "data/agent-context-packs.json": {
        "generatorCommand": "python scripts/generate-agent-context-packs.py",
        "checkCommand": "python scripts/generate-agent-context-packs.py --check",
        "validatorCommands": ["python scripts/validate-agent-routing.py"],
    },
    "data/mooncat-visual-traits.sample.json": {
        "generatorCommand": "python scripts/generate-visual-traits.py",
        "checkCommand": "python scripts/generate-visual-traits.py --check",
        "validatorCommands": ["python scripts/validate-visual-traits.py"],
    },
    "data/materialization-parity-results.json": {
        "generatorCommand": "python scripts/generate-materialization-parity.py",
        "checkCommand": "python scripts/generate-materialization-parity.py --check",
        "validatorCommands": ["python scripts/validate-materialization-parity.py"],
    },
    "data/kb-manifest.json": {
        "generatorCommand": "python scripts/generate-kb-manifest.py",
        "checkCommand": "python scripts/generate-kb-manifest.py --check",
        "validatorCommands": ["python scripts/validate-kb-manifest.py"],
    },
    "data/kb-audit-report.json": {
        "generatorCommand": "python scripts/audit-kb.py",
        "validatorCommands": [],
    },
}


def sha256_and_size(path: Path) -> tuple[str, int]:
    digest = hashlib.sha256()
    size = 0
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            size += len(chunk)
            digest.update(chunk)
    return digest.hexdigest(), size


def exclusion_reason(relative_path: str) -> str | None:
    if relative_path in EXCLUDED_EXACT:
        return EXCLUDED_EXACT[relative_path]
    if relative_path.endswith(".pyc") or "/__pycache__/" in relative_path:
        return "python-cache"
    for prefix, reason in EXCLUDED_PREFIXES.items():
        if relative_path.startswith(prefix):
            return reason
    if relative_path.startswith("."):
        return "local-hidden-workflow-artifact"
    return None


def record_exclusion(relative_path: str) -> bool:
    """Keep the generated list stable while policy still excludes volatile caches."""
    volatile_prefixes = (".git/", ".chatgpt/", ".agents/", ".codex/", "__pycache__/")
    return not relative_path.endswith(".pyc") and "/__pycache__/" not in relative_path and not relative_path.startswith(volatile_prefixes)


def iter_repo_files() -> list[tuple[str, Path]]:
    files: list[tuple[str, Path]] = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(ROOT).as_posix()
        files.append((relative, path))
    return files


def load_json(relative_path: str) -> dict[str, Any]:
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8"))


def route_maps() -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    routes: dict[str, list[str]] = {}
    for task in load_json("data/agent-index.json").get("tasks", []):
        key = task.get("key")
        if not isinstance(key, str):
            continue
        for path in task.get("primaryFiles", []) + task.get("optionalFiles", []):
            if isinstance(path, str):
                routes.setdefault(path, []).append(key)
    recipes: dict[str, list[str]] = {}
    for recipe in load_json("data/task-recipes.json").get("recipes", []):
        key = recipe.get("key")
        if not isinstance(key, str):
            continue
        for path in recipe.get("loadOrder", []) + recipe.get("optionalFiles", []):
            if isinstance(path, str):
                recipes.setdefault(path, []).append(key)
    return ({path: sorted(set(keys)) for path, keys in routes.items()},
            {path: sorted(set(keys)) for path, keys in recipes.items()})


def source_backed_paths() -> set[str]:
    return {
        entry["path"] for entry in load_json("data/sources.json").get("sources", [])
        if isinstance(entry, dict) and isinstance(entry.get("path"), str)
    }


def contains_source_reference(value: Any) -> bool:
    if isinstance(value, dict):
        return any(
            key in {"sourceRef", "sourceRefs"} or contains_source_reference(item)
            for key, item in value.items()
        )
    if isinstance(value, list):
        return any(contains_source_reference(item) for item in value)
    return False


def file_classification(relative_path: str) -> tuple[str, list[str], str, list[str]]:
    """Classify by the documented path table; unknown maintained files raise."""
    if relative_path in {"README.md", "AGENTS.md", "llms.txt", "CONTRIBUTING.md"}:
        return "entrypoint", ["agent-workflow", "repository"], "local-policy", ["curated", "doc"]
    if relative_path in {"LICENSE", "NOTICE.md"}:
        return "license-notice", ["licensing", "repository"], "local-policy", ["curated", "doc"]
    if relative_path == "result.md":
        return "project-metadata", ["repository", "workflow"], "local-policy", ["curated", "doc"]
    if relative_path.startswith("docs/") and relative_path.endswith(".md"):
        topic = "agent-workflow" if relative_path == "docs/agent-usage.md" else "mooncat-knowledge"
        return "documentation", [topic], "curated", ["curated", "doc"]
    if relative_path == "data/sources.json":
        return "source-index", ["provenance", "sources"], "curated", ["curated"]
    if relative_path in {"data/agent-index.json", "data/task-recipes.json", "data/kb-gap-index.json", "data/agent-query-cases.json", "data/agent-coding-patterns.json"}:
        return "workflow-data", ["agent-workflow", "routing"], "curated", ["curated"]
    if relative_path in GENERATED_ARTIFACTS:
        return "workflow-data" if relative_path == "data/agent-context-packs.json" else "canonical-data", ["generated-data", "mooncat-knowledge"], "generated", ["generated"]
    if relative_path.startswith("data/") and relative_path.endswith(".json"):
        topic = "provenance" if "source" in relative_path or "upstream" in relative_path else "mooncat-knowledge"
        return "canonical-data", [topic], "curated", ["curated"]
    if relative_path.startswith("scripts/generate-") and relative_path.endswith(".py"):
        return "generator", ["validation", "agent-workflow"], "curated", ["curated", "script"]
    if relative_path.startswith("scripts/validate-") and relative_path.endswith(".py"):
        return "validator", ["validation", "agent-workflow"], "curated", ["curated", "script"]
    if relative_path == "scripts/audit-kb.py":
        return "validator", ["validation", "integrity"], "curated", ["curated", "script"]
    if relative_path == "examples/rescue-mining.js" or relative_path.startswith("examples/rescue-mining-widget/"):
        return "example", ["rescue-mining", "example"], "curated", ["curated", "example"]
    raise ValueError(f"no explicit manifest classification rule for maintained file: {relative_path}")


def build_manifest() -> dict[str, Any]:
    routes, recipes = route_maps()
    registered_sources = source_backed_paths()
    entries: list[dict[str, Any]] = []
    exclusions: list[dict[str, str]] = []
    for relative, path in iter_repo_files():
        reason = exclusion_reason(relative)
        if reason:
            if record_exclusion(relative):
                exclusions.append({"path": relative, "reason": reason})
            continue
        role, topics, curation_mode, statuses = file_classification(relative)
        digest, size = sha256_and_size(path)
        source_status = "not-applicable"
        if relative in registered_sources:
            source_status = "registered-source"
        elif relative.startswith("data/") and relative.endswith(".json") and contains_source_reference(load_json(relative)):
            source_status = "contains-source-reference"
        entry = {
            "path": relative,
            "fileRole": role,
            "topics": topics,
            "curationMode": curation_mode,
            "statuses": statuses,
            "sizeBytes": size,
            "sha256": digest,
            "agentRoutes": routes.get(relative, []),
            "taskRecipes": recipes.get(relative, []),
            "generatorCommand": GENERATED_ARTIFACTS.get(relative, {}).get("generatorCommand"),
            "checkCommand": GENERATED_ARTIFACTS.get(relative, {}).get("checkCommand"),
            "validatorCommands": GENERATED_ARTIFACTS.get(relative, {}).get("validatorCommands", []),
            "sourceBackedStatus": source_status,
            "directAgentLoadRecommended": relative in routes and any(
                relative in task.get("primaryFiles", [])
                for task in load_json("data/agent-index.json").get("tasks", [])
            ),
        }
        entries.append(entry)
    return {
        "version": 1,
        "status": "generated-maintained-file-inventory",
        "generationPolicy": {
            "network": "none",
            "inventoryBasis": "all regular files under the repository root after explicit exclusion policy",
            "fileRoleEnums": FILE_ROLES,
            "curationModeEnums": CURATION_MODES,
            "fileStatusEnums": FILE_STATUSES,
            "classificationRule": "explicit root/path mappings in scripts/generate-kb-manifest.py; unmatched maintained paths fail generation",
            "excludedExactPaths": EXCLUDED_EXACT,
            "excludedPathPrefixes": EXCLUDED_PREFIXES,
            "notes": [
                "Reference snapshots and vendored example dependencies are excluded from maintained curated KB coverage.",
                "The manifest and audit report outputs are excluded to avoid self-referential hashes and dynamic audit durations.",
                "Agent routes and task recipes are derived from data/agent-index.json and data/task-recipes.json at generation time.",
            ],
        },
        "generatedArtifactRegistry": [
            {"path": path, **metadata} for path, metadata in sorted(GENERATED_ARTIFACTS.items())
        ],
        "coverage": {
            "maintainedFileCount": len(entries),
            "excludedFileCount": len(exclusions),
            "unclassifiedMaintainedFileCount": 0,
        },
        "entries": entries,
        "excludedFiles": exclusions,
    }


def render() -> str:
    return json.dumps(build_manifest(), indent=2, ensure_ascii=False) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail when the checked-in manifest differs")
    args = parser.parse_args()
    rendered = render()
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_text(encoding="utf-8") != rendered:
            print("ERROR: data/kb-manifest.json is stale; run python scripts/generate-kb-manifest.py")
            return 1
        print("OK: data/kb-manifest.json is deterministic and current")
        return 0
    OUTPUT.write_text(rendered, encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
