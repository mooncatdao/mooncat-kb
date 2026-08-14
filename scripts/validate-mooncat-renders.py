#!/usr/bin/env python3
"""Exhaustively validate compact full-population MoonCat render artifacts."""

from __future__ import annotations

import json
import sys
from collections import Counter

from mooncat_render_lib import (
    CAT_ID,
    ENCODING_ID,
    PARITY_CASES_PATH,
    POPULATION_COUNT,
    RENDER_DIR,
    ROOT,
    SCHEMA_VERSION,
    SHARD_SIZE,
    TRAITS_PATH,
    RenderArtifactError,
    build_render_artifacts,
    decode_palette_indices,
    decode_render_matrix,
    file_digest,
    load_committed_render_rows,
    load_source_identities,
    read_json,
    run_parser_matrices,
)


def fail(message: str) -> None:
    raise RenderArtifactError(message)


def validate_manifest_and_rows() -> tuple[dict, list[dict], dict[str, int]]:
    manifest, rows = load_committed_render_rows()
    if manifest.get("schemaVersion") != SCHEMA_VERSION or manifest.get("encodingVersion") != 1:
        fail("render manifest schema/encoding version mismatch")
    if manifest.get("rowCount") != POPULATION_COUNT:
        fail("render manifest population count mismatch")
    if manifest.get("encoding", {}).get("id") != ENCODING_ID:
        fail("render manifest encoding ID mismatch")
    if manifest.get("generation", {}).get("networkDependency") != "none":
        fail("render generation must declare networkDependency none")
    coordinate = manifest.get("coordinateSystem", {})
    if coordinate.get("parserOuterIndex") != "x/column" or coordinate.get("parserInnerIndex") != "y/row":
        fail("render manifest must preserve parser outer-X/inner-Y orientation")
    if coordinate.get("flattenOrder") != "x-major; offset = x * height + y":
        fail("render manifest flatten-order contract mismatch")

    source_refs = {item["id"] for item in read_json(ROOT / "data/sources.json")["sources"]}
    if not set(manifest.get("sourceRefs", [])) <= source_refs:
        fail("render manifest has unresolved sourceRefs")
    for source in manifest.get("sourceFiles", []):
        path = ROOT / source.get("path", "")
        if not path.is_file():
            fail(f"render source file is missing: {source.get('path')}")
        digest, size = file_digest(path)
        if digest != source.get("sha256") or size != source.get("bytes"):
            fail(f"render source hash/size drift: {source.get('path')}")

    shards = manifest.get("layout", {}).get("shards", [])
    if manifest.get("layout", {}).get("shardSize") != SHARD_SIZE or len(shards) != 26:
        fail("render manifest must list 26 fixed 1,000-order shards")
    expected_start = 0
    shard_bytes = 0
    expected_json_paths = {RENDER_DIR / "manifest.json"}
    for shard in shards:
        start, end, count = shard.get("startRescueOrder"), shard.get("endRescueOrder"), shard.get("rowCount")
        if start != expected_start or not isinstance(end, int) or count != end - start + 1:
            fail(f"render shard gap/range mismatch at rescueOrder {expected_start}")
        path = ROOT / shard["path"]
        expected_json_paths.add(path)
        payload = json.loads(path.read_text(encoding="utf-8"))
        expected_range = {"startRescueOrder": start, "endRescueOrder": end, "rowCount": count}
        if payload.get("range") != expected_range:
            fail(f"render shard payload range mismatch: {shard['path']}")
        shard_bytes += shard["bytes"]
        expected_start = end + 1
    if expected_start != POPULATION_COUNT:
        fail("render shard ranges do not exactly cover the population")
    existing_json_paths = set(RENDER_DIR.rglob("*.json"))
    if existing_json_paths != expected_json_paths:
        extra = sorted(path.relative_to(RENDER_DIR).as_posix() for path in existing_json_paths - expected_json_paths)
        missing = sorted(path.relative_to(RENDER_DIR).as_posix() for path in expected_json_paths - existing_json_paths)
        fail(f"render generated-file set mismatch; extra={extra} missing={missing}")
    loose_images = [path for path in RENDER_DIR.rglob("*") if path.is_file() and path.suffix.lower() in {".svg", ".png", ".jpg", ".jpeg", ".webp"}]
    if loose_images:
        fail(f"loose generated image files are forbidden: {[path.name for path in loose_images[:10]]}")

    identities = load_source_identities()
    seen_ids: set[str] = set()
    dimension_counts: Counter[tuple[int, int]] = Counter()
    palette_size_counts: Counter[int] = Counter()
    logical_cells = 0
    nontransparent_cells = 0
    packed_pixel_bytes = 0
    base64_pixel_characters = 0
    by_order: dict[int, dict] = {}
    required_fields = {"catId", "rescueOrder", "width", "height", "palette", "pixels"}
    for order, (row, identity) in enumerate(zip(rows, identities, strict=True)):
        if set(row) != required_fields:
            fail(f"render row schema mismatch at rescueOrder {order}")
        cat_id = row.get("catId")
        if row.get("rescueOrder") != order or identity != {"catId": cat_id, "rescueOrder": order}:
            fail(f"render/source identity mismatch at rescueOrder {order}")
        if not isinstance(cat_id, str) or not CAT_ID.fullmatch(cat_id) or cat_id in seen_ids:
            fail(f"invalid or duplicate render catId at rescueOrder {order}")
        seen_ids.add(cat_id)
        indexes = decode_palette_indices(row)
        if not any(index != 0 for index in indexes):
            fail(f"empty decoded render at rescueOrder {order}")
        dimension_counts[(row["width"], row["height"])] += 1
        palette_size_counts[len(row["palette"])] += 1
        logical_cells += len(indexes)
        nontransparent_cells += sum(index != 0 for index in indexes)
        packed_pixel_bytes += (len(indexes) + 1) // 2
        base64_pixel_characters += len(row["pixels"])
        by_order[order] = row
    if len(seen_ids) != POPULATION_COUNT:
        fail("render Cat ID uniqueness failed")

    observed = {
        "dimensions": [
            {"width": width, "height": height, "rowCount": count}
            for (width, height), count in sorted(dimension_counts.items())
        ],
        "paletteSizes": [
            {"paletteEntryCount": size, "rowCount": count}
            for size, count in sorted(palette_size_counts.items())
        ],
        "logicalCellCount": logical_cells,
        "nontransparentCellCount": nontransparent_cells,
        "packedPixelBytes": packed_pixel_bytes,
        "base64PixelCharacters": base64_pixel_characters,
    }
    if manifest.get("observed") != observed:
        fail("render manifest observed metrics are stale")
    generated = manifest.get("generatedData", {})
    if generated.get("shardBytesExcludingManifest") != shard_bytes:
        fail("render manifest shard-byte total is stale")
    if generated.get("averageShardBytesPerCat") != round(shard_bytes / POPULATION_COUNT, 2):
        fail("render manifest bytes-per-cat value is stale")
    if generated.get("looseImageFileCount") != 0:
        fail("render manifest loose-image count must be zero")
    return manifest, rows, {"shardBytes": shard_bytes, "logicalCells": logical_cells}


