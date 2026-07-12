#!/usr/bin/env python3
"""Generate the bounded, source-backed MoonCat visual-trait sample."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TRAITS_PATH = ROOT / "references/upstream/mooncatrescue/mooncat_traits.json"
LIB_PATH = ROOT / "references/upstream/mooncatrescue/libmooncat-limited.js"
PARSER_PATH = ROOT / "references/upstream/mooncatrescue/mooncatparser.js"
OUTPUT_PATH = ROOT / "data/mooncat-visual-traits.sample.json"
TARGET_ROWS = 64
ANCHORS = [0, 1, 82, 84, 95, 96, 2891, 5757, 25439]
DIRECT_FIELDS = [
    "rescueYear", "hueInt", "hueName", "pale", "facing", "expression",
    "pattern", "pose",
]
LIB_FIELD_MAP = {
    "catId": "catId",
    "rescueOrder": "rescueIndex",
    "rescueYear": "rescueYear",
    "hueInt": "hueValue",
    "hueName": "hue",
    "pale": "pale",
    "facing": "facing",
    "expression": "expression",
    "pattern": "pattern",
    "pose": "pose",
    "genesis": "genesis",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def select_rows(rows: list[dict]) -> tuple[list[dict], dict]:
    selected = set(ANCHORS)
    coverage_fields = ["hueName", "facing", "expression", "pattern", "pose", "pale"]
    coverage_hits: dict[str, dict[str, int]] = {field: {} for field in coverage_fields}

    # First occurrence is deterministic and ensures every observed enum/boolean value is represented.
    for index, row in enumerate(rows):
        for field in coverage_fields:
            value = str(row[field]).lower() if isinstance(row[field], bool) else str(row[field])
            if value not in coverage_hits[field]:
                coverage_hits[field][value] = index
                selected.add(index)

    # Fill the remaining slots with an inclusive, evenly spaced population sample.
    for position in range(TARGET_ROWS):
        selected.add(round(position * (len(rows) - 1) / (TARGET_ROWS - 1)))
        if len(selected) >= TARGET_ROWS:
            break
    if len(selected) < TARGET_ROWS:
        for index in range(len(rows)):
            selected.add(index)
            if len(selected) == TARGET_ROWS:
                break

    # Anchors and coverage can exceed the target; preserve them and deterministically trim fillers only.
    required = set(ANCHORS)
    for hits in coverage_hits.values():
        required.update(hits.values())
    fillers = sorted(selected - required)
    chosen = sorted(required | set(fillers[: max(0, TARGET_ROWS - len(required))]))
    if len(chosen) > TARGET_ROWS:
        raise ValueError(f"required representative coverage exceeds {TARGET_ROWS} rows")
    return [rows[index] for index in chosen], {
        "targetRowCount": TARGET_ROWS,
        "anchorRescueOrders": ANCHORS,
        "coverageFirstOccurrences": coverage_hits,
        "fillMethod": "inclusive evenly spaced rescue-order positions using round(position * 25439 / 63)",
        "selectedRescueOrders": chosen,
    }


def run_javascript_checks(cat_ids: list[str]) -> dict[str, dict]:
    program = r"""
