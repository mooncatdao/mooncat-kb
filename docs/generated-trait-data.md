# Generated Visual-Trait Data

## Prototype Status

`data/mooncat-visual-traits.sample.json` is a deterministic 64-row prototype, not a complete MoonCat trait table. It is keyed by the 0x-prefixed bytes5 `catId`; `rescueOrder` is a secondary lookup value copied from the reviewed row and checked through array position plus LibMoonCat lookups. It is never calculated arithmetically from `catId`.

Generate and validate it with:

```sh
python scripts/generate-visual-traits.py
python scripts/generate-visual-traits.py --check
python scripts/validate-visual-traits.py
```

Generation uses only checked-in files and invokes the checked-in JavaScript bundles through local Node.js. It performs no network requests.

## Sample Selection

The sample target is 64 rows. Selection is deterministic and combines:

- fixed boundary and known representative rescue orders: `0`, `1`, `82`, `84`, `95`, `96`, `2891`, `5757`, and `25439`
- the first upstream occurrence of every observed hue, facing, expression, pattern, pose, and pale value
- inclusive evenly spaced rescue-order positions until 64 rows are selected

This includes normal, Genesis, pale and non-pale cats, both black and white Genesis hue cases, all observed visual enums, and population-spanning rows. The exact selected rescue orders and first-occurrence evidence are stored in the artifact's `generation.sampleSelection` object.

## Source Priority and Provenance

The generator establishes priority before producing rows:

1. `mooncatrescue-mooncat-traits-json` supplies direct per-row identifiers and selected visual values.
2. `mooncatrescue-libmooncat-limited-js` independently checks identifiers and compares its extended trait output for every selected row. It does not silently overwrite snapshot values.
3. `mooncatrescue-mooncatparser-js` checks that each bytes5 ID produces a non-empty pixel matrix. Its colors and pixels are not promoted to trait or palette data.
4. An absent optional upstream `genesis` marker is normalized to `false`; the provenance schema records this method. Other differences are left unresolved and reported.

Artifact-level `fieldProvenance` defines direct, normalized, derived, and unresolved categories. Each row points to its value and comparison sources and links any differences into `mismatchReport`. Input SHA-256 hashes identify the exact checked-in snapshots used.

## Known Mismatches

The prototype currently reports eight comparisons rather than coercing them:

- five sampled Genesis rows use `hueInt` values `1000` or `2000` in the trait snapshot while LibMoonCat uses `hueValue` sentinels `-1` or `-2`
- three sampled `skyblue` rows use lowercase `skyblue` in the trait snapshot while LibMoonCat emits `skyBlue`

The direct snapshot value is retained because that source supplies the artifact's declared field vocabulary. These differences are semantic or normalization candidates, but remain unresolved until a focused model decision defines a shared representation.

## Validation

The dedicated validator checks row count, unique and formatted bytes5 IDs, unique in-range rescue orders, required types and enums, pale/Genesis edge coverage, all identifier round trips, parser output, sourceRef resolution, and mismatch-link/count consistency. Generator `--check` rebuilds the complete artifact in memory and compares exact bytes, including input hashes.

## Scaling to the Full Population

A full 25,440-row artifact should remain generated rather than hand-edited. Before scaling:

- decide whether the file size and review cost justify one JSON file, deterministic shards, or a build-only artifact
- pin or record upstream snapshot revisions/retrieval dates in addition to hashes
- run identifier uniqueness, rescue-order alignment, enum, provenance, and cross-source mismatch checks across every row
- preserve mismatch values from both sources; do not normalize until the schema names the normalization and retains originals
- separate visual traits from names, accessories, ownership, markets, and other data with different update cadences
- define an update policy that regenerates, validates, summarizes row/mismatch changes, and requires deliberate review before replacement

The current prototype does not establish freshness against a live API, RPC, marketplace, or chain state.
