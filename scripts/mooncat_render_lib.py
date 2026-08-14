#!/usr/bin/env python3
"""Shared zero-network helpers for full-population MoonCat render artifacts."""

from __future__ import annotations

import base64
import binascii
import hashlib
import json
import re
import subprocess
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RENDER_DIR = ROOT / "data/mooncat-renders"
TRAITS_PATH = ROOT / "references/upstream/mooncatrescue/mooncat_traits.json"
PARSER_PATH = ROOT / "references/upstream/mooncatrescue/mooncatparser.js"
PARITY_CASES_PATH = ROOT / "data/materialization-parity-cases.json"

POPULATION_COUNT = 25_440
SHARD_SIZE = 1_000
SCHEMA_VERSION = 1
ENCODING_ID = "palette-index-nibble-base64-v1"
CAT_ID = re.compile(r"^0x[0-9a-f]{10}$")
COLOR = re.compile(r"^#[0-9a-f]{6}$")


class RenderArtifactError(ValueError):
    """Fatal render source, encoding, or generated-artifact error."""


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RenderArtifactError(f"cannot read JSON {path.relative_to(ROOT)}: {exc}") from exc


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


def load_source_identities() -> list[dict[str, Any]]:
    rows = read_json(TRAITS_PATH)
    if not isinstance(rows, list) or len(rows) != POPULATION_COUNT:
        raise RenderArtifactError(f"mooncat_traits.json must contain exactly {POPULATION_COUNT} rows")
    identities: list[dict[str, Any]] = []
    seen: set[str] = set()
    for order, row in enumerate(rows):
        if not isinstance(row, dict) or row.get("rescueOrder") != order:
            raise RenderArtifactError(f"source row/index alignment failed at rescueOrder {order}")
        cat_id = row.get("catId")
        if not isinstance(cat_id, str) or not CAT_ID.fullmatch(cat_id) or cat_id in seen:
            raise RenderArtifactError(f"invalid or duplicate source catId at rescueOrder {order}: {cat_id}")
        seen.add(cat_id)
        identities.append({"catId": cat_id, "rescueOrder": order})
    return identities


