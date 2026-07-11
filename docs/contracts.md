# Contracts

Machine-readable contract data lives in `data/contracts.json`.

## Current Status

Partially verified.

The original `MoonCatRescue` Solidity source and Ethereum mainnet address are verified.

The current Acclimated MoonCats ERC-721/ERC-998 wrapper address is also verified from registered marketplace/project links and the registered Etherscan source entry in `data/sources.json`.

The historical `MoonCatsWrapped` / `Wrapped MoonCatsRescue` (`WMCR`) wrapper address and verified source are now registered separately. Its token IDs are counter-allocated and mapping-backed; that source does not use rescue order.

The MoonCatRescue log page `Chained to the Future` is registered as official context for on-chain materialization work. It links to MoonCatReference, MoonCatTraits, MoonCatColors, MoonCatSVGs, and MoonCatAccessoryImages contract pages. Those five linked contract pages have now been verified on Etherscan for address and source identity, and are represented in `data/contracts.json`.

The five materialization contract records now include conservative role/function summaries. MoonCatColors, MoonCatSVGs, and MoonCatAccessoryImages also have compact internals reviews in data files. These summaries and compact reviews do **not** import trait mappings, color palettes, SVG coordinate data, accessory image bytes, accessory ID taxonomy, ABI blobs, or identifier conversion rules.

The contract records also include `artifactUrls` metadata for checked source/ABI reference pages. These URLs point to Etherscan source-and-ABI pages, and for the original MoonCatRescue contract also to the registered raw GitHub Solidity source. The KB treats those URLs as references only; ABI JSON, Solidity source text, bytecode, constructor arguments, storage values, CIDs, and other artifact blobs are intentionally not imported.

Imported source-derived protocol constants live in `data/protocol-constants.json`.

## Verified from source

The original contract source verifies:

- contract name: `MoonCatRescue`
- Solidity pragma: `^0.4.13`
- total supply constant: `25600`
- initial normal rescue supply: `25600 - 256`
- Genesis supply cap: `256`
- `imageGenerationCodeMD5` for verifying `mooncatparser.js`
- Genesis cat construction formula used by `addGenesisCatGroup()`

## Verified Addresses

- Original MoonCatRescue: `0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6`
- Acclimated MoonCats: `0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69`
- MoonCatReference: `0x0B78C64bCE6d6d4447e58b09E53F3621f44A2a48`
- MoonCatTraits: `0x9330BbfBa0C8FdAf0D93717E4405a410a6103cC2`
- MoonCatColors: `0x2fd7E0c38243eA15700F45cfc38A7a7f66df1deC`
- MoonCatSVGs: `0xB39C61fe6281324A23e079464f7E697F8Ba6968f`
- MoonCatAccessoryImages: `0x91CF36c92fEb5c11D3F5fe3e8b9e212f7472Ec14`
- MoonCatsWrapped: `0x7C40c393DC0f283F318791d746d894DdD3693572`

The Acclimated contract source identifies itself as `MoonCatAcclimator`, describes wrapping original MoonCats into an ERC-721/ERC-998-compliant asset, references the original MoonCatRescue contract, and mints token IDs using rescue order.

The original MoonCatRescue source exposes a public `rescueOrder` array that maps rescue-order indexes to bytes5 cat IDs. MoonCatTraits `catIdOf(uint256)` and MoonCatSVGs rescue-order overloads use that original-contract lookup. This verifies a rescue-order-to-catId lookup method, not a reverse on-chain lookup or full imported mapping table.

## Verified Materialization Function Surfaces

