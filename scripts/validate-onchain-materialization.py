#!/usr/bin/env python3
"""Zero-network integrity validator for pinned MoonCat materialization evidence."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

from onchain_materialization_lib import (
    ADDRESS,
    CAT_ID,
    HASH32,
    POPULATION_COUNT,
    ROOT,
    MaterializationError,
    compare_structures,
    decode_render_structure,
    json_bytes,
    read_json,
    rgb_triplets,
    self_test,
    sha256_bytes,
    summarize_check_accounting,
    summarize_structural_geometry,
)


OUTPUT_ROOT = ROOT / "data/onchain-materialization"
MANIFEST_PATH = OUTPUT_ROOT / "manifest.json"
CHECKPOINT_PATH = OUTPUT_ROOT / "checkpoint.json"
SHA256 = re.compile(r"^[0-9a-f]{64}$")
HEX_QUANTITY = re.compile(r"^0x(?:0|[1-9a-f][0-9a-f]*)$")
CORE_KEYS = {
    "mooncatRescue", "acclimatedMoonCats", "mooncatReference", "mooncatTraits",
    "mooncatColors", "mooncatSVGs", "mooncatAccessories", "mooncatAccessoryImages",
}
TRAIT_FIELDS = ["genesis", "pale", "facing", "expression", "pattern", "pose"]


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--allow-missing", action="store_true", help="Validate helper logic but report an explicit skip when no network snapshot is committed.")
    parser.add_argument("--self-test", action="store_true", help="Run only dependency-free ABI/hash helper tests.")
    return parser.parse_args()


def load_population_and_renders() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    population_manifest = read_json(ROOT / "data/mooncat-population/manifest.json")
    render_manifest = read_json(ROOT / "data/mooncat-renders/manifest.json")
    population, renders = [], []
    for shard in population_manifest["layout"]["shards"]:
        population.extend(read_json(ROOT / shard["path"])["rows"])
    for shard in render_manifest["layout"]["shards"]:
        renders.extend(read_json(ROOT / shard["path"])["rows"])
    if len(population) != POPULATION_COUNT or len(renders) != POPULATION_COUNT:
        fail("local population/render inputs are incomplete")
    for order, (row, render) in enumerate(zip(population, renders)):
        if row.get("rescueOrder") != order or render.get("rescueOrder") != order or row.get("catId") != render.get("catId"):
            fail(f"local population/render identity mismatch at rescueOrder {order}")
    return population, renders


def require_hash(value: Any, label: str) -> None:
    if not isinstance(value, str) or not SHA256.fullmatch(value):
        fail(f"invalid SHA-256 for {label}")


def validate_file_record(record: dict[str, Any], label: str, *, generated: bool = False) -> Path:
    relative = record.get("path")
    if not isinstance(relative, str) or not relative or relative.startswith(("/", "~")):
        fail(f"invalid path for {label}")
    path = (ROOT / relative).resolve()
    try:
        path.relative_to(ROOT.resolve())
    except ValueError:
        fail(f"path escapes repository for {label}: {relative}")
    if generated:
        try:
            path.relative_to(OUTPUT_ROOT.resolve())
        except ValueError:
            fail(f"generated evidence path is outside data/onchain-materialization: {relative}")
    if not path.is_file():
        fail(f"missing file for {label}: {relative}")
    content = path.read_bytes()
    require_hash(record.get("sha256"), label)
    if record["sha256"] != sha256_bytes(content) or record.get("bytes") != len(content):
        fail(f"hash/size drift for {label}: {relative}")
    if generated:
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            fail(f"generated file is not JSON for {label}: {exc}")
        if content != json_bytes(parsed):
            fail(f"generated JSON is not stable pretty-printed serialization: {relative}")
    return path


def expected_traits(local: dict[str, Any], labels: dict[str, list[str]]) -> list[Any]:
    traits = local["traits"]
    values: list[Any] = [local["genesis"], traits["pale"]]
    for field in ("facing", "expression", "pattern", "pose"):
        options = [value.casefold() for value in labels[field]]
        if traits[field].casefold() not in options:
            fail(f"local {field} label is absent from pinned trait table at rescueOrder {local['rescueOrder']}")
        values.append(options.index(traits[field].casefold()))
    return values


def validate_normalization(value: dict[str, Any], label: str) -> None:
    if value.get("status") not in {
        "cell-normalized", "incomparable-invalid-xml", "incomparable-missing-viewbox",
        "incomparable-invalid-viewbox", "incomparable-missing-square-cell-definition",
        "incomparable-nonintegral-logical-dimensions", "incomparable-unsupported-svg-geometry",
        "incomparable-overlapping-cells",
    }:
        fail(f"invalid SVG normalization status for {label}")
    if not isinstance(value.get("utf8Bytes"), int) or value["utf8Bytes"] <= 0:
        fail(f"invalid SVG byte length for {label}")
    require_hash(value.get("sha256"), f"{label} SVG")
    require_hash(value.get("keccak256"), f"{label} SVG Keccak")
    if value["status"] == "cell-normalized":
        for key in ("occupiedCoordinateSha256", "colorPartitionSha256"):
            require_hash(value.get(key), f"{label} {key}")
        if value.get("occupiedCellCount", 0) <= 0 or value.get("distinctColorCount", 0) <= 0:
            fail(f"empty cell normalization for {label}")
        logical = value.get("logicalDimensions")
        view_logical = value.get("viewBoxLogicalDimensions")
        margins = value.get("transparentMargins", {})
        if (
            not isinstance(logical, list) or len(logical) != 2
            or not all(isinstance(item, int) and item > 0 for item in logical)
            or not isinstance(view_logical, list) or len(view_logical) != 2
            or not all(isinstance(item, int) and item > 0 for item in view_logical)
            or set(margins) != {"left", "right", "top", "bottom"}
            or not all(isinstance(item, int) and item >= 0 for item in margins.values())
        ):
            fail(f"invalid SVG logical dimensions/margins for {label}")
        if logical[0] + margins["left"] + margins["right"] != view_logical[0] or logical[1] + margins["top"] + margins["bottom"] != view_logical[1]:
            fail(f"SVG tight bounds do not reconcile to the viewBox for {label}")
        if value.get("normalizationOrigin") != [margins["left"], margins["top"]]:
            fail(f"SVG normalization origin does not match transparent margins for {label}")
        if value.get("paintWriteCount", 0) - value.get("overdrawWriteCount", 0) != value["occupiedCellCount"]:
            fail(f"SVG paint/overdraw counts do not reconcile for {label}")
        used_colors = value.get("usedHexColors")
        if not isinstance(used_colors, list) or not used_colors or any(not re.fullmatch(r"#[0-9a-f]{6}", color) for color in used_colors):
            fail(f"invalid normalized SVG colors for {label}")


def equal_output(left: dict[str, Any], right: dict[str, Any]) -> bool:
    return left.get("utf8Bytes") == right.get("utf8Bytes") and left.get("sha256") == right.get("sha256")


def expected_default_match(default: dict[str, Any], false: dict[str, Any], true: dict[str, Any]) -> str:
    if equal_output(default, true):
        return "true"
    if equal_output(default, false):
        return "false"
    return "neither"


def validate_representative_row(
    row: dict[str, Any],
    local: dict[str, Any],
    render: dict[str, Any],
    labels: dict[str, list[str]],
    acclimator: str,
) -> None:
    order, cat_id = row.get("rescueOrder"), row.get("catId")
    if order != local["rescueOrder"] or cat_id != local["catId"] or not CAT_ID.fullmatch(cat_id or ""):
        fail(f"representative identity mismatch at rescueOrder {local['rescueOrder']}")
    traits = row.get("traits", {})
    by_cat = [traits.get("bytes5", {}).get(field) for field in TRAIT_FIELDS]
    by_order = [traits.get("rescueOrder", {}).get(field) for field in TRAIT_FIELDS]
    stored_expected = [traits.get("localExpected", {}).get(field) for field in TRAIT_FIELDS]
    expected = expected_traits(local, labels)
    if stored_expected != expected:
        fail(f"stored local trait expectation drift at rescueOrder {order}")
    colors = row.get("colors", {})
    colors_cat, colors_order = colors.get("colorsOfBytes5"), colors.get("colorsOfRescueOrder")
    if not isinstance(colors_cat, list) or len(colors_cat) != 24 or any(not isinstance(value, int) or not 0 <= value <= 255 for value in colors_cat):
        fail(f"invalid colorsOf array at rescueOrder {order}")
    if not isinstance(colors_order, list) or len(colors_order) != 24 or any(not isinstance(value, int) or not 0 <= value <= 255 for value in colors_order):
        fail(f"invalid rescue-order colorsOf array at rescueOrder {order}")
    for key in ("hueIntBytes5", "hueIntRescueOrder"):
        if not isinstance(colors.get(key), int) or not 0 <= colors[key] <= 65535:
            fail(f"invalid {key} at rescueOrder {order}")
    for key in ("glowBytes5", "glowRescueOrder"):
        values = colors.get(key)
        if not isinstance(values, list) or len(values) != 3 or any(not isinstance(value, int) or not 0 <= value <= 255 for value in values):
            fail(f"invalid {key} at rescueOrder {order}")
    if colors.get("rgbTriplets") != rgb_triplets(colors_cat):
        fail(f"RGB triplet summary drift at rescueOrder {order}")
    svg = row.get("svg", {})
    output_keys = [
        "explicitFalseBytes5", "explicitFalseRescueOrder", "explicitTrueBytes5",
        "explicitTrueRescueOrder", "defaultBytes5", "defaultRescueOrder",
    ]
    for key in output_keys:
        if not isinstance(svg.get(key), dict):
            fail(f"missing SVG output {key} at rescueOrder {order}")
        validate_normalization(svg[key], f"{order}:{key}")
    parser = decode_render_structure(render)
    if svg.get("parserStructure") != parser:
        fail(f"parser structure drift at rescueOrder {order}")
    structural = compare_structures(svg["explicitFalseBytes5"], parser)
    if svg.get("structuralComparison") != structural:
        fail(f"structural comparison drift at rescueOrder {order}")
    owner = svg.get("pinnedOriginalOwner")
    if not isinstance(owner, str) or not ADDRESS.fullmatch(owner):
        fail(f"invalid pinned owner at rescueOrder {order}")
    should_glow = owner.lower() == acclimator.lower()
    if svg.get("pinnedOriginalOwnerIsAcclimator") != should_glow:
        fail(f"pinned owner/acclimator comparison drift at rescueOrder {order}")
    default_cat = expected_default_match(svg["defaultBytes5"], svg["explicitFalseBytes5"], svg["explicitTrueBytes5"])
    default_order = expected_default_match(svg["defaultRescueOrder"], svg["explicitFalseRescueOrder"], svg["explicitTrueRescueOrder"])
    if svg.get("defaultBytes5EqualsExplicit") != default_cat or svg.get("defaultRescueOrderEqualsExplicit") != default_order:
        fail(f"default SVG equality summary drift at rescueOrder {order}")
    if svg["explicitFalseBytes5"].get("status") == "cell-normalized":
        color_subset_status = (
            "passed"
            if set(svg["explicitFalseBytes5"]["usedHexColors"]) <= set(rgb_triplets(colors_cat))
            else "failed"
        )
    else:
        color_subset_status = "not-evaluated"
    expected_checks: dict[str, Any] = {
        "catIdOfMatchesLocal": traits.get("catIdOf") == cat_id,
        "traitOverloadsEqual": by_cat == by_order,
        "traitsMatchLocal": by_cat == expected,
        "colorOverloadsEqual": colors_cat == colors_order,
        "hueOverloadsEqual": colors.get("hueIntBytes5") == colors.get("hueIntRescueOrder"),
        "hueMatchesLocal": colors.get("hueIntBytes5") == local["traits"]["hueInt"],
        "glowOverloadsEqual": colors.get("glowBytes5") == colors.get("glowRescueOrder"),
        "svgFalseOverloadsByteIdentical": equal_output(svg["explicitFalseBytes5"], svg["explicitFalseRescueOrder"]),
        "svgTrueOverloadsByteIdentical": equal_output(svg["explicitTrueBytes5"], svg["explicitTrueRescueOrder"]),
        "svgDefaultOverloadsByteIdentical": equal_output(svg["defaultBytes5"], svg["defaultRescueOrder"]),
        "defaultMatchesPinnedOwnerCondition": default_cat == ("true" if should_glow else "false") and default_order == ("true" if should_glow else "false"),
        "svgUsedColorsSubsetOfColorsOf": color_subset_status,
        "parserStructureStatus": structural["status"],
    }
    if row.get("checks") != expected_checks:
        fail(f"representative check summary drift at rescueOrder {order}")
    return None


def validate_representatives(
    manifest: dict[str, Any],
    population: list[dict[str, Any]],
    renders: list[dict[str, Any]],
    labels: dict[str, list[str]],
    acclimator: str,
) -> tuple[int, dict[str, Any]]:
    record = manifest.get("representative", {})
    path = ROOT / record.get("path", "")
    if not path.is_file() or sha256_bytes(path.read_bytes()) != record.get("sha256"):
        fail("representative file is missing or hash-drifted")
    representative = read_json(path)
    rows = representative.get("rows", [])
    if not 32 <= len(rows) <= 64 or record.get("count") != len(rows):
        fail("representative set must contain 32..64 rows")
    if representative.get("status") != "completed" or representative.get("selection", {}).get("targetCount") != len(rows):
        fail("representative status/selection count is inconsistent")
    orders = [row.get("rescueOrder") for row in rows]
    if orders != sorted(set(orders)) or any(not isinstance(order, int) or not 0 <= order < POPULATION_COUNT for order in orders):
        fail("representative rescue orders must be unique, sorted, and in range")
    fixture_orders = {
        row["rescueOrder"]
        for row in read_json(ROOT / "data/materialization-parity-cases.json")["fixtures"]
    }
    if not fixture_orders <= set(orders):
        fail("representative set does not include all eight zero-network fixtures")
    for row in rows:
        validate_representative_row(row, population[row["rescueOrder"]], renders[row["rescueOrder"]], labels, acclimator)
    accounting = summarize_check_accounting(rows)
    for key in ("definiteMismatchCount", "mismatchCounts", "incomparableCounts", "notEvaluatedCounts", "comparisonCounts"):
        if representative.get(key) != accounting[key] or record.get(key) != accounting[key]:
            fail(f"representative {key} accounting is inconsistent")
    if record.get("structuralGeometry") != summarize_structural_geometry(rows):
        fail("representative structural geometry summary is inconsistent")
    required = [
        "catIdOfMatchesLocal", "traitOverloadsEqual", "traitsMatchLocal", "colorOverloadsEqual",
        "hueOverloadsEqual", "hueMatchesLocal", "glowOverloadsEqual", "svgFalseOverloadsByteIdentical",
        "svgTrueOverloadsByteIdentical", "svgDefaultOverloadsByteIdentical", "defaultMatchesPinnedOwnerCondition",
    ]
    base_success = all(all(row["checks"][key] for key in required) for row in rows)
    if representative.get("baseVerificationSucceeded") != base_success or record.get("baseVerificationSucceeded") != base_success:
        fail("base representative status is inconsistent")
    return len(rows), accounting


def validate_compact_surface_row(
    surface: str,
    row: dict[str, Any],
    local: dict[str, Any],
    render: dict[str, Any],
    labels: dict[str, list[str]],
) -> dict[str, Any]:
    order = local["rescueOrder"]
    if row.get("rescueOrder") != order or row.get("catId") != local["catId"]:
        fail(f"{surface} identity mismatch at rescueOrder {order}")
    if surface == "identityTraits":
        traits = row.get("traitsBytes5")
        traits_order = row.get("traitsRescueOrder")
        if not isinstance(traits, list) or len(traits) != len(TRAIT_FIELDS) or not isinstance(traits_order, list) or len(traits_order) != len(TRAIT_FIELDS):
            fail(f"invalid exhaustive trait arrays at rescueOrder {order}")
        expected_checks = {
            "catIdOfMatchesLocal": row.get("catIdOf") == local["catId"],
            "overloadsEqual": traits == traits_order,
            "traitsMatchLocal": traits == expected_traits(local, labels),
        }
    elif surface == "colors":
        colors = row.get("colorsBytes5")
        if not isinstance(colors, list) or len(colors) != 24 or any(not isinstance(value, int) or not 0 <= value <= 255 for value in colors):
            fail(f"invalid exhaustive colors at rescueOrder {order}")
        order_colors = row.get("colorsRescueOrder")
        if not isinstance(order_colors, list) or len(order_colors) != 24 or any(not isinstance(value, int) or not 0 <= value <= 255 for value in order_colors):
            fail(f"invalid exhaustive rescue-order colors at rescueOrder {order}")
        for key in ("hueIntBytes5", "hueIntRescueOrder"):
            if not isinstance(row.get(key), int) or not 0 <= row[key] <= 65535:
                fail(f"invalid exhaustive {key} at rescueOrder {order}")
        for key in ("glowBytes5", "glowRescueOrder"):
            values = row.get(key)
            if not isinstance(values, list) or len(values) != 3 or any(not isinstance(value, int) or not 0 <= value <= 255 for value in values):
                fail(f"invalid exhaustive {key} at rescueOrder {order}")
        expected_checks = {
            "colorsOverloadsEqual": colors == order_colors,
            "hueOverloadsEqual": row.get("hueIntBytes5") == row.get("hueIntRescueOrder"),
            "hueMatchesLocal": row.get("hueIntBytes5") == local["traits"]["hueInt"],
            "glowOverloadsEqual": row.get("glowBytes5") == row.get("glowRescueOrder"),
        }
    else:
        output = row.get("outputBytes5")
        order_output = row.get("outputRescueOrder")
        if not isinstance(output, dict) or not isinstance(order_output, dict):
            fail(f"missing exhaustive SVG output at rescueOrder {order}")
        validate_normalization(output, f"full:{order}")
        validate_normalization(order_output, f"full-order:{order}")
        structural = compare_structures(output, decode_render_structure(render))
        if row.get("structuralComparison") != structural:
            fail(f"full SVG structural comparison drift at rescueOrder {order}")
        expected_checks = {
            "overloadsByteIdentical": equal_output(output, order_output),
            "parserStructureStatus": structural["status"],
        }
    if row.get("checks") != expected_checks:
        fail(f"{surface} check summary drift at rescueOrder {order}")
    return summarize_check_accounting([row])


def validate_exhaustive(
    manifest: dict[str, Any],
    population: list[dict[str, Any]],
    renders: list[dict[str, Any]],
    labels: dict[str, list[str]],
) -> dict[str, int]:
    completion = {}
    empty_accounting = summarize_check_accounting([])
    for surface in ("identityTraits", "colors", "svgFalse"):
        record = manifest.get("exhaustive", {}).get(surface, {})
        status, target = record.get("status"), record.get("targetCount")
        if status not in {"completed", "in-progress", "pending", "not-requested"}:
            fail(f"invalid exhaustive status for {surface}")
        if status == "not-requested":
            if target != 0 or record.get("completedCount") != 0 or record.get("shards"):
                fail(f"not-requested surface has output: {surface}")
            for key in ("definiteMismatchCount", "mismatchCounts", "incomparableCounts", "notEvaluatedCounts", "comparisonCounts"):
                if record.get(key) != empty_accounting[key]:
                    fail(f"not-requested surface has nonempty {key}: {surface}")
            completion[surface] = 0
            continue
        if target != POPULATION_COUNT:
            fail(f"requested exhaustive surface has wrong target: {surface}")
        expected_order = 0
        mismatches: Counter[str] = Counter()
        incomparable: Counter[str] = Counter()
        not_evaluated: Counter[str] = Counter()
        comparison_counts = {
            "parserStructure": {"passed": 0, "failed": 0, "incomparable": 0},
            "svgUsedColorsSubsetOfColorsOf": {"passed": 0, "failed": 0, "notEvaluated": 0},
        }
        for shard_record in record.get("shards", []):
            path = validate_file_record(shard_record, f"{surface} shard", generated=True)
            shard = read_json(path)
            if shard.get("surface") != surface:
                fail(f"surface mismatch in shard {path.relative_to(ROOT)}")
            rows = shard.get("rows", [])
            if not rows or shard_record.get("rowCount") != len(rows):
                fail(f"empty/count-drifted shard {path.relative_to(ROOT)}")
            if shard_record.get("startRescueOrder") != expected_order or rows[0].get("rescueOrder") != expected_order:
                fail(f"non-contiguous {surface} shard at {path.relative_to(ROOT)}")
            for row in rows:
                order = row.get("rescueOrder")
                if order != expected_order or not 0 <= order < POPULATION_COUNT:
                    fail(f"non-contiguous {surface} row at rescueOrder {expected_order}")
                accounting = validate_compact_surface_row(surface, row, population[order], renders[order], labels)
                mismatches.update(accounting["mismatchCounts"])
                incomparable.update(accounting["incomparableCounts"])
                not_evaluated.update(accounting["notEvaluatedCounts"])
                for comparison, buckets in accounting["comparisonCounts"].items():
                    for bucket, count in buckets.items():
                        comparison_counts[comparison][bucket] += count
                expected_order += 1
            if shard_record.get("endRescueOrder") != expected_order - 1:
                fail(f"shard end drift for {surface}")
        if record.get("completedCount") != expected_order:
            fail(f"completion count drift for {surface}")
        if status == "completed" and expected_order != POPULATION_COUNT:
            fail(f"completed surface is not exhaustive: {surface}")
        expected_accounting = {
            "definiteMismatchCount": sum(mismatches.values()),
            "mismatchCounts": dict(sorted(mismatches.items())),
            "incomparableCounts": dict(sorted(incomparable.items())),
            "notEvaluatedCounts": dict(sorted(not_evaluated.items())),
            "comparisonCounts": comparison_counts,
        }
        for key, value in expected_accounting.items():
            if record.get(key) != value:
                fail(f"{key} accounting drift for {surface}")
        completion[surface] = expected_order
    return completion


def validate_accessories(manifest: dict[str, Any], population: list[dict[str, Any]]) -> int:
    record = manifest.get("accessories", {})
    status = record.get("status")
    if status == "not-requested":
        if record.get("path") is not None or record.get("rowCount") != 0:
            fail("not-requested accessory phase has output")
        return 0
    allowed_statuses = {
        "completed", "completed-no-accessories-found-in-bounded-scan",
        "skipped-base-verification-not-successful", "failed-bounded-phase",
    }
    if status not in allowed_statuses:
        fail("invalid bounded accessory phase status")
    path = ROOT / record.get("path", "")
    if not path.is_file():
        fail("accessory phase path is missing")
    data = read_json(path)
    rows = data.get("rows", [])
    if record.get("rowCount") != len(rows) or status != data.get("status"):
        fail("accessory summary count/status drift")
    base_succeeded = manifest.get("representative", {}).get("baseVerificationSucceeded") is True
    if rows and not base_succeeded:
        fail("accessory evidence exists even though representative base verification did not succeed")
    if status == "skipped-base-verification-not-successful" and (base_succeeded or rows):
        fail("accessory base-verification skip status is inconsistent")
    if status in {"completed", "completed-no-accessories-found-in-bounded-scan", "failed-bounded-phase"} and not base_succeeded:
        fail("accessory phase ran without successful representative base verification")
    seen = set()
    for row in rows:
        order = row.get("rescueOrder")
        if not isinstance(order, int) or not 0 <= order < POPULATION_COUNT or order in seen or row.get("catId") != population[order]["catId"]:
            fail("invalid accessory representative identity")
        seen.add(order)
        if not 0 < row.get("recordedAccessoryCount", 0) <= row.get("ownedAccessoryCount", 0):
            fail(f"invalid accessory count at rescueOrder {order}")
        if len(row.get("ownedAccessories", [])) != row["recordedAccessoryCount"]:
            fail(f"owned accessory row count drift at rescueOrder {order}")
        for item in row["ownedAccessories"]:
            if not isinstance(item.get("accessoryId"), int) or not 0 <= item["accessoryId"] < 2 ** 232:
                fail(f"invalid accessory ID at rescueOrder {order}")
            if not isinstance(item.get("paletteIndex"), int) or not 0 <= item["paletteIndex"] <= 255:
                fail(f"invalid accessory palette index at rescueOrder {order}")
            if not isinstance(item.get("zIndex"), int) or not 0 <= item["zIndex"] <= 65535:
                fail(f"invalid accessory z-index at rescueOrder {order}")
            placement = item.get("placement", {})
            for key in ("offsetX", "offsetY", "width", "height"):
                if not isinstance(placement.get(key), int) or not 0 <= placement[key] <= 255:
                    fail(f"invalid accessory placement {key} at rescueOrder {order}")
            if not isinstance(placement.get("mirror"), bool) or not isinstance(placement.get("background"), bool):
                fail(f"invalid accessory placement flags at rescueOrder {order}")
        validate_normalization(row.get("baseImage", {}), f"accessory-base:{order}")
        validate_normalization(row.get("accessorizedImage", {}), f"accessorized:{order}")
        expected_differs = not equal_output(row["baseImage"], row["accessorizedImage"])
        if row.get("accessorizedDiffersFromBase") != expected_differs:
            fail(f"accessorized/base equality drift at rescueOrder {order}")
    return len(rows)


def no_secret_bearing_values(value: Any, path: str = "$") -> None:
    if isinstance(value, dict):
        for key, item in value.items():
            if key.casefold() in {"endpoint", "url", "authorization", "apiKey".casefold()}:
                fail(f"secret-bearing field is forbidden at {path}.{key}")
            no_secret_bearing_values(item, f"{path}.{key}")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            no_secret_bearing_values(item, f"{path}[{index}]")
    elif isinstance(value, str) and re.search(r"https?://", value):
        fail(f"RPC/URL-like value is forbidden in on-chain snapshot at {path}")


def main() -> int:
    args = parse_args()
    try:
        self_test()
    except MaterializationError as exc:
        fail(str(exc))
    if args.self_test:
        print("OK: Ethereum Keccak and ABI codec self-tests passed")
        return 0
    if not MANIFEST_PATH.is_file():
        if args.allow_missing:
            print("SKIP: no committed pinned-block materialization snapshot; helper self-tests passed")
            return 0
        fail("data/onchain-materialization/manifest.json is missing; run the RPC verifier with an explicitly supplied environment endpoint")
    manifest = read_json(MANIFEST_PATH)
    if MANIFEST_PATH.read_bytes() != json_bytes(manifest):
        fail("on-chain materialization manifest is not stable pretty-printed JSON")
    for path in sorted(OUTPUT_ROOT.rglob("*.json")):
        no_secret_bearing_values(read_json(path), path.relative_to(ROOT).as_posix())
    if manifest.get("schemaVersion") != 1 or manifest.get("status") not in {"completed", "partial-resumable"}:
        fail("invalid on-chain materialization manifest version/status")
    if set(manifest.get("exhaustive", {})) != {"identityTraits", "colors", "svgFalse"}:
        fail("manifest must contain exactly the three exhaustive surface records")
    block = manifest.get("block", {})
    if block.get("chainId") != 1 or not isinstance(block.get("number"), int) or block["number"] < 0:
        fail("snapshot is not pinned to an Ethereum-mainnet block number")
    if not HEX_QUANTITY.fullmatch(block.get("numberHex", "")) or int(block["numberHex"], 16) != block["number"]:
        fail("block number hex/decimal mismatch")
    if not HASH32.fullmatch(block.get("hash", "")) or not isinstance(block.get("timestamp"), int) or block["timestamp"] <= 0:
        fail("invalid block hash/timestamp")
    provider = manifest.get("provider", {})
    if provider.get("endpointPersisted") is not False or not isinstance(provider.get("environmentVariable"), str):
        fail("provider secrecy classification is missing")
    registry = read_json(ROOT / "data/contract-registry.json")
    registered = {item["key"]: item for item in registry["contracts"] if item.get("key") in CORE_KEYS}
    contracts = manifest.get("contracts", [])
    if {item.get("contractKey") for item in contracts} != CORE_KEYS or len(contracts) != len(CORE_KEYS):
        fail("runtime-code evidence must cover exactly eight core contracts")
    for item in contracts:
        key = item["contractKey"]
        if item.get("address", "").lower() != registered[key]["address"].lower() or item.get("runtimeCodeBytes", 0) <= 0:
            fail(f"runtime-code identity/length mismatch for {key}")
        require_hash(item.get("runtimeCodeSha256"), f"{key} runtime code")
        require_hash(item.get("runtimeCodeKeccak256"), f"{key} runtime code Keccak")
    input_paths = []
    for record in manifest.get("inputFiles", []):
        input_paths.append(validate_file_record(record, "input file").relative_to(ROOT).as_posix())
    if len(input_paths) != len(set(input_paths)) or not input_paths:
        fail("input file records must be non-empty and unique")
    required_inputs = {
        "data/contract-registry.json",
        "data/materialization-parity-cases.json",
        "data/materialization-parity-results.json",
        "data/mooncat-population/manifest.json",
        "data/mooncat-renders/manifest.json",
        "scripts/verify-onchain-materialization.py",
        "scripts/onchain_materialization_lib.py",
        *(registered[key]["abiArtifact"]["path"] for key in CORE_KEYS),
    }
    if not required_inputs <= set(input_paths):
        fail("snapshot input records omit a required registry, ABI, local baseline, or implementation file")
    generated_paths = []
    for record in manifest.get("generatedFiles", []):
        generated_paths.append(validate_file_record(record, "generated evidence", generated=True).relative_to(ROOT).as_posix())
    if len(generated_paths) != len(set(generated_paths)) or not generated_paths:
        fail("generated evidence records must be non-empty and unique")
    actual_generated = {
        path.relative_to(ROOT).as_posix()
        for path in OUTPUT_ROOT.rglob("*.json")
        if path != MANIFEST_PATH
    }
    if set(generated_paths) != actual_generated:
        fail("generated evidence records do not exactly own the snapshot JSON files")
    labels = manifest.get("traitLabelTables", {})
    expected_label_counts = {"facing": 2, "expression": 4, "pattern": 4, "pose": 4}
    if set(labels) != set(expected_label_counts) or any(
        not isinstance(labels[field], list)
        or len(labels[field]) != count
        or not all(isinstance(value, str) and value for value in labels[field])
        for field, count in expected_label_counts.items()
    ):
        fail("pinned trait label tables are invalid")
    population, renders = load_population_and_renders()
    representative_count, representative_accounting = validate_representatives(
        manifest, population, renders, labels, registered["acclimatedMoonCats"]["address"]
    )
    completion = validate_exhaustive(manifest, population, renders, labels)
    accessory_count = validate_accessories(manifest, population)
    exhaustive_statuses = [record.get("status") for record in manifest.get("exhaustive", {}).values()]
    expected_manifest_status = "completed" if all(status in {"completed", "not-requested"} for status in exhaustive_statuses) else "partial-resumable"
    if manifest.get("status") != expected_manifest_status:
        fail("manifest status does not agree with exhaustive surface statuses")
    if CHECKPOINT_PATH.is_file():
        checkpoint = read_json(CHECKPOINT_PATH)
        if checkpoint.get("block") != block:
            fail("checkpoint block does not match manifest block")
        if checkpoint.get("configuration", {}).get("comparisonAccountingVersion") != 2:
            fail("checkpoint comparison accounting version is not current")
        for surface, count in completion.items():
            checkpoint_surface = checkpoint.get("surfaces", {}).get(surface, {})
            manifest_surface = manifest["exhaustive"][surface]
            if checkpoint_surface.get("nextRescueOrder") != count:
                fail(f"checkpoint completion drift for {surface}")
            for key in ("mismatchCounts", "incomparableCounts", "notEvaluatedCounts", "comparisonCounts"):
                if checkpoint_surface.get(key) != manifest_surface.get(key):
                    fail(f"checkpoint {key} drift for {surface}")
    print(
        f"OK: pinned mainnet block {block['number']} {block['hash']}; 8 runtime-code records, "
        f"{representative_count} representatives, identity={completion['identityTraits']}, "
        f"colors={completion['colors']}, svgFalse={completion['svgFalse']}, accessories={accessory_count}, "
        f"definite mismatches={representative_accounting['definiteMismatchCount']}, "
        f"structural={representative_accounting['comparisonCounts']['parserStructure']}, "
        f"colorSubset={representative_accounting['comparisonCounts']['svgUsedColorsSubsetOfColorsOf']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