def validate_representative_parser_equality(rows: list[dict]) -> tuple[int, str]:
    cases = read_json(PARITY_CASES_PATH).get("fixtures", [])
    traits = read_json(TRAITS_PATH)
    identities = [
        {"catId": case.get("catIdBytes5"), "rescueOrder": case.get("rescueOrder")}
        for case in cases
    ]
    if len(identities) < 8:
        fail("representative render cross-check requires the eight materialization fixtures")
    raw_rows = run_parser_matrices(identities)
    poses, patterns, facings, hues = set(), set(), set(), set()
    genesis_states: set[bool] = set()
    orientation_witness: str | None = None
    for identity, raw_row in zip(identities, raw_rows, strict=True):
        order = identity["rescueOrder"]
        source = traits[order]
        if source.get("catId") != identity["catId"] or source.get("rescueOrder") != order:
            fail(f"representative source identity mismatch at rescueOrder {order}")
        poses.add(source["pose"])
        patterns.add(source["pattern"])
        facings.add(source["facing"])
        hues.add(source["hueName"])
        genesis_states.add(source.get("genesis", False))
        committed = rows[order]
        decoded = decode_render_matrix(committed)
        raw = raw_row.get("matrix")
        if raw_row.get("catId") != identity["catId"] or raw_row.get("rescueOrder") != order:
            fail(f"fresh parser cross-check identity mismatch at rescueOrder {order}")
        if decoded != raw:
            fail(f"decoded artifact differs from fresh parser[x][y] at rescueOrder {order}")
        if committed["width"] != len(raw) or committed["height"] != len(raw[0]):
            fail(f"decoded orientation dimensions differ from parser at rescueOrder {order}")
        if orientation_witness is None and committed["width"] != committed["height"]:
            limit = min(committed["width"], committed["height"])
            for x in range(limit):
                for y in range(limit):
                    if raw[x][y] != raw[y][x]:
                        orientation_witness = f"{identity['catId']}@{x},{y}"
                        break
                if orientation_witness is not None:
                    break
    if poses != {"pouncing", "sleeping", "stalking", "standing"}:
        fail(f"representative render cases do not cover all poses: {sorted(poses)}")
    if patterns != {"pure", "spotted", "tabby", "tortie"}:
        fail(f"representative render cases do not cover all patterns: {sorted(patterns)}")
    if facings != {"left", "right"} or genesis_states != {False, True}:
        fail("representative render cases must cover both facings and normal/Genesis cats")
    if not {"black", "white"} <= hues or len(hues - {"black", "white"}) < 2:
        fail("representative render cases must cover Genesis and multiple normal parser colors")
    if orientation_witness is None:
        fail("representative parser cases lack an orientation-sensitive asymmetric witness")
    return len(identities), orientation_witness


def validate_deterministic_regeneration() -> None:
    expected = build_render_artifacts()
    committed = {path.relative_to(RENDER_DIR).as_posix(): path.read_bytes() for path in RENDER_DIR.rglob("*.json")}
    if set(committed) != set(expected):
        fail("deterministic regeneration file set differs from committed artifact")
    changed = [relative for relative, content in expected.items() if committed[relative] != content]
    if changed:
        fail("deterministic regeneration differs: " + ", ".join(changed))


def main() -> int:
    manifest, rows, metrics = validate_manifest_and_rows()
    fixture_count, orientation_witness = validate_representative_parser_equality(rows)
    validate_deterministic_regeneration()
    print(
        f"OK: {manifest['rowCount']:,} exact parser renders across {manifest['layout']['shardCount']} shards; "
        f"{metrics['logicalCells']:,} decoded cells; {fixture_count} direct parser fixtures; "
        f"orientation witness {orientation_witness}; {metrics['shardBytes']:,} shard bytes"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RenderArtifactError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
