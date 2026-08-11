# Generated Visual-Trait Data

## Prototype Status

`data/mooncat-visual-traits.sample.json` is a deterministic 64-row prototype, not a complete MoonCat trait table. It is keyed by the 0x-prefixed bytes5 `catId`; `rescueOrder` is a secondary lookup value copied from the reviewed row and checked through array position plus LibMoonCat lookups. It is never calculated arithmetically from `catId`.

The full population is now implemented separately at
`data/mooncat-population/manifest.json`. The sample remains unchanged as a
compact representative fixture; see `docs/mooncat-population-index.md` for the
25,440-row schema, query CLI, pinned naming enrichment, and exhaustive checks.

Generate and validate it with:

```sh
python scripts/generate-visual-traits.py
python scripts/generate-visual-traits.py --check
python scripts/validate-visual-traits.py
```

Generation uses only checked-in files and invokes the checked-in JavaScript bundles through local Node.js. It performs no network requests.

The local input hashes and unresolved upstream-revision limitations are tracked in `data/upstream-snapshot-manifest.json`. A hash change is drift, not an automatic refresh signal.

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

The generated `colorClassification` object is a separate, versioned human-facing display policy. It preserves `hueInt`, `hueName`, `pale`, and `genesis`, uses the reviewed ADR-shifted integer buckets, and gives source-backed Genesis black/white sentinels special treatment before circular hue handling. Its `Sky Blue` label is a display normalization of source `skyblue`, not a mismatch. It does not claim palettes, RGB/hex values, rendering output, rarity, or canonical on-chain traits. See `docs/color-classification.md`.

`data/materialization-parity-results.json` reuses eight selected rows for deterministic identifier, source-trait, and parser-structure checks. It preserves the raw traits and derived label separately, and explicitly marks on-chain palette, SVG serialization, and accessory composition layers unavailable or deferred. See `docs/materialization-parity.md`.

## Validation

The dedicated validator checks row count, unique and formatted bytes5 IDs, unique in-range rescue orders, required types and enums, pale/Genesis edge coverage, all identifier round trips, parser output, sourceRef resolution, and mismatch-link/count consistency. Generator `--check` rebuilds the complete artifact in memory and compares exact bytes, including input hashes.

## Full-Population Relationship

The scaled artifact is generated rather than hand-edited, uses fixed
rescue-order shards, records exact input hashes and the pinned finalized
name-index revision, checks every identifier and parser render, and preserves
all LibMoonCat/source disagreements in a separate validation report. The sample
continues to provide fast representative coverage without becoming a second
population source.

Neither generated artifact establishes freshness against live APIs, RPC,
ownership, accessories, marketplaces, or chain state.
