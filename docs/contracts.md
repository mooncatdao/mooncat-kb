# Contracts

Machine-readable contract data lives in `data/contracts.json`.

## Current Status

Partially verified.

The original `MoonCatRescue` Solidity source and Ethereum mainnet address are verified.

The current Acclimated MoonCats ERC-721/ERC-998 wrapper address is also verified from registered marketplace/project links and the registered Etherscan source entry in `data/sources.json`.

The MoonCatRescue log page `Chained to the Future` is registered as official context for on-chain materialization work. It links to MoonCatReference, MoonCatTraits, MoonCatColors, MoonCatSVGs, and MoonCatAccessoryImages contract pages. Those five linked contract pages have now been verified on Etherscan for address and source identity, and are represented in `data/contracts.json`.

The five materialization contract records now include conservative role/function summaries. These summaries describe the verified public function surface only. They do **not** import trait mappings, color palettes, SVG coordinate data, accessory image bytes, accessory ID taxonomy, ABI blobs, or identifier conversion rules.

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

The Acclimated contract source identifies itself as `MoonCatAcclimator`, describes wrapping original MoonCats into an ERC-721/ERC-998-compliant asset, references the original MoonCatRescue contract, and mints token IDs using rescue order.

## Verified Materialization Function Surfaces

- MoonCatReference: on-chain documentation/reference registry with `doc`, indexed contract lookup, documentation write/update, ownership, and asset-recovery functions.
- MoonCatTraits: on-chain trait reference surface with compact and human-readable trait lookups, rescue-year/name/owner/catId lookup helpers, ERC-721 proxy ownership administration, documentation lookup, and owner administration.
- MoonCatColors: on-chain color reference surface with RGB/hue helpers, palette/color/glow/accessory-color lookup functions, owner-managed color mapping/finalization, documentation lookup, and owner administration.
- MoonCatSVGs: on-chain SVG image-generation surface with pixel/shape/SVG assembly helpers and `imageOf` overloads for cat IDs or rescue orders, plus documentation lookup and owner administration.
- MoonCatAccessoryImages: on-chain accessory image composition/PNG helper surface with accessorized image overloads, accessory PNG/placement/preparation helpers, PNG chunk helpers/constants, documentation lookup, and owner administration.

These are role/function-level summaries only. Detailed derivation logic and output data remain out of scope until specifically reviewed.

## Not yet verified here

- direct Etherscan API artifact endpoint policy beyond source-and-ABI page links
- accessory contract scope beyond MoonCatAccessoryImages address/source identity
- detailed on-chain materialization internals beyond role/function summaries
- trait derivation tables or bit-level mappings
- color palettes, hue-name tables, SVG coordinate data, accessory image bytes, and accessory ID taxonomy
- older wrapper token ID convention

## Rules

- Prefer primary sources for addresses and networks.
- Keep contract role notes separate from exact address data.
- Do not add further accessory or related contracts until their scope is defined.