- MoonCatReference: on-chain documentation/reference registry with `doc`, indexed contract lookup, documentation write/update, ownership, and asset-recovery functions.
- MoonCatTraits: on-chain trait reference surface with compact and human-readable trait lookups, rescue-year/name/owner/catId lookup helpers, ERC-721 proxy ownership administration, documentation lookup, and owner administration.
- MoonCatColors: on-chain color reference surface with RGB/hue helpers, palette/color/glow/accessory-color lookup functions, owner-managed color mapping/finalization, documentation lookup, and owner administration.
- MoonCatSVGs: on-chain SVG image-generation surface with pixel/shape/SVG assembly helpers and `imageOf` overloads for cat IDs or rescue orders, plus documentation lookup and owner administration. Compact internals are documented in `docs/mooncat-svgs.md` and `data/mooncat-svg-internals.json`.
- MoonCatAccessoryImages: on-chain accessory image composition/PNG helper surface with accessorized SVG overloads, accessory PNG/placement/preparation helpers, PNG chunk helpers/constants, documentation lookup, and owner administration. Compact internals are documented in `docs/mooncat-accessory-images.md` and `data/mooncat-accessory-images-internals.json`.
- MoonCatsWrapped: historical unofficial ERC-721 wrapper surface with `wrap(bytes5)`, `unwrap(uint256)`, and public cat-ID/token-ID mappings. Compact identifier behavior is documented in `docs/older-wrapper-contracts.md` and `data/older-wrapper-internals.json`.

These are role/function-level summaries only. Detailed derivation logic and output data remain out of scope until specifically reviewed.

## MoonCatSVGs Compact Internals

The MoonCatSVGs source review confirms that `imageOf(bytes5,bool)` reads trait fields from MoonCatTraits, reads `uint8[24]` color data from MoonCatColors, builds base pixel data, optionally applies glow from the first color triple, computes a bounding box, and returns an SVG string. Rescue-order overloads require `rescueOrder < 25440` and convert through the original MoonCatRescue `rescueOrder` lookup. The no-explicit-glow bytes5 overload derives glow by comparing original `catOwners(catId)` with the stored Acclimated contract address.

The MoonCatSVGs review imports no SVG coordinate constants, pattern arrays, generated SVGs, per-cat images, or accessory composition details. Accessory image behavior is documented separately in `docs/mooncat-accessory-images.md` and remains outside the MoonCatSVGs review scope.

## MoonCatAccessoryImages Compact Internals

The MoonCatAccessoryImages source review confirms that its public image entrypoints accept a numeric rescue order, use the original MoonCatRescue lookup to obtain a bytes5 cat ID in the guarded composition path, then combine MoonCatTraits/MoonCatColors/MoonCatSVGs base MoonCat data with accessory data read through a separate MoonCatAccessories interface. The source prepares source-owned accessories into background and foreground records, emits inline base64 PNG image snippets around base MoonCat pixels, and expands the SVG bounding box to cover prepared placement.

`accessoryPNG` returns a `data:image/png;base64` string assembled from PNG chunks, source accessory image data, and MoonCatColors palette/alpha helpers. The separate MoonCatAccessories implementation, accessory taxonomy, palette values, accessory state, PNG bytes, and rendered results are not included. See `docs/mooncat-accessory-images.md` for the compact source-confirmed flow and identifier boundaries.

## MoonCatsWrapped Identifier Internals

The verified `MoonCatsWrapped` source accepts a bytes5 `catId` in `wrap`, then assigns a separate ERC-721 token ID from a contract-local counter and stores `_catIDToTokenID` and `_tokenIDToCatID` mappings. `unwrap` uses the reverse mapping to return the cat through the original MoonCatRescue contract. The source contains no `rescueOrder` field or conversion, so WMCR token IDs are not source-confirmed rescue-order values and are not interchangeable with current Acclimated token IDs. See `docs/older-wrapper-contracts.md` and `data/older-wrapper-internals.json`.

## Not yet verified here

- direct Etherscan API artifact endpoint policy beyond source-and-ABI page links
- separate MoonCatAccessories contract implementation, taxonomy, state, and lifecycle
- detailed on-chain materialization internals beyond the compact MoonCatColors, MoonCatSVGs, and MoonCatAccessoryImages reviews
- trait derivation tables or bit-level mappings
- color palettes, hue-name tables, SVG coordinate data, accessory image bytes, and accessory ID taxonomy
- complete inventory and source review of additional historical or unofficial wrapper contracts

## Rules

- Prefer primary sources for addresses and networks.
- Keep contract role notes separate from exact address data.
- Do not add further accessory or related contracts until their scope is defined.
