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

Local bucket checks and preferred API samples support treating this numeric convention as aligned with local `rescue-order-index` values.

### Local Rescue-Order Index

`data/character-cat-index.json` and `data/rescue-buckets.json` use `indexKind: "rescue-order-index"`.

These values are local membership/index values. They have been verified as aligned with the API `rescueOrder` / original rescue index convention by local bucket checks and preferred API samples.

They are still not bytes5 cat IDs, ERC-721 token IDs, OpenSea IDs, or contract call values.

### ERC-721 or Wrapped Token ID

For the current Acclimated MoonCats ERC-721 contract, token-facing IDs are verified as the MoonCat rescue order.

Evidence:

- the Acclimated contract source says `wrap(_rescueOrder)` returns the ID/rescue order of the minted token
- `_wrap(address _owner, uint256 _tokenId)` mints `_tokenId`, where `_tokenId` is documented as the rescue order
- sampled ERC721 metadata for `0`, `82`, and `25439` uses the requested number in the name, external URL, image URL, and `Rescue Index` attribute

This does not verify older wrapper token IDs or any unrelated ERC-721 surface.

### OpenSea Token ID

Sampled OpenSea item URLs for the acclimated MoonCats collection use the acclimated contract address and the same numeric token ID, for example `/item/ethereum/0xc3f733ca98e0dad0386979eb96fb1722a1a05e69/0`.

Treat this as sampled evidence for the acclimated collection only. Do not assume the same rule for other marketplaces, old wrapper contracts, or unrelated collection URLs without checking.

### Contract Addresses

The original MoonCatRescue contract address is verified as `0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6`.

The current Acclimated MoonCats ERC-721 contract address is verified as `0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69` from registered marketplace/project links and the registered Etherscan source entry in `data/sources.json`.

### Ethereum Address

API owner/profile endpoints use Ethereum addresses. Address normalization behavior is not documented here.

### Accessory ID

API accessory endpoints use `accessoryId` parameters. The accessory ID format, range, and contract relationship still need verification.

## Conversion Rules

No identifier conversion is currently claimed unless it is already documented by an inspected source or by a recorded verification pass.

`apiOriginalRescueIndex` and `localRescueOrderIndex` are now recorded as aligned for the checked numeric convention. Evidence includes local contiguous bucket boundaries, exact source-to-import bucket matches, and preferred API samples where `rescueOrder` equals the requested numeric index.

Any tool that uses local rescue-order arrays outside their local context needs a verified conversion step first.

The API/local rescue-index alignment by itself does not define conversion to bytes5 cat IDs, wrapper IDs, marketplace IDs, or contract call values.

For the current Acclimated MoonCats ERC-721 contract, ERC-721 token IDs are rescue-order indexes. That verified token-facing convention still does not define a conversion to bytes5 cat IDs.

## Related Files

- `data/identifier-conventions.json` records machine-readable terminology and conversion status.
- `data/api-endpoints.json` records API parameters and endpoint usage.
- `data/character-cat-index.json` stores community-curated membership arrays using `rescue-order-index`.
- `data/rescue-buckets.json` stores canonical-derived rescue/history bucket arrays using `rescue-order-index`.
- `data/protocol-constants.json` records contract-derived bytes5 cat ID generation notes.

## Still Needed

- exact derivation method for local rescue-order-index arrays
- source-backed conversion between rescue-order indexes and bytes5 cat IDs
- older wrapper token ID convention
- broader marketplace token ID behavior beyond sampled acclimated URLs
- accessory ID format and validation rules
