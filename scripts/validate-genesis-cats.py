#!/usr/bin/env python3
"""Validate the bounded Genesis MoonCat historical reconstruction offline."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data/genesis-cats.json"
SOURCES_PATH = ROOT / "data/sources.json"
BUCKETS_PATH = ROOT / "data/rescue-buckets.json"
PROTOCOL_PATH = ROOT / "data/protocol-constants.json"
TRAITS_PATH = ROOT / "references/upstream/mooncatrescue/mooncat_traits.json"
INVENTORY_PATH = ROOT / "references/research-notes/genesis-cats/SOURCES.json"

EXPECTED_FORMULA = "(bytes5(genesisCatIndex) << 24) | 0xff00000ca7"
REQUIRED_STATES = {
    "contract-planned-derivable",
    "released-to-adoption",
    "entered-collection",
    "permanently-locked-unreleased",
    "current-ownership-unknown-not-in-scope",
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def cat_id_for_index(index: int) -> str:
    return f"0x{((index << 24) | 0xff00000ca7):010x}"


def collect_source_refs(value: Any) -> list[str]:
    if isinstance(value, dict):
        refs: list[str] = []
        for key, item in value.items():
            if key == "sourceRefs":
                if not isinstance(item, list) or not all(isinstance(ref, str) for ref in item):
                    raise ValueError("sourceRefs must be a list of strings")
                refs.extend(item)
            else:
                refs.extend(collect_source_refs(item))
        return refs
    if isinstance(value, list):
        return [ref for item in value for ref in collect_source_refs(item)]
    return []


def find_disallowed_current_owner_key(value: Any, path: str = "$") -> str | None:
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {"currentOwner", "ownerAddress", "liveOwner"}:
                return f"{path}.{key}"
            found = find_disallowed_current_owner_key(item, f"{path}.{key}")
            if found:
                return found
    elif isinstance(value, list):
        for index, item in enumerate(value):
            found = find_disallowed_current_owner_key(item, f"{path}[{index}]")
            if found:
                return found
    return None


def validate_inventory(inventory: dict[str, Any], errors: list[str]) -> set[str]:
    if inventory.get("version") != 1:
        errors.append("research inventory version must be 1")
    sources = inventory.get("sources")
    if not isinstance(sources, list) or not sources:
        errors.append("research inventory sources must be a non-empty list")
        return set()
    ids: set[str] = set()
    for source in sources:
        if not isinstance(source, dict):
            errors.append("research inventory source entry must be an object")
            continue
        required = {
            "id", "url", "publisher", "publicationDate", "retrievedDate", "sourceClass",
            "trustLevel", "accessMethod", "accessStatus", "note", "noteSha256",
        }
        missing = sorted(required - set(source))
        if missing:
            errors.append(f"inventory source {source.get('id')!r} missing fields: {', '.join(missing)}")
            continue
        source_id = source["id"]
        if not isinstance(source_id, str) or source_id in ids:
            errors.append(f"inventory source id is invalid or duplicate: {source_id!r}")
        ids.add(source_id)
        note = source["note"]
        digest = source["noteSha256"]
        if not isinstance(note, str) or len(note) > 600:
            errors.append(f"inventory source {source_id} must contain a bounded note")
        elif hashlib.sha256(note.encode("utf-8")).hexdigest() != digest:
            errors.append(f"inventory source {source_id} noteSha256 does not match note")
        if source["accessStatus"] == "inaccessible" and "no claim" not in note.lower():
            errors.append(f"inaccessible inventory source {source_id} must say no claim was imported")
    return ids


def validate(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if data.get("schemaVersion") != 1:
        errors.append("schemaVersion must be 1")
    if data.get("status") != "source-backed-reconstruction":
        errors.append("status must be source-backed-reconstruction")
    if data.get("scope", {}).get("currentOwnership") != "unknown-not-in-scope":
        errors.append("scope.currentOwnership must be unknown-not-in-scope")
    forbidden_key = find_disallowed_current_owner_key(data)
    if forbidden_key:
        errors.append(f"positive current-owner field is out of scope: {forbidden_key}")

    sources = load_json(SOURCES_PATH).get("sources", [])
    known_source_ids = {entry.get("id") for entry in sources if isinstance(entry, dict)}
    for source_ref in collect_source_refs(data):
        if source_ref not in known_source_ids:
            errors.append(f"unknown sourceRef: {source_ref}")

    for path in data.get("relatedFiles", []):
        if not isinstance(path, str) or not (ROOT / path).is_file():
            errors.append(f"related file does not exist: {path!r}")

    population = data.get("population", {})
    planned = population.get("plannedGenesis", {})
    released = population.get("releasedGenesis", {})
    locked = population.get("lockedUnreleasedGenesis", {})
    collection = population.get("finalCollection", {})
    if planned.get("count") != 256 or planned.get("genesisIndexRange") != [0, 255]:
        errors.append("planned Genesis population must be 256 over indices 0..255")
    if released.get("count") != 96 or released.get("derivedReleaseGroupCount") != 6:
        errors.append("released Genesis population must be 96 in six groups")
    if locked.get("count") != 160 or locked.get("genesisIndexRange") != [96, 255]:
        errors.append("locked Genesis population must be 160 over indices 96..255")
    if planned.get("count", 0) != released.get("count", 0) + locked.get("count", 0):
        errors.append("Genesis population partition must be 256 = 96 + 160")
    if (collection.get("rescueCats"), collection.get("genesisCats"), collection.get("totalCats")) != (25344, 96, 25440):
        errors.append("collection arithmetic must be 25344 + 96 = 25440")

    contract = data.get("contract", {})
    formula = contract.get("genesisIdFormula", {}).get("formula")
    protocol = load_json(PROTOCOL_PATH)
    protocol_formula = protocol.get("catId", {}).get("genesisCatGeneration", {}).get("formula")
    if formula != EXPECTED_FORMULA or protocol_formula != EXPECTED_FORMULA:
        errors.append("Genesis ID formula must match the documented protocol formula")
    mechanism = contract.get("releaseMechanism", {})
    if mechanism.get("function") != "addGenesisCatGroup" or mechanism.get("groupSize") != 16:
        errors.append("release mechanism must identify addGenesisCatGroup with group size 16")
    schedule = contract.get("adoptionPriceSchedule", {})
    if schedule.get("firstGroupWei") != 300000000000000000 or schedule.get("incrementWei") != 300000000000000000:
        errors.append("adoption schedule must begin and increment by 0.3 ETH in wei")
    payment = contract.get("adoptionPaymentBehavior", {})
    if payment.get("actualDestination") != "zero address" or payment.get("transactionAggregate") != "not-evaluated":
        errors.append("payment behavior must retain zero-address destination and no transaction aggregate")

    groups = data.get("releasedGroups")
    if not isinstance(groups, list) or len(groups) != 6:
        errors.append("releasedGroups must contain six groups")
        groups = []
    all_indexes: list[int] = []
    all_ids: list[str] = []
    all_orders: list[int] = []
    for expected_number, group in enumerate(groups, start=1):
        if group.get("releaseGroup") != expected_number:
            errors.append(f"release group {expected_number} has a non-sequential number")
        start, end = group.get("genesisIndexRange", [None, None])
        expected_start = (expected_number - 1) * 16
        if (start, end) != (expected_start, expected_start + 15):
            errors.append(f"release group {expected_number} has an invalid Genesis index range")
            continue
        states = set(group.get("state", []))
        required_group_states = {
            "contract-planned-derivable", "released-to-adoption", "entered-collection",
            "current-ownership-unknown-not-in-scope",
        }
        if states != required_group_states:
            errors.append(f"release group {expected_number} has invalid state labels")
        if group.get("scheduledPriceWei") != expected_number * 300000000000000000:
            errors.append(f"release group {expected_number} has an invalid scheduled price")
        ids = group.get("catIds", [])
        orders = group.get("rescueOrders", [])
        if len(ids) != 16 or len(orders) != 16:
            errors.append(f"release group {expected_number} must contain 16 IDs and rescue orders")
            continue
        indexes = list(range(start, end + 1))
        for index, cat_id in zip(indexes, ids):
            if not isinstance(cat_id, str) or not re.fullmatch(r"0x[0-9a-f]{10}", cat_id):
                errors.append(f"invalid Cat ID format at Genesis index {index}: {cat_id!r}")
            elif cat_id != cat_id_for_index(index):
                errors.append(f"Cat ID formula mismatch at Genesis index {index}: {cat_id}")
        all_indexes.extend(indexes)
        all_ids.extend(ids)
        all_orders.extend(orders)
    if all_indexes != list(range(96)):
        errors.append("released groups must partition Genesis indices 0..95")
    if len(set(all_ids)) != 96 or len(set(all_orders)) != 96:
        errors.append("released Cat IDs and rescue orders must each be unique")

    bucket = load_json(BUCKETS_PATH).get("buckets", {}).get("genesis", {})
    if bucket.get("count") != 96 or all_orders != bucket.get("indexes"):
        errors.append("released rescue orders must exactly match data/rescue-buckets.json#genesis")
    traits = load_json(TRAITS_PATH)
    trait_rows = {row.get("rescueOrder"): row for row in traits if row.get("genesis") is True}
    if len(trait_rows) != 96:
        errors.append("checked-in trait reference must contain exactly 96 Genesis rows")
    for cat_id, rescue_order in zip(all_ids, all_orders):
        row = trait_rows.get(rescue_order)
        if row is None or row.get("catId") != cat_id:
            errors.append(f"trait cross-reference mismatch for rescueOrder {rescue_order}")

    unreleased = data.get("unreleasedRange", {})
    if unreleased.get("genesisIndexRange") != [96, 255]:
        errors.append("unreleased range must be 96..255")
    if set(unreleased.get("state", [])) != {
        "contract-planned-derivable", "permanently-locked-unreleased", "current-ownership-unknown-not-in-scope",
    }:
        errors.append("unreleased range must retain bounded state labels")
    if not isinstance(unreleased.get("catIds"), str) or unreleased.get("rescueOrders") != "none asserted":
        errors.append("unreleased range must not materialize cat IDs or rescue orders")

    vote = data.get("vote", {})
    timeline = vote.get("timeline", {})
    if timeline.get("scheduledStart") != "2021-03-20T12:00:00Z" or timeline.get("durationHours") != 48:
        errors.append("vote timeline must retain the documented start and 48-hour duration")
    if vote.get("eligibility", {}).get("eligibleAddressCount") != 6110:
        errors.append("vote eligibility count must be 6110")
    if vote.get("participation", {}).get("votingAddressCount") != 1311:
        errors.append("vote participation count must be 1311")
    if vote.get("outcome", {}).get("lockedCount") != 160:
        errors.append("vote outcome must lock 160 Genesis Cats")
    mechanism_status = vote.get("technicalLockMechanism", {}).get("status")
    if mechanism_status != "unresolved" or vote.get("technicalLockMechanism", {}).get("verifiedPostVoteMechanism") is not None:
        errors.append("technical lock mechanism must stay explicitly unresolved without direct evidence")

    inventory_ids = validate_inventory(load_json(INVENTORY_PATH), errors)
    required_inventory = set(data.get("evidence", {}).get("requiredInventoryIds", []))
    if not required_inventory or not required_inventory.issubset(inventory_ids):
        errors.append("evidence inventory is missing required Genesis research records")
    return errors


def main() -> int:
    try:
        errors = validate(load_json(DATA_PATH))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("Genesis Cats validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
