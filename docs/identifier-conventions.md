# Identifier Conventions

Machine-readable terminology lives in `data/identifier-conventions.json`.

## Current Status

Partially verified.

This page distinguishes known MoonCat identifier spaces so future imports do not mix API rescue indexes, local rescue-order indexes, bytes5 cat IDs, token-facing IDs, OpenSea IDs, owner addresses, or accessory IDs.

## Identifier Kinds

### bytes5 MoonCat ID

The original contract source uses `bytes5` cat IDs. The API landing pages also document a valid MoonCat ID example, `0x00d8523a53`, for `catId_or_rescueIndex`.

This repository now records a verified array-backed lookup method between bytes5 cat IDs and rescue-order based identifiers. The registered upstream reference dataset `references/upstream/mooncatrescue/mooncat_traits.json` contains 25,440 rows ordered by `rescueOrder`, with a `catId` field per row. The registered `libmooncat-limited.js` reference exposes lookup helpers including `getMoonCatIdByRescueIndex`, `getCatId`, `getRescueOrder`, and `parseCatId`.

The preferred API still provides independent lookup evidence: it accepts either a bytes5 cat ID or decimal rescue index for `/mooncat/traits/:catId_or_rescueIndex` and returns both `catId` and `rescueOrder` in sampled responses.

This is array-backed library/dataset conversion, not a closed-form reverse formula. The KB registers the upstream reference files but does not import the full 25,440-entry mapping table into curated `data/` files.

### API Original Rescue Index

The API landing pages document `catId_or_rescueIndex` as accepting an original rescue index where `0 <= rescueIndex <= 25439`.

Local bucket checks and preferred API samples support treating this numeric convention as aligned with local `rescue-order-index` values. Preferred API samples, MoonCatTraits contract surface, `libmooncat-limited.js`, and `mooncat_traits.json` also verify array-backed lookup from this numeric convention to bytes5 cat IDs.

### Local Rescue-Order Index

`data/character-cat-index.json` and `data/rescue-buckets.json` use `indexKind: "rescue-order-index"`.

These values are local membership/index values. They have been verified as aligned with the API `rescueOrder` / original rescue index convention by local bucket checks and preferred API samples.

They are still not themselves bytes5 cat IDs. Use the verified array-backed lookup method before using a local rescue-order index as a cat ID. They are token IDs only for the current Acclimated MoonCats contract, not generic OpenSea IDs or generic contract-call values.

### ERC-721 or Wrapped Token ID

For the current Acclimated MoonCats ERC-721 contract, token-facing IDs are verified as the MoonCat rescue order.

Evidence:

- the Acclimated contract source says `wrap(_rescueOrder)` returns the ID/rescue order of the minted token
- `_wrap(address _owner, uint256 _tokenId)` mints `_tokenId`, where `_tokenId` is documented as the rescue order
- sampled ERC721 metadata for `0`, `82`, and `25439` uses the requested number in the name, external URL, image URL, and `Rescue Index` attribute

This does not verify older wrapper token IDs or any unrelated ERC-721 surface.

### Historical MoonCatsWrapped WMCR Token ID

The exact historical `MoonCatsWrapped` contract at `0x7C40c393DC0f283F318791d746d894DdD3693572` is now source-reviewed. Its verified source names the ERC-721 collection `Wrapped MoonCatsRescue` (`WMCR`) and accepts a bytes5 `catId` in `wrap(bytes5)`.

The wrapper allocates a separate `uint256` token ID from a contract-local counter starting at zero, then stores explicit `_catIDToTokenID` and `_tokenIDToCatID` mappings. `unwrap(tokenID)` uses the reverse mapping to return the bytes5 cat through the original MoonCatRescue contract. The source contains no `rescueOrder` field or conversion.

Therefore, WMCR token IDs are mapping-backed wrapper identifiers, not bytes5 encodings and not source-confirmed rescue-order values. Resolve a WMCR token ID through the exact contract mapping or its source-defined wrap/unwrap event context. If an API original rescue index is needed afterward, use the separately documented bytes5 lookup. Do not apply the current Acclimated tokenId-equals-rescue-order rule to WMCR.

### OpenSea Token ID

Sampled OpenSea item URLs for the acclimated MoonCats collection use the acclimated contract address and the same numeric token ID, for example `/item/ethereum/0xc3f733ca98e0dad0386979eb96fb1722a1a05e69/0`.

Treat this as sampled evidence for the acclimated collection only. Do not assume the same rule for other marketplaces, old wrapper contracts, or unrelated collection URLs without checking.

### Contract Addresses

The original MoonCatRescue contract address is verified as `0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6`.

The current Acclimated MoonCats ERC-721 contract address is verified as `0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69` from registered marketplace/project links and the registered Etherscan source entry in `data/sources.json`.

### Ethereum Address

API owner/profile endpoints use Ethereum addresses. Address normalization behavior is not documented here.

### Accessory ID

API accessory endpoints use `accessoryId` parameters. For the exact reviewed MoonCatAccessories contract at `0x8d33303023723dE93b213da4EB53bE890e747C63`, an accessory ID is the zero-based `uint256` index assigned when a definition is appended to `AllAccessories`; owned and batch structs pack it as `uint232`.

