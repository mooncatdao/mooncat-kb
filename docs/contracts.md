# Contracts

Machine-readable contract data lives in `data/contracts.json`.

## Current Status

Partially verified.

The original `MoonCatRescue` Solidity source and Ethereum mainnet address are verified.

The current Acclimated MoonCats ERC-721/ERC-998 wrapper address is also verified from registered marketplace/project links and the registered Etherscan source entry in `data/sources.json`.

The MoonCatRescue log page `Chained to the Future` is registered as official context for on-chain materialization work. It links to MoonCatReference, MoonCatTraits, MoonCatColors, MoonCatSVGs, and MoonCatAccessoryImages contract pages. Those five linked contract pages have now been verified on Etherscan for address and source identity, and are represented in `data/contracts.json`.

This pass does **not** import or summarize the internals of those materialization contracts. Trait derivation, color data, SVG output behavior, accessory image data, accessory ID behavior, and ABI/source artifact details still need focused follow-up passes.

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

## Not yet verified here

- ABI artifact source
- block explorer URL
- accessory contract scope beyond MoonCatAccessoryImages address/source identity
- on-chain materialization contract internals and exact role/function summaries
- older wrapper token ID convention

## Rules

- Prefer primary sources for addresses and networks.
- Keep contract role notes separate from exact address data.
- Do not add further accessory or related contracts until their scope is defined.
