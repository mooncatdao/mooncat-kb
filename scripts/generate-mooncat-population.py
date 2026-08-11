#!/usr/bin/env python3
"""Generate or check the deterministic full MoonCat population index."""

from __future__ import annotations

import argparse
import os
import tempfile
from pathlib import Path

from mooncat_population_lib import POPULATION_DIR, PopulationError, build_population_artifacts


def atomic_write(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=f".{path.name}.", delete=False) as handle:
        handle.write(content)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Rebuild in memory and fail if committed artifacts differ.")
    args = parser.parse_args()
    artifacts = build_population_artifacts()
    expected_paths = {POPULATION_DIR / relative for relative in artifacts}
    if args.check:
        changed = []
        for relative, content in artifacts.items():
            path = POPULATION_DIR / relative
            if not path.is_file() or path.read_bytes() != content:
                changed.append(relative)
        existing = {path for path in POPULATION_DIR.rglob("*.json")} if POPULATION_DIR.is_dir() else set()
        unexpected = sorted(path.relative_to(POPULATION_DIR).as_posix() for path in existing - expected_paths)
        if changed or unexpected:
            if changed:
                print("out of date: " + ", ".join(changed))
            if unexpected:
                print("unexpected generated artifacts: " + ", ".join(unexpected))
            return 1
        print(f"OK: {len(artifacts) - 2} shards plus manifest/report are deterministic and current")
        return 0
    existing = {path for path in POPULATION_DIR.rglob("*.json")} if POPULATION_DIR.is_dir() else set()
    unexpected = sorted(path.relative_to(POPULATION_DIR).as_posix() for path in existing - expected_paths)
    if unexpected:
        raise PopulationError(f"refusing to leave or delete unexpected generated artifacts: {unexpected}")
    for relative, content in artifacts.items():
        atomic_write(POPULATION_DIR / relative, content)
    total = sum(len(content) for content in artifacts.values())
    print(f"Wrote {len(artifacts) - 2} shards plus manifest/report ({total} bytes)")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PopulationError as exc:
        print(f"ERROR: {exc}")
        raise SystemExit(1)
