# Contracts

Machine-readable contract data lives in `data/contracts.json`.

## Current Status

Partially verified.

The original `MoonCatRescue` Solidity source and Ethereum mainnet address are verified.

The current Acclimated MoonCats ERC-721/ERC-998 wrapper address is also verified from registered marketplace/project links and the registered Etherscan source entry in `data/sources.json`.

The MoonCatRescue log page `Chained to the Future` is registered as official context for on-chain materialization work. It links to MoonCatReference, MoonCatTraits, MoonCatColors, MoonCatSVGs, and MoonCatAccessoryImages contract pages, but those linked contract details still need a focused import/review pass before they are added to `data/contracts.json`.

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

The Acclimated contract source identifies itself as `MoonCatAcclimator`, describes wrapping original MoonCats into an ERC-721/ERC-998-compliant asset, references the original MoonCatRescue contract, and mints token IDs using rescue order.

## Not yet verified here

- ABI artifact source
- block explorer URL
- accessory or other related contract scope
- on-chain materialization contract roles and exact imported address/source records
- older wrapper token ID convention

## Rules

- Prefer primary sources for addresses and networks.
- Keep contract role notes separate from exact address data.
- Do not add accessory or related contracts until their scope is defined.
