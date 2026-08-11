#!/usr/bin/env python3
"""Query the checked-in MoonCat contract, event, and indexer recipe registries."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CONTRACTS = ROOT / "data/contract-registry.json"
EVENTS = ROOT / "data/event-registry.json"
RECIPES = ROOT / "data/event-indexer-recipes.json"


def matches_text(value: str, query: str) -> bool:
    return value.casefold() == query.casefold()


def event_matches(event: dict[str, Any], args: argparse.Namespace) -> bool:
    if args.contract and not (
        matches_text(event["contractKey"], args.contract)
        or matches_text(event["contractAddress"], args.contract)
    ):
        return False
    if args.event and not matches_text(event["name"], args.event):
        return False
    if args.signature and not matches_text(event["signature"], args.signature):
        return False
    if args.identifier_kind and not any(
        parameter.get("identifierKind") == args.identifier_kind for parameter in event.get("parameters", [])
    ):
        return False
    if args.classification and event.get("contractClassification") != args.classification:
        return False
    return True


def print_event(event: dict[str, Any]) -> None:
    label = "MoonCat-specific" if event["mooncatSpecific"] else event["category"]
    print(f"{event['contractKey']}  {event['signature']}")
    print(f"  address: {event['contractAddress']}")
    print(f"  classification: {event['contractClassification']}; category: {label}")
    print(f"  topic0: {event['topic0']}")
    for parameter in event.get("parameters", []):
        annotations = []
        if parameter.get("indexed"):
            annotations.append("indexed")
        if parameter.get("identifierKind"):
            annotations.append(parameter["identifierKind"])
        if parameter.get("semanticKind"):
            annotations.append(parameter["semanticKind"])
        suffix = f" ({', '.join(annotations)})" if annotations else ""
        print(f"  [{parameter['position']}] {parameter['name']}: {parameter['type']}{suffix}")
    print(f"  semantics: {event['semantics']['stateRelationship']}")


def print_recipe(recipe: dict[str, Any]) -> None:
    print(f"{recipe['key']}: {recipe['purpose']}")
    print(f"  contracts: {', '.join(recipe['contractKeys'])}")
    print(f"  events: {', '.join(recipe['events'])}")
    boundary = recipe.get("startBoundary", {})
    print(f"  start boundary: {boundary.get('status', 'unknown')}")
    if boundary.get("note"):
        print(f"  boundary note: {boundary['note']}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--contract", help="exact contract key or address")
    parser.add_argument("--event", help="exact event name")
    parser.add_argument("--signature", help="exact canonical event signature")
    parser.add_argument("--identifier-kind", help="exact identifierKind annotation")
    parser.add_argument("--classification", choices=["core", "adjacent"], help="contract registry classification")
    parser.add_argument("--recipe", help="exact recipe key")
    parser.add_argument("--json", action="store_true", help="emit structured JSON")
    args = parser.parse_args()

    contracts = json.loads(CONTRACTS.read_text(encoding="utf-8"))
    events = json.loads(EVENTS.read_text(encoding="utf-8"))["events"]
    recipe_records = json.loads(RECIPES.read_text(encoding="utf-8"))["recipes"]

    if args.recipe:
        matches = [recipe for recipe in recipe_records if matches_text(recipe["key"], args.recipe)]
        payload = {"kind": "recipes", "count": len(matches), "recipes": matches}
        if args.json:
            print(json.dumps(payload, indent=2, ensure_ascii=False))
        else:
            print(f"Recipes: {len(matches)}")
            for recipe in matches:
                print_recipe(recipe)
        return 0 if matches else 1

    matches = [event for event in events if event_matches(event, args)]
    payload = {
        "kind": "events",
        "count": len(matches),
        "filters": {
            "contract": args.contract,
            "event": args.event,
            "signature": args.signature,
            "identifierKind": args.identifier_kind,
            "classification": args.classification,
        },
        "events": matches,
    }
    if args.json:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        exact_count = sum(contract["abiStatus"] == "exact-local-abi-extracted" for contract in contracts["contracts"])
        print(f"Events: {len(matches)} (registry has {exact_count} exact-ABI contracts)")
        for index, event in enumerate(matches):
            if index:
                print()
            print_event(event)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
