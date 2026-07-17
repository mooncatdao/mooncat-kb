#!/usr/bin/env python3
"""Validate MoonCat KB structural consistency.

This script is intentionally read-only and uses only the Python standard
library. It validates JSON parsing, required repo-relative file references,
and sourceRef consistency across data/*.json files.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class Reporter:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warning(self, message: str) -> None:
        self.warnings.append(message)


def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    for candidate in (current, *current.parents):
        if (candidate / "README.md").is_file() and (candidate / "data").is_dir():
            return candidate
    raise SystemExit("ERROR: could not find repo root with README.md and data/")


def json_path(parent: str, key: str | int) -> str:
    if isinstance(key, int):
        return f"{parent}[{key}]"
    if parent == "$":
        return f"$.{key}"
    return f"{parent}.{key}"


def load_data_json(repo_root: Path, reporter: Reporter) -> dict[Path, Any]:
    loaded: dict[Path, Any] = {}
    for path in sorted((repo_root / "data").glob("*.json")):
        try:
            loaded[path] = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            reporter.error(
                f"{path.relative_to(repo_root)}: invalid JSON at line {exc.lineno}, "
                f"column {exc.colno}: {exc.msg}"
            )
        except OSError as exc:
            reporter.error(f"{path.relative_to(repo_root)}: could not read file: {exc}")
    return loaded


def is_repo_relative_path(value: Any) -> bool:
    if not isinstance(value, str) or not value:
        return False
    if "://" in value or value.startswith("#"):
        return False
    if value.startswith(("./", "../", "/", "~")):
        return False
    return "/" in value or value in {"AGENTS.md", "README.md", "llms.txt"}


def path_exists(repo_root: Path, value: str) -> bool:
    return (repo_root / value).exists()


def iter_strings(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [item for item in value if isinstance(item, str)]
    return []


def check_required_paths(
    repo_root: Path,
    loaded: dict[Path, Any],
    reporter: Reporter,
) -> int:
    checked = 0

    def check_values(file_label: str, base_path: str, values: Any) -> None:
        nonlocal checked
        for value in iter_strings(values):
            if is_repo_relative_path(value):
                checked += 1
                if not path_exists(repo_root, value):
                    reporter.error(f"{file_label}: missing required file at {base_path}: {value}")

    agent_path = repo_root / "data" / "agent-index.json"
    agent = loaded.get(agent_path)
    if isinstance(agent, dict):
        check_values("data/agent-index.json", "$.defaults.loadFirst", agent.get("defaults", {}).get("loadFirst"))
        for index, task in enumerate(agent.get("tasks", [])):
            if isinstance(task, dict):
                check_values(
                    "data/agent-index.json",
                    f"$.tasks[{index}].primaryFiles",
                    task.get("primaryFiles"),
                )
                check_values(
                    "data/agent-index.json",
                    f"$.tasks[{index}].optionalFiles",
                    task.get("optionalFiles"),
                )

    recipes_path = repo_root / "data" / "task-recipes.json"
    recipes = loaded.get(recipes_path)
    if isinstance(recipes, dict):
        check_values("data/task-recipes.json", "$.relatedFiles", recipes.get("relatedFiles"))
        check_values("data/task-recipes.json", "$.defaults.loadFirst", recipes.get("defaults", {}).get("loadFirst"))
        for index, recipe in enumerate(recipes.get("recipes", [])):
            if isinstance(recipe, dict):
                check_values(
                    "data/task-recipes.json",
                    f"$.recipes[{index}].loadOrder",
                    recipe.get("loadOrder"),
                )
                check_values(
                    "data/task-recipes.json",
                    f"$.recipes[{index}].optionalFiles",
                    recipe.get("optionalFiles"),
                )

    gaps_path = repo_root / "data" / "kb-gap-index.json"
    gaps = loaded.get(gaps_path)
    if isinstance(gaps, dict):
        check_values("data/kb-gap-index.json", "$.sourceFiles", gaps.get("sourceFiles"))

    return checked


def collect_source_ids(repo_root: Path, loaded: dict[Path, Any], reporter: Reporter) -> set[str]:
    sources_path = repo_root / "data" / "sources.json"
    data = loaded.get(sources_path)
    source_ids: set[str] = set()
    if not isinstance(data, dict):
        reporter.error("data/sources.json: expected top-level object")
        return source_ids

    sources = data.get("sources")
    if not isinstance(sources, list):
        reporter.error("data/sources.json: expected $.sources array")
        return source_ids

    for index, entry in enumerate(sources):
        if not isinstance(entry, dict):
            reporter.error(f"data/sources.json: expected object at $.sources[{index}]")
            continue
        source_id = entry.get("id")
        if not isinstance(source_id, str) or not source_id:
            reporter.error(f"data/sources.json: missing source id at $.sources[{index}]")
            continue
        if source_id in source_ids:
            reporter.error(f"data/sources.json: duplicate source id at $.sources[{index}]: {source_id}")
        source_ids.add(source_id)

    return source_ids


def check_source_refs(
    repo_root: Path,
    loaded: dict[Path, Any],
    source_ids: set[str],
    reporter: Reporter,
) -> int:
    checked = 0

    def check_ref(file_label: str, path: str, value: Any) -> None:
        nonlocal checked
        if value is None or value == "":
            return
        if isinstance(value, str):
            checked += 1
            if value not in source_ids:
                reporter.warning(f"{file_label}: unknown sourceRef at {path}: {value}")
            return
        reporter.error(f"{file_label}: expected sourceRef string at {path}")

    def is_schema_field_description(path: str, value: Any) -> bool:
        return path.endswith(".fields.sourceRefs") and isinstance(value, str)

    def check_refs(file_label: str, path: str, value: Any) -> None:
        nonlocal checked
        if value is None or value == "":
            return
        if isinstance(value, list):
            for index, item in enumerate(value):
                if item is None or item == "":
                    continue
                if not isinstance(item, str):
                    reporter.error(f"{file_label}: expected sourceRef string at {path}[{index}]")
                    continue
                checked += 1
                if item not in source_ids:
                    reporter.error(f"{file_label}: unknown sourceRef at {path}[{index}]: {item}")
            return
        reporter.error(f"{file_label}: expected sourceRefs/provenance.sources array at {path}")

    def walk(file_label: str, value: Any, path: str) -> None:
        if isinstance(value, dict):
            for key, item in value.items():
                item_path = json_path(path, key)
                if key == "sourceRef":
                    check_ref(file_label, item_path, item)
                elif key == "sourceRefs":
                    if not is_schema_field_description(item_path, item):
                        check_refs(file_label, item_path, item)
                elif key == "provenance" and isinstance(item, dict) and "sources" in item:
                    check_refs(file_label, json_path(item_path, "sources"), item.get("sources"))
                    for sub_key, sub_item in item.items():
                        if sub_key != "sources":
                            walk(file_label, sub_item, json_path(item_path, sub_key))
                else:
                    walk(file_label, item, item_path)
        elif isinstance(value, list):
            for index, item in enumerate(value):
                walk(file_label, item, json_path(path, index))

    for path, data in sorted(loaded.items()):
        walk(str(path.relative_to(repo_root)), data, "$")

    return checked


def check_related_files(
    repo_root: Path,
    loaded: dict[Path, Any],
    reporter: Reporter,
) -> int:
    checked = 0

    def walk(file_label: str, value: Any, path: str) -> None:
        nonlocal checked
        if isinstance(value, dict):
            for key, item in value.items():
                item_path = json_path(path, key)
                if key == "relatedFiles" and isinstance(item, list):
                    for index, ref in enumerate(item):
                        if is_repo_relative_path(ref):
                            checked += 1
                            if not path_exists(repo_root, ref):
                                reporter.warning(
                                    f"{file_label}: missing relatedFiles entry at {item_path}[{index}]: {ref}"
                                )
                else:
                    walk(file_label, item, item_path)
        elif isinstance(value, list):
            for index, item in enumerate(value):
                walk(file_label, item, json_path(path, index))

    for path, data in sorted(loaded.items()):
        walk(str(path.relative_to(repo_root)), data, "$")

    return checked


def main() -> int:
    repo_root = find_repo_root(Path.cwd())
    reporter = Reporter()
    loaded = load_data_json(repo_root, reporter)

    required_paths_checked = 0
    source_refs_checked = 0
    related_files_checked = 0

    if not reporter.errors:
        required_paths_checked = check_required_paths(repo_root, loaded, reporter)
        source_ids = collect_source_ids(repo_root, loaded, reporter)
        source_refs_checked = check_source_refs(repo_root, loaded, source_ids, reporter)
        related_files_checked = check_related_files(repo_root, loaded, reporter)

    print("MoonCat KB validation")
    print(f"Repo root: {repo_root}")
    print(f"JSON files checked: {len(loaded)}")
    print(f"Required file references checked: {required_paths_checked}")
    print(f"sourceRefs checked: {source_refs_checked}")
    print(f"relatedFiles checked: {related_files_checked}")
    print(f"Warnings: {len(reporter.warnings)}")
    print(f"Errors: {len(reporter.errors)}")

    for warning in reporter.warnings:
        print(f"WARNING: {warning}")
    for error in reporter.errors:
        print(f"ERROR: {error}")

    return 1 if reporter.errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
