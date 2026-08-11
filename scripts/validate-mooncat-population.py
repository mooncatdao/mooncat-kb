#!/usr/bin/env python3
"""Independently validate committed full-population artifacts and local sources."""

from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict

from mooncat_population_lib import (
    CAT_ID,
    COLOR_PATH,
    POPULATION_COUNT,
    POPULATION_DIR,
    SHARD_SIZE,
    TRAIT_FIELDS,
    PopulationError,
    classify_color,
    compute_js_validation,
    file_digest,
    load_committed_population,
    load_memberships,
    load_name_snapshot,
    load_traits,
    read_json,
    reconcile_historical_names,
    sha256_bytes,
)


def fail(message: str) -> None:
    raise PopulationError(message)


def main() -> int:
    manifest, rows = load_committed_population()
    source_rows = load_traits()
    names, metadata, snapshot = load_name_snapshot()
    genesis, buckets_by_order, characters_by_order, bucket_counts, character_counts = load_memberships()
    policy = read_json(COLOR_PATH)
    report_path = POPULATION_DIR / "validation-report.json"
    report_content = report_path.read_bytes()
    report = json.loads(report_content)
    report_ref = manifest.get("validationReport", {})
    if sha256_bytes(report_content) != report_ref.get("sha256") or len(report_content) != report_ref.get("bytes"):
        fail("validation-report hash/size does not match manifest")
    if manifest.get("rowCount") != POPULATION_COUNT or manifest.get("layout", {}).get("shardSize") != SHARD_SIZE:
        fail("manifest population/layout contract mismatch")
    shards = manifest["layout"]["shards"]
    if len(shards) != 26:
        fail("manifest must list 26 fixed rescue-order shards")
    expected_start = 0
    for shard in shards:
        if shard["startRescueOrder"] != expected_start:
            fail(f"shard gap/overlap begins at {expected_start}")
        if shard["rowCount"] != shard["endRescueOrder"] - shard["startRescueOrder"] + 1:
            fail("shard range/count mismatch")
        expected_start = shard["endRescueOrder"] + 1
    if expected_start != POPULATION_COUNT:
        fail("shard ranges do not exactly cover the population")

    source_refs = {item["id"] for item in read_json(POPULATION_DIR.parent / "sources.json")["sources"]}
    if not set(manifest.get("sourceRefs", [])) <= source_refs:
        fail("population manifest has unresolved sourceRefs")
    for source in manifest.get("sourceFiles", []):
        path = POPULATION_DIR.parents[1] / source["path"]
        digest, size = file_digest(path)
        if digest != source.get("sha256") or size != source.get("bytes"):
            fail(f"population input hash/size drift: {source['path']}")

    names_by_order = {record["rescueOrder"]: record for record in names}
    actual_buckets: dict[str, list[int]] = defaultdict(list)
    actual_characters: dict[str, list[int]] = defaultdict(list)
    color_counts: Counter[str] = Counter()
    seen_ids: set[str] = set()
    named_count = 0
    for order, (row, source) in enumerate(zip(rows, source_rows, strict=True)):
        if row.get("rescueOrder") != order or source["rescueOrder"] != order:
            fail(f"population/source rescueOrder sequence mismatch at {order}")
        cat_id = row.get("catId")
        if cat_id != source["catId"] or not CAT_ID.fullmatch(str(cat_id)) or cat_id in seen_ids:
            fail(f"population identity mismatch at rescueOrder {order}")
        seen_ids.add(cat_id)
        expected_traits = {field: source[field] for field in TRAIT_FIELDS}
        if row.get("traits") != expected_traits:
            fail(f"population trait mismatch at rescueOrder {order}")
        is_genesis = order in genesis
        if row.get("genesis") is not is_genesis or source.get("genesis", False) is not is_genesis:
            fail(f"population/source/canonical Genesis mismatch at rescueOrder {order}")
        expected_color = classify_color(source, is_genesis, policy)
        if row.get("color") != expected_color:
            fail(f"population color classification mismatch at rescueOrder {order}")
        color_counts[expected_color["key"]] += 1
        expected_buckets = buckets_by_order.get(order, [])
        expected_characters = characters_by_order.get(order, [])
        if row.get("rescueBuckets") != expected_buckets:
            fail(f"rescue bucket membership mismatch at rescueOrder {order}")
        if row.get("characterCategories") != expected_characters:
            fail(f"character category membership mismatch at rescueOrder {order}")
        for key in row["rescueBuckets"]:
            actual_buckets[key].append(order)
        for key in row["characterCategories"]:
            actual_characters[key].append(order)
        expected_name = names_by_order.get(order)
        if row.get("name") != expected_name:
            fail(f"finalized name enrichment mismatch at rescueOrder {order}")
        if expected_name is not None:
            named_count += 1

    if len(seen_ids) != POPULATION_COUNT:
        fail("population catId uniqueness failed")
    if {key: len(value) for key, value in actual_buckets.items()} != bucket_counts:
        fail("population rescue bucket counts do not reproduce source memberships")
    if {key: len(value) for key, value in actual_characters.items()} != character_counts:
        fail("population character counts do not reproduce source memberships")
    if named_count != len(names) or report["naming"]["sourceMetadata"] != metadata or report["naming"]["sourceRevision"] != snapshot["sourceRevision"]:
        fail("population naming count/metadata/revision mismatch")
    if report["naming"]["historicalSnapshotReconciliation"] != reconcile_historical_names(names):
        fail("historical naming reconciliation report is stale")
    if report["memberships"]["rescueBucketCounts"] != bucket_counts or report["memberships"]["characterCategoryCounts"] != character_counts:
        fail("validation report membership counts are stale")
    if report["colors"]["counts"] != dict(sorted(color_counts.items())):
        fail("validation report color counts are stale")

    _, js_report = compute_js_validation(source_rows)
    if report.get("javascriptChecks") != js_report:
        fail("committed exhaustive JavaScript mismatch report is stale")
    if manifest.get("counts", {}).get("libTraitMismatchCount") != js_report["mismatchCount"]:
        fail("manifest mismatch count is stale")
    print(
        "OK: 25,440 rows, 25,440 ID round trips, 25,440 parser renders, "
        f"{len(genesis)} Genesis, {named_count} finalized names, "
        f"{js_report['mismatchCount']} explicit LibMoonCat trait mismatches"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PopulationError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