An accessory ID identifies a definition. It is not a rescue order, bytes5 cat ID, Acclimated token ID, WMCR token ID, local owned-accessory index, manager enumeration index, palette index, or z-index. The current valid range depends on current `totalAccessories` state and is not imported here. Exact lifecycle boundaries are documented in `docs/mooncat-accessories.md`.

### Accessory Record Indexes and Settings

`ownedAccessoryIndex` is local to one rescue order's `OwnedAccessory[]` and selects an existing record for enumeration or alteration. `managedAccessoryIndex` is local to one manager address's set and resolves to an accessory ID. Neither is globally interchangeable with accessory ID.

`paletteIndex` selects a slot within one accessory definition. `zIndex` is a wear/drawing-order setting, with zero meaning owned but not worn; it is not an identifier.

## Conversion Rules

No identifier conversion is currently claimed unless it is already documented by an inspected source or by a recorded verification pass.

`apiOriginalRescueIndex` and `localRescueOrderIndex` are now recorded as aligned for the checked numeric convention. Evidence includes local contiguous bucket boundaries, exact source-to-import bucket matches, and preferred API samples where `rescueOrder` equals the requested numeric index.

Any tool that uses local rescue-order arrays outside their local context needs a verified conversion step first.

The verified bytes5 lookup evidence is:

- `mooncat_traits.json` validates as JSON with 25,440 rows ordered by `rescueOrder`, checked with unique `catId` values
- `mooncat_traits.json` samples for rescue orders `0`, `82`, `84`, and `25439` match the existing API samples
- `libmooncat-limited.js` exports `getMoonCatIdByRescueIndex`, `getCatId`, `getRescueOrder`, `parseCatId`, and typed `getTraits` helpers
- `LibMoonCat.getMoonCatIdByRescueIndex` / `getCatId` samples map `0`, `82`, `84`, and `25439` to `0x00d658d50b`, `0x0057774705`, `0xff00000ca7`, and `0x0076fe2589`
- `LibMoonCat.getRescueOrder` samples map those `0x`-prefixed cat IDs back to `0`, `82`, `84`, and `25439`
- preferred API OpenAPI defines `MoonCatIdentifier` as either a five-byte hex string or decimal index value
- preferred API numeric samples `0`, `82`, `84`, and `25439` returned bytes5 `catId` values with matching `rescueOrder`
- preferred API bytes5 samples `0x00d658d50b`, `0x0057774705`, and `0x0076fe2589` returned matching `rescueOrder` values
- the original MoonCatRescue source declares a public `bytes5[25600] rescueOrder` array and writes cat IDs into that array as cats are rescued or genesis cats are added
- MoonCatTraits `catIdOf(uint256 rescueOrder)` returns `MCR.rescueOrder(rescueOrder)`
- MoonCatSVGs rescue-order overloads call `MoonCatRescue.rescueOrder(rescueOrder)` before using the bytes5 cat ID

For current Acclimated MoonCats ERC-721 token IDs, first use the verified current-contract rule that token ID equals rescue order, then use the rescue-order-to-catId lookup method. Do not apply that token-facing conversion to older wrappers or unrelated collections.

The reverse bytes5-to-rescueOrder path is verified through array-backed dataset/library lookup and preferred API samples. No on-chain reverse lookup or closed-form reverse formula is documented here. Checked `LibMoonCat.getRescueOrder` calls used `0x`-prefixed cat IDs; normalize input with `parseCatId` before relying on non-prefixed input behavior.

## Related Files

- `data/identifier-conventions.json` records machine-readable terminology and conversion status.
- `data/identifier-conversion-cases.json` and `docs/identifier-verification.md` define the executable representative conversion fixtures and their explicit type/reversibility boundaries.
- `scripts/validate-identifier-conversions.py` runs the zero-network LibMoonCat/trait cross-check and negative-case suite.
- `data/api-endpoints.json` records API parameters and endpoint usage.
- `data/character-cat-index.json` stores community-curated membership arrays using `rescue-order-index`.
- `data/rescue-buckets.json` stores canonical-derived rescue/history bucket arrays using `rescue-order-index`.
- `data/protocol-constants.json` records contract-derived bytes5 cat ID generation notes.
- `data/mooncat-accessories-internals.json` records exact accessory definition, ownership, enumeration, and wear-setting identifier boundaries.
- `references/upstream/mooncatrescue/README.md` describes local upstream reference files and usage limits.
- `references/upstream/mooncatrescue/libmooncat-limited.js` is a registered upstream reference copy for array-backed lookup helpers.
- `references/upstream/mooncatrescue/mooncat_traits.json` is a registered upstream reference copy for the full rescueOrder/catId dataset.

## Still Needed

- exact derivation method for local rescue-order-index arrays
- exact inventory and source review for any additional historical or unofficial wrapper contracts
- broader marketplace token ID behavior beyond sampled acclimated URLs
- live API-to-contract accessory ID runtime alignment and current valid accessory ID range
- generated-data method if the full bytes5 catId mapping table is ever promoted from upstream reference copy into curated KB data

The executable verification suite intentionally does not close these gaps: it confirms only the registered array-backed, exact-contract, and explicitly unsupported paths.
