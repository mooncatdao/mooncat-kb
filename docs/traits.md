# Trait Data Strategy

Machine-readable trait data now includes a bounded generated prototype at `data/mooncat-visual-traits.sample.json`. The full trait dataset remains only a local upstream reference snapshot at `references/upstream/mooncatrescue/mooncat_traits.json`.

This page documents what was observed in that snapshot, which resources can support future trait work, and what should happen before any normalized trait data is promoted into curated KB files.

## Current Status

Curated model decision implemented as a deterministic 64-row representative prototype. Full-population per-cat trait data is not imported.

See `docs/generated-trait-data.md` for sample selection, source priority, mismatch reporting, generation, validation, and scaling guidance.

`mooncat_traits.json` is a reference input under `docs/reference-policy.md`, not a curated KB dataset. It may be used as evidence for schema and validation planning, but future imports should promote only deliberate, normalized outputs into `data/`.

## Curated Trait Model Decision

The bounded curated prototype was created through a focused generated-data pass. The KB should not hand-copy or directly promote the full upstream `mooncat_traits.json` table into `data/`.

The prototype uses `catId` in the 0x-prefixed bytes5 MoonCat ID form as its primary key. `rescueOrder` is a required secondary lookup/index field sourced from the validated row and checked through array-backed and LibMoonCat lookup methods according to `data/identifier-conventions.json`.

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

Names and accessory-related fields may have different freshness, event semantics, or update cadence. They should stay reference-only until a separate provenance and model decision exists.

Required provenance and method:

- use sourceRefs registered in `data/sources.json`
- record the exact source snapshot or live source surface used
- document the generation command or script
- document row count, identifier alignment checks, and optional-field normalization
- mark complete, partial, stale-risk, or update-cadence-bound coverage explicitly

Validation for any future generated artifact should check JSON syntax, one row per included `catId`, no duplicate `catId` values, bytes5 `catId` format, `rescueOrder` range and uniqueness for complete datasets, rescue-order alignment, required visual trait fields, allowed value sets, explicit `genesis` handling, and sourceRef resolution.

The bounded prototype's `colorClassification` object is derived display metadata for search, filtering, and labels. It is generated from `data/color-classification.json`, follows reviewed ADR-shifted integer hue intervals, and handles source-backed Genesis black/white sentinels before circular hue bucketing. It does not alter raw hue fields or prove palettes, RGB values, rendering, rarity, or canonical on-chain trait vocabulary. See `docs/color-classification.md`.

Open questions before a full import:

- whether a future artifact should include all 25,440 cats or remain a smaller generated lookup optimized for common KB tasks
- whether a full generated artifact should be committed directly, sharded, or produced only at build time
- whether visual traits should be versioned separately from API/name/accessory fields
- what freshness policy should apply if current API or ChainStation-maintained trait artifacts diverge from the local upstream snapshot
- whether any consumer needs rescueOrder-primary shape despite bytes5 `catId` being the preferred primary key

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
- `nameRaw`: string; present on 1,225 rows
- `name`: string or boolean; present on 1,225 rows
- `namedOrder`: number; present on 1,225 rows
- `namedYear`: number; present on 1,225 rows
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

No frequency table, generated schema file, or curated trait dataset was created in this pass.

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
- Validation report: generate a small report with row count, required-field coverage, optional-field coverage, catId uniqueness, rescueOrder range, and checked enum values. This should not include all 25,440 rows.
- Small schema file: create a compact machine-readable schema for `mooncat_traits.json` fields and validation rules. Include sourceRefs and mark it as schema metadata, not trait data.
- Frequency summary: generate aggregate counts for selected fields such as hue, expression, pattern, pose, pale, genesis, and accessory/name presence. This is derived data and should document the exact command or script.
- Generated curated trait data: promote selected normalized visual-trait fields into `data/` only through the model decision above and only if a focused pass defines the generated artifact, sourceRefs, generation method, validation checks, update process, and size limits.

Before any curated import, decide whether names, accessory counts, and derived relation fields belong in the same dataset as visual traits. They may need separate provenance or update cadence.

## Limits

The prototype does not import the full 25,440-row mapping into `data/`, does not create trait frequencies, does not claim a canonical trait dictionary, and does not resolve freshness of current API or ChainStation trait artifacts. It includes 64 generated rows and an explicit mismatch report only.
