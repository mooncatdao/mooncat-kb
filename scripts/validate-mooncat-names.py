#!/usr/bin/env python3
"""Validate the deterministic MoonCat naming snapshot and its source boundary."""

from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "references/upstream/mooncatrescue/mooncat_traits.json"
OUTPUT_PATH = ROOT / "data/mooncat-names.json"
SOURCES_PATH = ROOT / "data/sources.json"
CAT_ID = re.compile(r"0x[0-9a-f]{10}$")
BYTES32 = re.compile(r"0x[0-9a-f]{64}$")


def load_generator() -> Any:
    sys.dont_write_bytecode = True
    path = ROOT / "scripts/generate-mooncat-names.py"
    spec = importlib.util.spec_from_file_location("generate_mooncat_names", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("could not load generator")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    errors: list[str] = []
    try:
        source_rows = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
        snapshot = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
        sources = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))["sources"]
        generator = load_generator()
    except (OSError, json.JSONDecodeError, KeyError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    if not isinstance(source_rows, list) or len(source_rows) != 25440:
        errors.append("source must contain exactly 25,440 rows")
    if snapshot.get("schemaVersion") != 1:
        errors.append("snapshot schemaVersion must be 1")
    if snapshot.get("status") != "checked-in-source-snapshot-not-current-chain-truth":
        errors.append("snapshot status must preserve the source-snapshot boundary")
    source_meta = snapshot.get("source", {})
    if source_meta.get("sourceRowCount") != 25440:
        errors.append("snapshot sourceRowCount must be 25,440")
    source_ids = {entry.get("id") for entry in sources if isinstance(entry, dict)}
    for ref in (source_meta.get("sourceRef"), source_meta.get("artifactSourceRef")):
        if ref not in source_ids:
            errors.append(f"unresolved sourceRef: {ref!r}")

    records = snapshot.get("records")
    if not isinstance(records, list) or len(records) != 1225:
        errors.append("snapshot must contain exactly 1,225 naming records")
        records = []
    counts = snapshot.get("counts", {})
    expected_counts = {
        "nameBearingRows": 1225,
        "parsedUtf8StringRows": 1207,
        "invalidOrUnparsedMarkerRows": 18,
    }
    if counts != expected_counts:
        errors.append("snapshot counts must be 1,225 rows, 1,207 strings, and 18 markers")

    cat_ids, rescue_orders, named_orders = set(), set(), set()
    parsed = invalid = 0
    source_by_cat = {row.get("catId"): row for row in source_rows if isinstance(row, dict) and "nameRaw" in row}
    for record in records:
        if not isinstance(record, dict):
            errors.append("every record must be an object")
            continue
        cat_id = record.get("catId")
        name_raw = record.get("nameRaw")
        rescue_order = record.get("rescueOrder")
        named_order = record.get("namedOrder")
        if not isinstance(cat_id, str) or not CAT_ID.fullmatch(cat_id): errors.append(f"invalid catId: {cat_id!r}")
        if not isinstance(name_raw, str) or not BYTES32.fullmatch(name_raw): errors.append(f"invalid nameRaw for {cat_id!r}")
        if not isinstance(rescue_order, int) or not 0 <= rescue_order < 25440: errors.append(f"invalid rescueOrder for {cat_id!r}")
        if not isinstance(named_order, int) or named_order < 0: errors.append(f"invalid namedOrder for {cat_id!r}")
        for value, seen, label in ((cat_id, cat_ids, "catId"), (rescue_order, rescue_orders, "rescueOrder"), (named_order, named_orders, "namedOrder")):
            if value in seen: errors.append(f"duplicate {label}: {value!r}")
            seen.add(value)
        source = source_by_cat.get(cat_id)
        if source is None:
            errors.append(f"record {cat_id!r} is absent from source naming rows")
            continue
        for key in ("rescueOrder", "catId", "nameRaw", "namedOrder", "namedYear"):
            if record.get(key) != source.get(key): errors.append(f"{cat_id}: {key} differs from source")
        if isinstance(source.get("name"), str):
            parsed += 1
            if record.get("decodedName") != source["name"] or record.get("decodeStatus") != "utf8-string-from-source" or "sourceNameMarker" in record:
                errors.append(f"{cat_id}: parsed name representation differs from source")
        elif isinstance(source.get("name"), bool):
            invalid += 1
            if record.get("decodedName") is not None or record.get("decodeStatus") != "invalid-or-unparsed-marker-from-source" or record.get("sourceNameMarker") is not source["name"]:
                errors.append(f"{cat_id}: marker representation differs from source")
        else:
            errors.append(f"{cat_id}: unsupported source name type")
    if (parsed, invalid) != (1207, 18): errors.append("record decode-status totals must be 1,207 parsed and 18 markers")
    if records != sorted(records, key=lambda record: (record["namedOrder"], record["rescueOrder"])):
        errors.append("records must be ordered by namedOrder, then rescueOrder")
    if OUTPUT_PATH.read_text(encoding="utf-8") != generator.render():
        errors.append("committed snapshot differs from deterministic generator output")
    if errors:
        for error in errors: print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("OK: 1,225 naming rows, 1,207 parsed strings, 18 markers, raw-byte and source checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
