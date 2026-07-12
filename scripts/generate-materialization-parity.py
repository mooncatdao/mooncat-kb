#!/usr/bin/env python3
"""Generate deterministic, bounded MoonCat materialization-parity results."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASES = ROOT / "data/materialization-parity-cases.json"
RESULTS = ROOT / "data/materialization-parity-results.json"
TRAITS = ROOT / "references/upstream/mooncatrescue/mooncat_traits.json"
LIB = ROOT / "references/upstream/mooncatrescue/libmooncat-limited.js"
PARSER = ROOT / "references/upstream/mooncatrescue/mooncatparser.js"
VISUAL_SAMPLE = ROOT / "data/mooncat-visual-traits.sample.json"
MATERIALIZATION = ROOT / "data/materialization-internals.json"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inspect_with_javascript(fixtures: list[dict]) -> dict:
    program = r"""
const crypto = require('crypto');
global.window = {};
require(process.argv[1]);
const L = window.LibMoonCat;
const parser = require(process.argv[2]);
const fixtures = JSON.parse(process.argv[3]);
function digest(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function normalize(matrix) {
  const occupied = [];
  const colors = {};
  const widths = matrix.map(row => row.length);
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      const color = matrix[y][x];
      if (color !== null) {
        occupied.push(`${x},${y}`);
        colors[color] = (colors[color] || 0) + 1;
      }
    }
  }
  const coordinates = occupied.join(';');
  const roleCounts = Object.values(colors).sort((a, b) => a - b);
  return {
    rowCount: matrix.length,
    widths: [...new Set(widths)].sort((a, b) => a - b),
    occupiedCellCount: occupied.length,
    occupiedCoordinateSha256: digest(coordinates),
    boundingBox: {
      minX: Math.min(...occupied.map(value => Number(value.split(',')[0]))),
      maxX: Math.max(...occupied.map(value => Number(value.split(',')[0]))),
      minY: Math.min(...occupied.map(value => Number(value.split(',')[1]))),
      maxY: Math.max(...occupied.map(value => Number(value.split(',')[1])))
    },
    distinctColorCount: Object.keys(colors).length,
    colorRoleCounts: roleCounts,
    colorPartitionSha256: digest(roleCounts.join(','))
  };
}
const out = {};
for (const fixture of fixtures) {
  const first = normalize(parser(fixture.catIdBytes5));
  const second = normalize(parser(fixture.catIdBytes5));
  out[fixture.key] = {
    libTraits: L.getTraits('extended', fixture.catIdBytes5),
    libCatId: L.getMoonCatIdByRescueIndex(fixture.rescueOrder),
    libRescueOrder: L.getRescueOrder(fixture.catIdBytes5),
    parser: first,
    parserRepeatMatches: JSON.stringify(first) === JSON.stringify(second)
  };
}
process.stdout.write(JSON.stringify(out));
"""
    result = subprocess.run(
        ["node", "-e", program, str(LIB), str(PARSER), json.dumps(fixtures)],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def trait_parity(source: dict, lib: dict) -> tuple[str, list[str], list[dict]]:
    matches, differences = [], []
    direct = {
        "catId": (source["catId"], lib.get("catId")),
        "rescueOrder": (source["rescueOrder"], lib.get("rescueIndex")),
        "rescueYear": (source["rescueYear"], lib.get("rescueYear")),
        "facing": (source["facing"], lib.get("facing")),
        "expression": (source["expression"], lib.get("expression")),
        "pattern": (source["pattern"], lib.get("pattern")),
        "pose": (source["pose"], lib.get("pose")),
        "pale": (source["pale"], lib.get("pale")),
        "genesis": (source.get("genesis", False), lib.get("genesis", False)),
    }
    for field, (left, right) in direct.items():
        if left != right:
            differences.append({"field": field, "traitSnapshotValue": left, "libMoonCatValue": right, "kind": "unexpected"})
        else:
            matches.append(field)
    hue_name = (source["hueName"], lib.get("hue"))
    if hue_name[0] == hue_name[1]:
        matches.append("hueName")
    elif hue_name == ("skyblue", "skyBlue"):
        differences.append({"field": "hueName", "traitSnapshotValue": hue_name[0], "libMoonCatValue": hue_name[1], "kind": "intentional-vocabulary-normalization"})
    else:
        differences.append({"field": "hueName", "traitSnapshotValue": hue_name[0], "libMoonCatValue": hue_name[1], "kind": "unexpected"})
    hue_int = (source["hueInt"], lib.get("hueValue"))
    if hue_int[0] == hue_int[1]:
        matches.append("hueInt")
    elif (source.get("genesis") and hue_int in {(1000, -1), (2000, -2)}):
        differences.append({"field": "hueInt", "traitSnapshotValue": hue_int[0], "libMoonCatValue": hue_int[1], "kind": "intentional-genesis-sentinel"})
    else:
        differences.append({"field": "hueInt", "traitSnapshotValue": hue_int[0], "libMoonCatValue": hue_int[1], "kind": "unexpected"})
    if any(item["kind"] == "unexpected" for item in differences):
        return "failed", matches, differences
    return ("passed-with-intentional-differences" if differences else "passed"), matches, differences


def generate() -> dict:
    cases = json.loads(CASES.read_text())
    trait_rows = json.loads(TRAITS.read_text())
    sample_rows = {row["rescueOrder"]: row for row in json.loads(VISUAL_SAMPLE.read_text())["rows"]}
    fixture_rows = cases["fixtures"]
    js = inspect_with_javascript(fixture_rows)
    results = []
    for fixture in fixture_rows:
        source = trait_rows[fixture["rescueOrder"]]
        sample = sample_rows.get(fixture["rescueOrder"])
        check = js[fixture["key"]]
        if source["rescueOrder"] != fixture["rescueOrder"] or source["catId"] != fixture["catIdBytes5"]:
            raise ValueError(f"fixture {fixture['key']} does not match trait snapshot identity")
        if not sample or sample["catId"] != fixture["catIdBytes5"]:
            raise ValueError(f"fixture {fixture['key']} is absent or mismatched in visual sample")
        if check["libCatId"] != fixture["catIdBytes5"] or check["libRescueOrder"] != fixture["rescueOrder"]:
            raise ValueError(f"fixture {fixture['key']} failed LibMoonCat identifier round trip")
        trait_status, matching_fields, differences = trait_parity(source, check["libTraits"])
        if trait_status != fixture["expectedSourceTraitStatus"]:
            raise ValueError(f"fixture {fixture['key']} source trait status {trait_status} differs from expected {fixture['expectedSourceTraitStatus']}")
        if not check["parserRepeatMatches"]:
            raise ValueError(f"fixture {fixture['key']} parser normalization is not deterministic")
        parser = check["parser"]
        if parser["occupiedCellCount"] <= 0 or not parser["widths"] or parser["distinctColorCount"] <= 0:
            raise ValueError(f"fixture {fixture['key']} parser normalization is empty")
        results.append({
            "key": fixture["key"],
            "catIdBytes5": fixture["catIdBytes5"],
            "rescueOrder": fixture["rescueOrder"],
            "coverage": fixture["coverage"],
            "sourceRefs": fixture["sourceRefs"],
            "rawTraits": {field: source.get(field, False if field == "genesis" else None) for field in ["rescueYear", "hueInt", "hueName", "pale", "facing", "expression", "pattern", "pose", "genesis"]},
            "derivedColorLabel": {
                "schemeId": sample["colorClassification"]["schemeId"],
                "schemeVersion": sample["colorClassification"]["schemeVersion"],
                "label": sample["colorClassification"]["label"],
                "baseBucket": sample["colorClassification"]["baseBucket"],
                "specialCategory": sample["colorClassification"]["specialCategory"],
                "limitation": "display metadata only; not palette or rendering proof"
            },
            "parity": {
                "identifier": {"status": "passed", "method": "trait snapshot plus LibMoonCat forward/reverse lookup"},
                "sourceTrait": {"status": trait_status, "matchingFields": matching_fields, "differences": differences},
                "structuralRender": {"status": "passed", "method": "repeat mooncatparser normalization", "normalization": parser},
                "colorPalette": {"status": "not-executable-evidence-insufficient", "reason": "no executable checked-in MoonCatColors per-cat palette output; parser partition is structural-only"},
                "exactSerialization": {"status": "not-executable", "reason": "no checked-in MoonCatSVGs output and LibMoonCat image helpers require DOM"},
                "documentedMaterialization": {"status": "documented-only", "reason": "reviewed MoonCatSVGs accepts this bytes5/rescueOrder identity and documented trait/color inputs; no offline contract execution"},
                "accessoryComposition": {"status": "deferred-insufficient-deterministic-inputs", "reason": "no deterministic owned records, definitions, image data, palette, layering, or worn-state inputs"}
            }
        })
    intentional = sum(len(row["parity"]["sourceTrait"]["differences"]) for row in results)
    return {
        "version": 1,
        "updated": "2026-07-12",
        "status": "generated-representative-zero-network-parity-results",
        "scope": cases["scope"],
        "sourceRefs": cases["sourceRefs"],
        "sourceFiles": [
            {"path": str(path.relative_to(ROOT)), "sha256": sha256(path)}
            for path in [CASES, TRAITS, LIB, PARSER, VISUAL_SAMPLE, MATERIALIZATION]
        ],
        "generation": {"script": "scripts/generate-materialization-parity.py", "command": "python scripts/generate-materialization-parity.py", "networkDependency": "none", "fixtureCount": len(results)},
        "parityLevels": cases["parityLevels"],
        "summary": {"fixtureCount": len(results), "identifierPassed": len(results), "sourceTraitPassed": sum(row["parity"]["sourceTrait"]["status"] == "passed" for row in results), "sourceTraitPassedWithIntentionalDifferences": sum(row["parity"]["sourceTrait"]["status"] == "passed-with-intentional-differences" for row in results), "intentionalDifferenceCount": intentional, "structuralRenderPassed": len(results), "colorPaletteNotExecutable": len(results), "exactSerializationNotExecutable": len(results), "documentedMaterializationOnly": len(results), "accessoryCompositionDeferred": len(results)},
        "results": results,
        "limitations": cases["limitations"]
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if the committed result differs")
    args = parser.parse_args()
    rendered = json.dumps(generate(), indent=2, ensure_ascii=False) + "\n"
    if args.check:
        if not RESULTS.exists() or RESULTS.read_text() != rendered:
            print(f"out of date: {RESULTS.relative_to(ROOT)}", file=sys.stderr)
            return 1
        print(f"OK: {RESULTS.relative_to(ROOT)} is deterministic and current")
        return 0
    RESULTS.write_text(rendered)
    print(f"wrote {RESULTS.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
