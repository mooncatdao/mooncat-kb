# Full MoonCat Population Index

## Status and layout

`data/mooncat-population/manifest.json` describes a deterministic generated
view of all 25,440 collection members. It is a joined lookup over registered
source files, not a new independent source of truth and not a live-state
artifact.

Rows are split into 26 fixed rescue-order shards under
`data/mooncat-population/shards/`. The first 25 shards hold 1,000 rows each;
the last covers rescue orders 25,000 through 25,439. The manifest records every
range, row count, byte size, and SHA-256. Fixed rescue-order boundaries keep a
new finalized name localized to its shard plus the manifest, validation report,
and pinned name-index inputs.

Each compact row contains:

- native bytes5 `catId` and source-backed `rescueOrder`;
- selected raw visual traits: `rescueYear`, `hueInt`, `hueName`, `pale`,
  `facing`, `expression`, `pattern`, and `pose`;
- canonical released-Genesis membership;
- versioned derived human-facing color key/label;
- canonical-derived rescue/history bucket keys;
- community-curated character-category keys; and
- a detailed finalized name-index record, or `null` when unnamed.

Field-group provenance and trust are stored once in the manifest instead of
being repeated on every row. The existing 64-row
`data/mooncat-visual-traits.sample.json` remains a lightweight fixture with its
original schema and validation contract.

## Source priority and trust

The generator selects identities and raw visual fields from the checked-in
`mooncat_traits.json` reference, then exhaustively compares every row with
LibMoonCat. It uses mooncatparser only as a nonempty renderability check; parser
pixels and colors are not promoted into trait or palette data.

Released Genesis membership comes from `data/genesis-cats.json` and must equal
the 96 source markers and the Genesis rescue bucket. Rescue/history bucket
membership comes from `data/rescue-buckets.json`. Character categories come
from `data/character-cat-index.json` and remain community-curated,
noncanonical classifications. They have zero overlap with released Genesis
membership in the committed build.

Color keys and labels are derived under `mooncat-human-hue-v1` from
`data/color-classification.json`. Raw hue, pale, and Genesis evidence remains in
the row. A color label is not an on-chain trait, RGB/hex palette, rarity claim,
or rendering proof.

## Finalized naming snapshot

`references/upstream/name-index/` contains only `current-names.json`,
`metadata.json`, and `SNAPSHOT.json`, pinned to MoonCatDAO/name-index commit
`5d3b265613e987e4ca2c32e2afd7edf3178a146a` under CC0-1.0. Event history,
pending events, `*-live.json`, webhook state, and reports are not vendored.

Every current-name record maps to exactly one population row through both
`catId` and `rescueOrder`. Detailed immutable fields are preserved without
inventing absent `text`. Blank events never become current-name records.
`data/mooncat-names.json` is compared by raw bytes32 plus identifiers: all
1,225 overlapping rows match the pinned finalized snapshot, which has eight
additional finalized names at this revision.

Refresh only from an explicit local checkout:

```sh
python scripts/import-name-index-snapshot.py --source /path/to/name-index
python scripts/generate-mooncat-population.py
python scripts/diff-mooncat-population.py
python scripts/validate-mooncat-population.py
```

The importer validates the repository package identity, CC0-1.0 license,
finalized artifact shape, metadata, identifiers, hashes, and monotonic naming
invariant without network access. A newly named previously unnamed cat is an
allowed addition. Removing a finalized name or changing a previously finalized
nonblank `nameRaw` is fatal and requires investigation.

## Generation and validation

Generate or compare deterministic artifacts with:

```sh
python scripts/generate-mooncat-population.py
python scripts/generate-mooncat-population.py --check
python scripts/validate-mooncat-population.py
python scripts/diff-mooncat-population.py --check
```

The JavaScript verification runs in one Node process with inputs passed through
stdin. Generation and validation each check all 25,440 LibMoonCat identifier
round trips, extended traits, and mooncatparser outputs. Identity, range,
membership, source-hash, naming, and parser failures are fatal.

Representational trait disagreements do not overwrite either source. The
compact `validation-report.json` lists every affected MoonCat and groups repeat
patterns. The committed build records 2,524 comparisons across 2,511 cats:
2,218 `hueName` differences and 306 `hueInt` differences. These include the
known `skyblue`/`skyBlue` representation and Genesis sentinel differences as
well as all other full-population hue comparisons.

## Querying

The query CLI reads only the generated manifest/shards:

```sh
python scripts/query-mooncats.py --rescue-order 0
python scripts/query-mooncats.py --cat-id 0x00d658d50b --json
python scripts/query-mooncats.py --genesis --count
python scripts/query-mooncats.py --character-category pinkPanther --count
python scripts/query-mooncats.py --color "Sky Blue" --pale --count
python scripts/query-mooncats.py --named --name-text MoonCat --json
```

Filters cover rescue year, raw hue, derived color, pale, facing, expression,
pattern, pose, Genesis, character category, rescue bucket, named/unnamed, and
case-insensitive exact decoded name text. Duplicate names are allowed, so name
queries return all matching rows subject to the display `--limit`; `--count`
always counts the complete match set. `--provenance` adds field-group provenance
to JSON output.

## Static, monotonic, and excluded fields

Static source inputs change only through a deliberate source review and
regeneration. Finalized nonblank names are immutable per cat, but the named
population grows monotonically and therefore has an explicit pinned revision.
The index excludes current ownership, balances, accessory ownership/wear,
marketplaces, prices, sales, bids, live API/RPC/chain state, provisional names,
and complete `CatNamed` history.
