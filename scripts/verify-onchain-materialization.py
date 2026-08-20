#!/usr/bin/env python3
"""Verify MoonCat materialization through read-only, block-pinned Ethereum RPC."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
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
    JsonRpcClient,
    MaterializationError,
    atomic_write_json,
    compare_structures,
    decode_outputs,
    decode_render_structure,
    encode_call,
    file_record,
    function_by_signature,
    json_bytes,
    keccak256,
    normalize_svg,
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
REPRESENTATIVE_PATH = OUTPUT_ROOT / "representative.json"
ACCESSORY_PATH = OUTPUT_ROOT / "accessories.json"
CORE_KEYS = [
    "mooncatRescue",
    "acclimatedMoonCats",
    "mooncatReference",
    "mooncatTraits",
    "mooncatColors",
    "mooncatSVGs",
    "mooncatAccessories",
    "mooncatAccessoryImages",
]
TRAIT_FIELDS = ["genesis", "pale", "facing", "expression", "pattern", "pose"]
TRAIT_LABEL_SIGNATURES = {
    "facing": ("facingNames(uint256)", 2),
    "expression": ("expressionNames(uint256)", 4),
    "pattern": ("patternNames(uint256)", 4),
    "pose": ("poseNames(uint256)", 4),
}
SURFACE_NAMES = ["identityTraits", "colors", "svgFalse"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rpc-env", default="ETH_RPC_URL", help="Environment variable name holding the endpoint; its value is never printed or persisted.")
    parser.add_argument("--plan", action="store_true", help="Validate local inputs/ABI surfaces and print bounded call estimates without reading the RPC environment or writing output.")
    parser.add_argument("--mode", choices=["representative", "full"], default="representative")
    parser.add_argument("--full-svg", action="store_true", help="Attempt the exhaustive explicit-glow-false SVG surface in full mode.")
    parser.add_argument("--accessories", action="store_true", help="Run the bounded accessory phase after successful base representative verification.")
    parser.add_argument("--resume", action="store_true", help="Resume the exact block recorded in checkpoint.json.")
    parser.add_argument("--refresh-representative", action="store_true", help="With --resume, rebuild only the same representative sample after verifying the checkpoint block hash.")
    parser.add_argument("--block-number", type=int, help="Reproduce an explicit historical block instead of selecting finalized at run start.")
    parser.add_argument("--representative-count", type=int, default=48)
    parser.add_argument("--rpc-batch-size", type=int, default=25)
    parser.add_argument("--shard-size", type=int, default=1000)
    parser.add_argument("--fallback-confirmations", type=int, default=64)
    parser.add_argument("--timeout", type=float, default=30)
    parser.add_argument("--retries", type=int, default=4)
    parser.add_argument("--accessory-scan-limit", type=int, default=1000)
    parser.add_argument("--accessory-cat-limit", type=int, default=4)
    parser.add_argument("--accessory-record-limit", type=int, default=8)
    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", args.rpc_env):
        raise MaterializationError("--rpc-env must be an environment variable name, not an endpoint value")
    if not 32 <= args.representative_count <= 64:
        raise MaterializationError("--representative-count must be 32..64")
    if not 1 <= args.rpc_batch_size <= 100:
        raise MaterializationError("--rpc-batch-size must be 1..100")
    if args.shard_size not in {100, 200, 250, 400, 500, 1000}:
        raise MaterializationError("--shard-size must be one of 100, 200, 250, 400, 500, 1000")
    if args.fallback_confirmations < 32:
        raise MaterializationError("--fallback-confirmations must be at least 32")
    if not 1 <= args.timeout <= 120:
        raise MaterializationError("--timeout must be 1..120 seconds")
    if not 0 <= args.retries <= 10:
        raise MaterializationError("--retries must be 0..10")
    if not 1 <= args.accessory_scan_limit <= POPULATION_COUNT:
        raise MaterializationError(f"--accessory-scan-limit must be 1..{POPULATION_COUNT}")
    if not 1 <= args.accessory_cat_limit <= 16:
        raise MaterializationError("--accessory-cat-limit must be 1..16")
    if not 1 <= args.accessory_record_limit <= 64:
        raise MaterializationError("--accessory-record-limit must be 1..64")
    if args.block_number is not None and args.block_number < 0:
        raise MaterializationError("--block-number cannot be negative")
    if args.resume and args.block_number is not None:
        raise MaterializationError("--resume uses the checkpoint block and cannot be combined with --block-number")
    if args.full_svg and args.mode != "full":
        raise MaterializationError("--full-svg requires --mode full")
    if args.refresh_representative and not args.resume:
        raise MaterializationError("--refresh-representative requires --resume and its exact checkpoint block")
    if args.refresh_representative and (args.mode != "representative" or args.full_svg or args.accessories):
        raise MaterializationError("--refresh-representative is restricted to representative mode without full SVG or accessories")


def load_contracts() -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    registry = read_json(ROOT / "data/contract-registry.json")
    contracts = {item["key"]: item for item in registry["contracts"] if item.get("key") in CORE_KEYS}
    if set(contracts) != set(CORE_KEYS):
        raise MaterializationError("contract registry does not contain exactly the eight required core keys")
    abis: dict[str, dict[str, Any]] = {}
    for key in CORE_KEYS:
        contract = contracts[key]
        if contract.get("network") != "ethereum-mainnet" or not ADDRESS.fullmatch(contract.get("address", "")):
            raise MaterializationError(f"invalid mainnet registry address for {key}")
        artifact = contract.get("abiArtifact", {})
        path = ROOT / artifact.get("path", "")
        if not path.is_file() or sha256_bytes(path.read_bytes()) != artifact.get("sha256"):
            raise MaterializationError(f"ABI artifact hash mismatch for {key}")
        abi = read_json(path)
        if abi.get("contractKey") != key or abi.get("address", "").lower() != contract["address"].lower():
            raise MaterializationError(f"ABI artifact identity mismatch for {key}")
        abis[key] = abi
    return contracts, abis


def block_record(block: dict[str, Any], selection_mode: str, confirmations: int | None = None) -> dict[str, Any]:
    number, timestamp, block_hash = block.get("number"), block.get("timestamp"), block.get("hash")
    if not isinstance(number, str) or not isinstance(timestamp, str) or not isinstance(block_hash, str) or not HASH32.fullmatch(block_hash):
        raise MaterializationError("RPC block object lacks exact number/hash/timestamp")
    number_int, timestamp_int = int(number, 16), int(timestamp, 16)
    return {
        "chainId": 1,
        "number": number_int,
        "numberHex": hex(number_int),
        "hash": block_hash.lower(),
        "timestamp": timestamp_int,
        "timestampUtc": dt.datetime.fromtimestamp(timestamp_int, tz=dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "selectionMode": selection_mode,
        "fallbackConfirmations": confirmations,
        "stateParameterMode": "exact-block-number-with-hash-rechecked-before-and-after",
    }


def select_block(client: JsonRpcClient, args: argparse.Namespace, checkpoint: dict[str, Any] | None) -> dict[str, Any]:
    chain_id = client.call("eth_chainId", [])
    if int(chain_id, 16) != 1:
        raise MaterializationError(f"RPC chainId must be Ethereum mainnet 1; received {int(chain_id, 16)}")
    if checkpoint:
        expected = checkpoint["block"]
        block = client.call("eth_getBlockByNumber", [expected["numberHex"], False])
        record = block_record(block, expected["selectionMode"], expected.get("fallbackConfirmations"))
        if record["hash"] != expected["hash"]:
            raise MaterializationError("resume block hash no longer matches its recorded block number")
        return record
    if args.block_number is not None:
        block = client.call("eth_getBlockByNumber", [hex(args.block_number), False])
        if block is None:
            raise MaterializationError("explicit block number is unavailable from provider")
        try:
            finalized = client.call("eth_getBlockByNumber", ["finalized", False])
        except MaterializationError:
            finalized = None
        if finalized is not None:
            finalized_record = block_record(finalized, "rpc-finalized-tag")
            if args.block_number > finalized_record["number"]:
                raise MaterializationError("explicit block number is newer than the provider finalized block")
            return block_record(block, "explicit-block-number-at-or-before-rpc-finalized")
        head = int(client.call("eth_blockNumber", []), 16)
        conservative_ceiling = head - args.fallback_confirmations
        if args.block_number > conservative_ceiling:
            raise MaterializationError("explicit block number is newer than the conservative fallback finality ceiling")
        return block_record(block, "explicit-block-number-at-or-before-fallback-finality", args.fallback_confirmations)
    try:
        finalized = client.call("eth_getBlockByNumber", ["finalized", False])
        if finalized is not None:
            return block_record(finalized, "rpc-finalized-tag")
    except MaterializationError:
        pass
    head = int(client.call("eth_blockNumber", []), 16)
    selected = head - args.fallback_confirmations
    if selected < 0:
        raise MaterializationError("fallback finalized block would be negative")
    block = client.call("eth_getBlockByNumber", [hex(selected), False])
    return block_record(block, "head-minus-confirmations-fallback", args.fallback_confirmations)


def abi_batch(
    client: JsonRpcClient,
    specs: list[tuple[str, dict[str, Any], str, list[Any]]],
    block_tag: str,
    batch_size: int,
) -> list[list[Any]]:
    results: list[list[Any]] = []
    for start in range(0, len(specs), batch_size):
        chunk = specs[start:start + batch_size]
        requests = [
            ("eth_call", [{"to": address, "data": encode_call(abi, signature, values)}, block_tag])
            for address, abi, signature, values in chunk
        ]
        try:
            raw_results = client.batch(requests)
        except MaterializationError:
            raw_results = [client.call(method, params) for method, params in requests]
        for (_, abi, signature, _), raw in zip(chunk, raw_results):
            results.append(decode_outputs(abi, signature, raw))
    return results


def verify_code(
    client: JsonRpcClient,
    contracts: dict[str, dict[str, Any]],
    block_tag: str,
    batch_size: int,
) -> list[dict[str, Any]]:
    keys = CORE_KEYS
    calls = [("eth_getCode", [contracts[key]["address"], block_tag]) for key in keys]
    raw_codes: list[str] = []
    for start in range(0, len(calls), batch_size):
        chunk = calls[start:start + batch_size]
        try:
            raw_codes.extend(client.batch(chunk))
        except MaterializationError:
            raw_codes.extend(client.call(method, params) for method, params in chunk)
    evidence = []
    for key, encoded in zip(keys, raw_codes):
        if not isinstance(encoded, str) or not encoded.startswith("0x") or encoded == "0x":
            raise MaterializationError(f"empty deployed runtime code for {key} at pinned block")
        try:
            code = bytes.fromhex(encoded[2:])
        except ValueError as exc:
            raise MaterializationError(f"invalid runtime code hex for {key}") from exc
        evidence.append({
            "contractKey": key,
            "address": contracts[key]["address"],
            "runtimeCodeBytes": len(code),
            "runtimeCodeSha256": sha256_bytes(code),
            "runtimeCodeKeccak256": keccak256(code).hex(),
            "claimBoundary": "deployed runtime-code presence/hash only; not verified-source, compiler, or semantic equivalence",
        })
    return evidence


def load_population_and_renders() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    population_manifest = read_json(ROOT / "data/mooncat-population/manifest.json")
    render_manifest = read_json(ROOT / "data/mooncat-renders/manifest.json")
    population, renders = [], []
    for shard in population_manifest["layout"]["shards"]:
        population.extend(read_json(ROOT / shard["path"])["rows"])
    for shard in render_manifest["layout"]["shards"]:
        renders.extend(read_json(ROOT / shard["path"])["rows"])
    if len(population) != POPULATION_COUNT or len(renders) != POPULATION_COUNT:
        raise MaterializationError("population or render inputs are not complete")
    for order, (row, render) in enumerate(zip(population, renders)):
        if row.get("rescueOrder") != order or render.get("rescueOrder") != order or row.get("catId") != render.get("catId"):
            raise MaterializationError(f"population/render identity mismatch at rescueOrder {order}")
    return population, renders


def select_representatives(population: list[dict[str, Any]], target: int) -> tuple[list[int], dict[str, list[str]]]:
    fixtures = read_json(ROOT / "data/materialization-parity-cases.json")["fixtures"]
    selected = [item["rescueOrder"] for item in fixtures]
    fixed_boundaries = [0, 1, 95, 96, 99, 100, 491, 492, 903, 904, 999, 1000, 25343, 25344, 25438, 25439]
    selected.extend(order for order in fixed_boundaries if order not in selected)

    def tokens(row: dict[str, Any]) -> set[str]:
        traits = row["traits"]
        result = {
            f"genesis:{str(row['genesis']).lower()}",
            f"pale:{str(traits['pale']).lower()}",
            f"facing:{traits['facing']}",
            f"expression:{traits['expression']}",
            f"pattern:{traits['pattern']}",
            f"pose:{traits['pose']}",
            f"rescueYear:{traits['rescueYear']}",
        }
        result.update(f"rescueBucket:{value}" for value in row.get("rescueBuckets", []))
        if traits["hueInt"] in {0, 359, 1000, 2000}:
            result.add(f"hueEdge:{traits['hueInt']}")
        return result

    covered = set().union(*(tokens(population[order]) for order in selected))
    universe = set().union(*(tokens(row) for row in population))
    for row in population:
        if len(selected) >= target or not (tokens(row) - covered):
            continue
        selected.append(row["rescueOrder"])
        covered.update(tokens(row))
    stride = POPULATION_COUNT / target
    index = 0
    while len(selected) < target:
        candidate = min(POPULATION_COUNT - 1, int(index * stride))
        index += 1
        if candidate not in selected:
            selected.append(candidate)
    selected = sorted(selected[:target])
    return selected, {
        "coveredTokens": sorted(set().union(*(tokens(population[order]) for order in selected))),
        "uncoveredTokens": sorted(universe - set().union(*(tokens(population[order]) for order in selected))),
    }


def trait_label_maps(
    client: JsonRpcClient,
    contract: dict[str, Any],
    abi: dict[str, Any],
    block_tag: str,
    batch_size: int,
) -> dict[str, list[str]]:
    specs = []
    order = []
    for field, (signature, count) in TRAIT_LABEL_SIGNATURES.items():
        for index in range(count):
            specs.append((contract["address"], abi, signature, [index]))
            order.append(field)
    decoded = abi_batch(client, specs, block_tag, batch_size)
    maps: dict[str, list[str]] = {field: [] for field in TRAIT_LABEL_SIGNATURES}
    for field, result in zip(order, decoded):
        maps[field].append(result[0])
    return maps


def expected_traits(row: dict[str, Any], labels: dict[str, list[str]]) -> list[Any]:
    traits = row["traits"]
    result: list[Any] = [row["genesis"], traits["pale"]]
    for field in ("facing", "expression", "pattern", "pose"):
        candidates = [value.casefold() for value in labels[field]]
        value = traits[field].casefold()
        if value not in candidates:
            raise MaterializationError(f"local {field} label {traits[field]!r} is absent from pinned contract label table")
        result.append(candidates.index(value))
    return result


def call_specs_for_cat(
    row: dict[str, Any],
    contracts: dict[str, dict[str, Any]],
    abis: dict[str, dict[str, Any]],
) -> list[tuple[str, dict[str, Any], str, list[Any]]]:
    cat_id, order = row["catId"], row["rescueOrder"]
    traits, colors, svgs, rescue = (contracts[key] for key in ("mooncatTraits", "mooncatColors", "mooncatSVGs", "mooncatRescue"))
    return [
        (traits["address"], abis["mooncatTraits"], "catIdOf(uint256)", [order]),
        (traits["address"], abis["mooncatTraits"], "kTraitsOf(bytes5)", [cat_id]),
        (traits["address"], abis["mooncatTraits"], "kTraitsOf(uint256)", [order]),
        (colors["address"], abis["mooncatColors"], "colorsOf(bytes5)", [cat_id]),
        (colors["address"], abis["mooncatColors"], "colorsOf(uint256)", [order]),
        (colors["address"], abis["mooncatColors"], "hueIntOf(bytes5)", [cat_id]),
        (colors["address"], abis["mooncatColors"], "hueIntOf(uint256)", [order]),
        (colors["address"], abis["mooncatColors"], "glowOf(bytes5)", [cat_id]),
        (colors["address"], abis["mooncatColors"], "glowOf(uint256)", [order]),
        (svgs["address"], abis["mooncatSVGs"], "imageOf(bytes5,bool)", [cat_id, False]),
        (svgs["address"], abis["mooncatSVGs"], "imageOf(uint256,bool)", [order, False]),
        (svgs["address"], abis["mooncatSVGs"], "imageOf(bytes5,bool)", [cat_id, True]),
        (svgs["address"], abis["mooncatSVGs"], "imageOf(uint256,bool)", [order, True]),
        (svgs["address"], abis["mooncatSVGs"], "imageOf(bytes5)", [cat_id]),
        (svgs["address"], abis["mooncatSVGs"], "imageOf(uint256)", [order]),
        (rescue["address"], abis["mooncatRescue"], "catOwners(bytes5)", [cat_id]),
    ]


def representative_row(
    row: dict[str, Any],
    render: dict[str, Any],
    results: list[list[Any]],
    labels: dict[str, list[str]],
    acclimator_address: str,
) -> dict[str, Any]:
    cat_id, order = row["catId"], row["rescueOrder"]
    cat_id_of = results[0][0].lower()
    traits_bytes, traits_order = results[1], results[2]
    colors_bytes, colors_order = results[3][0], results[4][0]
    hue_bytes, hue_order = results[5][0], results[6][0]
    glow_bytes, glow_order = results[7][0], results[8][0]
    svg_false_bytes, svg_false_order = results[9][0], results[10][0]
    svg_true_bytes, svg_true_order = results[11][0], results[12][0]
    svg_default_bytes, svg_default_order = results[13][0], results[14][0]
    owner = results[15][0].lower()
    parser_structure = decode_render_structure(render)
    false_normalized = normalize_svg(svg_false_bytes)
    false_order_normalized = normalize_svg(svg_false_order)
    true_normalized = normalize_svg(svg_true_bytes)
    true_order_normalized = normalize_svg(svg_true_order)
    default_normalized = normalize_svg(svg_default_bytes)
    default_order_normalized = normalize_svg(svg_default_order)
    expected = expected_traits(row, labels)
    default_should_glow = owner == acclimator_address.lower()
    default_match = "true" if svg_default_bytes == svg_true_bytes else "false" if svg_default_bytes == svg_false_bytes else "neither"
    default_order_match = "true" if svg_default_order == svg_true_order else "false" if svg_default_order == svg_false_order else "neither"
    contract_palette = rgb_triplets(colors_bytes)
    structural = compare_structures(false_normalized, parser_structure)
    if false_normalized.get("status") == "cell-normalized":
        color_subset_status = (
            "passed"
            if set(false_normalized["usedHexColors"]) <= set(contract_palette)
            else "failed"
        )
    else:
        color_subset_status = "not-evaluated"
    checks = {
        "catIdOfMatchesLocal": cat_id_of == cat_id,
        "traitOverloadsEqual": traits_bytes == traits_order,
        "traitsMatchLocal": traits_bytes == expected,
        "colorOverloadsEqual": colors_bytes == colors_order,
        "hueOverloadsEqual": hue_bytes == hue_order,
        "hueMatchesLocal": hue_bytes == row["traits"]["hueInt"],
        "glowOverloadsEqual": glow_bytes == glow_order,
        "svgFalseOverloadsByteIdentical": svg_false_bytes == svg_false_order,
        "svgTrueOverloadsByteIdentical": svg_true_bytes == svg_true_order,
        "svgDefaultOverloadsByteIdentical": svg_default_bytes == svg_default_order,
        "defaultMatchesPinnedOwnerCondition": default_match == ("true" if default_should_glow else "false") and default_order_match == ("true" if default_should_glow else "false"),
        "svgUsedColorsSubsetOfColorsOf": color_subset_status,
        "parserStructureStatus": structural["status"],
    }
    return {
        "rescueOrder": order,
        "catId": cat_id,
        "coverage": {
            "genesis": row["genesis"],
            "pale": row["traits"]["pale"],
            "facing": row["traits"]["facing"],
            "expression": row["traits"]["expression"],
            "pattern": row["traits"]["pattern"],
            "pose": row["traits"]["pose"],
            "rescueYear": row["traits"]["rescueYear"],
            "rescueBuckets": row.get("rescueBuckets", []),
        },
        "traits": {
            "catIdOf": cat_id_of,
            "bytes5": dict(zip(TRAIT_FIELDS, traits_bytes)),
            "rescueOrder": dict(zip(TRAIT_FIELDS, traits_order)),
            "localExpected": dict(zip(TRAIT_FIELDS, expected)),
        },
        "colors": {
            "colorsOfBytes5": colors_bytes,
            "colorsOfRescueOrder": colors_order,
            "rgbTriplets": contract_palette,
            "hueIntBytes5": hue_bytes,
            "hueIntRescueOrder": hue_order,
            "glowBytes5": glow_bytes,
            "glowRescueOrder": glow_order,
        },
        "svg": {
            "explicitFalseBytes5": false_normalized,
            "explicitFalseRescueOrder": false_order_normalized,
            "explicitTrueBytes5": true_normalized,
            "explicitTrueRescueOrder": true_order_normalized,
            "defaultBytes5": default_normalized,
            "defaultRescueOrder": default_order_normalized,
            "defaultBytes5EqualsExplicit": default_match,
            "defaultRescueOrderEqualsExplicit": default_order_match,
            "pinnedOriginalOwner": owner,
            "pinnedOriginalOwnerIsAcclimator": default_should_glow,
            "parserStructure": parser_structure,
            "structuralComparison": structural,
        },
        "checks": checks,
    }


def run_representatives(
    client: JsonRpcClient,
    population: list[dict[str, Any]],
    renders: list[dict[str, Any]],
    selected: list[int],
    coverage: dict[str, list[str]],
    contracts: dict[str, dict[str, Any]],
    abis: dict[str, dict[str, Any]],
    labels: dict[str, list[str]],
    block_tag: str,
    batch_size: int,
) -> dict[str, Any]:
    rows = []
    for order in selected:
        decoded = abi_batch(client, call_specs_for_cat(population[order], contracts, abis), block_tag, batch_size)
        rows.append(representative_row(population[order], renders[order], decoded, labels, contracts["acclimatedMoonCats"]["address"]))
    accounting = summarize_check_accounting(rows)
    required_boolean_checks = [
        "catIdOfMatchesLocal", "traitOverloadsEqual", "traitsMatchLocal",
        "colorOverloadsEqual", "hueOverloadsEqual", "hueMatchesLocal", "glowOverloadsEqual",
        "svgFalseOverloadsByteIdentical", "svgTrueOverloadsByteIdentical",
        "svgDefaultOverloadsByteIdentical", "defaultMatchesPinnedOwnerCondition",
    ]
    base_success = all(all(row["checks"][key] for key in required_boolean_checks) for row in rows)
    return {
        "schemaVersion": 1,
        "status": "completed",
        "selection": {
            "algorithm": "existing-eight-fixtures-plus-fixed-rescue-boundaries-then-first-uncovered-population-categories-and-evenly-spaced-fill",
            "targetCount": len(selected),
            **coverage,
        },
        "baseVerificationSucceeded": base_success,
        **accounting,
        "rows": rows,
    }


def init_checkpoint(block: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    requested = {
        "identityTraits": args.mode == "full",
        "colors": args.mode == "full",
        "svgFalse": args.mode == "full" and args.full_svg,
    }
    return {
        "schemaVersion": 1,
        "status": "in-progress",
        "block": block,
        "configuration": {
            "shardSize": args.shard_size,
            "rpcBatchSize": args.rpc_batch_size,
            "fullSvgRequested": args.full_svg,
            "representativeCount": args.representative_count,
            "mode": args.mode,
            "comparisonAccountingVersion": 2,
        },
        "surfaces": {
            name: {
                "status": "pending" if requested[name] else "not-requested",
                "nextRescueOrder": 0,
                "partialRows": [],
                "shards": [],
                "mismatchCounts": {},
                "incomparableCounts": {},
                "notEvaluatedCounts": {},
                "comparisonCounts": {
                    "parserStructure": {"passed": 0, "failed": 0, "incomparable": 0},
                    "svgUsedColorsSubsetOfColorsOf": {"passed": 0, "failed": 0, "notEvaluated": 0},
                },
            }
            for name in SURFACE_NAMES
        },
    }


def shard_path(surface: str, start: int, end: int) -> Path:
    slug = {"identityTraits": "identity-traits", "colors": "colors", "svgFalse": "svg-false"}[surface]
    return OUTPUT_ROOT / "shards" / slug / f"{start:05d}-{end:05d}.json"


def write_surface_shard(surface: str, rows: list[dict[str, Any]]) -> dict[str, Any]:
    start, end = rows[0]["rescueOrder"], rows[-1]["rescueOrder"]
    path = shard_path(surface, start, end)
    payload = {"schemaVersion": 1, "surface": surface, "range": {"startRescueOrder": start, "endRescueOrder": end}, "rows": rows}
    atomic_write_json(path, payload)
    return file_record(path, f"pinned-block exhaustive {surface} evidence") | {"startRescueOrder": start, "endRescueOrder": end, "rowCount": len(rows)}


def compact_full_row(
    surface: str,
    local: dict[str, Any],
    render: dict[str, Any],
    decoded: list[list[Any]],
    labels: dict[str, list[str]],
) -> tuple[dict[str, Any], dict[str, Any]]:
    cat_id, order = local["catId"], local["rescueOrder"]
    if surface == "identityTraits":
        cat_id_of, by_cat, by_order = decoded[0][0].lower(), decoded[1], decoded[2]
        expected = expected_traits(local, labels)
        checks = {
            "catIdOfMatchesLocal": cat_id_of == cat_id,
            "overloadsEqual": by_cat == by_order,
            "traitsMatchLocal": by_cat == expected,
        }
        row = {
            "rescueOrder": order,
            "catId": cat_id,
            "catIdOf": cat_id_of,
            "traitsBytes5": by_cat,
            "traitsRescueOrder": by_order,
            "checks": checks,
        }
    elif surface == "colors":
        colors_cat, colors_order = decoded[0][0], decoded[1][0]
        hue_cat, hue_order = decoded[2][0], decoded[3][0]
        glow_cat, glow_order = decoded[4][0], decoded[5][0]
        checks = {
            "colorsOverloadsEqual": colors_cat == colors_order,
            "hueOverloadsEqual": hue_cat == hue_order,
            "hueMatchesLocal": hue_cat == local["traits"]["hueInt"],
            "glowOverloadsEqual": glow_cat == glow_order,
        }
        row = {
            "rescueOrder": order,
            "catId": cat_id,
            "colorsBytes5": colors_cat,
            "colorsRescueOrder": colors_order,
            "hueIntBytes5": hue_cat,
            "hueIntRescueOrder": hue_order,
            "glowBytes5": glow_cat,
            "glowRescueOrder": glow_order,
            "checks": checks,
        }
    else:
        by_cat, by_order = decoded[0][0], decoded[1][0]
        normalized = normalize_svg(by_cat)
        parser = decode_render_structure(render)
        structural = compare_structures(normalized, parser)
        checks = {"overloadsByteIdentical": by_cat == by_order, "parserStructureStatus": structural["status"]}
        order_normalized = normalize_svg(by_order)
        row = {
            "rescueOrder": order,
            "catId": cat_id,
            "outputBytes5": normalized,
            "outputRescueOrder": order_normalized,
            "structuralComparison": structural,
            "checks": checks,
        }
    return row, summarize_check_accounting([row])


def specs_for_surface(
    surface: str,
    rows: list[dict[str, Any]],
    contracts: dict[str, dict[str, Any]],
    abis: dict[str, dict[str, Any]],
) -> list[tuple[str, dict[str, Any], str, list[Any]]]:
    specs = []
    for row in rows:
        order, cat_id = row["rescueOrder"], row["catId"]
        if surface == "identityTraits":
            contract, abi = contracts["mooncatTraits"], abis["mooncatTraits"]
            specs.extend([
                (contract["address"], abi, "catIdOf(uint256)", [order]),
                (contract["address"], abi, "kTraitsOf(bytes5)", [cat_id]),
                (contract["address"], abi, "kTraitsOf(uint256)", [order]),
            ])
        elif surface == "colors":
            contract, abi = contracts["mooncatColors"], abis["mooncatColors"]
            specs.extend([
                (contract["address"], abi, "colorsOf(bytes5)", [cat_id]),
                (contract["address"], abi, "colorsOf(uint256)", [order]),
                (contract["address"], abi, "hueIntOf(bytes5)", [cat_id]),
                (contract["address"], abi, "hueIntOf(uint256)", [order]),
                (contract["address"], abi, "glowOf(bytes5)", [cat_id]),
                (contract["address"], abi, "glowOf(uint256)", [order]),
            ])
        else:
            contract, abi = contracts["mooncatSVGs"], abis["mooncatSVGs"]
            specs.extend([
                (contract["address"], abi, "imageOf(bytes5,bool)", [cat_id, False]),
                (contract["address"], abi, "imageOf(uint256,bool)", [order, False]),
            ])
    return specs


def run_full_surface(
    surface: str,
    client: JsonRpcClient,
    checkpoint: dict[str, Any],
    population: list[dict[str, Any]],
    renders: list[dict[str, Any]],
    contracts: dict[str, dict[str, Any]],
    abis: dict[str, dict[str, Any]],
    labels: dict[str, list[str]],
    block_tag: str,
    args: argparse.Namespace,
) -> None:
    state = checkpoint["surfaces"][surface]
    if state["status"] == "completed":
        return
    state["status"] = "in-progress"
    arity = {"identityTraits": 3, "colors": 6, "svgFalse": 2}[surface]
    while state["nextRescueOrder"] < POPULATION_COUNT:
        start = state["nextRescueOrder"]
        next_shard_boundary = ((start // args.shard_size) + 1) * args.shard_size
        end = min(POPULATION_COUNT, start + args.rpc_batch_size, next_shard_boundary)
        local_rows = population[start:end]
        decoded = abi_batch(client, specs_for_surface(surface, local_rows, contracts, abis), block_tag, args.rpc_batch_size)
        mismatch_counts = Counter(state.get("mismatchCounts", {}))
        incomparable_counts = Counter(state.get("incomparableCounts", {}))
        not_evaluated_counts = Counter(state.get("notEvaluatedCounts", {}))
        comparison_counts = state.get("comparisonCounts", {
            "parserStructure": {"passed": 0, "failed": 0, "incomparable": 0},
            "svgUsedColorsSubsetOfColorsOf": {"passed": 0, "failed": 0, "notEvaluated": 0},
        })
        for index, local in enumerate(local_rows):
            values = decoded[index * arity:(index + 1) * arity]
            compact, accounting = compact_full_row(surface, local, renders[local["rescueOrder"]], values, labels)
            state["partialRows"].append(compact)
            mismatch_counts.update(accounting["mismatchCounts"])
            incomparable_counts.update(accounting["incomparableCounts"])
            not_evaluated_counts.update(accounting["notEvaluatedCounts"])
            for comparison, buckets in accounting["comparisonCounts"].items():
                for bucket, count in buckets.items():
                    comparison_counts[comparison][bucket] += count
        state["mismatchCounts"] = dict(sorted(mismatch_counts.items()))
        state["incomparableCounts"] = dict(sorted(incomparable_counts.items()))
        state["notEvaluatedCounts"] = dict(sorted(not_evaluated_counts.items()))
        state["comparisonCounts"] = comparison_counts
        state["nextRescueOrder"] = end
        if len(state["partialRows"]) >= args.shard_size or end == POPULATION_COUNT:
            state["shards"].append(write_surface_shard(surface, state["partialRows"]))
            state["partialRows"] = []
        atomic_write_json(CHECKPOINT_PATH, checkpoint)
    state["status"] = "completed"
    atomic_write_json(CHECKPOINT_PATH, checkpoint)


def flush_partial_shards(checkpoint: dict[str, Any]) -> None:
    for surface, state in checkpoint["surfaces"].items():
        if state.get("partialRows"):
            state["shards"].append(write_surface_shard(surface, state["partialRows"]))
            state["partialRows"] = []
    atomic_write_json(CHECKPOINT_PATH, checkpoint)


def run_accessories(
    client: JsonRpcClient,
    population: list[dict[str, Any]],
    contracts: dict[str, dict[str, Any]],
    abis: dict[str, dict[str, Any]],
    block_tag: str,
    args: argparse.Namespace,
) -> dict[str, Any]:
    accessory_contract, accessory_abi = contracts["mooncatAccessories"], abis["mooncatAccessories"]
    image_contract, image_abi = contracts["mooncatAccessoryImages"], abis["mooncatAccessoryImages"]
    svg_contract, svg_abi = contracts["mooncatSVGs"], abis["mooncatSVGs"]
    scan_rows = population[:min(args.accessory_scan_limit, POPULATION_COUNT)]
    specs = [(accessory_contract["address"], accessory_abi, "balanceOf(uint256)", [row["rescueOrder"]]) for row in scan_rows]
    balances = abi_batch(client, specs, block_tag, args.rpc_batch_size)
    selected = [(row, result[0]) for row, result in zip(scan_rows, balances) if result[0] > 0][:args.accessory_cat_limit]
    output_rows = []
    for row, balance in selected:
        record_count = min(balance, args.accessory_record_limit)
        record_specs = [
            (accessory_contract["address"], accessory_abi, "ownedAccessoryByIndex(uint256,uint256)", [row["rescueOrder"], index])
            for index in range(record_count)
        ]
        owned = [result[0] for result in abi_batch(client, record_specs, block_tag, args.rpc_batch_size)]
        placement_specs = [
            (image_contract["address"], image_abi, "placementOf(uint256,uint256)", [row["rescueOrder"], item["accessoryId"]])
            for item in owned
        ]
        placements = abi_batch(client, placement_specs, block_tag, args.rpc_batch_size) if placement_specs else []
        image_specs = [
            (svg_contract["address"], svg_abi, "imageOf(uint256,bool)", [row["rescueOrder"], False]),
            (image_contract["address"], image_abi, "accessorizedImageOf(uint256,uint8,bool)", [row["rescueOrder"], 0, False]),
        ]
        images = abi_batch(client, image_specs, block_tag, args.rpc_batch_size)
        output_rows.append({
            "rescueOrder": row["rescueOrder"],
            "catId": row["catId"],
            "ownedAccessoryCount": balance,
            "recordedAccessoryCount": record_count,
            "ownedAccessories": [
                {**item, "placement": dict(zip(["offsetX", "offsetY", "width", "height", "mirror", "background"], placement))}
                for item, placement in zip(owned, placements)
            ],
            "baseImage": normalize_svg(images[0][0]),
            "accessorizedImage": normalize_svg(images[1][0]),
            "accessorizedDiffersFromBase": images[0][0] != images[1][0],
        })
    return {
        "schemaVersion": 1,
        "status": "completed" if output_rows else "completed-no-accessories-found-in-bounded-scan",
        "scanRange": {"startRescueOrder": 0, "endRescueOrder": len(scan_rows) - 1, "count": len(scan_rows)},
        "catLimit": args.accessory_cat_limit,
        "recordLimitPerCat": args.accessory_record_limit,
        "rows": output_rows,
        "boundary": "bounded pinned-block composition evidence only; not a complete ownership, definition, or worn-accessory index",
    }


def input_records(contracts: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    paths: list[tuple[Path, str]] = [
        (ROOT / "data/contract-registry.json", "address-bound contract and ABI ownership"),
        (ROOT / "data/materialization-parity-cases.json", "existing representative baseline selection"),
        (ROOT / "data/materialization-parity-results.json", "existing zero-network parity baseline"),
        (ROOT / "data/mooncat-population/manifest.json", "local identity and trait evidence owner"),
        (ROOT / "data/mooncat-renders/manifest.json", "local parser-render evidence owner"),
        (ROOT / "scripts/verify-onchain-materialization.py", "network verifier implementation"),
        (ROOT / "scripts/onchain_materialization_lib.py", "ABI, RPC, hashing, and SVG normalization implementation"),
    ]
    for contract in contracts.values():
        paths.append((ROOT / contract["abiArtifact"]["path"], f"exact local ABI for {contract['key']}"))
    population_manifest = read_json(ROOT / "data/mooncat-population/manifest.json")
    render_manifest = read_json(ROOT / "data/mooncat-renders/manifest.json")
    paths.extend((ROOT / item["path"], "generated population input shard") for item in population_manifest["layout"]["shards"])
    paths.extend((ROOT / item["path"], "generated parser-render input shard") for item in render_manifest["layout"]["shards"])
    seen, records = set(), []
    for path, role in paths:
        relative = path.relative_to(ROOT).as_posix()
        if relative not in seen:
            records.append(file_record(path, role))
            seen.add(relative)
    return records


def build_manifest(
    args: argparse.Namespace,
    block: dict[str, Any],
    code: list[dict[str, Any]],
    labels: dict[str, list[str]],
    representative: dict[str, Any],
    checkpoint: dict[str, Any],
    contracts: dict[str, dict[str, Any]],
    accessory: dict[str, Any] | None,
    run_stop: str | None = None,
) -> dict[str, Any]:
    surfaces = {}
    for name, state in checkpoint["surfaces"].items():
        surfaces[name] = {
            "status": state["status"],
            "completedCount": state["nextRescueOrder"],
            "targetCount": 0 if state["status"] == "not-requested" else POPULATION_COUNT,
            "definiteMismatchCount": sum(state.get("mismatchCounts", {}).values()),
            "mismatchCounts": state.get("mismatchCounts", {}),
            "incomparableCounts": state.get("incomparableCounts", {}),
            "notEvaluatedCounts": state.get("notEvaluatedCounts", {}),
            "comparisonCounts": state.get("comparisonCounts", {
                "parserStructure": {"passed": 0, "failed": 0, "incomparable": 0},
                "svgUsedColorsSubsetOfColorsOf": {"passed": 0, "failed": 0, "notEvaluated": 0},
            }),
            "shards": state["shards"],
        }
    generated_files = [
        file_record(REPRESENTATIVE_PATH, "representative pinned-block evidence"),
        file_record(CHECKPOINT_PATH, "resumable pinned-block scan state"),
    ]
    for surface in surfaces.values():
        generated_files.extend(surface["shards"])
    if accessory is not None:
        generated_files.append(file_record(ACCESSORY_PATH, "bounded accessory pinned-block evidence"))
    return {
        "schemaVersion": 1,
        "status": "completed" if all(value["status"] in {"completed", "not-requested"} for value in surfaces.values()) else "partial-resumable",
        "scope": "Read-only Ethereum-mainnet materialization evidence at one exact block; no transaction submission, source equivalence, or current-forever claim.",
        "block": block,
        "provider": {"classification": "user-supplied-environment-json-rpc", "environmentVariable": args.rpc_env, "endpointPersisted": False},
        "generation": {
            "script": "scripts/verify-onchain-materialization.py",
            "resumeCommand": (
                f"python scripts/verify-onchain-materialization.py --rpc-env {args.rpc_env} --mode {args.mode} --resume "
                f"--representative-count {args.representative_count} --rpc-batch-size {args.rpc_batch_size} "
                f"--shard-size {args.shard_size}"
                + (" --full-svg" if args.full_svg else "")
                + (" --accessories" if args.accessories else "")
                + (f" --accessory-scan-limit {args.accessory_scan_limit} --accessory-cat-limit {args.accessory_cat_limit} --accessory-record-limit {args.accessory_record_limit}" if args.accessories else "")
            ),
            "representativeRefreshCommand": (
                f"python scripts/verify-onchain-materialization.py --rpc-env {args.rpc_env} --mode representative "
                f"--resume --refresh-representative --representative-count {args.representative_count} "
                f"--rpc-batch-size {args.rpc_batch_size} --shard-size {args.shard_size}"
            ),
            "networkDependency": "explicit-user-supplied-ethereum-json-rpc",
            "ordering": "ascending rescueOrder",
            "boundedConcurrency": "sequential HTTP requests containing at most the configured JSON-RPC batch size",
        },
        "contracts": code,
        "traitLabelTables": labels,
        "representative": {
            "status": representative["status"],
            "count": len(representative["rows"]),
            "baseVerificationSucceeded": representative["baseVerificationSucceeded"],
            "definiteMismatchCount": representative["definiteMismatchCount"],
            "mismatchCounts": representative["mismatchCounts"],
            "incomparableCounts": representative["incomparableCounts"],
            "notEvaluatedCounts": representative["notEvaluatedCounts"],
            "comparisonCounts": representative["comparisonCounts"],
            "structuralGeometry": summarize_structural_geometry(representative["rows"]),
            "path": REPRESENTATIVE_PATH.relative_to(ROOT).as_posix(),
            "sha256": sha256_bytes(REPRESENTATIVE_PATH.read_bytes()),
        },
        "exhaustive": surfaces,
        "accessories": {
            "status": accessory["status"] if accessory is not None else "not-requested",
            "path": ACCESSORY_PATH.relative_to(ROOT).as_posix() if accessory is not None else None,
            "rowCount": len(accessory["rows"]) if accessory is not None else 0,
        },
        "providerOrRuntimeStop": run_stop,
        "inputFiles": input_records(contracts),
        "generatedFiles": generated_files,
        "boundaries": [
            "Runtime code hashes establish deployed code presence only, not verified-source/compiler equivalence.",
            "ABI calls establish behavior only at the recorded mainnet block number and hash.",
            "Exact SVG equality means byte-identical UTF-8 returned strings; structural comparison is reported separately.",
            "Human-facing color classifications are not compared to MoonCatColors contract palettes.",
            "Representative evidence is not exhaustive proof; each exhaustive surface has an exact completion count.",
            "Accessory evidence, when present, is a bounded sample and not a current or complete ownership index.",
        ],
    }


def verify_block_unchanged(client: JsonRpcClient, block: dict[str, Any]) -> None:
    repeated = client.call("eth_getBlockByNumber", [block["numberHex"], False])
    if not isinstance(repeated, dict) or repeated.get("hash", "").lower() != block["hash"]:
        raise MaterializationError("pinned block hash changed or became unavailable before completion")


def print_local_plan(args: argparse.Namespace) -> None:
    contracts, abis = load_contracts()
    population, _ = load_population_and_renders()
    selected, coverage = select_representatives(population, args.representative_count)
    for _, abi, signature, values in call_specs_for_cat(population[selected[0]], contracts, abis):
        encode_call(abi, signature, values)
    for signature, count in TRAIT_LABEL_SIGNATURES.values():
        for index in range(count):
            encode_call(abis["mooncatTraits"], signature, [index])
    if args.accessories:
        for key, signature, values in [
            ("mooncatAccessories", "balanceOf(uint256)", [0]),
            ("mooncatAccessories", "ownedAccessoryByIndex(uint256,uint256)", [0, 0]),
            ("mooncatAccessoryImages", "placementOf(uint256,uint256)", [0, 0]),
            ("mooncatAccessoryImages", "accessorizedImageOf(uint256,uint8,bool)", [0, 0, False]),
        ]:
            encode_call(abis[key], signature, values)
    full_calls = {
        "identityTraits": POPULATION_COUNT * 3 if args.mode == "full" else 0,
        "colors": POPULATION_COUNT * 6 if args.mode == "full" else 0,
        "svgFalse": POPULATION_COUNT * 2 if args.full_svg else 0,
    }
    print(
        f"OK: local plan resolves 8 core contracts, 16 representative call surfaces, "
        f"{len(selected)} deterministic representatives, coverage tokens={len(coverage['coveredTokens'])}; "
        f"estimated exhaustive eth_call counts identity={full_calls['identityTraits']}, "
        f"colors={full_calls['colors']}, svgFalse={full_calls['svgFalse']}"
    )


def main() -> int:
    args = parse_args()
    try:
        validate_args(args)
        self_test()
        if args.plan:
            print_local_plan(args)
            return 0
        endpoint = os.environ.get(args.rpc_env)
        if not endpoint:
            raise MaterializationError(f"required RPC environment variable is absent: {args.rpc_env}")
        if args.resume:
            if not CHECKPOINT_PATH.is_file():
                raise MaterializationError("--resume requires data/onchain-materialization/checkpoint.json")
            checkpoint = read_json(CHECKPOINT_PATH)
        else:
            existing = [path for path in OUTPUT_ROOT.rglob("*") if path.is_file()] if OUTPUT_ROOT.exists() else []
            if existing:
                raise MaterializationError("output directory already contains files; use --resume or preserve/remove it deliberately")
            checkpoint = None
        contracts, abis = load_contracts()
        client = JsonRpcClient(endpoint, timeout=args.timeout, retries=args.retries)
        block = select_block(client, args, checkpoint)
        block_tag = block["numberHex"]
        if checkpoint is None:
            checkpoint = init_checkpoint(block, args)
            atomic_write_json(CHECKPOINT_PATH, checkpoint)
        else:
            expected_configuration = checkpoint.get("configuration", {})
            if expected_configuration.get("shardSize") != args.shard_size or expected_configuration.get("representativeCount") != args.representative_count:
                raise MaterializationError("resume shard/representative configuration differs from checkpoint")
            if expected_configuration.get("mode") == "full" and args.mode != "full":
                raise MaterializationError("a full-mode checkpoint cannot resume in representative mode")
            if expected_configuration.get("fullSvgRequested") and not args.full_svg:
                raise MaterializationError("a full-SVG checkpoint must resume with --full-svg")
            if args.mode == "full":
                checkpoint["configuration"]["mode"] = "full"
                checkpoint["configuration"]["fullSvgRequested"] = bool(args.full_svg or expected_configuration.get("fullSvgRequested"))
                checkpoint["configuration"]["rpcBatchSize"] = args.rpc_batch_size
                atomic_write_json(CHECKPOINT_PATH, checkpoint)
            checkpoint["configuration"]["comparisonAccountingVersion"] = 2
            for state in checkpoint["surfaces"].values():
                state.setdefault("incomparableCounts", {})
                state.setdefault("notEvaluatedCounts", {})
                state.setdefault("comparisonCounts", {
                    "parserStructure": {"passed": 0, "failed": 0, "incomparable": 0},
                    "svgUsedColorsSubsetOfColorsOf": {"passed": 0, "failed": 0, "notEvaluated": 0},
                })
        code = verify_code(client, contracts, block_tag, args.rpc_batch_size)
        labels = trait_label_maps(client, contracts["mooncatTraits"], abis["mooncatTraits"], block_tag, args.rpc_batch_size)
        population, renders = load_population_and_renders()
        selected, coverage = select_representatives(population, args.representative_count)
        if REPRESENTATIVE_PATH.is_file() and args.resume and not args.refresh_representative:
            representative = read_json(REPRESENTATIVE_PATH)
        else:
            if args.refresh_representative:
                prior = read_json(REPRESENTATIVE_PATH)
                prior_orders = [row.get("rescueOrder") for row in prior.get("rows", [])]
                if prior_orders != selected:
                    raise MaterializationError("representative refresh selection differs from the existing checkpointed sample")
            representative = run_representatives(client, population, renders, selected, coverage, contracts, abis, labels, block_tag, args.rpc_batch_size)
            if args.refresh_representative:
                verify_block_unchanged(client, block)
            atomic_write_json(REPRESENTATIVE_PATH, representative)
        run_stop = None
        if args.mode == "full":
            try:
                run_full_surface("identityTraits", client, checkpoint, population, renders, contracts, abis, labels, block_tag, args)
                run_full_surface("colors", client, checkpoint, population, renders, contracts, abis, labels, block_tag, args)
                if args.full_svg:
                    run_full_surface("svgFalse", client, checkpoint, population, renders, contracts, abis, labels, block_tag, args)
                else:
                    checkpoint["surfaces"]["svgFalse"]["status"] = "not-requested"
            except MaterializationError as exc:
                run_stop = str(exc)
                checkpoint["status"] = "partial-resumable"
                flush_partial_shards(checkpoint)
        else:
            for surface in SURFACE_NAMES:
                checkpoint["surfaces"][surface]["status"] = "not-requested"
        accessory = None
        if args.accessories and run_stop is None:
            if not representative["baseVerificationSucceeded"]:
                accessory = {
                    "schemaVersion": 1,
                    "status": "skipped-base-verification-not-successful",
                    "reason": "required representative base checks did not all pass",
                    "rows": [],
                    "boundary": "no accessory composition call or claim was made",
                }
            else:
                try:
                    accessory = run_accessories(client, population, contracts, abis, block_tag, args)
                except MaterializationError as exc:
                    accessory = {
                        "schemaVersion": 1,
                        "status": "failed-bounded-phase",
                        "reason": str(exc),
                        "rows": [],
                        "boundary": "base verification remains valid; no accessory composition claim is made",
                    }
            atomic_write_json(ACCESSORY_PATH, accessory)
        verify_block_unchanged(client, block)
        checkpoint["status"] = "completed" if all(value["status"] in {"completed", "not-requested"} for value in checkpoint["surfaces"].values()) else "partial-resumable"
        atomic_write_json(CHECKPOINT_PATH, checkpoint)
        manifest = build_manifest(args, block, code, labels, representative, checkpoint, contracts, accessory, run_stop)
        atomic_write_json(MANIFEST_PATH, manifest)
        print(
            f"OK: pinned mainnet block {block['number']} {block['hash']}; "
            f"8 contracts, {len(representative['rows'])} representatives, "
            f"definiteMismatches={representative['definiteMismatchCount']}, "
            f"identity={manifest['exhaustive']['identityTraits']['completedCount']}, "
            f"colors={manifest['exhaustive']['colors']['completedCount']}, "
            f"svgFalse={manifest['exhaustive']['svgFalse']['completedCount']}"
        )
        if run_stop is not None:
            print(f"ERROR: exhaustive sweep stopped with resumable evidence: {run_stop}", file=sys.stderr)
            return 1
        return 0
    except MaterializationError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
