#!/usr/bin/env python3
"""Validate the generated MoonCat visual-trait sample without network access."""

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "data/mooncat-visual-traits.sample.json"
SOURCES = ROOT / "data/sources.json"
COLOR_POLICY = ROOT / "data/color-classification.json"
CAT_ID = re.compile(r"^0x[0-9a-f]{10}$")
ENUMS = {
    "facing": {"left", "right"},
    "expression": {"grumpy", "pouting", "shy", "smiling"},
    "pattern": {"pure", "spotted", "tabby", "tortie"},
    "pose": {"pouncing", "sleeping", "stalking", "standing"},
}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    data = json.loads(ARTIFACT.read_text())
    policy = json.loads(COLOR_POLICY.read_text())
    source_ids = {item["id"] for item in json.loads(SOURCES.read_text())["sources"]}
    if len(data.get("rows", [])) != 64:
        fail("sample must contain exactly 64 rows")
    if not set(data["sourceRefs"]) <= source_ids:
        fail("artifact has unresolved sourceRefs")
    cat_ids, orders = set(), set()
    mismatch_links = 0
    coverage = {key: set() for key in ENUMS}
    coverage.update({"pale": set(), "genesis": set()})
    color_kinds, color_buckets, special_categories = set(), set(), set()
    for row in data["rows"]:
        cat_id, order = row["catId"], row["rescueOrder"]
        if not CAT_ID.fullmatch(cat_id) or cat_id in cat_ids:
            fail(f"invalid or duplicate catId: {cat_id}")
        if not isinstance(order, int) or not 0 <= order < 25440 or order in orders:
            fail(f"invalid or duplicate rescueOrder: {order}")
        cat_ids.add(cat_id); orders.add(order)
        traits = row["visualTraits"]
        for field, allowed in ENUMS.items():
            if traits.get(field) not in allowed:
                fail(f"invalid {field} for {cat_id}")
            coverage[field].add(traits[field])
        for field in ("pale", "genesis"):
            if not isinstance(traits.get(field), bool):
                fail(f"{field} must be boolean for {cat_id}")
            coverage[field].add(traits[field])
        if not isinstance(traits.get("hueInt"), int) or not isinstance(traits.get("hueName"), str):
            fail(f"invalid hue fields for {cat_id}")
        classification = row.get("colorClassification")
        if not isinstance(classification, dict):
            fail(f"missing colorClassification for {cat_id}")
        if classification.get("schemeId") != policy["scheme"]["id"] or classification.get("schemeVersion") != policy["scheme"]["version"]:
            fail(f"wrong color classification scheme for {cat_id}")
        if classification.get("modifiers", {}).get("pale") is not traits["pale"] or classification.get("modifiers", {}).get("genesis") is not traits["genesis"]:
            fail(f"color modifiers do not preserve raw fields for {cat_id}")
        if classification.get("modifiers", {}).get("paletteOrientation") != "not-classified":
            fail(f"color classification overclaims palette orientation for {cat_id}")
        color_kinds.add(classification.get("kind"))
        if classification.get("baseBucket"):
            color_buckets.add(classification["baseBucket"])
        if classification.get("specialCategory"):
            special_categories.add(classification["specialCategory"])
        if not all(row["identifierChecks"].values()):
            fail(f"identifier round trip failed for {cat_id}")
        parser_check = row["parserCheck"]
        if parser_check["rowCount"] <= 0 or parser_check["nonNullPixels"] <= 0:
            fail(f"parser did not produce pixels for {cat_id}")
        for link in row["mismatches"]:
            index = link["reportIndex"]
            if index >= len(data["mismatchReport"]["items"]):
                fail(f"invalid mismatch link for {cat_id}")
            item = data["mismatchReport"]["items"][index]
            if item["catId"] != cat_id or item["field"] != link["field"]:
                fail(f"mismatch link does not match report for {cat_id}")
            mismatch_links += 1
    for field, allowed in ENUMS.items():
        if coverage[field] != allowed:
            fail(f"sample does not cover all {field} values")
    if coverage["pale"] != {False, True} or coverage["genesis"] != {False, True}:
        fail("sample does not cover pale and genesis boolean edges")
    expected_buckets = {bucket["key"] for bucket in policy["normalHueClassification"]["buckets"]}
    if color_buckets != expected_buckets or color_kinds != {"circular-hue", "genesis-special"}:
        fail("sample does not cover all selected normal buckets and Genesis classification kinds")
    if special_categories != {"genesis-black", "genesis-white"}:
        fail("sample does not cover both Genesis sentinel categories")
    report = data["mismatchReport"]
    if report["count"] != len(report["items"]) or report["count"] != mismatch_links:
        fail("mismatch counts are inconsistent")
    print(f"OK: 64 rows, {report['count']} explicit mismatches, identifier and color coverage checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
