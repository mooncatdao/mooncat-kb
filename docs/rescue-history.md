# Rescue History

Machine-readable rescue data is split by purpose:

- `data/rescue-ranges.json` stores definitions, counts, criteria, and source notes.
- `data/rescue-buckets.json` stores materialized canonical-derived bucket membership arrays.

## Current Status

Partially verified.

The first import pass records contract-derived supply counts. A later local-source import adds canonical-derived rescue/history buckets such as `sub100`, `day1`, `week1`, calendar-year buckets, and a `genesis` bucket.

These bucket arrays use `rescue-order-index` values. They are not interchangeable with token IDs, bytes5 catIds, OpenSea IDs, or contract call values unless a conversion is explicitly defined and verified.

## Canonical vs Derived Artifacts

Canonical chain-derived facts come from protocol data, rescue order, and block timestamps.

`data/rescue-buckets.json` is a local derived JSON artifact that materializes those buckets as arrays. Its bucket membership can be canonical-derived, but the repo still needs a written method note that documents the exact source query or derivation process.

Downstream tools should treat `rescue-order-index` as its own identifier space. A separate mapping step is required before using these values as token-facing identifiers.

## Verified from contract source

- Total supply: `25600`
- Initial normal rescue cat supply: `25344`
- Genesis cat supply cap: `256`

These are supply constants, not rescue-history ranges.

## Canonical-derived buckets

`data/rescue-buckets.json` imports materialized bucket arrays from `mooncat_rescueOrder_by_category.json`.

Imported buckets:

- `sub100`
- `day1`
- `week1`
- `rescued2017`
- `rescued2018`
- `rescued2019`
- `rescued2020`
- `genesis`

Character-cat arrays from the same source are intentionally excluded from rescue buckets and live in `data/character-cat-index.json`.

## Definitions vs Membership

Range definitions and source criteria belong in `data/rescue-ranges.json`.

Materialized membership arrays belong in `data/rescue-buckets.json`.

Calendar/year buckets are canonical-derived when based on verified UTC rescue timestamps, but the exact derivation method still needs to be documented in this repository.

## Still needed

- confirmation of the rescue-order-index convention
- documentation of the exact derivation method/source query
- early-rescue definitions
- historical thresholds by block or timestamp
- source-backed conversion between rescue-order indexes and canonical catIds, if needed

## Rules

- State whether a range is based on ID, rescue order, block, timestamp, supply constant, or community convention.
- Add exact values only with source references.
- Keep historical explanation in this document and exact ranges/counts in JSON.
- Do not use rescue-order-index values as token IDs, bytes5 catIds, OpenSea IDs, or contract call values without conversion and verification.
