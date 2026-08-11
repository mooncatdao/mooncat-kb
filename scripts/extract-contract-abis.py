#!/usr/bin/env python3
"""Extract deterministic MoonCat ABI, contract, event, and recipe registries."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "references/upstream/mooncatrescue/libmooncat-limited.js"
CONTRACTS_SOURCE = ROOT / "data/contracts.json"
NAME_INDEX_SOURCE = ROOT / "data/name-index-integration.json"
ABI_DIR = ROOT / "data/abi-registry"
CONTRACT_REGISTRY = ROOT / "data/contract-registry.json"
EVENT_REGISTRY = ROOT / "data/event-registry.json"
RECIPES = ROOT / "data/event-indexer-recipes.json"
SOURCE_REF = "mooncatrescue-libmooncat-limited-js"

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
ADJACENT_KEYS = ["moonCatsWrapped", "catNamer"]
EXPECTED_KEYS = CORE_KEYS + ADJACENT_KEYS

ROLES = {
    "mooncatRescue": "Original MoonCat rescue, adoption, ownership, naming, and Genesis-release contract.",
    "acclimatedMoonCats": "Current ERC-721/ERC-998 Acclimated wrapper whose token ID is rescue order within this exact contract.",
    "mooncatReference": "On-chain documentation and contract-reference registry used by materialization helpers.",
    "mooncatTraits": "On-chain MoonCat trait and identity read surface.",
    "mooncatColors": "On-chain MoonCat and accessory color and palette-generation surface.",
    "mooncatSVGs": "On-chain base MoonCat SVG materialization surface.",
    "mooncatAccessories": "On-chain accessory definition, management, assignment, and wear-state surface.",
    "mooncatAccessoryImages": "On-chain accessory PNG and accessorized SVG composition surface.",
    "moonCatsWrapped": "Historical adjacent WMCR ERC-721 wrapper with mapping-backed token IDs.",
    "catNamer": "Adjacent naming helper context; original MoonCatRescue remains canonical name storage.",
}

REVIEWED_FILES = {
    "mooncatRescue": [
        "data/contracts.json",
        "data/contract-surfaces.json",
        "data/mooncat-naming.json",
        "data/name-index-integration.json",
        "data/identifier-conventions.json",
        "data/protocol-constants.json",
    ],
    "acclimatedMoonCats": [
        "data/contracts.json",
        "data/contract-surfaces.json",
        "data/identifier-conventions.json",
    ],
    "moonCatsWrapped": [
        "data/contracts.json",
        "data/contract-surfaces.json",
        "data/older-wrapper-internals.json",
        "data/identifier-conventions.json",
    ],
    "mooncatReference": ["data/contracts.json", "data/contract-surfaces.json", "data/materialization-internals.json"],
    "mooncatTraits": ["data/contracts.json", "data/contract-surfaces.json", "data/materialization-internals.json", "data/identifier-conventions.json"],
    "mooncatColors": ["data/contracts.json", "data/contract-surfaces.json", "data/materialization-internals.json"],
    "mooncatSVGs": ["data/contracts.json", "data/contract-surfaces.json", "data/materialization-internals.json"],
    "mooncatAccessories": [
        "data/contracts.json",
        "data/contract-surfaces.json",
        "data/mooncat-accessories-internals.json",
        "data/identifier-conventions.json",
    ],
    "mooncatAccessoryImages": [
        "data/contracts.json",
        "data/contract-surfaces.json",
        "data/mooncat-accessory-images-internals.json",
        "data/identifier-conventions.json",
    ],
    "catNamer": ["data/contracts.json", "data/contract-surfaces.json", "data/mooncat-naming.json"],
}

LOCAL_IDENTIFIER_KINDS = [
    {
        "key": "contractScopedExternalTokenId",
        "scope": "ERC-998 child token parameters only",
        "boundary": "Interpret only with the accompanying child-contract address; never treat as rescue order by default.",
    },
    {
        "key": "mooncatRescueOrder",
        "scope": "Contract-level uint256 MoonCat rescue-order identity for explicitly named rescueOrder parameters on reviewed on-chain contracts",
        "boundary": "Numerically aligned with the reviewed rescue-order convention but distinct from localRescueOrderIndex; not a generic token ID or local membership index.",
    },
    {
        "key": "ownedAccessoryIndex",
        "scope": "MoonCatAccessories local array index under one rescueOrder",
        "boundary": "Not accessoryId, rescueOrder, paletteIndex, or a token ID.",
    },
    {
        "key": "managedAccessoryIndex",
        "scope": "MoonCatAccessories manager-local enumeration index",
        "boundary": "Resolves to an accessoryId and is not stable global accessory identity.",
    },
    {
        "key": "paletteIndex",
        "scope": "MoonCatAccessories per-definition palette slot",
        "boundary": "Not a palette value, global color index, accessoryId, or zIndex.",
    },
]

GENERIC_ERC721 = {"Approval", "ApprovalForAll", "Transfer"}
GENERIC_ERC998 = {"ReceivedChild", "TransferChild"}
GENERIC_ADMIN = {"OwnershipTransferred", "Paused", "Unpaused"}

EVENT_SEMANTICS: dict[tuple[str, str], dict[str, Any]] = {
    ("mooncatRescue", "CatRescued"): {
        "semanticStatus": "exact-event-shape-with-bounded-surface-semantics",
        "stateRelationship": "Records the emitted rescue recipient and bytes5 catId for a successful original-contract rescue; it is historical evidence, not current ownership.",
        "corroborationSurfaces": ["catOwners(bytes5)", "rescueOrder(uint256)"],
    },
    ("mooncatRescue", "CatNamed"): {
        "semanticStatus": "reviewed-state-relationship",
        "stateRelationship": "nameCat stores the supplied bytes32 and emits CatNamed, except an all-zero bytes32 leaves catNames storage zero and therefore does not consume persistent naming state.",
        "corroborationSurfaces": ["catNames(bytes5)", "getCatNames()", "getCatDetails(...)"],
        "relatedFiles": ["data/mooncat-naming.json", "data/name-index-integration.json"],
        "cautions": [
            "Event presence is not equivalent to current catNames storage because an all-zero name may emit repeatedly without a persistent state effect.",
            "Preserve raw bytes32 separately from UTF-8 display decoding and moderation.",
        ],
    },
    ("mooncatRescue", "CatAdopted"): {
        "semanticStatus": "exact-event-shape-with-bounded-surface-semantics",
        "stateRelationship": "Records an emitted adoption transfer with catId, price, previous address, and recipient; current ownership must be read separately.",
        "corroborationSurfaces": ["catOwners(bytes5)", "adoptionOffers(bytes5)", "adoptionRequests(bytes5)"],
    },
    ("mooncatRescue", "AdoptionOffered"): {
        "semanticStatus": "exact-event-shape-with-bounded-surface-semantics",
        "stateRelationship": "Records creation or replacement of an emitted adoption offer; it does not prove that the offer remains active.",
        "corroborationSurfaces": ["adoptionOffers(bytes5)"],
    },
    ("mooncatRescue", "AdoptionOfferCancelled"): {
        "semanticStatus": "exact-event-shape-with-bounded-surface-semantics",
        "stateRelationship": "Records an emitted adoption-offer cancellation for a catId.",
        "corroborationSurfaces": ["adoptionOffers(bytes5)"],
    },
    ("mooncatRescue", "AdoptionRequested"): {
        "semanticStatus": "exact-event-shape-with-bounded-surface-semantics",
        "stateRelationship": "Records an emitted adoption request; it does not prove that the request remains active.",
        "corroborationSurfaces": ["adoptionRequests(bytes5)"],
    },
    ("mooncatRescue", "AdoptionRequestCancelled"): {
        "semanticStatus": "exact-event-shape-with-bounded-surface-semantics",
        "stateRelationship": "Records an emitted adoption-request cancellation for a catId.",
        "corroborationSurfaces": ["adoptionRequests(bytes5)"],
    },
    ("mooncatRescue", "GenesisCatsAdded"): {
        "semanticStatus": "exact-event-shape-only",
        "stateRelationship": "Carries the exact emitted fixed array of 16 bytes5 catIds; no additional release, ownership, or current-state inference is encoded here.",
        "corroborationSurfaces": ["rescueOrder(uint256)", "catOwners(bytes5)"],
    },
    ("acclimatedMoonCats", "MoonCatAcclimated"): {
        "semanticStatus": "reviewed-contract-scoped-lifecycle",
        "stateRelationship": "Records completion of acclimation/wrapping for this exact contract; tokenId is the rescue-order-valued Acclimated token ID only in this contract scope.",
        "corroborationSurfaces": ["ownerOf(uint256)", "rescueOrderLookup()"],
    },
    ("acclimatedMoonCats", "MoonCatDeacclimated"): {
        "semanticStatus": "reviewed-contract-scoped-lifecycle",
        "stateRelationship": "Records completion of deacclimation/unwrapping for this exact contract; later current ownership or wrapper state requires a state read.",
        "corroborationSurfaces": ["ownerOf(uint256)", "rescueOrderLookup()"],
    },
    ("moonCatsWrapped", "Wrapped"): {
        "semanticStatus": "reviewed-mapping-backed-lifecycle",
        "stateRelationship": "Records the exact bytes5 catId and sequential mapping-backed WMCR tokenID assigned by this historical wrapper.",
        "corroborationSurfaces": ["_catIDToTokenID(bytes5)", "_tokenIDToCatID(uint256)", "ownerOf(uint256)"],
        "relatedFiles": ["data/older-wrapper-internals.json"],
    },
    ("moonCatsWrapped", "Unwrapped"): {
        "semanticStatus": "reviewed-mapping-backed-lifecycle",
        "stateRelationship": "Records return of the mapped bytes5 catId and burn of the WMCR tokenID; the tokenID is not rescue order.",
        "corroborationSurfaces": ["_catIDToTokenID(bytes5)", "_tokenIDToCatID(uint256)", "ownerOf(uint256)"],
        "relatedFiles": ["data/older-wrapper-internals.json"],
    },
    ("mooncatAccessories", "AccessoryCreated"): {
        "semanticStatus": "reviewed-accessory-lifecycle",
        "stateRelationship": "Records creation of an accessory definition whose accessoryId is its definition-array index.",
        "corroborationSurfaces": ["accessoryInfo(uint256)", "totalAccessories()", "managerOf(uint256)"],
    },
    ("mooncatAccessories", "AccessoryPurchased"): {
        "semanticStatus": "reviewed-accessory-lifecycle",
        "stateRelationship": "Records paid assignment of an accessoryId to a rescueOrder; the reviewed purchase path appends an owned record and decrements available supply.",
        "corroborationSurfaces": ["doesMoonCatOwnAccessory(uint256,uint256)", "balanceOf(uint256)", "ownedAccessoryByIndex(uint256,uint256)"],
    },
    ("mooncatAccessories", "AccessoryApplied"): {
        "semanticStatus": "reviewed-accessory-lifecycle",
        "stateRelationship": "Records manager assignment of an accessoryId, paletteIndex, and zIndex to a rescueOrder through the reviewed zero-price application path.",
        "corroborationSurfaces": ["doesMoonCatOwnAccessory(uint256,uint256)", "balanceOf(uint256)", "ownedAccessoryByIndex(uint256,uint256)"],
    },
    ("mooncatAccessories", "AccessoryDiscontinued"): {
        "semanticStatus": "reviewed-accessory-lifecycle",
        "stateRelationship": "Records discontinuation of future assignment/sale for a definition; reviewed semantics do not remove already-owned records.",
        "corroborationSurfaces": ["accessoryInfo(uint256)", "managerOf(uint256)"],
    },
    ("mooncatAccessories", "AccessoryManagementTransferred"): {
        "semanticStatus": "reviewed-accessory-lifecycle",
        "stateRelationship": "Records a definition manager change for an accessoryId.",
        "corroborationSurfaces": ["managerOf(uint256)"],
    },
    ("mooncatAccessories", "AccessoryPriceChanged"): {
        "semanticStatus": "reviewed-accessory-lifecycle",
        "stateRelationship": "Records a definition price change; it does not prove the price remains current.",
        "corroborationSurfaces": ["accessoryInfo(uint256)"],
    },
    ("mooncatAccessories", "EligibleListSet"): {
        "semanticStatus": "reviewed-accessory-lifecycle",
        "stateRelationship": "Records activation or replacement of definition eligibility-list behavior.",
        "corroborationSurfaces": ["isEligible(uint256,uint256)", "accessoryEligibleList(uint256)"],
    },
    ("mooncatAccessories", "EligibleListCleared"): {
        "semanticStatus": "reviewed-accessory-lifecycle",
        "stateRelationship": "Records clearing of definition eligibility-list behavior.",
        "corroborationSurfaces": ["isEligible(uint256,uint256)", "accessoryEligibleList(uint256)"],
    },
}

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
    while len(output) < 32:
        for index in range(rate):
            output.append((state[index // 8] >> (8 * (index % 8))) & 0xFF)
            if len(output) == 32:
                break
        if len(output) < 32:
            keccak_f1600(state)
    return bytes(output)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def render_json(value: Any) -> str:
    return json.dumps(value, indent=2, ensure_ascii=False) + "\n"


def normalize_abi_item(item: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(item)
    item_type = normalized.get("type")
    if item_type in {"function", "constructor", "fallback", "receive"} and "stateMutability" not in normalized:
        if normalized.get("constant") is True:
            normalized["stateMutability"] = "view"
        elif normalized.get("payable") is True:
            normalized["stateMutability"] = "payable"
        else:
            normalized["stateMutability"] = "nonpayable"
    return normalized


def canonical_type(parameter: dict[str, Any]) -> str:
    type_name = parameter["type"]
    if not type_name.startswith("tuple"):
        return type_name
    suffix = type_name[len("tuple"):]
    components = ",".join(canonical_type(component) for component in parameter.get("components", []))
    return f"({components}){suffix}"


def canonical_signature(item: dict[str, Any]) -> str:
    return f"{item['name']}({','.join(canonical_type(parameter) for parameter in item.get('inputs', []))})"


def extract_address_bound_abis(source_text: str) -> dict[str, list[dict[str, Any]]]:
    pattern = re.compile(r'Jh,\s*"(0x[0-9A-Fa-f]{40})",\s*Lj,\s*\'(\[.*?\])\'', re.DOTALL)
    found: dict[str, list[dict[str, Any]]] = {}
    for address, raw_json in pattern.findall(source_text):
        normalized_address = address.lower()
        if normalized_address in found:
            raise ValueError(f"duplicate address-bound ABI in source: {address}")
        value = json.loads(raw_json)
        if not isinstance(value, list) or not all(isinstance(item, dict) for item in value):
            raise ValueError(f"address-bound ABI is not an object array: {address}")
        found[normalized_address] = [normalize_abi_item(item) for item in value]
    return found


def load_contracts() -> dict[str, dict[str, Any]]:
    data = json.loads(CONTRACTS_SOURCE.read_text(encoding="utf-8"))
    contracts = {item["key"]: item for item in data["contracts"]}
    missing = sorted(set(EXPECTED_KEYS) - set(contracts))
    if missing:
        raise ValueError(f"missing reviewed contracts: {', '.join(missing)}")
    return contracts


def artifact_payload(contract: dict[str, Any], abi: list[dict[str, Any]], source_sha256: str) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "status": "exact-local-address-bound-abi",
        "contractKey": contract["key"],
        "contractName": contract["contractName"],
        "network": contract["network"],
        "address": contract["address"],
        "source": {
            "path": SOURCE.relative_to(ROOT).as_posix(),
            "sourceRef": SOURCE_REF,
            "sourceSha256": source_sha256,
            "matchRule": "case-insensitive exact 20-byte contract address from data/contracts.json",
        },
        "normalization": {
            "abiItemOrder": "preserved from embedded address-bound JSON",
            "parameterOrder": "preserved",
            "legacyStateMutability": "derived without removing legacy constant or payable fields",
            "overloads": "preserved by canonical parameter-type signature",
        },
        "abi": abi,
    }


def parameter_annotation(contract_key: str, event_name: str, parameter: dict[str, Any]) -> dict[str, Any]:
    name = parameter.get("name", "")
    type_name = parameter["type"]
    annotation: dict[str, Any] = {}
    if type_name == "address":
        annotation["identifierKind"] = "ethereumAddress"
    if contract_key == "mooncatRescue" and (name == "catId" or name == "catIds"):
        annotation["identifierKind"] = "mooncatIdBytes5"
        if type_name.endswith("]"):
            annotation["cardinality"] = type_name[type_name.index("["):]
    elif contract_key == "moonCatsWrapped":
        if name == "catId":
            annotation["identifierKind"] = "mooncatIdBytes5"
        elif name in {"tokenID", "tokenId"}:
            annotation["identifierKind"] = "moonCatsWrappedTokenId"
    elif contract_key == "acclimatedMoonCats":
        if name in {"tokenId", "_toTokenId", "_fromTokenId"}:
            annotation["identifierKind"] = "erc721TokenId"
        elif name == "_childTokenId":
            annotation["identifierKind"] = "contractScopedExternalTokenId"
    elif contract_key == "mooncatAccessories":
        if name == "accessoryId":
            annotation["identifierKind"] = "accessoryId"
        elif name == "rescueOrder":
            annotation["identifierKind"] = "mooncatRescueOrder"
        elif name == "paletteIndex":
            annotation["identifierKind"] = "paletteIndex"
        elif name == "zIndex":
            annotation["semanticKind"] = "accessoryRenderOrder"
    if contract_key == "mooncatRescue" and name == "catName":
        annotation["semanticKind"] = "rawMooncatNameBytes32"
    elif name == "price":
        annotation["semanticKind"] = "weiAmount"
    elif contract_key == "mooncatRescue" and event_name == "Transfer" and name == "value":
        annotation["semanticKind"] = "fungibleAmount"
    return annotation


def event_category(contract_key: str, event_name: str) -> tuple[str, bool]:
    if event_name in GENERIC_ERC721 and contract_key in {"acclimatedMoonCats", "moonCatsWrapped"}:
        return "generic-erc721", False
    if event_name == "Transfer" and contract_key == "mooncatRescue":
        return "generic-erc20-style", False
    if event_name in GENERIC_ERC998:
        return "generic-erc998", False
    if event_name in GENERIC_ADMIN:
        return "generic-administration", False
    return "mooncat-specific-protocol", True


def build_event_record(contract: dict[str, Any], classification: str, event: dict[str, Any]) -> dict[str, Any]:
    signature = canonical_signature(event)
    category, mooncat_specific = event_category(contract["key"], event["name"])
    parameters = []
    for position, parameter in enumerate(event.get("inputs", [])):
        record = {
            "position": position,
            "name": parameter.get("name", ""),
            "type": parameter["type"],
            "indexed": parameter.get("indexed", False),
        }
        if "internalType" in parameter:
            record["internalType"] = parameter["internalType"]
        record.update(parameter_annotation(contract["key"], event["name"], parameter))
        parameters.append(record)
    semantics = EVENT_SEMANTICS.get((contract["key"], event["name"]))
    if semantics is None:
        semantics = {
            "semanticStatus": "exact-generic-event-shape-only",
            "stateRelationship": "The exact ABI event is preserved without a MoonCat-specific state-effect claim.",
        }
    return {
        "key": f"{contract['key']}:{signature}",
        "contractKey": contract["key"],
        "contractName": contract["contractName"],
        "contractAddress": contract["address"],
        "contractClassification": classification,
        "name": event["name"],
        "signature": signature,
        "topic0": "0x" + keccak256(signature.encode("ascii")).hex(),
        "anonymous": event.get("anonymous", False),
        "category": category,
        "mooncatSpecific": mooncat_specific,
        "parameters": parameters,
        "semantics": semantics,
    }


def deployment_boundary(contract: dict[str, Any]) -> dict[str, Any]:
    deployment = contract.get("deployment")
    if not isinstance(deployment, dict):
        return {
            "status": "unknown-in-checked-in-reviewed-evidence",
            "note": "No deployment transaction, block, or timestamp is copied into this registry.",
        }
    supported = {key: deployment[key] for key in ("transaction", "block", "blockNumber", "timestampUtc", "deployer", "sourceRef") if key in deployment}
    return {
        "status": "verified-partial",
        **supported,
        "note": "Only fields already present in data/contracts.json are retained; absent block data is not inferred.",
    }


def identifier_domains(contract_key: str) -> list[dict[str, str]]:
    domains = {
        "mooncatRescue": [
            {"parameterContext": "catId and catIds", "identifierKind": "mooncatIdBytes5"},
            {"parameterContext": "addresses", "identifierKind": "ethereumAddress"},
        ],
        "acclimatedMoonCats": [
            {"parameterContext": "this contract's parent tokenId", "identifierKind": "erc721TokenId"},
            {"parameterContext": "ERC-998 child token ID", "identifierKind": "contractScopedExternalTokenId"},
            {"parameterContext": "addresses", "identifierKind": "ethereumAddress"},
        ],
        "moonCatsWrapped": [
            {"parameterContext": "catId", "identifierKind": "mooncatIdBytes5"},
            {"parameterContext": "this contract's tokenID", "identifierKind": "moonCatsWrappedTokenId"},
            {"parameterContext": "addresses", "identifierKind": "ethereumAddress"},
        ],
        "mooncatReference": [{"parameterContext": "contract addresses and owner", "identifierKind": "ethereumAddress"}],
        "mooncatTraits": [
            {"parameterContext": "catId", "identifierKind": "mooncatIdBytes5"},
            {"parameterContext": "rescueOrder", "identifierKind": "mooncatRescueOrder"},
        ],
        "mooncatColors": [
            {"parameterContext": "catId", "identifierKind": "mooncatIdBytes5"},
            {"parameterContext": "rescueOrder", "identifierKind": "mooncatRescueOrder"},
            {"parameterContext": "accessoryId", "identifierKind": "accessoryId"},
            {"parameterContext": "paletteIndex", "identifierKind": "paletteIndex"},
        ],
        "mooncatSVGs": [
            {"parameterContext": "catId", "identifierKind": "mooncatIdBytes5"},
            {"parameterContext": "rescueOrder", "identifierKind": "mooncatRescueOrder"},
        ],
        "mooncatAccessories": [
            {"parameterContext": "rescueOrder", "identifierKind": "mooncatRescueOrder"},
            {"parameterContext": "accessoryId", "identifierKind": "accessoryId"},
            {"parameterContext": "ownedAccessoryIndex", "identifierKind": "ownedAccessoryIndex"},
            {"parameterContext": "managedAccessoryIndex", "identifierKind": "managedAccessoryIndex"},
            {"parameterContext": "paletteIndex", "identifierKind": "paletteIndex"},
        ],
        "mooncatAccessoryImages": [
            {"parameterContext": "rescueOrder", "identifierKind": "mooncatRescueOrder"},
            {"parameterContext": "accessoryId", "identifierKind": "accessoryId"},
            {"parameterContext": "paletteIndex", "identifierKind": "paletteIndex"},
        ],
        "catNamer": [
            {"parameterContext": "adjacent helper address", "identifierKind": "ethereumAddress"},
            {"parameterContext": "canonical name storage remains bytes5-scoped on MoonCatRescue", "identifierKind": "mooncatIdBytes5"},
        ],
    }
    return domains[contract_key]


def build_recipes(contracts: dict[str, dict[str, Any]]) -> dict[str, Any]:
    naming = json.loads(NAME_INDEX_SOURCE.read_text(encoding="utf-8"))
    naming_start = naming["identifiersAndFields"]["namingStartBlock"]
    accessory_deployment = deployment_boundary(contracts["mooncatAccessories"])
    common = {
        "network": "ethereum-mainnet",
        "checkpointing": "Persist the last finalized block plus transactionHash/logIndex identities; replay from a safety margin after restart.",
        "reorgAndFinality": "Treat unfinalized logs as provisional, remove replaced logs, and make writes idempotent by transactionHash plus logIndex.",
        "liveStateBoundary": "Recipes describe zero-network planning from checked-in evidence. They do not provide logs, RPC access, completeness, freshness, or current state.",
    }
    recipes = [
        {
            "key": "original-rescue-adoption-history",
            "purpose": "Index original rescues, Genesis batches, adoption offers/requests, cancellations, and completed adoptions without treating history as current state.",
            "contractKeys": ["mooncatRescue"],
            "events": [
                "CatRescued(address,bytes5)", "GenesisCatsAdded(bytes5[16])", "AdoptionOffered(bytes5,uint256,address)",
                "AdoptionOfferCancelled(bytes5)", "AdoptionRequested(bytes5,uint256,address)",
                "AdoptionRequestCancelled(bytes5)", "CatAdopted(bytes5,uint256,address,address)",
            ],
            "identifierGuidance": ["Treat catId as mooncatIdBytes5.", "Do not infer rescueOrder without a separate reviewed lookup."],
            "startBoundary": {"status": "unknown", "note": "No deployment block is present in the reviewed local registry evidence; configure only from separately verified evidence."},
            "corroborationSurfaces": ["catOwners(bytes5)", "adoptionOffers(bytes5)", "adoptionRequests(bytes5)", "rescueOrder(uint256)"],
            "exclusions": ["current owner", "current offer/request state", "aggregate payment totals", "complete historical coverage without a verified scan boundary"],
        },
        {
            "key": "mooncat-naming",
            "purpose": "Index raw CatNamed logs while routing maintained finalized history and current names to the reviewed name-index integration.",
            "contractKeys": ["mooncatRescue"],
            "events": ["CatNamed(bytes5,bytes32)"],
            "identifierGuidance": ["Treat catId as mooncatIdBytes5.", "Retain catName as raw bytes32 before display decoding."],
            "startBoundary": {"status": "verified-maintained-index-scan-boundary", "blockNumber": naming_start, "sourceFile": "data/name-index-integration.json", "note": "This is the reviewed naming scan boundary, not a generalized contract deployment block."},
            "corroborationSurfaces": ["catNames(bytes5)", "getCatNames()", "getCatDetails(...)"],
            "maintainedIndex": {
                "integrationFile": "data/name-index-integration.json",
                "useDirectLogsWhen": "Building or independently auditing raw history with separately authorized chain access and reorg-safe storage.",
                "useMaintainedFinalizedIndexWhen": "A revision-bounded finalized current name, canonical finalized CatNamed history, naming order/year, namer, or blank-event history is sufficient.",
                "doNotVendor": "name-index/data/events.jsonl",
            },
            "exclusions": ["provisional *-live artifacts as canonical", "event presence as proof of current name", "discarding all-zero events", "rewriting raw bytes32 during display moderation"],
        },
        {
            "key": "acclimation-lifecycle",
            "purpose": "Index current Acclimated wrap/deacclimation lifecycle alongside contract-scoped ERC-721/ERC-998 events.",
            "contractKeys": ["acclimatedMoonCats"],
            "events": ["MoonCatAcclimated(uint256,address)", "MoonCatDeacclimated(uint256,address)", "Transfer(address,address,uint256)", "ReceivedChild(address,uint256,address,uint256)", "TransferChild(uint256,address,address,uint256)"],
            "identifierGuidance": ["MoonCatAcclimated/MoonCatDeacclimated tokenId is erc721TokenId and equals rescue order only for this exact contract.", "Interpret child token IDs only with childContract; never globally as rescueOrder."],
            "startBoundary": {"status": "unknown", "note": "No deployment block is present in checked-in reviewed evidence."},
            "corroborationSurfaces": ["ownerOf(uint256)", "ownerOfChild(address,uint256)", "rescueOrderLookup()"],
            "exclusions": ["generic ERC-721 tokenId equals rescueOrder", "current owner or child holdings from historical logs alone", "WMCR identifier rules"],
        },
        {
            "key": "wmcr-wrap-unwrap",
            "purpose": "Index mapping-backed historical WMCR wrap/unwrap relationships without converting wrapper token IDs directly to rescue order.",
            "contractKeys": ["moonCatsWrapped"],
            "events": ["Wrapped(bytes5,uint256)", "Unwrapped(bytes5,uint256)", "Transfer(address,address,uint256)"],
            "identifierGuidance": ["catId is mooncatIdBytes5.", "tokenID/tokenId is moonCatsWrappedTokenId, a sequential mapping-backed ID rather than rescueOrder."],
            "startBoundary": {"status": "unknown", "note": "No deployment block is present in checked-in reviewed evidence."},
            "corroborationSurfaces": ["_catIDToTokenID(bytes5)", "_tokenIDToCatID(uint256)", "ownerOf(uint256)"],
            "exclusions": ["direct tokenID-to-rescueOrder conversion", "current WMCR ownership or activity from registry data", "generalization to other historical wrappers"],
        },
        {
            "key": "accessory-lifecycle",
            "purpose": "Index definition creation/management and assignment events while acknowledging that the exact ABI has no event for every mutable wear-state transition.",
            "contractKeys": ["mooncatAccessories"],
            "events": [
                "AccessoryCreated(uint256,address,uint256,uint16,bytes30)", "AccessoryPriceChanged(uint256,uint256)",
                "AccessoryManagementTransferred(uint256,address)", "AccessoryDiscontinued(uint256)",
                "EligibleListSet(uint256)", "EligibleListCleared(uint256)",
                "AccessoryPurchased(uint256,uint256,uint256)", "AccessoryApplied(uint256,uint256,uint8,uint16)",
            ],
            "identifierGuidance": ["Use mooncatRescueOrder for on-chain rescueOrder fields; keep it distinct from localRescueOrderIndex, accessoryId, paletteIndex, ownedAccessoryIndex, and zIndex.", "zIndex is render/wear order, not an identifier; zero means owned but not worn in reviewed state semantics."],
            "startBoundary": {**accessory_deployment, "blockNumber": None, "note": "A reviewed deployment transaction/timestamp is retained, but the block remains unknown and must not be inferred."},
            "corroborationSurfaces": ["accessoryInfo(uint256)", "managerOf(uint256)", "doesMoonCatOwnAccessory(uint256,uint256)", "balanceOf(uint256)", "ownedAccessoryByIndex(uint256,uint256)", "isEligible(uint256,uint256)"],
            "exclusions": ["current accessory ownership or wear state", "complete reconstruction of palette/zIndex alterations from logs", "taxonomy, image bytes, current prices, supply, or eligibility"],
            "incompleteness": "The exact ABI contains no dedicated event for alterAccessory/alterAccessories, so event-only indexing cannot reconstruct every paletteIndex or zIndex mutation.",
        },
    ]
    for recipe in recipes:
        recipe["operationalGuidance"] = common
    return {
        "schemaVersion": 1,
        "status": "curated-zero-network-indexer-guidance",
        "scope": "Planning recipes over exact locally extracted events. This file is not an indexer, event dataset, RPC configuration, completeness claim, or current-state source.",
        "relatedFiles": ["data/contract-registry.json", "data/event-registry.json", "data/identifier-conventions.json"],
        "recipes": recipes,
    }


def build_outputs() -> dict[Path, str]:
    contracts = load_contracts()
    source_bytes = SOURCE.read_bytes()
    source_sha256 = sha256_bytes(source_bytes)
    extracted = extract_address_bound_abis(source_bytes.decode("utf-8"))
    outputs: dict[Path, str] = {}
    artifact_meta: dict[str, dict[str, Any]] = {}
    exact_abis: dict[str, list[dict[str, Any]]] = {}
    for key in EXPECTED_KEYS:
        contract = contracts[key]
        abi = extracted.get(contract["address"].lower())
        if abi is None:
            continue
        payload = artifact_payload(contract, abi, source_sha256)
        path = ABI_DIR / f"{key}.json"
        rendered = render_json(payload)
        outputs[path] = rendered
        artifact_meta[key] = {
            "path": path.relative_to(ROOT).as_posix(),
            "sha256": sha256_bytes(rendered.encode("utf-8")),
            "abiItemCount": len(abi),
            "functionCount": sum(item.get("type") == "function" for item in abi),
            "eventCount": sum(item.get("type") == "event" for item in abi),
        }
        exact_abis[key] = abi

    contract_records = []
    event_records = []
    for key in EXPECTED_KEYS:
        source_contract = contracts[key]
        classification = "core" if key in CORE_KEYS else "adjacent"
        exact = key in exact_abis
        record = {
            "key": key,
            "name": source_contract["contractName"],
            "label": source_contract.get("label", source_contract["contractName"]),
            "address": source_contract["address"],
            "network": source_contract["network"],
            "classification": classification,
            "role": ROLES[key],
            "abiStatus": "exact-local-abi-extracted" if exact else "semantic-only",
            "abiArtifact": artifact_meta.get(key),
            "sourceRefs": sorted(set(source_contract.get("sourceRefs", []) + ([SOURCE_REF] if exact else []))),
            "reviewedSemanticFiles": REVIEWED_FILES[key],
            "deploymentBoundary": deployment_boundary(source_contract),
            "identifierDomains": identifier_domains(key),
            "limitations": [
                "The ABI and registry describe contract interfaces and reviewed semantics, not deployed bytecode equivalence, current state, or event-history completeness.",
                "Deployment fields are present only when copied from existing checked-in reviewed evidence.",
            ],
        }
        if key == "catNamer":
            record["limitations"].append("No address-matching ABI exists in the checked-in local bundle; no complete CatNamer ABI or event surface is claimed.")
        contract_records.append(record)
        for item in exact_abis.get(key, []):
            if item.get("type") == "event":
                event_records.append(build_event_record(source_contract, classification, item))

    contract_registry = {
        "schemaVersion": 1,
        "status": "deterministic-provenance-aware-contract-registry",
        "scope": "Eight core MoonCat materialization contracts plus structurally separate reviewed adjacent WMCR and CatNamer entries.",
        "generation": {
            "script": "scripts/extract-contract-abis.py",
            "command": "python scripts/extract-contract-abis.py",
            "checkCommand": "python scripts/extract-contract-abis.py --check",
            "networkDependency": "none",
            "abiSourcePath": SOURCE.relative_to(ROOT).as_posix(),
            "abiSourceSha256": source_sha256,
            "addressMatch": "case-insensitive exact 20-byte address from data/contracts.json",
        },
        "abiStatuses": ["exact-local-abi-extracted", "semantic-only", "unavailable-local-exact-abi"],
        "classification": {"coreContractKeys": CORE_KEYS, "adjacentContractKeys": ADJACENT_KEYS},
        "identifierConventionFile": "data/identifier-conventions.json",
        "localIdentifierKinds": LOCAL_IDENTIFIER_KINDS,
        "contracts": contract_records,
    }
    event_registry = {
        "schemaVersion": 1,
        "status": "exact-abi-events-with-curated-bounded-semantics",
        "scope": "Every event entry from each exact locally extracted ABI, including inherited generic events and MoonCat-specific protocol events.",
        "generation": {
            "script": "scripts/extract-contract-abis.py",
            "networkDependency": "none",
            "topic0Strategy": "Ethereum Keccak-256 implemented locally and checked independently by scripts/validate-contract-registry.py against known vectors; NIST SHA3-256 is not used.",
        },
        "identifierConventionFile": "data/identifier-conventions.json",
        "localIdentifierKinds": [item["key"] for item in LOCAL_IDENTIFIER_KINDS],
        "counts": {
            "events": len(event_records),
            "mooncatSpecific": sum(item["mooncatSpecific"] for item in event_records),
            "generic": sum(not item["mooncatSpecific"] for item in event_records),
            "byContract": {key: sum(item["contractKey"] == key for item in event_records) for key in EXPECTED_KEYS},
        },
        "events": event_records,
    }
    outputs[CONTRACT_REGISTRY] = render_json(contract_registry)
    outputs[EVENT_REGISTRY] = render_json(event_registry)
    outputs[RECIPES] = render_json(build_recipes(contracts))
    return outputs


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail when generated artifacts differ from checked-in outputs")
    args = parser.parse_args()
    try:
        outputs = build_outputs()
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    expected_abi_paths = {path for path in outputs if path.parent == ABI_DIR}
    current_abi_paths = set(ABI_DIR.glob("*.json")) if ABI_DIR.is_dir() else set()
    if args.check:
        stale = [path.relative_to(ROOT).as_posix() for path, rendered in outputs.items() if not path.is_file() or path.read_text(encoding="utf-8") != rendered]
        extras = sorted(path.relative_to(ROOT).as_posix() for path in current_abi_paths - expected_abi_paths)
        if stale or extras:
            if stale:
                print("ERROR: stale or missing generated files: " + ", ".join(stale), file=sys.stderr)
            if extras:
                print("ERROR: unexpected ABI artifacts: " + ", ".join(extras), file=sys.stderr)
            return 1
        print(f"OK: {len(expected_abi_paths)} exact ABI artifacts and contract/event/recipe registries are deterministic and current")
        return 0
    ABI_DIR.mkdir(parents=True, exist_ok=True)
    for path, rendered in outputs.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(rendered, encoding="utf-8")
    print(f"Wrote {len(expected_abi_paths)} exact ABI artifacts plus data/contract-registry.json, data/event-registry.json, and data/event-indexer-recipes.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
