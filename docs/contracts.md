# Contracts

Machine-readable contract data lives in `data/contracts.json`.

## Current Status

Partially verified.

The original `MoonCatRescue` Solidity source has been verified and linked, but this repository still does not define deployed contract addresses, networks, ABIs, deployment dates, or related wrapper/accessory contract scope.

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

## Not yet verified here

- deployed contract address
- deployment network metadata
- ABI artifact source
- block explorer URL
- wrapper, accessory, or related contract scope

## Rules

- Prefer primary sources for addresses and networks.
- Keep contract role notes separate from exact address data.
- Do not add wrapper, accessory, or related contracts until their scope is defined.
