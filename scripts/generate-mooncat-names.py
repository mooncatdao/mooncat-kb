#!/usr/bin/env python3
"""Generate the checked-in MoonCat naming snapshot from the local trait reference."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "references/upstream/mooncatrescue/mooncat_traits.json"
OUTPUT_PATH = ROOT / "data/mooncat-names.json"
SOURCE_REF = "mooncatrescue-mooncat-traits-json"
ARTIFACT_SOURCE_REF = "mooncat-kb-mooncat-names-snapshot"
NAME_FIELDS = ("nameRaw", "name", "namedOrder", "namedYear")


def naming_rows(source_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Select and preserve the name-bearing source rows without decoding anew."""
    records: list[dict[str, Any]] = []
    for row in source_rows:
        present = [field in row for field in NAME_FIELDS]
        if not any(present):
            continue
        if not all(present):
            raise ValueError(f"partial naming fields for {row.get('catId', '<unknown catId>')}")
        name = row["name"]
        if isinstance(name, str):
            record: dict[str, Any] = {
                "rescueOrder": row["rescueOrder"],
                "catId": row["catId"],
                "nameRaw": row["nameRaw"],
                "decodedName": name,
                "decodeStatus": "utf8-string-from-source",
                "namedOrder": row["namedOrder"],
                "namedYear": row["namedYear"],
            }
        elif isinstance(name, bool):
            record = {
                "rescueOrder": row["rescueOrder"],
                "catId": row["catId"],
                "nameRaw": row["nameRaw"],
                "decodedName": None,
                "decodeStatus": "invalid-or-unparsed-marker-from-source",
                "sourceNameMarker": name,
                "namedOrder": row["namedOrder"],
                "namedYear": row["namedYear"],
            }
        else:
            raise ValueError(f"unsupported name value for {row.get('catId', '<unknown catId>')}")
        records.append(record)
    return sorted(records, key=lambda record: (record["namedOrder"], record["rescueOrder"]))


def payload() -> dict[str, Any]:
    source_rows = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    if not isinstance(source_rows, list):
        raise ValueError("mooncat_traits.json must be a top-level array")
    records = naming_rows(source_rows)
    parsed = sum(record["decodeStatus"] == "utf8-string-from-source" for record in records)
    invalid = sum(record["decodeStatus"] == "invalid-or-unparsed-marker-from-source" for record in records)
    return {
        "schemaVersion": 1,
        "status": "checked-in-source-snapshot-not-current-chain-truth",
        "source": {
            "sourceRef": SOURCE_REF,
            "artifactSourceRef": ARTIFACT_SOURCE_REF,
            "path": "references/upstream/mooncatrescue/mooncat_traits.json",
            "sourceRowCount": len(source_rows),
            "selection": "Rows containing nameRaw, name, namedOrder, and namedYear.",
        },
        "ordering": "ascending namedOrder, then rescueOrder",
        "counts": {
            "nameBearingRows": len(records),
            "parsedUtf8StringRows": parsed,
            "invalidOrUnparsedMarkerRows": invalid,
        },
        "recordFields": {
            "nameRaw": "Exact source bytes32 hex; retained even when no display string is available.",
            "decodedName": "Exact source string when present; null for source boolean markers.",
            "decodeStatus": "Source-derived display/decode classification, not a fresh byte decoder.",
        },
        "limitations": [
            "This deterministic artifact reflects a checked-in source snapshot, not current contract storage or a complete CatNamed event history.",
            "Raw bytes32 values are retained; invalid or unparsed source markers are not normalized into replacement-character strings.",
            "The snapshot does not establish current ownership, active adoption offers, current display moderation, or live named counts.",
        ],
        "records": records,
    }


def render() -> str:
    return json.dumps(payload(), ensure_ascii=False, indent=2) + "\n"


def main(argv: list[str]) -> int:
    if argv not in ([], ["--check"]):
        print("usage: generate-mooncat-names.py [--check]", file=sys.stderr)
        return 2
    expected = render()
    if argv == ["--check"]:
        actual = OUTPUT_PATH.read_text(encoding="utf-8") if OUTPUT_PATH.is_file() else ""
        if actual != expected:
            print("ERROR: data/mooncat-names.json is not current; run python scripts/generate-mooncat-names.py", file=sys.stderr)
            return 1
        print("OK: data/mooncat-names.json is deterministic and current")
        return 0
    OUTPUT_PATH.write_text(expected, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
