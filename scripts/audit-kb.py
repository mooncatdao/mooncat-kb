#!/usr/bin/env python3
"""Run the bounded, zero-network MoonCat KB integrity audit."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT / "data/kb-audit-report.json"
MANIFEST_PATH = ROOT / "data/kb-manifest.json"
MAX_OUTPUT_CHARS = 400

REQUIRED_COMMANDS = [
    "python scripts/generate-agent-context-packs.py --check",
    "python scripts/generate-visual-traits.py --check",
    "python scripts/generate-materialization-parity.py --check",
    "python scripts/generate-kb-manifest.py --check",
    "python scripts/validate-kb.py",
    "python scripts/validate-agent-routing.py",
    "python scripts/validate-upstream-snapshots.py",
    "python scripts/validate-identifier-conversions.py",
    "python scripts/validate-color-classification.py",
    "python scripts/validate-visual-traits.py",
    "python scripts/validate-materialization-parity.py",
    "python scripts/validate-architecture-decisions.py",
    "python scripts/validate-kb-manifest.py",
]

NAMESPACE_COLLECTIONS = {
    "sources": ("data/sources.json", "sources", "id"),
    "agent-routes": ("data/agent-index.json", "tasks", "key"),
    "task-recipes": ("data/task-recipes.json", "recipes", "key"),
    "benchmark-cases": ("data/agent-query-cases.json", "cases", "id"),
    "gap-records": ("data/kb-gap-index.json", "resolvedOrPartiallyResolvedGaps", "key"),
    "identifier-fixtures": ("data/identifier-conversion-cases.json", "fixtures", "key"),
    "materialization-fixtures": ("data/materialization-parity-cases.json", "fixtures", "key"),
    "materialization-results": ("data/materialization-parity-results.json", "results", "key"),
    "upstream-snapshots": ("data/upstream-snapshot-manifest.json", "entries", "key"),
    "architecture-decisions": ("data/architecture-decisions.json", "decisions", "id"),
}

REPO_PATH = re.compile(r"^(?:AGENTS\.md|README\.md|CONTRIBUTING\.md|context\.md|llms\.txt|result\.md|(?:data|docs|scripts|examples)/[^\s#]+)$")
MARKDOWN_LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
PHONE = re.compile(r"(?<![\w.])(?:\+?\d{1,3}[ .-])?(?:\(?\d{3}\)?[ .-])\d{3}[ .-]\d{4}(?![\w.])")
HOME = re.compile(r"/(?:home|Users)/[A-Za-z0-9._-]+")
IP_ADDRESS = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
PII_ALLOWLIST = [re.compile(r"\b(?:test|example)@example\.com\b", re.I)]
PII_DENYLIST: list[str] = []
PUBLIC_CONTRACT_ADDRESS = re.compile(r"^0x[0-9a-f]{40}$", re.I)
PII_CONTEXT_EXEMPTIONS = {
    "data/sources.json": {"email", "phone-like", "ip-address"},
}


def concise_output(stdout: str, stderr: str) -> str:
    text = " ".join(line.strip() for line in (stdout + "\n" + stderr).splitlines() if line.strip())
    return text[:MAX_OUTPUT_CHARS] + ("…" if len(text) > MAX_OUTPUT_CHARS else "")


def run_command(command: str) -> dict[str, Any]:
    parts = command.split()
    executable = sys.executable if parts[0] == "python" else parts[0]
    result = subprocess.run(
        [executable, *parts[1:]],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    return {
        "command": command,
        "required": True,
        "exitStatus": result.returncode,
        "outputSummary": concise_output(result.stdout, result.stderr),
    }


def duplicate_id_checks() -> dict[str, Any]:
    results, errors = {}, []
    for namespace, (relative, array_key, id_key) in NAMESPACE_COLLECTIONS.items():
        data = json.loads((ROOT / relative).read_text(encoding="utf-8"))
        values = [item.get(id_key) for item in data.get(array_key, []) if isinstance(item, dict)]
        duplicates = sorted({value for value in values if value is not None and values.count(value) > 1})
        results[namespace] = {"file": relative, "count": len(values), "duplicates": duplicates}
        if duplicates:
            errors.append(f"duplicate IDs in {namespace}: {', '.join(map(str, duplicates))}")
    return {"collections": results, "errors": errors}


def internal_path_checks() -> dict[str, Any]:
    errors, warnings, checked = [], [], 0
    markdown_paths = [ROOT / name for name in ("README.md", "AGENTS.md", "llms.txt")]
    markdown_paths.extend(sorted((ROOT / "docs").glob("*.md")))
    for path in markdown_paths:
        content = path.read_text(encoding="utf-8")
        for target in MARKDOWN_LINK.findall(content):
            if "://" in target or target.startswith("#"):
                continue
            candidate = target.split("#", 1)[0]
            if candidate:
                checked += 1
                if not (path.parent / candidate).exists() and not (ROOT / candidate).exists():
                    errors.append(f"{path.relative_to(ROOT)}: missing Markdown target {target}")
    for path in sorted((ROOT / "data").glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        stack = [("$", data)]
        while stack:
            location, value = stack.pop()
            if isinstance(value, dict):
                stack.extend((f"{location}.{key}", item) for key, item in value.items())
            elif isinstance(value, list):
                stack.extend((f"{location}[{index}]", item) for index, item in enumerate(value))
            elif isinstance(value, str) and REPO_PATH.fullmatch(value):
                checked += 1
                if not (ROOT / value).exists():
                    message = f"{path.relative_to(ROOT)}: missing metadata path at {location}: {value}"
                    if path.name == "sources.json" and ".path" in location:
                        warnings.append(message)
                    else:
                        errors.append(message)
    return {"checked": checked, "errors": errors, "warnings": warnings}


def pii_warnings(manifest: dict[str, Any]) -> dict[str, Any]:
    warnings = []
    text_suffixes = {".md", ".json", ".py", ".txt", ".js", ".html", ".css"}
    for entry in manifest["entries"]:
        relative = entry["path"]
        path = ROOT / relative
        if path.suffix not in text_suffixes:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for label, pattern in [("email", EMAIL), ("phone-like", PHONE), ("home-directory", HOME), ("ip-address", IP_ADDRESS)]:
            for match in pattern.finditer(text):
                value = match.group(0)
                if label in PII_CONTEXT_EXEMPTIONS.get(relative, set()):
                    continue
                if PUBLIC_CONTRACT_ADDRESS.fullmatch(value):
                    continue
                if any(allowed.search(value) for allowed in PII_ALLOWLIST):
                    continue
                if label == "ip-address" and value in {"0.0.0.0", "127.0.0.1"}:
                    continue
                warnings.append({"path": relative, "kind": label, "value": value})
        for literal in PII_DENYLIST:
            if literal and literal in text:
                warnings.append({"path": relative, "kind": "denylist-literal", "value": literal})
    return {
        "policy": "warning-only; scans maintained text files only; public source URLs, contract addresses, and documented examples are not PII matches",
        "allowlist": [pattern.pattern for pattern in PII_ALLOWLIST],
        "denylistLiterals": PII_DENYLIST,
        "warnings": warnings,
    }


def report_payload(command_results: list[dict[str, Any]], duplicate: dict[str, Any], links: dict[str, Any], pii: dict[str, Any]) -> dict[str, Any]:
    errors = duplicate["errors"] + links["errors"]
    failed_commands = [result["command"] for result in command_results if result["exitStatus"] != 0]
    errors.extend(f"required command failed: {command}" for command in failed_commands)
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return {
        "version": 1,
        "status": "passed" if not errors else "failed",
        "scope": "zero-network orchestration of registered local validators, generators, manifest checks, bounded duplicate IDs, internal paths, and warning-only PII scan",
        "commands": command_results,
        "counts": {
            "requiredCommandCount": len(command_results),
            "failedRequiredCommandCount": len(failed_commands),
            "duplicateNamespaceCount": len(duplicate["collections"]),
            "internalPathsChecked": links["checked"],
            "piiWarningCount": len(pii["warnings"]),
            "warningCount": len(links["warnings"]) + len(pii["warnings"]),
            "errorCount": len(errors),
            "manifestMaintainedFileCount": manifest["coverage"]["maintainedFileCount"],
            "manifestExcludedFileCount": manifest["coverage"]["excludedFileCount"],
        },
        "duplicateIdChecks": duplicate,
        "internalPathChecks": links,
        "piiScan": pii,
        "warnings": [
            *[{"path": "internal-path-check", "kind": "legacy-source-path", "value": warning} for warning in links["warnings"]],
            *pii["warnings"],
        ],
        "errors": errors,
        "skippedChecks": [
            {"check": "external URL, RPC, API, explorer, and network validation", "reason": "outside zero-network audit scope"},
            {"check": "Git-history PII scan", "reason": "explicit separate mode; not part of default audit"},
            {"check": "generic semantic contradiction detection", "reason": "no universal ontology or arbitrary semantic inference is maintained"},
        ],
    }


def main() -> int:
    if not MANIFEST_PATH.is_file():
        print("ERROR: data/kb-manifest.json is missing; run its generator first", file=sys.stderr)
        return 1
    command_results = [run_command(command) for command in REQUIRED_COMMANDS]
    duplicate = duplicate_id_checks()
    links = internal_path_checks()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    pii = pii_warnings(manifest)
    report = report_payload(command_results, duplicate, links, pii)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("MoonCat KB integrity audit")
    print(f"Status: {report['status']}")
    print(f"Required commands: {report['counts']['requiredCommandCount']} ({report['counts']['failedRequiredCommandCount']} failed)")
    print(f"Manifest: {report['counts']['manifestMaintainedFileCount']} maintained, {report['counts']['manifestExcludedFileCount']} excluded")
    print(f"Duplicate namespaces: {report['counts']['duplicateNamespaceCount']}; internal paths: {report['counts']['internalPathsChecked']}; PII warnings: {report['counts']['piiWarningCount']}")
    for error in report["errors"]:
        print(f"ERROR: {error}")
    for warning in report["warnings"][:5]:
        print(f"WARNING: {warning['path']}: {warning['kind']} {warning['value']}")
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
