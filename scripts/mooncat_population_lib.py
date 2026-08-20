#!/usr/bin/env python3
"""Shared zero-network helpers for the generated MoonCat population index."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
POPULATION_DIR = ROOT / "data/mooncat-population"
TRAITS_PATH = ROOT / "references/upstream/mooncatrescue/mooncat_traits.json"
LIB_PATH = ROOT / "references/upstream/mooncatrescue/libmooncat-limited.js"
PARSER_PATH = ROOT / "references/upstream/mooncatrescue/mooncatparser.js"
NAME_SNAPSHOT_DIR = ROOT / "references/upstream/name-index"
NAME_CURRENT_PATH = NAME_SNAPSHOT_DIR / "current-names.json"
NAME_METADATA_PATH = NAME_SNAPSHOT_DIR / "metadata.json"
NAME_SNAPSHOT_PATH = NAME_SNAPSHOT_DIR / "SNAPSHOT.json"
GENESIS_PATH = ROOT / "data/genesis-cats.json"
BUCKETS_PATH = ROOT / "data/rescue-buckets.json"
CHARACTERS_PATH = ROOT / "data/character-cat-index.json"
COLOR_PATH = ROOT / "data/color-classification.json"
HISTORICAL_NAMES_PATH = ROOT / "data/mooncat-names.json"

POPULATION_COUNT = 25_440
SHARD_SIZE = 1_000
CAT_ID = re.compile(r"^0x[0-9a-f]{10}$")
NAME_RAW = re.compile(r"^0x[0-9a-f]{64}$")
HASH = re.compile(r"^0x[0-9a-fA-F]{64}$")
ADDRESS = re.compile(r"^0x[0-9a-fA-F]{40}$")
ZERO_NAME = "0x" + "00" * 32
TRAIT_FIELDS = (
    "rescueYear", "hueInt", "hueName", "pale", "facing", "expression",
    "pattern", "pose",
)
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
ENUMS = {
    "facing": {"left", "right"},
    "expression": {"grumpy", "pouting", "shy", "smiling"},
    "pattern": {"pure", "spotted", "tabby", "tortie"},
    "pose": {"pouncing", "sleeping", "stalking", "standing"},
}
NAME_REQUIRED_FIELDS = {
    "catId", "rescueOrder", "namedOrder", "eventId", "blockNumber",
    "transactionHash", "namer", "logIndex", "transactionIndex", "nameRaw",
    "status", "blockTimestamp", "namedYear",
}


class PopulationError(ValueError):
    """Fatal source, invariant, or generated-artifact error."""


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise PopulationError(f"cannot read JSON {path.relative_to(ROOT)}: {exc}") from exc


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def sha256_bytes(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def file_digest(path: Path) -> tuple[str, int]:
    content = path.read_bytes()
    return sha256_bytes(content), len(content)


def source_file_record(path: Path, role: str) -> dict[str, Any]:
    digest, size = file_digest(path)
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "sha256": digest,
        "bytes": size,
        "role": role,
    }


def load_traits() -> list[dict[str, Any]]:
    rows = read_json(TRAITS_PATH)
    if not isinstance(rows, list) or len(rows) != POPULATION_COUNT:
        raise PopulationError(f"mooncat_traits.json must contain exactly {POPULATION_COUNT} rows")
    seen: set[str] = set()
    for order, row in enumerate(rows):
        if not isinstance(row, dict) or row.get("rescueOrder") != order:
            raise PopulationError(f"source row/index alignment failed at rescueOrder {order}")
        cat_id = row.get("catId")
        if not isinstance(cat_id, str) or not CAT_ID.fullmatch(cat_id) or cat_id in seen:
            raise PopulationError(f"invalid or duplicate source catId at rescueOrder {order}: {cat_id}")
        seen.add(cat_id)
        for field in TRAIT_FIELDS:
            if field not in row:
                raise PopulationError(f"source row {order} is missing {field}")
        if not isinstance(row["rescueYear"], int) or not isinstance(row["hueInt"], int):
            raise PopulationError(f"source row {order} has invalid numeric traits")
        if not isinstance(row["hueName"], str) or not isinstance(row["pale"], bool):
            raise PopulationError(f"source row {order} has invalid hue/pale traits")
        for field, allowed in ENUMS.items():
            if row[field] not in allowed:
                raise PopulationError(f"source row {order} has unsupported {field}: {row[field]}")
        if "genesis" in row and row["genesis"] is not True:
            raise PopulationError(f"source row {order} has unsupported genesis marker")
    return rows


def load_memberships() -> tuple[set[int], dict[int, list[str]], dict[int, list[str]], dict[str, int], dict[str, int]]:
    genesis_data = read_json(GENESIS_PATH)
    genesis_orders: list[int] = []
    for group in genesis_data.get("releasedGroups", []):
        ids = group.get("catIds", [])
        orders = group.get("rescueOrders", [])
        if len(ids) != len(orders):
            raise PopulationError("Genesis released group catId/rescueOrder arrays do not align")
        genesis_orders.extend(orders)
    genesis = set(genesis_orders)
    if len(genesis_orders) != 96 or len(genesis) != 96:
        raise PopulationError("canonical released Genesis membership must contain 96 unique rescue orders")

    bucket_data = read_json(BUCKETS_PATH)
    buckets_by_order: dict[int, list[str]] = defaultdict(list)
    bucket_counts: dict[str, int] = {}
    for key, bucket in bucket_data.get("buckets", {}).items():
        indexes = bucket.get("indexes")
        if not isinstance(indexes, list) or len(indexes) != len(set(indexes)):
            raise PopulationError(f"rescue bucket {key} has invalid or duplicate indexes")
        if bucket.get("count") != len(indexes):
            raise PopulationError(f"rescue bucket {key} count does not match indexes")
        for order in indexes:
            if not isinstance(order, int) or not 0 <= order < POPULATION_COUNT:
                raise PopulationError(f"rescue bucket {key} has out-of-range rescue order {order}")
            buckets_by_order[order].append(key)
        bucket_counts[key] = len(indexes)

    character_data = read_json(CHARACTERS_PATH)
    characters_by_order: dict[int, list[str]] = defaultdict(list)
    character_counts: dict[str, int] = {}
    for key, category in character_data.get("categories", {}).items():
        indexes = category.get("all")
        if not isinstance(indexes, list) or len(indexes) != len(set(indexes)):
            raise PopulationError(f"character category {key} has invalid or duplicate indexes")
        for order in indexes:
            if not isinstance(order, int) or not 0 <= order < POPULATION_COUNT:
                raise PopulationError(f"character category {key} has out-of-range rescue order {order}")
            characters_by_order[order].append(key)
        character_counts[key] = len(indexes)

    overlap = sorted(genesis & set(characters_by_order))
    if overlap:
        raise PopulationError(f"Genesis/character-category overlap: {overlap[:20]}")
    for values in buckets_by_order.values():
        values.sort()
    for values in characters_by_order.values():
        values.sort()
    return genesis, buckets_by_order, characters_by_order, bucket_counts, character_counts


def classify_color(row: dict[str, Any], genesis: bool, policy: dict[str, Any]) -> dict[str, Any]:
    for category in policy["specialClassification"]["genesisCategories"]:
        required = category["requiredRawValues"]
        if genesis == required["genesis"] and row["hueInt"] == required["hueInt"] and row["hueName"] == required["hueName"]:
            return {"key": category["key"], "label": category["label"], "kind": "genesis-special"}
    if row["hueInt"] in {1000, 2000}:
        raise PopulationError(f"unresolved special hue sentinel for rescueOrder {row['rescueOrder']}")
    hue = row["hueInt"] % 360
    for bucket in policy["normalHueClassification"]["buckets"]:
        if any(start <= hue < end for start, end in bucket["intervals"]):
            return {"key": bucket["key"], "label": bucket["label"], "kind": "circular-hue"}
    raise PopulationError(f"color policy did not classify rescueOrder {row['rescueOrder']}")


def validate_current_names(records: Any, metadata: Any) -> list[dict[str, Any]]:
    if not isinstance(records, list):
        raise PopulationError("finalized current-names snapshot must be an array")
    if not isinstance(metadata, dict):
        raise PopulationError("finalized metadata snapshot must be an object")
    if metadata.get("chainId") != 1 or metadata.get("contractAddress") != "0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6":
        raise PopulationError("name-index metadata chain/contract identity mismatch")
    if metadata.get("moonCatCount") != POPULATION_COUNT or metadata.get("namingStartBlock") != 4_140_409:
        raise PopulationError("name-index metadata population/start-block mismatch")
    if metadata.get("source") != "data/events.jsonl":
        raise PopulationError("name-index metadata must identify finalized data/events.jsonl as its source")
    if metadata.get("namedCatCount") != len(records):
        raise PopulationError("name-index namedCatCount does not match current-names records")
    if any("live" in str(value).lower() or "provisional" in str(value).lower() for value in metadata.values()):
        raise PopulationError("provisional/live metadata is forbidden")

    seen_ids: set[str] = set()
    seen_orders: set[int] = set()
    normalized: list[dict[str, Any]] = []
    for index, record in enumerate(records):
        if not isinstance(record, dict) or not NAME_REQUIRED_FIELDS <= set(record):
            raise PopulationError(f"name-index current record {index} is missing required finalized fields")
        if any(key == "provisional" or "live" in key.lower() for key in record):
            raise PopulationError(f"name-index current record {index} contains provisional/live fields")
        cat_id, order = record.get("catId"), record.get("rescueOrder")
        if not isinstance(cat_id, str) or not CAT_ID.fullmatch(cat_id) or cat_id in seen_ids:
            raise PopulationError(f"invalid or duplicate name-index catId: {cat_id}")
        if not isinstance(order, int) or not 0 <= order < POPULATION_COUNT or order in seen_orders:
            raise PopulationError(f"invalid or duplicate name-index rescueOrder: {order}")
        raw = record.get("nameRaw")
        if not isinstance(raw, str) or not NAME_RAW.fullmatch(raw) or raw == ZERO_NAME:
            raise PopulationError(f"name-index record {cat_id} has invalid/blank current nameRaw")
        if not isinstance(record.get("eventId"), str) or record["eventId"] != f"{record.get('transactionHash')}:{record.get('logIndex')}":
            raise PopulationError(f"name-index record {cat_id} has invalid eventId")
        if not HASH.fullmatch(str(record.get("transactionHash"))) or not ADDRESS.fullmatch(str(record.get("namer"))):
            raise PopulationError(f"name-index record {cat_id} has invalid transaction/namer")
        for field in ("namedOrder", "blockNumber", "logIndex", "transactionIndex", "blockTimestamp", "namedYear"):
            if not isinstance(record.get(field), int):
                raise PopulationError(f"name-index record {cat_id} has invalid {field}")
        if not isinstance(record.get("status"), str) or not record["status"]:
            raise PopulationError(f"name-index record {cat_id} has invalid status")
        if "text" in record and not isinstance(record["text"], str):
            raise PopulationError(f"name-index record {cat_id} has invalid text")
        seen_ids.add(cat_id)
        seen_orders.add(order)
        normalized.append(dict(record))
    return normalized


def load_name_snapshot() -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    snapshot = read_json(NAME_SNAPSHOT_PATH)
    if snapshot.get("license") != "CC0-1.0" or snapshot.get("status") != "pinned-finalized-name-index-inputs":
        raise PopulationError("name-index SNAPSHOT.json must record CC0-1.0 finalized-only status")
    inventory = snapshot.get("inventory")
    if not isinstance(inventory, list) or {item.get("path") for item in inventory if isinstance(item, dict)} != {"current-names.json", "metadata.json"}:
        raise PopulationError("name-index snapshot inventory must contain only current-names.json and metadata.json")
    for item in inventory:
        path = NAME_SNAPSHOT_DIR / item["path"]
        digest, size = file_digest(path)
        if digest != item.get("sha256") or size != item.get("bytes"):
            raise PopulationError(f"name-index snapshot hash/size drift: {item['path']}")
    records = read_json(NAME_CURRENT_PATH)
    metadata = read_json(NAME_METADATA_PATH)
    return validate_current_names(records, metadata), metadata, snapshot


def run_javascript_checks(source_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Check all IDs/traits/renderability in one Node process using stdin."""
    program = r"""
global.window = {};
require(process.argv[1]);
const parser = require(process.argv[2]);
const fs = require('fs');
const rows = JSON.parse(fs.readFileSync(0, 'utf8'));
const L = window.LibMoonCat;
const out = [];
for (const row of rows) {
  const id = row.catId;
  const traits = L.getTraits('extended', id);
  const pixels = parser(id);
  let nonNullPixels = 0;
  let minWidth = null;
  let maxWidth = 0;
  for (const pixelRow of pixels) {
    minWidth = minWidth === null ? pixelRow.length : Math.min(minWidth, pixelRow.length);
    maxWidth = Math.max(maxWidth, pixelRow.length);
    for (const value of pixelRow) if (value !== null) nonNullPixels++;
  }
  out.push({
    catId: id,
    parsedCatId: L.parseCatId(id),
    rescueOrderLookup: L.getRescueOrder(id),
    reverseCatIdLookup: L.getMoonCatIdByRescueIndex(row.rescueOrder),
    traits,
    parser: {rowCount: pixels.length, minWidth, maxWidth, nonNullPixels}
  });
}
process.stdout.write(JSON.stringify(out));
"""
    payload = json.dumps(
        [{"catId": row["catId"], "rescueOrder": row["rescueOrder"]} for row in source_rows],
        separators=(",", ":"),
    )
    try:
        result = subprocess.run(
            ["node", "-e", program, str(LIB_PATH), str(PARSER_PATH)],
            cwd=ROOT,
            input=payload,
            capture_output=True,
            text=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        detail = getattr(exc, "stderr", "")
        raise PopulationError(f"JavaScript population verification failed: {detail}") from exc
    checks = json.loads(result.stdout)
    if not isinstance(checks, list) or len(checks) != POPULATION_COUNT:
        raise PopulationError("JavaScript verifier returned an incomplete population")
    return checks


def compute_js_validation(source_rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    checks = run_javascript_checks(source_rows)
    mismatch_items: list[dict[str, Any]] = []
    parser_failures: list[dict[str, Any]] = []
    identifier_failures: list[dict[str, Any]] = []
    for row, check in zip(source_rows, checks, strict=True):
        cat_id, order = row["catId"], row["rescueOrder"]
        identifier_ok = (
            check.get("catId") == cat_id
            and check.get("parsedCatId") == cat_id
            and check.get("rescueOrderLookup") == order
            and check.get("reverseCatIdLookup") == cat_id
        )
        if not identifier_ok:
            identifier_failures.append({"rescueOrder": order, "catId": cat_id, "check": check})
        parser = check.get("parser", {})
        if not isinstance(parser.get("rowCount"), int) or parser["rowCount"] <= 0 or not isinstance(parser.get("nonNullPixels"), int) or parser["nonNullPixels"] <= 0:
            parser_failures.append({"rescueOrder": order, "catId": cat_id, "parser": parser})
        expected = {field: row[field] for field in TRAIT_FIELDS}
        expected.update({"catId": cat_id, "rescueOrder": order, "genesis": row.get("genesis", False)})
        compared = check.get("traits", {})
        for selected_field, lib_field in LIB_FIELD_MAP.items():
            if expected[selected_field] != compared.get(lib_field):
                mismatch_items.append({
                    "rescueOrder": order,
                    "catId": cat_id,
                    "field": selected_field,
                    "selectedValue": expected[selected_field],
                    "selectedSourceRef": "mooncatrescue-mooncat-traits-json",
                    "comparedValue": compared.get(lib_field),
                    "comparedSourceRef": "mooncatrescue-libmooncat-limited-js",
                    "resolution": "unresolved-semantic-difference; direct snapshot value retained",
                })
    if identifier_failures:
        first = identifier_failures[0]
        raise PopulationError(f"LibMoonCat identifier round trip failed at {first['rescueOrder']} / {first['catId']}")
    if parser_failures:
        first = parser_failures[0]
        raise PopulationError(f"mooncatparser produced no nonempty output at {first['rescueOrder']} / {first['catId']}")

    pattern_counts = Counter(
        (item["field"], json.dumps(item["selectedValue"], ensure_ascii=False), json.dumps(item["comparedValue"], ensure_ascii=False))
        for item in mismatch_items
    )
    patterns = [
        {
            "field": field,
            "selectedValue": json.loads(selected),
            "comparedValue": json.loads(compared),
            "count": count,
        }
        for (field, selected, compared), count in sorted(pattern_counts.items())
    ]
    report = {
        "checkedRowCount": len(source_rows),
        "identifierRoundTripPassCount": len(source_rows),
        "parserRenderablePassCount": len(source_rows),
        "mismatchCount": len(mismatch_items),
        "mismatchAffectedCatCount": len({item["catId"] for item in mismatch_items}),
        "mismatchByField": dict(sorted(Counter(item["field"] for item in mismatch_items).items())),
        "mismatchPatterns": patterns,
        "items": mismatch_items,
    }
    return checks, report


def reconcile_historical_names(names: list[dict[str, Any]]) -> dict[str, Any]:
    historical = read_json(HISTORICAL_NAMES_PATH).get("records", [])
    current_by_order = {record["rescueOrder"]: record for record in names}
    exact = 0
    historical_only: list[dict[str, Any]] = []
    current_only_orders = set(current_by_order)
    differences: list[dict[str, Any]] = []
    for record in historical:
        order = record["rescueOrder"]
        current = current_by_order.get(order)
        if current is None:
            historical_only.append({"rescueOrder": order, "catId": record["catId"], "nameRaw": record["nameRaw"]})
            continue
        current_only_orders.discard(order)
        if current["catId"] == record["catId"] and current["nameRaw"] == record["nameRaw"]:
            exact += 1
        else:
            differences.append({
                "rescueOrder": order,
                "historical": {"catId": record["catId"], "nameRaw": record["nameRaw"]},
                "finalized": {"catId": current["catId"], "nameRaw": current["nameRaw"]},
                "resolution": "preserve both source layers; finalized name-index enriches the population row",
            })
    return {
        "historicalRecordCount": len(historical),
        "finalizedRecordCount": len(names),
        "overlapCount": exact + len(differences),
        "exactIdentifierAndRawCount": exact,
        "differenceCount": len(differences),
        "historicalOnlyCount": len(historical_only),
        "finalizedOnlyCount": len(current_only_orders),
        "historicalOnly": historical_only,
        "finalizedOnly": [
            {"rescueOrder": order, "catId": current_by_order[order]["catId"], "nameRaw": current_by_order[order]["nameRaw"]}
            for order in sorted(current_only_orders)
        ],
        "differences": differences,
        "comparisonBoundary": "Raw bytes32 plus catId/rescueOrder identity comparison; display text and namedOrder are not used as equality keys.",
    }


def build_population_artifacts() -> dict[str, bytes]:
    source_rows = load_traits()
    names, name_metadata, name_snapshot = load_name_snapshot()
    genesis, buckets_by_order, characters_by_order, bucket_counts, character_counts = load_memberships()
    color_policy = read_json(COLOR_PATH)
    checks, mismatch_report = compute_js_validation(source_rows)
    del checks

    source_genesis = {row["rescueOrder"] for row in source_rows if row.get("genesis") is True}
    if source_genesis != genesis:
        missing = sorted(genesis - source_genesis)
        extra = sorted(source_genesis - genesis)
        raise PopulationError(f"source/canonical Genesis mismatch; missing={missing[:20]} extra={extra[:20]}")
    if set(read_json(BUCKETS_PATH)["buckets"]["genesis"]["indexes"]) != genesis:
        raise PopulationError("canonical Genesis membership does not match rescue bucket membership")

    names_by_order = {record["rescueOrder"]: record for record in names}
    for record in names:
        source = source_rows[record["rescueOrder"]]
        if source["catId"] != record["catId"]:
            raise PopulationError(f"name-index identifier mismatch at rescueOrder {record['rescueOrder']}")

    rows: list[dict[str, Any]] = []
    color_counts: Counter[str] = Counter()
    for source in source_rows:
        order = source["rescueOrder"]
        is_genesis = order in genesis
        color = classify_color(source, is_genesis, color_policy)
        color_counts[color["key"]] += 1
        rows.append({
            "catId": source["catId"],
            "rescueOrder": order,
            "traits": {field: source[field] for field in TRAIT_FIELDS},
            "genesis": is_genesis,
            "color": color,
            "rescueBuckets": buckets_by_order.get(order, []),
            "characterCategories": characters_by_order.get(order, []),
            "name": names_by_order.get(order),
        })

    historical_reconciliation = reconcile_historical_names(names)
    report = {
        "schemaVersion": 1,
        "status": "exhaustive-zero-network-validation-passed",
        "population": {
            "rowCount": len(rows),
            "uniqueCatIdCount": len({row["catId"] for row in rows}),
            "rescueOrderRange": [0, POPULATION_COUNT - 1],
            "sourceArrayAlignmentPassCount": len(rows),
        },
        "javascriptChecks": mismatch_report,
        "memberships": {
            "canonicalGenesisCount": len(genesis),
            "sourceGenesisMarkerCount": len(source_genesis),
            "genesisCharacterOverlapCount": 0,
            "rescueBucketCounts": bucket_counts,
            "characterCategoryCounts": character_counts,
        },
        "colors": {
            "schemeId": color_policy["scheme"]["id"],
            "schemeVersion": color_policy["scheme"]["version"],
            "classifiedRowCount": len(rows),
            "counts": dict(sorted(color_counts.items())),
        },
        "naming": {
            "finalizedNamedRowCount": len(names),
            "unnamedRowCount": len(rows) - len(names),
            "blankCurrentNameCount": 0,
            "sourceRevision": name_snapshot["sourceRevision"],
            "sourceMetadata": name_metadata,
            "historicalSnapshotReconciliation": historical_reconciliation,
        },
        "hardFailures": [],
        "networkDependency": "none",
    }

    artifacts: dict[str, bytes] = {}
    shard_entries: list[dict[str, Any]] = []
    for start in range(0, POPULATION_COUNT, SHARD_SIZE):
        end = min(start + SHARD_SIZE, POPULATION_COUNT) - 1
        filename = f"{start:05d}-{end:05d}.json"
        relative = f"shards/{filename}"
        content = json_bytes({
            "schemaVersion": 1,
            "range": {"startRescueOrder": start, "endRescueOrder": end, "rowCount": end - start + 1},
            "rows": rows[start:end + 1],
        })
        artifacts[relative] = content
        shard_entries.append({
            "path": f"data/mooncat-population/{relative}",
            "startRescueOrder": start,
            "endRescueOrder": end,
            "rowCount": end - start + 1,
            "sha256": sha256_bytes(content),
            "bytes": len(content),
        })

    report_content = json_bytes(report)
    artifacts["validation-report.json"] = report_content
    source_files = [
        source_file_record(TRAITS_PATH, "selected identity and visual-trait values"),
        source_file_record(LIB_PATH, "exhaustive identifier and extended-trait comparison"),
        source_file_record(PARSER_PATH, "exhaustive nonempty renderability check"),
        source_file_record(GENESIS_PATH, "canonical released Genesis membership"),
        source_file_record(BUCKETS_PATH, "canonical-derived rescue bucket memberships"),
        source_file_record(CHARACTERS_PATH, "community-curated character memberships"),
        source_file_record(COLOR_PATH, "versioned derived human-facing color policy"),
        source_file_record(NAME_CURRENT_PATH, "pinned finalized current-name enrichment"),
        source_file_record(NAME_METADATA_PATH, "pinned finalized name-index metadata"),
        source_file_record(NAME_SNAPSHOT_PATH, "pinned name-index snapshot provenance"),
        source_file_record(HISTORICAL_NAMES_PATH, "historical/source-comparison name reconciliation"),
    ]
    manifest = {
        "schemaVersion": 1,
        "status": "generated-full-population-index",
        "scope": "Deterministic generated joined view for all 25,440 MoonCats; not an independent canonical source or live-state artifact.",
        "rowCount": POPULATION_COUNT,
        "primaryKey": {"field": "catId", "identifierKind": "mooncatIdBytes5"},
        "secondaryLookup": {"field": "rescueOrder", "identifierKind": "apiOriginalRescueIndex", "method": "source array and LibMoonCat lookup-backed; never arithmetic"},
        "layout": {"kind": "fixed-rescue-order-shards", "shardSize": SHARD_SIZE, "shardCount": len(shard_entries), "shards": shard_entries},
        "rowSchema": {
            "fields": ["catId", "rescueOrder", "traits", "genesis", "color", "rescueBuckets", "characterCategories", "name"],
            "unnamedRepresentation": "name is null",
            "compactProvenance": "Field-group provenance is defined in this manifest rather than repeated on rows.",
        },
        "fieldProvenance": {
            "identityAndTraits": {"trust": "upstream-reference-selected-and-exhaustively-compared", "sourceRefs": ["mooncatrescue-mooncat-traits-json", "mooncatrescue-libmooncat-limited-js"]},
            "genesis": {"trust": "canonical-membership", "sourceRefs": ["mooncatrescue-about-collection", "mooncatrescue-mooncat-traits-json"]},
            "color": {"trust": "derived-human-facing-display-policy", "sourceRefs": ["mooncat-color-classification"], "limitations": "Not an on-chain trait, RGB/hex palette, rarity, or rendering proof."},
            "rescueBuckets": {"trust": "canonical-derived", "sourceRefs": ["mooncat-rescueorder-by-category"]},
            "characterCategories": {"trust": "community-curated-noncanonical", "sourceRefs": ["mooncat-rescueorder-by-category"]},
            "name": {"trust": "pinned-finalized-monotonic-enrichment", "sourceRefs": ["mooncatdao-name-index", "mooncat-kb-name-index-pinned-snapshot"], "sourceRevision": name_snapshot["sourceRevision"], "limitations": "No blank events, event history, provisional/live state, or freshness beyond the pinned revision."},
        },
        "sourceFiles": source_files,
        "validationReport": {
            "path": "data/mooncat-population/validation-report.json",
            "sha256": sha256_bytes(report_content),
            "bytes": len(report_content),
        },
        "generation": {
            "script": "scripts/generate-mooncat-population.py",
            "checkCommand": "python scripts/generate-mooncat-population.py --check",
            "validator": "python scripts/validate-mooncat-population.py",
            "networkDependency": "none",
            "nameSnapshotImport": "python scripts/import-name-index-snapshot.py --source /path/to/name-index",
        },
        "counts": {
            "namedRows": len(names),
            "unnamedRows": POPULATION_COUNT - len(names),
            "genesisRows": len(genesis),
            "libTraitMismatchCount": mismatch_report["mismatchCount"],
            "libTraitMismatchAffectedCatCount": mismatch_report["mismatchAffectedCatCount"],
        },
        "generatedDataBytesExcludingManifest": sum(len(content) for content in artifacts.values()),
        "exclusions": [
            "current ownership or balances",
            "accessory ownership/wear state",
            "marketplace, price, sale, or bid data",
            "live API/RPC/chain state",
            "provisional/live naming inputs",
            "complete CatNamed event history",
        ],
        "sourceRefs": [
            "mooncatrescue-mooncat-traits-json",
            "mooncatrescue-libmooncat-limited-js",
            "mooncatrescue-mooncatparser-js",
            "mooncatrescue-about-collection",
            "mooncat-rescueorder-by-category",
            "mooncat-color-classification",
            "mooncatdao-name-index",
            "mooncat-kb-name-index-pinned-snapshot",
            "mooncat-kb-mooncat-names-snapshot",
        ],
    }
    artifacts["manifest.json"] = json_bytes(manifest)
    return artifacts


def load_committed_population(directory: Path = POPULATION_DIR) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    manifest = read_json(directory / "manifest.json")
    rows: list[dict[str, Any]] = []
    for shard in manifest.get("layout", {}).get("shards", []):
        path = ROOT / shard["path"] if directory == POPULATION_DIR else directory / "shards" / Path(shard["path"]).name
        content = path.read_bytes()
        if sha256_bytes(content) != shard.get("sha256") or len(content) != shard.get("bytes"):
            raise PopulationError(f"shard hash/size mismatch: {path}")
        data = json.loads(content)
        shard_rows = data.get("rows")
        if not isinstance(shard_rows, list) or len(shard_rows) != shard.get("rowCount"):
            raise PopulationError(f"shard row count mismatch: {path}")
        rows.extend(shard_rows)
    if len(rows) != POPULATION_COUNT:
        raise PopulationError(f"committed population contains {len(rows)} rows, expected {POPULATION_COUNT}")
    return manifest, rows


def compare_rows(old_rows: list[dict[str, Any]], new_rows: list[dict[str, Any]]) -> dict[str, Any]:
    if len(old_rows) != len(new_rows):
        raise PopulationError("candidate population row count differs from committed population")
    field_counts: Counter[str] = Counter()
    changed_orders: list[int] = []
    newly_named: list[dict[str, Any]] = []
    immutable_name_mutations: list[dict[str, Any]] = []
    for old, new in zip(old_rows, new_rows, strict=True):
        if old.get("rescueOrder") != new.get("rescueOrder") or old.get("catId") != new.get("catId"):
            raise PopulationError(f"candidate identity changed at rescueOrder {old.get('rescueOrder')}")
        changed = False
        for field in ("traits", "genesis", "color", "rescueBuckets", "characterCategories", "name"):
            if old.get(field) != new.get(field):
                field_counts[field] += 1
                changed = True
        old_name, new_name = old.get("name"), new.get("name")
        if old_name is None and new_name is not None:
            newly_named.append({"rescueOrder": old["rescueOrder"], "catId": old["catId"], "nameRaw": new_name.get("nameRaw"), "text": new_name.get("text")})
        elif old_name is not None and new_name is not None and old_name.get("nameRaw") != new_name.get("nameRaw"):
            immutable_name_mutations.append({
                "rescueOrder": old["rescueOrder"], "catId": old["catId"],
                "oldNameRaw": old_name.get("nameRaw"), "newNameRaw": new_name.get("nameRaw"),
            })
        elif old_name is not None and new_name is None:
            immutable_name_mutations.append({
                "rescueOrder": old["rescueOrder"], "catId": old["catId"],
                "oldNameRaw": old_name.get("nameRaw"), "newNameRaw": None,
            })
        if changed:
            changed_orders.append(old["rescueOrder"])
    return {
        "changedRowCount": len(changed_orders),
        "changedRescueOrders": changed_orders,
        "changesByFieldGroup": dict(sorted(field_counts.items())),
        "newlyNamedCount": len(newly_named),
        "newlyNamed": newly_named,
        "immutableNameMutationCount": len(immutable_name_mutations),
        "immutableNameMutations": immutable_name_mutations,
    }
