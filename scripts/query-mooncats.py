#!/usr/bin/env python3
"""Query the generated MoonCat population index without network or source files."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
POPULATION_DIR = ROOT / "data/mooncat-population"
CAT_ID = re.compile(r"^0x[0-9a-fA-F]{10}$")


def load_manifest() -> dict[str, Any]:
    return json.loads((POPULATION_DIR / "manifest.json").read_text(encoding="utf-8"))


def shard_for_order(manifest: dict[str, Any], order: int) -> dict[str, Any]:
    for shard in manifest["layout"]["shards"]:
        if shard["startRescueOrder"] <= order <= shard["endRescueOrder"]:
            return shard
    raise ValueError(f"rescueOrder is outside 0..25439: {order}")


def load_shard(shard: dict[str, Any]) -> list[dict[str, Any]]:
    return json.loads((ROOT / shard["path"]).read_text(encoding="utf-8"))["rows"]


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--rescue-order", type=int)
    result.add_argument("--cat-id")
    result.add_argument("--rescue-year", type=int)
    result.add_argument("--hue-int", type=int)
    result.add_argument("--hue-name")
    result.add_argument("--color", help="Derived human-facing color key or label.")
    result.add_argument("--pale", action="store_true")
    result.add_argument("--facing")
    result.add_argument("--expression")
    result.add_argument("--pattern")
    result.add_argument("--pose")
    result.add_argument("--genesis", action="store_true")
    result.add_argument("--character-category")
    result.add_argument("--rescue-bucket")
    naming = result.add_mutually_exclusive_group()
    naming.add_argument("--named", action="store_true")
    naming.add_argument("--unnamed", action="store_true")
    result.add_argument("--name-text", help="Case-insensitive exact decoded text match; duplicate names return every match.")
    result.add_argument("--count", action="store_true")
    result.add_argument("--limit", type=int, default=50)
    result.add_argument("--json", action="store_true")
    result.add_argument("--provenance", action="store_true", help="Include manifest field provenance with JSON results.")
    return result


def matches(row: dict[str, Any], args: argparse.Namespace) -> bool:
    traits = row["traits"]
    if args.rescue_order is not None and row["rescueOrder"] != args.rescue_order: return False
    if args.cat_id and row["catId"].lower() != args.cat_id.lower(): return False
    if args.rescue_year is not None and traits["rescueYear"] != args.rescue_year: return False
    if args.hue_int is not None and traits["hueInt"] != args.hue_int: return False
    if args.hue_name and traits["hueName"].lower() != args.hue_name.lower(): return False
    if args.color and args.color.lower() not in {row["color"]["key"].lower(), row["color"]["label"].lower()}: return False
    if args.pale and traits["pale"] is not True: return False
    for field in ("facing", "expression", "pattern", "pose"):
        value = getattr(args, field)
        if value and traits[field].lower() != value.lower(): return False
    if args.genesis and row["genesis"] is not True: return False
    if args.character_category and args.character_category not in row["characterCategories"]: return False
    if args.rescue_bucket and args.rescue_bucket not in row["rescueBuckets"]: return False
    if args.named and row["name"] is None: return False
    if args.unnamed and row["name"] is not None: return False
    if args.name_text:
        if row["name"] is None or str(row["name"].get("text", "")).casefold() != args.name_text.casefold(): return False
    return True


def main() -> int:
    args = parser().parse_args()
    if args.limit < 1:
        raise ValueError("--limit must be positive")
    if args.rescue_order is not None and not 0 <= args.rescue_order < 25_440:
        raise ValueError("--rescue-order must be 0..25439")
    if args.cat_id and not CAT_ID.fullmatch(args.cat_id):
        raise ValueError("--cat-id must be 0x-prefixed bytes5 hex")
    manifest = load_manifest()
    if args.rescue_order is not None:
        shards = [shard_for_order(manifest, args.rescue_order)]
    else:
        shards = manifest["layout"]["shards"]
    matched: list[dict[str, Any]] = []
    total = 0
    for shard in shards:
        for row in load_shard(shard):
            if matches(row, args):
                total += 1
                if len(matched) < args.limit:
                    matched.append(row)
    if args.count:
        if args.json:
            print(json.dumps({"count": total}))
        else:
            print(total)
        return 0
    if args.json:
        payload: dict[str, Any] = {"count": total, "returned": len(matched), "results": matched}
        if args.provenance:
            payload["fieldProvenance"] = manifest["fieldProvenance"]
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return 0
    print(f"Matched {total}; showing {len(matched)}")
    for row in matched:
        traits = row["traits"]
        name = row["name"]
        display_name = name.get("text") if name else None
        print(
            f"#{row['rescueOrder']} {row['catId']} | {traits['rescueYear']} "
            f"{row['color']['label']} {traits['pattern']} {traits['pose']} | "
            f"name={display_name!r} genesis={row['genesis']} characters={','.join(row['characterCategories']) or '-'}"
        )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