global.window = {};
const lib = require(process.argv[1]);
const parser = require(process.argv[2]);
const ids = JSON.parse(process.argv[3]);
const L = window.LibMoonCat;
const out = {};
for (const id of ids) {
  const extended = L.getTraits('extended', id);
  const pixels = parser(id);
  const widths = pixels.map(row => row.length);
  out[id] = {
    parsedCatId: L.parseCatId(id),
    rescueOrderLookup: L.getRescueOrder(id),
    reverseCatIdLookup: L.getMoonCatIdByRescueIndex(L.getRescueOrder(id)),
    traits: extended,
    parser: {
      rowCount: pixels.length,
      minWidth: Math.min(...widths),
      maxWidth: Math.max(...widths),
      nonNullPixels: pixels.flat().filter(value => value !== null).length
    }
  };
}
process.stdout.write(JSON.stringify(out));
"""
    result = subprocess.run(
        ["node", "-e", program, str(LIB_PATH), str(PARSER_PATH), json.dumps(cat_ids)],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def generate() -> dict:
    rows = json.loads(TRAITS_PATH.read_text())
    if len(rows) != 25440:
        raise ValueError(f"expected 25440 upstream rows, found {len(rows)}")
    selected, selection = select_rows(rows)
    checks = run_javascript_checks([row["catId"] for row in selected])
    output_rows = []
    mismatches = []

    for source_row in selected:
        cat_id = source_row["catId"]
        rescue_order = source_row["rescueOrder"]
        check = checks[cat_id]
        traits = check["traits"]
        row_mismatches = []
        expected = {field: source_row[field] for field in DIRECT_FIELDS}
        expected["catId"] = cat_id
        expected["rescueOrder"] = rescue_order
        expected["genesis"] = source_row.get("genesis", False)
        for artifact_field, lib_field in LIB_FIELD_MAP.items():
            if expected[artifact_field] != traits.get(lib_field):
                mismatch = {
                    "catId": cat_id,
                    "rescueOrder": rescue_order,
                    "field": artifact_field,
                    "selectedValue": expected[artifact_field],
                    "selectedSourceRef": "mooncatrescue-mooncat-traits-json",
                    "comparedValue": traits.get(lib_field),
                    "comparedSourceRef": "mooncatrescue-libmooncat-limited-js",
                    "resolution": "unresolved-semantic-difference; direct snapshot value retained",
                }
                mismatches.append(mismatch)
                row_mismatches.append({"field": artifact_field, "reportIndex": len(mismatches) - 1})

        identifier_checks = {
            "arrayIndexMatchesRescueOrder": rows[rescue_order]["catId"] == cat_id,
            "libParseRoundTrip": check["parsedCatId"] == cat_id,
            "libRescueOrderLookupMatches": check["rescueOrderLookup"] == rescue_order,
            "libReverseLookupMatches": check["reverseCatIdLookup"] == cat_id,
        }
        output_rows.append({
            "catId": cat_id,
            "rescueOrder": rescue_order,
            "visualTraits": {
                "rescueYear": source_row["rescueYear"],
                "hueInt": source_row["hueInt"],
                "hueName": source_row["hueName"],
                "pale": source_row["pale"],
                "facing": source_row["facing"],
                "expression": source_row["expression"],
                "pattern": source_row["pattern"],
                "pose": source_row["pose"],
                "genesis": source_row.get("genesis", False),
            },
            "provenance": {
                "valueSourceRef": "mooncatrescue-mooncat-traits-json",
                "valueMethod": "direct except genesis=false normalized from an absent optional marker",
                "comparisonSourceRef": "mooncatrescue-libmooncat-limited-js",
            },
            "identifierChecks": identifier_checks,
            "parserCheck": {
                "sourceRef": "mooncatrescue-mooncatparser-js",
                "method": "derived renderability check only; parser output is not used as trait data",
                **check["parser"],
            },
            "mismatches": row_mismatches,
        })

    return {
        "version": 1,
        "updated": "2026-07-11",
        "status": "generated-representative-prototype",
        "scope": "Deterministic 64-row visual-trait sample; not a complete MoonCat trait dataset.",
        "primaryKey": {"field": "catId", "identifierKind": "mooncatIdBytes5"},
        "secondaryLookup": {
            "field": "rescueOrder",
            "identifierKind": "apiOriginalRescueIndex",
            "method": "direct upstream row plus array and LibMoonCat lookup checks; never arithmetically derived from catId",
        },
        "sourceRefs": [
            "mooncatrescue-mooncat-traits-json",
            "mooncatrescue-libmooncat-limited-js",
            "mooncatrescue-mooncatparser-js",
        ],
        "sourceFiles": [
            {"path": str(TRAITS_PATH.relative_to(ROOT)), "sha256": sha256(TRAITS_PATH), "role": "priority value source"},
            {"path": str(LIB_PATH.relative_to(ROOT)), "sha256": sha256(LIB_PATH), "role": "independent trait and identifier comparison"},
            {"path": str(PARSER_PATH.relative_to(ROOT)), "sha256": sha256(PARSER_PATH), "role": "bytes5 renderability check only"},
        ],
        "generation": {
            "script": "scripts/generate-visual-traits.py",
            "command": "python scripts/generate-visual-traits.py",
            "networkDependency": "none",
            "sampleSelection": selection,
        },
        "sourcePriority": [
            "Use direct fields from mooncat_traits.json for artifact values because it provides explicit per-row rescueOrder/catId alignment and the requested field vocabulary.",
            "Compare every selected row with LibMoonCat extended traits and bidirectional lookup helpers; report disagreement without overwriting either value.",
            "Use mooncatparser.js only to confirm the catId produces a non-empty pixel matrix; it supplies no selected trait values.",
            "Normalize absent optional genesis markers to false and record that normalization; do not normalize any other mismatch.",
        ],
        "fieldProvenance": {
            "catId": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "rescueOrder": {"category": "direct-and-cross-checked", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.rescueYear": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.hueInt": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.hueName": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.pale": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.facing": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.expression": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.pattern": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.pose": {"category": "direct", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "visualTraits.genesis": {"category": "direct-when-present; normalized-false-when-absent", "sourceRef": "mooncatrescue-mooncat-traits-json"},
            "identifierChecks": {"category": "derived", "sourceRef": "mooncatrescue-libmooncat-limited-js"},
            "parserCheck": {"category": "derived", "sourceRef": "mooncatrescue-mooncatparser-js"},
            "mismatches": {"category": "unresolved", "sourceRefs": ["mooncatrescue-mooncat-traits-json", "mooncatrescue-libmooncat-limited-js"]},
        },
        "mismatchReport": {
            "count": len(mismatches),
            "byField": {field: sum(item["field"] == field for item in mismatches) for field in sorted({item["field"] for item in mismatches})},
            "items": mismatches,
        },
        "rows": output_rows,
        "limitations": [
            "Only 64 representative rows are curated; the remaining population is intentionally absent.",
            "The local source snapshots have no recorded retrieval date, so upstream freshness is unresolved.",
            "No names, accessories, ownership, market data, palettes, RGB/hex values, or current chain state are included.",
            "LibMoonCat hueValue and mooncat_traits.json hueInt have different Genesis sentinel semantics; mismatches remain explicit.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if the committed artifact differs")
    args = parser.parse_args()
    rendered = json.dumps(generate(), indent=2, ensure_ascii=False) + "\n"
    if args.check:
        if not OUTPUT_PATH.exists() or OUTPUT_PATH.read_text() != rendered:
            print(f"out of date: {OUTPUT_PATH.relative_to(ROOT)}", file=sys.stderr)
            return 1
        print(f"OK: {OUTPUT_PATH.relative_to(ROOT)} is deterministic and current")
        return 0
    OUTPUT_PATH.write_text(rendered)
    print(f"wrote {OUTPUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
