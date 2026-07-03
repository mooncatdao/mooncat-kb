# Identifier Conventions

Machine-readable terminology lives in `data/identifier-conventions.json`.

## Current Status

Incomplete.

This page distinguishes known MoonCat identifier spaces so future imports do not mix API rescue indexes, local rescue-order indexes, bytes5 cat IDs, token-facing IDs, OpenSea IDs, owner addresses, or accessory IDs.

## Identifier Kinds

### bytes5 MoonCat ID

The original contract source uses `bytes5` cat IDs. The API landing pages also document a valid MoonCat ID example, `0x00d8523a53`, for `catId_or_rescueIndex`.

This repository does not yet define a complete parser-derived mapping from bytes5 cat IDs to rescue indexes, rescue-order indexes, token-facing IDs, or marketplace IDs.

### API Original Rescue Index

The API landing pages document `catId_or_rescueIndex` as accepting an original rescue index where `0 <= rescueIndex <= 25439`.

Treat this as an API input convention. Do not assume it is equivalent to local `rescue-order-index` values until that mapping is explicitly verified.

### Local Rescue-Order Index

`data/character-cat-index.json` and `data/rescue-buckets.json` use `indexKind: "rescue-order-index"`.

These values are local membership/index values. They are not automatically API rescue indexes, bytes5 cat IDs, ERC-721 token IDs, OpenSea IDs, or contract call values.

### ERC-721 or Wrapped Token ID

Token-facing IDs are not verified in this repository yet.

Do not fill token-facing IDs from local index arrays unless a primary source or documented conversion method supports the mapping.

### OpenSea Token ID

OpenSea token ID conventions are not verified in this repository yet.

Do not assume OpenSea IDs match rescue-order indexes, API rescue indexes, bytes5 cat IDs, or wrapped token IDs.

### Ethereum Address

API owner/profile endpoints use Ethereum addresses. Address normalization behavior is not documented here.

### Accessory ID

API accessory endpoints use `accessoryId` parameters. The accessory ID format, range, and contract relationship still need verification.

## Conversion Rules

No identifier conversion is currently claimed unless it is already documented by an inspected source.

In particular, `apiOriginalRescueIndex` and `localRescueOrderIndex` must not be assumed equivalent. They may prove to align, but this repository still needs a source-backed method note or mapping.

Any tool that uses local rescue-order arrays outside their local context needs a verified conversion step first.

## Related Files

- `data/identifier-conventions.json` records machine-readable terminology and conversion status.
- `data/api-endpoints.json` records API parameters and endpoint usage.
- `data/character-cat-index.json` stores community-curated membership arrays using `rescue-order-index`.
- `data/rescue-buckets.json` stores canonical-derived rescue/history bucket arrays using `rescue-order-index`.
- `data/protocol-constants.json` records contract-derived bytes5 cat ID generation notes.

## Still Needed

- exact derivation method for local rescue-order-index arrays
- verification of whether API original rescue indexes and local rescue-order indexes align
- source-backed conversion between rescue-order indexes and bytes5 cat IDs
- token-facing ERC-721 or wrapped token ID convention
- OpenSea token ID convention
- accessory ID format and validation rules
