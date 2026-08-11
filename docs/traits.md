# Trait Data Strategy

Machine-readable trait data now includes a deterministic sharded full-population lookup at `data/mooncat-population/manifest.json`. The bounded `data/mooncat-visual-traits.sample.json` remains a lightweight representative fixture, and the underlying full trait source remains a local upstream reference snapshot at `references/upstream/mooncatrescue/mooncat_traits.json`.

This page documents what was observed in that snapshot, how the generated population view is bounded, and which trait work remains open.

## Current Status

The curated model decision is implemented as a deterministic 25,440-row generated joined view with exhaustive source comparisons. The unchanged 64-row representative artifact remains available for lightweight fixture use.

See `docs/mooncat-population-index.md` for full-population schema, provenance, querying, refresh, and exhaustive validation. See `docs/generated-trait-data.md` for the retained compact fixture.

`mooncat_traits.json` is a reference input under `docs/reference-policy.md`, not a curated KB dataset. The generated population view joins it with other reviewed inputs without promoting the upstream table itself into curated canonical data.

## Curated Trait Model Decision

The full-population lookup is generated through a focused data pipeline. The KB does not hand-copy or directly promote the upstream table as canonical data; each row remains a source-attributed joined view with a pinned input manifest and mismatch report.

Both generated artifacts use `catId` in the 0x-prefixed bytes5 MoonCat ID form as the primary key. `rescueOrder` is a required secondary lookup/index field sourced from the validated row and checked exhaustively through array-backed and LibMoonCat lookup methods according to `data/identifier-conventions.json`.

Allowed fields for the first visual-trait artifact:

- `catId`
- `rescueOrder`
- `rescueYear`
- visual traits: `hueInt`, `hueName`, `pale`, `facing`, `expression`, `pattern`, `pose`, and `genesis`
- derived human-facing color metadata: `colorClassification`, generated from a separately versioned policy while retaining the raw color fields
- artifact-level `sourceRefs`
- generation and validation metadata such as `generatedBy` and `validatedAt`

Reference-only or disallowed fields for the first visual-trait artifact:

- names: `nameRaw`, `name`, `namedOrder`, and `namedYear`
- accessory-related fields such as `ownedAccessories` or accessory ownership details
- full upstream rows, frequency tables, rendered images, palette values, and API response bodies

Names remain excluded from the visual-trait artifact because they have distinct
event and freshness semantics. Their separate provenance/model decision is now
implemented in `data/mooncat-naming.json`, `data/name-index-integration.json`,
`data/mooncat-names.json`, `docs/mooncat-naming.md`, and
`docs/name-index-integration.md`; the visual artifact must not duplicate them.

Required provenance and method:

- use sourceRefs registered in `data/sources.json`
- record the exact source snapshot or live source surface used
- document the generation command or script
- document row count, identifier alignment checks, and optional-field normalization
- mark complete, partial, stale-risk, or update-cadence-bound coverage explicitly

The full-population validator checks JSON syntax, one row per included `catId`, no duplicate `catId` values, bytes5 `catId` format, complete `rescueOrder` range and uniqueness, rescue-order alignment, required visual trait fields, allowed value sets, explicit `genesis` handling, sourceRef resolution, names, classifications, and parser evidence. Any future generated artifact should preserve the same explicit checks where applicable.

The bounded prototype's `colorClassification` object is derived display metadata for search, filtering, and labels. It is generated from `data/color-classification.json`, follows reviewed ADR-shifted integer hue intervals, and handles source-backed Genesis black/white sentinels before circular hue bucketing. It does not alter raw hue fields or prove palettes, RGB values, rendering, rarity, or canonical on-chain trait vocabulary. See `docs/color-classification.md`.

Decisions retained for the full-population view:

- all 25,440 cats are committed as 26 fixed 1,000-rescue-order shards (the final shard has 440 rows)
- verbose provenance, parser checks, and mismatch evidence remain artifact-level rather than repeated per row
- finalized names use an exact pinned local CC0 snapshot and retain revision-bound monotonic freshness
- current API, ownership, accessory, marketplace, and live-chain fields remain excluded
- bytes5 `catId` remains primary while `rescueOrder` is an explicit lookup-backed secondary key

## Observed Snapshot Shape

The checked file is a top-level JSON array with 25,440 rows.

Required fields present on every checked row:

- `rescueOrder`: number; ordered from `0` through `25439`
- `rescueYear`: number
- `catId`: string; `0x`-prefixed bytes5 MoonCat ID format
- `hueInt`: number
- `hueName`: string
- `pale`: boolean
- `facing`: string
- `expression`: string
- `pattern`: string
- `pose`: string

Optional fields observed:

