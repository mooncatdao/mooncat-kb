#!/usr/bin/env python3
"""Run deterministic, zero-network identifier conversion fixtures."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "data/identifier-conversion-cases.json"
SOURCES = ROOT / "data/sources.json"
TRAITS = ROOT / "references/upstream/mooncatrescue/mooncat_traits.json"
CAT_ID = re.compile(r"^0x[0-9a-fA-F]{10}$")
RESCUE_MAX = 25439


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def normalize_cat_id(value: object) -> str | None:
    if not isinstance(value, str) or not CAT_ID.fullmatch(value):
        return None
    return value.lower()


def run_libmooncat(orders: list[int], cat_ids: list[str]) -> dict:
    program = r"""
global.window = {};
require(process.argv[1]);
const L = window.LibMoonCat;
const payload = JSON.parse(process.argv[2]);
const out = {orders: {}, catIds: {}, parser: {}};
for (const order of payload.orders) {
  out.orders[String(order)] = {
    byIndex: L.getMoonCatIdByRescueIndex(order),
    byCatId: (() => { try { return L.getCatId(order); } catch (e) { return `THROW:${e.message}`; } })()
  };
}
for (const id of payload.catIds) {
  out.catIds[id] = {
    rescueOrder: L.getRescueOrder(id),
    parsed: L.parseCatId(id)
  };
}
process.stdout.write(JSON.stringify(out));
"""
    result = subprocess.run(
        ["node", "-e", program, str(ROOT / "references/upstream/mooncatrescue/libmooncat-limited.js"), json.dumps({"orders": orders, "catIds": cat_ids})],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def main() -> int:
    data = json.loads(FIXTURES.read_text())
    source_ids = {item["id"] for item in json.loads(SOURCES.read_text())["sources"]}
    if data.get("version") != 1:
        fail("fixture version must be 1")
    if not set(data.get("sourceRefs", [])) <= source_ids:
        fail("fixture root has unresolved sourceRefs")
    definitions = data.get("conversionDefinitions", {})
    for name, definition in definitions.items():
        if not definition.get("inputType") or not definition.get("outputType"):
            fail(f"conversion definition {name} lacks explicit input/output types")
        if definition.get("reversibility") not in {"bijective-for-known-rescued-fixture-domain", "contextual-one-step-then-bijective-lookup", "contextual-identity-for-exact-contract", "contextual-mapping-backed", "unsupported"}:
            fail(f"conversion definition {name} has invalid reversibility classification")
        if not set(definition.get("sourceRefs", [])) <= source_ids:
            fail(f"conversion definition {name} has unresolved sourceRefs")
    cases = data.get("cases", [])
    if not cases:
        fail("fixture set is empty")
    case_ids = set()
    for case in cases:
        if case["id"] in case_ids:
            fail(f"duplicate fixture id {case['id']}")
        case_ids.add(case["id"])
        if case["conversion"] not in definitions:
            fail(f"{case['id']} references unknown conversion")
        if not set(case.get("sourceRefs", [])) <= source_ids:
            fail(f"{case['id']} has unresolved sourceRefs")
        if case["input"]["type"] not in data["typeDefinitions"]:
            fail(f"{case['id']} has an unregistered input type")
        expected_status = case["expected"]["status"]
        if expected_status not in {"success", "rejected", "unsupported"}:
            fail(f"{case['id']} has invalid expected status")

    rows = json.loads(TRAITS.read_text())
    by_order = {row["rescueOrder"]: row["catId"] for row in rows}
    by_cat_id = {row["catId"]: row["rescueOrder"] for row in rows}
    orders = sorted({case["input"]["value"] for case in cases if case["conversion"] in {"rescueOrder_to_catIdBytes5", "acclimatedTokenId_to_catIdBytes5"} and isinstance(case["input"]["value"], int) and not isinstance(case["input"]["value"], bool) and 0 <= case["input"]["value"] <= RESCUE_MAX})
    normalized_id_values = {
        normalized
        for case in cases
        if (normalized := normalize_cat_id(case["input"]["value"])) is not None
    }
    normalized_id_values.update(
        expected["value"]
        for case in cases
        for expected in [case["expected"]]
        if expected.get("status") == "success" and normalize_cat_id(expected.get("value")) is not None
    )
    normalized_ids = sorted(normalized_id_values)
    lib = run_libmooncat(orders, normalized_ids)
    positive_round_trips = 0
    negative_cases = 0
    unsupported_cases = 0
    seen_types = set()
    for case in cases:
        input_value = case["input"]["value"]
        input_type = case["input"]["type"]
        conversion = case["conversion"]
        expected = case["expected"]
        seen_types.add(input_type)
        if expected["status"] != "success":
            if expected["status"] == "rejected":
                if conversion == "rescueOrder_to_catIdBytes5":
                    valid_order = isinstance(input_value, int) and not isinstance(input_value, bool) and 0 <= input_value <= RESCUE_MAX
                    if valid_order:
                        fail(f"{case['id']} rejects an in-range rescueOrder")
                elif conversion == "catIdBytes5_to_rescueOrder":
                    normalized = normalize_cat_id(input_value)
                    if normalized is not None and lib["catIds"].get(normalized, {}).get("rescueOrder") is not None:
                        fail(f"{case['id']} rejects a known catIdBytes5")
                    if normalized is not None and normalized not in lib["catIds"]:
                        fail(f"{case['id']} was not included in the LibMoonCat negative probe")
                negative_cases += 1
            else:
                if conversion not in {"wmcrTokenId_to_catIdBytes5", "wmcrTokenId_to_rescueOrder", "nonMoonCatIdentity_to_catIdBytes5"}:
                    fail(f"{case['id']} marks an unregistered conversion unsupported")
                unsupported_cases += 1
            continue
        if conversion == "rescueOrder_to_catIdBytes5":
            if input_type != "rescueOrder" or isinstance(input_value, bool) or not isinstance(input_value, int) or not 0 <= input_value <= RESCUE_MAX:
                fail(f"{case['id']} successful rescueOrder fixture has invalid input")
            actual = lib["orders"][str(input_value)]["byIndex"]
            if actual != expected["value"] or lib["orders"][str(input_value)]["byCatId"] != expected["value"] or by_order.get(input_value) != expected["value"]:
                fail(f"{case['id']} does not agree across LibMoonCat and trait snapshot")
            if case.get("roundTrip"):
                if by_cat_id.get(actual) != input_value or lib["catIds"][actual]["rescueOrder"] != input_value:
                    fail(f"{case['id']} rescueOrder/catId round trip failed")
                positive_round_trips += 1
        elif conversion == "catIdBytes5_to_rescueOrder":
            normalized = normalize_cat_id(input_value)
            if normalized is None:
                fail(f"{case['id']} successful catId fixture violates strict format")
            if normalized != expected.get("normalizedValue") or lib["catIds"][normalized]["parsed"] != normalized:
                fail(f"{case['id']} normalization does not match parseCatId")
            actual = lib["catIds"][normalized]["rescueOrder"]
            if actual != expected["value"] or by_cat_id.get(normalized) != expected["value"]:
                fail(f"{case['id']} reverse lookup does not match trait snapshot")
            if case.get("roundTrip") and lib["orders"][str(actual)]["byIndex"] != normalized:
                fail(f"{case['id']} catId/rescueOrder round trip failed")
            positive_round_trips += 1
        elif conversion == "acclimatedTokenId_to_catIdBytes5":
            if input_type != "acclimatedTokenId" or isinstance(input_value, bool) or not isinstance(input_value, int) or not 0 <= input_value <= RESCUE_MAX:
                fail(f"{case['id']} successful Acclimated fixture has invalid input")
            actual = lib["orders"][str(input_value)]["byIndex"]
            if actual != expected["value"] or expected.get("equivalentRescueOrder") != input_value or by_order.get(input_value) != expected["value"]:
                fail(f"{case['id']} Acclimated identity equivalence failed")
            if case.get("roundTrip"):
                positive_round_trips += 1
        elif conversion == "acclimatedTokenId_to_rescueOrder":
            if input_type != "acclimatedTokenId" or input_value != expected["value"] or input_value < 0 or input_value > RESCUE_MAX:
                fail(f"{case['id']} Acclimated tokenId equivalence failed")
        else:
            fail(f"{case['id']} has unsupported successful conversion implementation")

    required_types = {"rescueOrder", "catIdBytes5", "acclimatedTokenId", "wmcrTokenId", "accessoryId", "paletteIndex", "ownedAccessoryIndex", "managedAccessoryIndex", "batchOwnedAccessoryIndex", "marketplaceUrlIdentifier"}
    if not required_types <= seen_types:
        fail(f"fixture set misses identifier types: {sorted(required_types - seen_types)}")
    if positive_round_trips < 12 or negative_cases < 8 or unsupported_cases < 7:
        fail("fixture coverage is below the required representative positive/negative/unsupported threshold")
    print(f"OK: {len(cases)} fixtures, {positive_round_trips} round trips, {negative_cases} negative cases, {unsupported_cases} unsupported boundaries; sourceRefs and LibMoonCat/trait cross-checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