def run_parser_encoded(identities: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Run mooncatparser once and return compact x-major palette-index rows."""
    program = r"""
const fs = require('fs');
const parser = require(process.argv[1]);
const identities = JSON.parse(fs.readFileSync(0, 'utf8'));
const output = [];
for (const identity of identities) {
  const matrix = parser(identity.catId);
  if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0]) || matrix[0].length === 0) {
    throw new Error(`empty parser matrix for ${identity.catId}`);
  }
  const width = matrix.length;
  const height = matrix[0].length;
  const palette = [null];
  const paletteIndexes = new Map([[null, 0]]);
  const indexes = [];
  for (let x = 0; x < width; x += 1) {
    const column = matrix[x];
    if (!Array.isArray(column) || column.length !== height) {
      throw new Error(`ragged parser matrix for ${identity.catId}`);
    }
    for (let y = 0; y < height; y += 1) {
      const color = column[y];
      if (color !== null && typeof color !== 'string') {
        throw new Error(`invalid parser cell for ${identity.catId} at ${x},${y}`);
      }
      if (!paletteIndexes.has(color)) {
        paletteIndexes.set(color, palette.length);
        palette.push(color);
      }
      indexes.push(paletteIndexes.get(color));
    }
  }
  if (palette.length > 16) {
    throw new Error(`palette exceeds nibble capacity for ${identity.catId}`);
  }
  const packed = Buffer.alloc(Math.ceil(indexes.length / 2));
  for (let index = 0; index < indexes.length; index += 1) {
    if (index % 2 === 0) packed[index >> 1] = indexes[index] << 4;
    else packed[index >> 1] |= indexes[index];
  }
  output.push({
    catId: identity.catId,
    rescueOrder: identity.rescueOrder,
    width,
    height,
    palette,
    pixels: packed.toString('base64')
  });
}
process.stdout.write(JSON.stringify(output));
"""
    payload = json.dumps(identities, separators=(",", ":"))
    try:
        result = subprocess.run(
            ["node", "-e", program, str(PARSER_PATH)],
            cwd=ROOT,
            input=payload,
            capture_output=True,
            text=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        detail = getattr(exc, "stderr", "")
        raise RenderArtifactError(f"mooncatparser render generation failed: {detail}") from exc
    try:
        rows = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RenderArtifactError(f"mooncatparser returned invalid encoded JSON: {exc}") from exc
    if not isinstance(rows, list) or len(rows) != len(identities):
        raise RenderArtifactError("mooncatparser returned an incomplete encoded population")
    return rows


def run_parser_matrices(identities: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return fresh raw parser matrices for a bounded validator cross-check."""
    program = r"""
const fs = require('fs');
const parser = require(process.argv[1]);
const identities = JSON.parse(fs.readFileSync(0, 'utf8'));
const output = identities.map(identity => ({
  catId: identity.catId,
  rescueOrder: identity.rescueOrder,
  matrix: parser(identity.catId)
}));
process.stdout.write(JSON.stringify(output));
"""
    payload = json.dumps(identities, separators=(",", ":"))
    try:
        result = subprocess.run(
            ["node", "-e", program, str(PARSER_PATH)],
            cwd=ROOT,
            input=payload,
            capture_output=True,
            text=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        detail = getattr(exc, "stderr", "")
        raise RenderArtifactError(f"mooncatparser representative cross-check failed: {detail}") from exc
    try:
        rows = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RenderArtifactError(f"mooncatparser returned invalid matrix JSON: {exc}") from exc
    if not isinstance(rows, list) or len(rows) != len(identities):
        raise RenderArtifactError("mooncatparser returned incomplete representative matrices")
    return rows


def decode_palette_indices(row: dict[str, Any]) -> list[int]:
    width, height = row.get("width"), row.get("height")
    if not isinstance(width, int) or not isinstance(height, int) or width <= 0 or height <= 0:
        raise RenderArtifactError(f"invalid render dimensions for {row.get('catId')}")
    palette = row.get("palette")
    if not isinstance(palette, list) or not 2 <= len(palette) <= 16 or palette[0] is not None:
        raise RenderArtifactError(f"invalid render palette for {row.get('catId')}")
    if len({color for color in palette[1:]}) != len(palette) - 1:
        raise RenderArtifactError(f"duplicate render palette color for {row.get('catId')}")
    if any(not isinstance(color, str) or not COLOR.fullmatch(color) for color in palette[1:]):
        raise RenderArtifactError(f"invalid render palette color for {row.get('catId')}")
    pixels = row.get("pixels")
    if not isinstance(pixels, str):
        raise RenderArtifactError(f"missing packed pixels for {row.get('catId')}")
    try:
        packed = base64.b64decode(pixels, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise RenderArtifactError(f"invalid base64 pixels for {row.get('catId')}") from exc
    cell_count = width * height
    if len(packed) != (cell_count + 1) // 2:
        raise RenderArtifactError(f"packed pixel length mismatch for {row.get('catId')}")
    indexes: list[int] = []
    for value in packed:
        indexes.extend((value >> 4, value & 0x0F))
    if cell_count % 2 and indexes[-1] != 0:
        raise RenderArtifactError(f"nonzero packed padding nibble for {row.get('catId')}")
    indexes = indexes[:cell_count]
    if any(index >= len(palette) for index in indexes):
        raise RenderArtifactError(f"palette index out of range for {row.get('catId')}")
    return indexes


def decode_render_matrix(row: dict[str, Any]) -> list[list[str | None]]:
    """Decode to parser orientation: matrix[x][y], outer X/column then inner Y/row."""
    indexes = decode_palette_indices(row)
    height = row["height"]
    palette = row["palette"]
    return [
        [palette[indexes[x * height + y]] for y in range(height)]
        for x in range(row["width"])
    ]


def build_render_artifacts() -> dict[str, bytes]:
    identities = load_source_identities()
    rows = run_parser_encoded(identities)
    dimension_counts: Counter[tuple[int, int]] = Counter()
    palette_size_counts: Counter[int] = Counter()
    logical_cells = 0
    nontransparent_cells = 0
    packed_pixel_bytes = 0
    base64_pixel_characters = 0
    for identity, row in zip(identities, rows, strict=True):
        if row.get("catId") != identity["catId"] or row.get("rescueOrder") != identity["rescueOrder"]:
            raise RenderArtifactError(f"encoded identity mismatch at rescueOrder {identity['rescueOrder']}")
        indexes = decode_palette_indices(row)
        logical_cells += len(indexes)
        nontransparent_cells += sum(index != 0 for index in indexes)
        packed_pixel_bytes += (len(indexes) + 1) // 2
        base64_pixel_characters += len(row["pixels"])
        dimension_counts[(row["width"], row["height"])] += 1
        palette_size_counts[len(row["palette"])] += 1

    artifacts: dict[str, bytes] = {}
    shard_entries: list[dict[str, Any]] = []
    for start in range(0, POPULATION_COUNT, SHARD_SIZE):
        end = min(start + SHARD_SIZE, POPULATION_COUNT) - 1
        filename = f"{start:05d}-{end:05d}.json"
        relative = f"shards/{filename}"
        content = json_bytes({
            "schemaVersion": SCHEMA_VERSION,
            "encoding": ENCODING_ID,
            "range": {
                "startRescueOrder": start,
                "endRescueOrder": end,
                "rowCount": end - start + 1,
            },
            "rows": rows[start:end + 1],
        })
        artifacts[relative] = content
        shard_entries.append({
            "path": f"data/mooncat-renders/{relative}",
            "startRescueOrder": start,
            "endRescueOrder": end,
            "rowCount": end - start + 1,
            "sha256": sha256_bytes(content),
            "bytes": len(content),
        })

    shard_bytes = sum(len(content) for content in artifacts.values())
    manifest = {
        "schemaVersion": SCHEMA_VERSION,
        "encodingVersion": 1,
        "updated": "2026-08-14",
        "status": "generated-full-population-parser-render-artifact",
        "scope": "Deterministic parser-derived unit-cell render data for all 25,440 MoonCats; renderer-neutral and zero-network, but not on-chain SVG, accessory, ownership, or live-state evidence.",
        "rowCount": POPULATION_COUNT,
        "primaryKey": {"field": "catId", "identifierKind": "mooncatIdBytes5"},
        "secondaryLookup": {
            "field": "rescueOrder",
            "identifierKind": "apiOriginalRescueIndex",
            "method": "source array alignment; never arithmetic Cat ID conversion",
        },
        "layout": {
            "kind": "fixed-rescue-order-shards",
            "shardSize": SHARD_SIZE,
            "shardCount": len(shard_entries),
            "shards": shard_entries,
        },
        "rowSchema": {
            "fields": ["catId", "rescueOrder", "width", "height", "palette", "pixels"],
            "logicalDimensions": "width by height unit cells",
            "palette": "Index 0 is JSON null for a transparent cell; remaining entries are exact parser-returned CSS hex colors in first-encounter order.",
            "pixels": "Base64 text containing two 4-bit palette indexes per byte.",
        },
        "coordinateSystem": {
            "origin": "top-left",
            "xDirection": "right",
            "yDirection": "down",
            "parserOuterIndex": "x/column",
            "parserInnerIndex": "y/row",
            "flattenOrder": "x-major; offset = x * height + y",
            "svgUnitCellMapping": "For each nonzero palette index, emit a 1x1 cell at x=<outer index>, y=<inner index>; do not transpose the matrix.",
        },
        "encoding": {
            "id": ENCODING_ID,
            "paletteIndexBits": 4,
            "byteOrder": "first cell in high nibble, second cell in low nibble",
            "oddCellPadding": "unused final low nibble is zero",
            "transparentPaletteIndex": 0,
            "maximumPaletteEntries": 16,
        },
        "observed": {
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
        },
        "generatedData": {
            "shardBytesExcludingManifest": shard_bytes,
            "averageShardBytesPerCat": round(shard_bytes / POPULATION_COUNT, 2),
            "looseImageFileCount": 0,
        },
        "sourceFiles": [
            source_file_record(TRAITS_PATH, "source-backed bytes5 Cat ID and rescue-order sequence"),
            source_file_record(PARSER_PATH, "exact parser-derived palettes and unit-cell matrices"),
        ],
        "sourceRefs": [
            "mooncatrescue-mooncat-traits-json",
            "mooncatrescue-mooncatparser-js",
        ],
        "generation": {
            "script": "scripts/generate-mooncat-renders.py",
            "command": "python scripts/generate-mooncat-renders.py",
            "checkCommand": "python scripts/generate-mooncat-renders.py --check",
            "validator": "python scripts/validate-mooncat-renders.py",
            "networkDependency": "none",
        },
        "validation": {
            "scope": "All rows are decoded and checked for identity, order, dimensions, palette indexes, nonempty output, shard integrity, source hashes, deterministic regeneration, and direct representative parser equality.",
            "representativeCaseSource": "data/materialization-parity-cases.json",
            "orientationRequirement": "At least one non-square representative matrix must match parser[x][y] directly and expose an asymmetric x/y witness so a transpose cannot pass.",
        },
        "intendedConsumers": [
            "Static local image/profile tools",
            "mckb-library SVG reconstruction at integer or CSS scale",
        ],
        "limitations": [
            "Parser-derived colors and cells are not proof of current MoonCatSVGs serialization or on-chain palette parity.",
            "No accessory definitions, worn state, ownership, balances, markets, API responses, or live chain state are included.",
            "The artifact does not make a licensing determination for mooncatparser.js or parser-derived visual output.",
            "SVG and other presentation output belong to downstream consumers and are not stored here.",
        ],
        "license": {
            "status": "no-parser-or-derived-output-license-determination",
            "note": "Existing parser snapshot provenance is recorded; no upstream parser or generated visual-output license claim is made.",
        },
    }
    artifacts["manifest.json"] = json_bytes(manifest)
    return artifacts


def load_committed_render_rows() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    manifest = read_json(RENDER_DIR / "manifest.json")
    rows: list[dict[str, Any]] = []
    for shard in manifest.get("layout", {}).get("shards", []):
        path = ROOT / shard.get("path", "")
        if not path.is_file():
            raise RenderArtifactError(f"missing render shard: {shard.get('path')}")
        content = path.read_bytes()
        if sha256_bytes(content) != shard.get("sha256") or len(content) != shard.get("bytes"):
            raise RenderArtifactError(f"render shard hash/size mismatch: {shard.get('path')}")
        data = json.loads(content)
        if data.get("schemaVersion") != SCHEMA_VERSION or data.get("encoding") != ENCODING_ID:
            raise RenderArtifactError(f"render shard schema/encoding mismatch: {shard.get('path')}")
        shard_rows = data.get("rows")
        if not isinstance(shard_rows, list) or len(shard_rows) != shard.get("rowCount"):
            raise RenderArtifactError(f"render shard row-count mismatch: {shard.get('path')}")
        rows.extend(shard_rows)
    if len(rows) != POPULATION_COUNT:
        raise RenderArtifactError(f"committed render artifact contains {len(rows)} rows, expected {POPULATION_COUNT}")
    return manifest, rows