- `genesis`: boolean; present on 96 rows, observed value `true`
- `nameRaw`: string; present on 1,225 rows. The dedicated naming snapshot preserves these raw bytes32 values.
- `name`: string or boolean; present on 1,225 rows. The dedicated snapshot retains 1,207 strings and represents 18 boolean invalid/unparsed markers without normalization.
- `namedOrder`: number; present on 1,225 rows and retained by the dedicated naming snapshot.
- `namedYear`: number; present on 1,225 rows and retained by the dedicated naming snapshot.
- `ownedAccessories`: number; present on 4,920 rows

Observed string value sets in this pass:

- `rescueYear`: `2017`, `2018`, `2019`, `2020`, `2021`
- `hueName`: `black`, `blue`, `chartreuse`, `cyan`, `fuchsia`, `green`, `magenta`, `orange`, `purple`, `red`, `skyblue`, `teal`, `white`, `yellow`
- `facing`: `left`, `right`
- `expression`: `grumpy`, `pouting`, `shy`, `smiling`
- `pattern`: `pure`, `spotted`, `tabby`, `tortie`
- `pose`: `pouncing`, `sleeping`, `stalking`, `standing`

These are observed snapshot values, not yet a curated canonical trait dictionary.

## Checks Run

Practical checks performed against the local snapshot:

- JSON parses with `python -m json.tool`
- row count is 25,440
- `rescueOrder` is ordered by array index from `0` through `25439`
- every row has the required fields listed above
- `catId` values match the checked bytes5 MoonCat ID format
- `catId` values are unique across all 25,440 rows
- optional field presence counts were recorded for name, genesis, and owned accessory fields

No frequency table or canonical trait dictionary/schema was created in this pass. The generated population validation report is retained with the population manifest rather than repeated as a separate trait table.

## Supporting Resources

Use these resources according to `docs/reference-policy.md` source tiers:

- `mooncatrescue-mooncat-traits-json`: local upstream reference snapshot. Useful for schema observation, validation planning, and candidate generated-data inputs. Do not treat the whole file as curated KB data.
- `mooncatrescue-libmooncat-limited-js`: local upstream reference snapshot of the LibMoonCat browser bundle. Useful for checking helper surfaces such as `getTraits`, `parseCatId`, `getCatId`, `getMoonCatIdByRescueIndex`, and `getRescueOrder`.
- `etherscan-mooncat-traits`: canonical on-chain contract surface for MoonCatTraits. Useful for checking contract-level trait functions such as compact and human-readable trait accessors, but not a full imported trait mapping.
- `mooncatrescue-api` and `mooncatrescue-api-openapi`: preferred current API resources. Useful for checking current trait response shapes and identifier input conventions.
- `mooncatrescue-mooncatparser-js` and `ponderware-mooncatparser`: parser context for bytes5 cat ID parsing and original image-generation behavior. Use these for parser behavior, not as a complete trait dataset by themselves.
- `ponderware-mooncatrescue-sol-raw`: historical primary source for original contract behavior and cat ID generation context.
- `mooncatrescue-gitlab` and `chainstation-source`: canonical current-maintainer technical sources when future work reviews current maintained data artifacts or app behavior.

LibMoonCat checks in this pass showed `getTraits` can emit at least `basic`, `extended`, and `erc721` shapes for a checked input. Those output shapes should be documented separately before any generated trait API compatibility layer is promoted.

## Future Curated-Data Options

Recommended next passes, in increasing scope:

- Trait field dictionary: document each field, type, allowed values, sourceRefs, and limitations. This can stay in Markdown first or become a small `data/` schema file.
- Small schema file: create a compact machine-readable schema for `mooncat_traits.json` fields and validation rules. Include sourceRefs and mark it as schema metadata, not trait data.
- Frequency summary: generate aggregate counts for selected fields such as hue, expression, pattern, pose, pale, genesis, and accessory/name presence. This is derived data and should document the exact command or script.
- Palette/rendering review: independently document palette values, rendering behavior, and any reproducible materialization outputs; the population color labels do not close those gaps.
- Current-state enrichment: separately review live API/ChainStation freshness, ownership, accessory state, and marketplace fields with their own provenance and update cadence.

Before any curated import, decide whether names, accessory counts, and derived relation fields belong in the same dataset as visual traits. They may need separate provenance or update cadence. If finalized names become a generated enrichment, consume only a pinned/local MoonCatDAO name-index finalized artifact; record its revision and metadata, regenerate deliberately when new finalized names appear, treat a changed finalized nonblank name as an invariant violation, and exclude provisional/live overlays.

## Limits

The 25,440-row population index is a generated, source-attributed joined lookup, not a standalone canonical trait dictionary or closed-form on-chain mapping. It does not create trait frequencies, establish a canonical on-chain trait vocabulary, reproduce palettes or rendering, or resolve freshness of current API/ChainStation artifacts, ownership, accessories, or marketplace state. The 64-row artifact remains a lightweight fixture with its own schema and validation contract.
