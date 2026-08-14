#!/usr/bin/env python3
"""Generate or check compact full-population MoonCat render artifacts."""

from __future__ import annotations

import argparse
import os
import tempfile
from pathlib import Path

from mooncat_render_lib import RENDER_DIR, RenderArtifactError, build_render_artifacts


def atomic_write(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=f".{path.name}.", delete=False) as handle:
        handle.write(content)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail when committed artifacts differ")
    args = parser.parse_args()
    artifacts = build_render_artifacts()
    expected_paths = {RENDER_DIR / relative for relative in artifacts}
    existing = {path for path in RENDER_DIR.rglob("*.json")} if RENDER_DIR.is_dir() else set()
    unexpected = sorted(path.relative_to(RENDER_DIR).as_posix() for path in existing - expected_paths)
    if args.check:
        changed = [
            relative for relative, content in artifacts.items()
            if not (RENDER_DIR / relative).is_file() or (RENDER_DIR / relative).read_bytes() != content
        ]
        if changed or unexpected:
            if changed:
                print("out of date: " + ", ".join(changed))
            if unexpected:
                print("unexpected generated artifacts: " + ", ".join(unexpected))
            return 1
        print(f"OK: {len(artifacts) - 1} render shards plus manifest are deterministic and current")
        return 0
    if unexpected:
        raise RenderArtifactError(f"refusing to leave or delete unexpected generated artifacts: {unexpected}")
    for relative, content in artifacts.items():
        atomic_write(RENDER_DIR / relative, content)
    total = sum(len(content) for content in artifacts.values())
    print(f"Wrote {len(artifacts) - 1} render shards plus manifest ({total} bytes)")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RenderArtifactError as exc:
        print(f"ERROR: {exc}")
        raise SystemExit(1)
