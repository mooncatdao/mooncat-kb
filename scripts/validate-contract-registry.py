#!/usr/bin/env python3
"""Independently validate the zero-network MoonCat ABI and event registry."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "references/upstream/mooncatrescue/libmooncat-limited.js"
CONTRACTS = ROOT / "data/contracts.json"
IDENTIFIERS = ROOT / "data/identifier-conventions.json"
CONTRACT_REGISTRY = ROOT / "data/contract-registry.json"
EVENT_REGISTRY = ROOT / "data/event-registry.json"
RECIPES = ROOT / "data/event-indexer-recipes.json"

CORE_KEYS = {
    "mooncatRescue", "acclimatedMoonCats", "mooncatReference", "mooncatTraits",
    "mooncatColors", "mooncatSVGs", "mooncatAccessories", "mooncatAccessoryImages",
}
ADJACENT_KEYS = {"moonCatsWrapped", "catNamer"}
ALLOWED_ABI_STATUSES = {"exact-local-abi-extracted", "semantic-only", "unavailable-local-exact-abi"}
GENERIC_ERC721 = {"Approval", "ApprovalForAll", "Transfer"}
GENERIC_ERC998 = {"ReceivedChild", "TransferChild"}
GENERIC_ADMIN = {"OwnershipTransferred", "Paused", "Unpaused"}

ROUND_CONSTANTS = [
    0x0000000000000001, 0x0000000000008082, 0x800000000000808A,
    0x8000000080008000, 0x000000000000808B, 0x0000000080000001,
    0x8000000080008081, 0x8000000000008009, 0x000000000000008A,
    0x0000000000000088, 0x0000000080008009, 0x000000008000000A,
    0x000000008000808B, 0x800000000000008B, 0x8000000000008089,
    0x8000000000008003, 0x8000000000008002, 0x8000000000000080,
    0x000000000000800A, 0x800000008000000A, 0x8000000080008081,
    0x8000000000008080, 0x0000000080000001, 0x8000000080008008,
]
ROTATION = [
    [0, 36, 3, 41, 18],
    [1, 44, 10, 45, 2],
    [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56],
    [27, 20, 39, 8, 14],
]
MASK64 = (1 << 64) - 1


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def rotate_left(value: int, shift: int) -> int:
    if shift == 0:
        return value & MASK64
    return ((value << shift) | (value >> (64 - shift))) & MASK64


def keccak_f1600(state: list[int]) -> None:
    for round_constant in ROUND_CONSTANTS:
        columns = [state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20] for x in range(5)]
        deltas = [columns[(x - 1) % 5] ^ rotate_left(columns[(x + 1) % 5], 1) for x in range(5)]
        for x in range(5):
            for y in range(5):
                state[x + 5 * y] ^= deltas[x]
        moved = [0] * 25
        for x in range(5):
            for y in range(5):
                moved[y + 5 * ((2 * x + 3 * y) % 5)] = rotate_left(state[x + 5 * y], ROTATION[x][y])
        for x in range(5):
            for y in range(5):
                state[x + 5 * y] = moved[x + 5 * y] ^ ((~moved[(x + 1) % 5 + 5 * y]) & moved[(x + 2) % 5 + 5 * y])
        state[0] ^= round_constant


def keccak256(data: bytes) -> bytes:
    rate = 136
    padded = bytearray(data)
    padded.append(0x01)
    padded.extend(b"\x00" * ((rate - len(padded) % rate - 1) % rate))
    padded.append(0x80)
    state = [0] * 25
    for offset in range(0, len(padded), rate):
        for index, byte in enumerate(padded[offset:offset + rate]):
            state[index // 8] ^= byte << (8 * (index % 8))
        keccak_f1600(state)
    output = bytearray()
    for index in range(32):
        output.append((state[index // 8] >> (8 * (index % 8))) & 0xFF)
    return bytes(output)


def normalize_item(item: dict[str, Any]) -> dict[str, Any]:
    result = dict(item)
    if result.get("type") in {"function", "constructor", "fallback", "receive"} and "stateMutability" not in result:
        if result.get("constant") is True:
            result["stateMutability"] = "view"
        elif result.get("payable") is True:
            result["stateMutability"] = "payable"
        else:
            result["stateMutability"] = "nonpayable"
    return result


def extract_source_abis() -> dict[str, list[dict[str, Any]]]:
    pattern = re.compile(r'Jh,\s*"(0x[0-9A-Fa-f]{40})",\s*Lj,\s*\'(\[.*?\])\'', re.DOTALL)
    result: dict[str, list[dict[str, Any]]] = {}
    for address, raw_json in pattern.findall(SOURCE.read_text(encoding="utf-8")):
        key = address.lower()
        if key in result:
            fail(f"duplicate source ABI address {address}")
        parsed = json.loads(raw_json)
        if not isinstance(parsed, list) or not all(isinstance(item, dict) for item in parsed):
            fail(f"source ABI for {address} is not an object array")
        result[key] = [normalize_item(item) for item in parsed]
    return result


def canonical_type(parameter: dict[str, Any]) -> str:
    value = parameter["type"]
    if not value.startswith("tuple"):
        return value
    components = ",".join(canonical_type(component) for component in parameter.get("components", []))
    return f"({components}){value[len('tuple') :]}"


def signature(item: dict[str, Any]) -> str:
    return f"{item['name']}({','.join(canonical_type(parameter) for parameter in item.get('inputs', []))})"


def artifact_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate_abi_items(contract_key: str, abi: list[dict[str, Any]], source_abi: list[dict[str, Any]]) -> None:
    if abi != source_abi:
        fail(f"{contract_key}: normalized ABI differs from the exact address-bound source")
    seen: set[tuple[str, str]] = set()
    for item in abi:
        item_type = item.get("type")
        if item_type in {"function", "event"}:
            normalized_signature = signature(item)
            identity = (item_type, normalized_signature)
            if identity in seen:
                fail(f"{contract_key}: duplicate normalized {item_type} signature {normalized_signature}")
            seen.add(identity)
        if item_type == "event":
            if not isinstance(item.get("anonymous"), bool):
                fail(f"{contract_key}: event lacks boolean anonymous flag")
            for parameter in item.get("inputs", []):
                if not isinstance(parameter.get("indexed"), bool):
                    fail(f"{contract_key}: event parameter lacks boolean indexed flag")


def expected_event_shape(contract_key: str, contract: dict[str, Any], item: dict[str, Any]) -> dict[str, Any]:
    parameters = []
    for position, parameter in enumerate(item.get("inputs", [])):
        record = {
            "position": position,
            "name": parameter.get("name", ""),
            "type": parameter["type"],
            "indexed": parameter.get("indexed", False),
        }
        if "internalType" in parameter:
            record["internalType"] = parameter["internalType"]
        parameters.append(record)
    canonical = signature(item)
    return {
        "key": f"{contract_key}:{canonical}",
        "contractKey": contract_key,
        "contractName": contract["contractName"],
        "contractAddress": contract["address"],
        "name": item["name"],
        "signature": canonical,
        "anonymous": item.get("anonymous", False),
        "parameters": parameters,
    }


def expected_event_category(contract_key: str, event_name: str) -> tuple[str, bool]:
    if contract_key in {"acclimatedMoonCats", "moonCatsWrapped"} and event_name in GENERIC_ERC721:
        return "generic-erc721", False
    if contract_key == "mooncatRescue" and event_name == "Transfer":
        return "generic-erc20-style", False
    if event_name in GENERIC_ERC998:
        return "generic-erc998", False
    if event_name in GENERIC_ADMIN:
        return "generic-administration", False
    return "mooncat-specific-protocol", True


def main() -> int:
    try:
        contracts_source = json.loads(CONTRACTS.read_text(encoding="utf-8"))
        identifiers = json.loads(IDENTIFIERS.read_text(encoding="utf-8"))
        contract_registry = json.loads(CONTRACT_REGISTRY.read_text(encoding="utf-8"))
        event_registry = json.loads(EVENT_REGISTRY.read_text(encoding="utf-8"))
        recipes = json.loads(RECIPES.read_text(encoding="utf-8"))
        source_abis = extract_source_abis()
    except (OSError, json.JSONDecodeError, KeyError) as exc:
        fail(str(exc))

    if keccak256(b"").hex() != "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470":
        fail("Ethereum Keccak-256 empty-input vector failed")
    if keccak256(b"Transfer(address,address,uint256)").hex() != "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef":
        fail("Ethereum Transfer topic vector failed")

    source_contracts = {item["key"]: item for item in contracts_source.get("contracts", [])}
    source_sha256 = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    generation = contract_registry.get("generation", {})
    if generation.get("abiSourcePath") != SOURCE.relative_to(ROOT).as_posix() or generation.get("abiSourceSha256") != source_sha256:
        fail("contract registry ABI source path/hash does not match checked-in evidence")
    registry_contracts = contract_registry.get("contracts", [])
    if len(registry_contracts) != 10:
        fail("contract registry must contain exactly eight core and two adjacent entries")
    by_key = {item.get("key"): item for item in registry_contracts}
    if set(by_key) != CORE_KEYS | ADJACENT_KEYS or len(by_key) != len(registry_contracts):
        fail("contract registry keys are missing, duplicated, or outside reviewed scope")
    classification = contract_registry.get("classification", {})
    if set(classification.get("coreContractKeys", [])) != CORE_KEYS or len(classification.get("coreContractKeys", [])) != 8:
        fail("core materialization classification must contain exactly the eight reviewed keys")
    if set(classification.get("adjacentContractKeys", [])) != ADJACENT_KEYS:
        fail("adjacent classification must contain WMCR and CatNamer only")

    convention_kinds = {item.get("key") for item in identifiers.get("identifierKinds", [])}
    local_kinds = {item.get("key") for item in contract_registry.get("localIdentifierKinds", [])}
    if "mooncatRescueOrder" not in local_kinds:
        fail("contract registry local identifier enum must define mooncatRescueOrder")
    if event_registry.get("localIdentifierKinds") != [item.get("key") for item in contract_registry.get("localIdentifierKinds", [])]:
        fail("event and contract registry local identifier enums differ")
    allowed_kinds = convention_kinds | local_kinds

    expected_events: dict[str, dict[str, Any]] = {}
    function_names: dict[str, set[str]] = {}
    exact_count = 0
    semantic_count = 0
    for key, record in by_key.items():
        source_contract = source_contracts.get(key)
        if not source_contract:
            fail(f"{key}: missing from data/contracts.json")
        if record.get("address", "").lower() != source_contract.get("address", "").lower() or record.get("network") != source_contract.get("network"):
            fail(f"{key}: address or network does not align with data/contracts.json")
        expected_class = "core" if key in CORE_KEYS else "adjacent"
        if record.get("classification") != expected_class:
            fail(f"{key}: invalid core/adjacent classification")
        for domain in record.get("identifierDomains", []):
            context = domain.get("parameterContext")
            identifier_kind = domain.get("identifierKind")
            if identifier_kind not in allowed_kinds:
                fail(f"{key}: unresolved identifier domain kind {identifier_kind}")
            if context == "rescueOrder":
                if identifier_kind == "localRescueOrderIndex":
                    fail(f"{key}: rescueOrder identifier domain cannot use localRescueOrderIndex")
                if identifier_kind != "mooncatRescueOrder":
                    fail(f"{key}: rescueOrder identifier domain must use mooncatRescueOrder")
        status = record.get("abiStatus")
        if status not in ALLOWED_ABI_STATUSES:
            fail(f"{key}: unsupported abiStatus")
        artifact = record.get("abiArtifact")
        source_abi = source_abis.get(source_contract["address"].lower())
        if status == "exact-local-abi-extracted":
            exact_count += 1
            if source_abi is None or not isinstance(artifact, dict):
                fail(f"{key}: exact ABI status lacks matching local source/artifact")
            artifact_path = ROOT / artifact.get("path", "")
            if artifact_path.parent != ROOT / "data/abi-registry" or not artifact_path.is_file():
                fail(f"{key}: ABI artifact path is missing or outside data/abi-registry")
            if artifact.get("sha256") != artifact_hash(artifact_path):
                fail(f"{key}: ABI artifact hash mismatch")
            payload = json.loads(artifact_path.read_text(encoding="utf-8"))
            if payload.get("contractKey") != key or payload.get("address", "").lower() != source_contract["address"].lower():
                fail(f"{key}: ABI artifact identity mismatch")
            payload_source = payload.get("source", {})
            if payload_source.get("path") != SOURCE.relative_to(ROOT).as_posix() or payload_source.get("sourceSha256") != source_sha256:
                fail(f"{key}: ABI artifact source provenance mismatch")
            abi = payload.get("abi")
            if not isinstance(abi, list):
                fail(f"{key}: ABI artifact lacks an ABI array")
            validate_abi_items(key, abi, source_abi)
            function_names[key] = {item["name"] for item in abi if item.get("type") == "function"}
            if artifact.get("abiItemCount") != len(abi):
                fail(f"{key}: ABI item count mismatch")
            if artifact.get("functionCount") != sum(item.get("type") == "function" for item in abi) or artifact.get("eventCount") != sum(item.get("type") == "event" for item in abi):
                fail(f"{key}: ABI function/event count mismatch")
            for item in abi:
                if item.get("type") == "event":
                    shape = expected_event_shape(key, source_contract, item)
                    if shape["key"] in expected_events:
                        fail(f"duplicate contract-scoped event key {shape['key']}")
                    expected_events[shape["key"]] = shape
        else:
            semantic_count += status == "semantic-only"
            if artifact is not None:
                fail(f"{key}: non-exact ABI status must not link a full ABI artifact")

    if exact_count != 9 or semantic_count != 1:
        fail(f"expected 9 exact ABI contracts and 1 semantic-only contract, got {exact_count} and {semantic_count}")
    cat_namer = by_key["catNamer"]
    if cat_namer.get("abiStatus") != "semantic-only" or cat_namer.get("abiArtifact") is not None:
        fail("CatNamer must remain semantic-only without a fabricated full ABI")

    registered_events = event_registry.get("events", [])
    by_event_key = {item.get("key"): item for item in registered_events}
    if len(by_event_key) != len(registered_events) or set(by_event_key) != set(expected_events):
        fail("event registry keys do not exactly match extracted ABI events")
    mooncat_specific = 0
    for key, expected in expected_events.items():
        actual = by_event_key[key]
        for field in ("contractKey", "contractName", "contractAddress", "name", "signature", "anonymous"):
            left = actual.get(field)
            right = expected[field]
            if field == "contractAddress":
                left, right = str(left).lower(), str(right).lower()
            if left != right:
                fail(f"{key}: event {field} differs from extracted ABI")
        actual_parameters = actual.get("parameters", [])
        if len(actual_parameters) != len(expected["parameters"]):
            fail(f"{key}: event parameter count mismatch")
        for actual_parameter, expected_parameter in zip(actual_parameters, expected["parameters"]):
            for field, value in expected_parameter.items():
                if actual_parameter.get(field) != value:
                    fail(f"{key}: parameter {field} order/type/indexed mismatch")
            identifier_kind = actual_parameter.get("identifierKind")
            if identifier_kind is not None and identifier_kind not in allowed_kinds:
                fail(f"{key}: unresolved identifierKind {identifier_kind}")
            if actual_parameter.get("name") == "rescueOrder":
                if identifier_kind == "localRescueOrderIndex":
                    fail(f"{key}: rescueOrder event parameter cannot use localRescueOrderIndex")
                if identifier_kind != "mooncatRescueOrder":
                    fail(f"{key}: rescueOrder event parameter must use mooncatRescueOrder")
        expected_topic = "0x" + keccak256(actual["signature"].encode("ascii")).hex()
        if actual.get("topic0") != expected_topic:
            fail(f"{key}: incorrect Ethereum Keccak topic0")
        expected_category, expected_specific = expected_event_category(actual["contractKey"], actual["name"])
        if actual.get("category") != expected_category or actual.get("mooncatSpecific") is not expected_specific:
            fail(f"{key}: incorrect generic/MoonCat-specific classification")
        for surface in actual.get("semantics", {}).get("corroborationSurfaces", []):
            surface_name = surface.split("(", 1)[0]
            if surface_name not in function_names.get(actual["contractKey"], set()):
                fail(f"{key}: unresolved corroboration surface {surface}")
        mooncat_specific += actual["mooncatSpecific"]

    counts = event_registry.get("counts", {})
    by_contract_counts = {key: sum(event["contractKey"] == key for event in registered_events) for key in by_key}
    if counts.get("events") != len(registered_events) or counts.get("mooncatSpecific") != mooncat_specific or counts.get("generic") != len(registered_events) - mooncat_specific or counts.get("byContract") != by_contract_counts:
        fail("event registry counts are stale or inconsistent")

    recipe_records = recipes.get("recipes", [])
    recipe_keys = [item.get("key") for item in recipe_records]
    if len(recipe_keys) != len(set(recipe_keys)) or len(recipe_records) < 5:
        fail("indexer recipes must be unique and cover the required practical workflows")
    for recipe in recipe_records:
        contract_keys = recipe.get("contractKeys", [])
        if not contract_keys or not set(contract_keys) <= set(by_key):
            fail(f"recipe {recipe.get('key')} has unresolved contract keys")
        if not recipe.get("events") or not recipe.get("identifierGuidance") or not recipe.get("corroborationSurfaces") or not recipe.get("exclusions"):
            fail(f"recipe {recipe.get('key')} lacks required guidance")
        for event_signature in recipe["events"]:
            if not any(event["contractKey"] in contract_keys and event["signature"] == event_signature for event in registered_events):
                fail(f"recipe {recipe.get('key')} references unresolved event {event_signature}")
        for surface in recipe["corroborationSurfaces"]:
            surface_name = surface.split("(", 1)[0]
            if not any(surface_name in function_names.get(contract_key, set()) for contract_key in contract_keys):
                fail(f"recipe {recipe.get('key')} references unresolved corroboration surface {surface}")
    required_recipes = {"original-rescue-adoption-history", "mooncat-naming", "acclimation-lifecycle", "wmcr-wrap-unwrap", "accessory-lifecycle"}
    if not required_recipes <= set(recipe_keys):
        fail("required rescue, naming, acclimation, WMCR, or accessory recipe is missing")

    print(
        "OK: "
        f"{len(by_key)} contracts ({exact_count} exact ABI, {semantic_count} semantic-only), "
        f"{len(registered_events)} events ({mooncat_specific} MoonCat-specific, {len(registered_events) - mooncat_specific} generic), "
        f"{len(recipe_records)} recipes, exact ABI alignment, overloads, identifier kinds, and Ethereum Keccak topic0 values validated"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
