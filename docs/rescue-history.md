# Rescue History

Machine-readable rescue data is split by purpose:

- `data/rescue-ranges.json` stores definitions, counts, criteria, and source notes.
- `data/rescue-buckets.json` stores materialized canonical-derived bucket membership arrays.

Identifier terminology and conversion status live in `data/identifier-conventions.json` and `docs/identifier-conventions.md`.

## Current status

Static buckets and their timestamp-boundary method are documented and
validated; independent event-log derivation of every cutoff remains outside
the checked-in evidence.

The data records contract-derived supply constants plus canonical-derived
rescue/history buckets such as `sub100`, `day1`, `week1`, calendar-year buckets,
and a `genesis` bucket.

These bucket arrays use `rescue-order-index` values. Local bucket checks and preferred API samples verify that this convention aligns with the API rescueOrder/original rescue index convention.

These indexes are not interchangeable with token IDs, bytes5 catIds, OpenSea IDs, or contract call values unless a separate conversion is explicitly defined and verified.

## Canonical vs Derived Artifacts

Canonical chain-derived facts come from protocol data, rescue order, and block timestamps.

`data/rescue-buckets.json` is a local derived JSON artifact that materializes
those buckets as arrays. `data/rescue-ranges.json` records the UTC-boundary
method, the independently checked cutoff transaction timestamps, and the limit
that rescue-order cutoffs were not re-derived from imported event logs.

Downstream tools can treat `rescue-order-index` as aligned with API rescueOrder/original rescue index for the checked convention. A separate mapping step is still required before using these values as token-facing identifiers.

See `docs/identifier-conventions.md` before converting rescue-order indexes into bytes5 catIds, token-facing IDs, or marketplace IDs.

## Verified from contract source

- Total supply: `25600`
- Initial normal rescue cat supply: `25344`
- Genesis cat supply cap: `256`

These are supply constants, not rescue-history ranges.
The `25,600` contract constant is also not the final collection membership:
only 96 of the 256 planned Genesis Cats entered the collection, so the checked
final arithmetic is 25,344 Rescue Cats + 96 released Genesis Cats = 25,440.
See `data/genesis-cats.json`.

## Canonical-derived buckets

`data/rescue-buckets.json` imports materialized bucket arrays from `references/derived/mooncat_rescueOrder_by_category.json`.

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

Calendar/year buckets are canonical-derived under the method and limitations
recorded in `data/rescue-ranges.json`; verified timestamp strings do not by
themselves replace an independent full event-log derivation.

## Remaining boundaries

- independent event-log derivation of rescue-order cutoffs, if a future use
  needs stronger chain-derived provenance than the recorded method;
- additional early-rescue definitions beyond the existing day/week buckets,
  when a concrete sourced convention requires them; and
- live/current ownership, availability, or contract-state evidence, which is
  intentionally absent.

The repository already provides a checked array-backed conversion between
rescue order and bytes5 Cat ID. That lookup does not make a rescue order a
generic token ID; token-facing use remains contract-scoped.

## Rules

- State whether a range is based on ID, rescue order, block, timestamp, supply constant, or community convention.
- Add exact values only with source references.
- Keep historical explanation in this document and exact ranges/counts in JSON.
- Do not use rescue-order-index values as token IDs, bytes5 catIds, OpenSea IDs, or contract call values without conversion and verification.
