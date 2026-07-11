# Older Wrapper Contracts

Machine-readable summary: `data/older-wrapper-internals.json`.

## Current Status

One exact historical wrapper is now source-reviewed: `MoonCatsWrapped`, the `Wrapped MoonCatsRescue` (`WMCR`) ERC-721 contract at `0x7C40c393DC0f283F318791d746d894DdD3693572` on Ethereum mainnet. Etherscan reports the verified source as an exact match, compiled with Solidity `v0.7.6+commit.7338295f`; optimization is disabled and Etherscan reports a 1000-runs setting. No license is declared on the page.

This is a contract-scoped review, not a complete inventory of all historical MoonCat wrappers.

## MoonCatsWrapped / WMCR

The verified source defines `MoonCatsWrapped` as an ERC-721 contract named `Wrapped MoonCatsRescue` with symbol `WMCR`. It references the original `MoonCatRescue` contract at `0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6` and exposes `wrap(bytes5 catId)` and `unwrap(uint256 tokenID)`.

## Token Identifier Behavior

`wrap` accepts a bytes5 MoonCat ID directly. It reads the adoption offer for that cat, requires the offer seller to be the caller, accepts the offer, and then assigns an ERC-721 token ID.

The token ID is allocated from a private counter whose default first value is zero. The source stores both directions explicitly:

- `_catIDToTokenID(bytes5)` maps a bytes5 cat ID to a wrapper `uint256 tokenID`.
- `_tokenIDToCatID(uint256)` maps a wrapper token ID back to a bytes5 cat ID.

This is a mapping-backed wrapper identifier, not a bytes5 encoding. The source contains no `rescueOrder` field, function, or conversion. It therefore does not establish that WMCR token IDs equal rescue order, API original rescue indexes, local rescue-order indexes, current Acclimated ERC-721 token IDs, or marketplace URL IDs.

`unwrap(tokenID)` uses the reverse mapping, checks the ERC-721 owner, returns the mapped cat through `MoonCatsRescue.giveCat`, burns the wrapper token, and emits the source-defined event. The source uses zero as the “unassigned” mapping sentinel even though the counter begins at token ID zero, so re-wrap behavior around token ID zero is left as a source-level lifecycle caveat rather than generalized behavior.

## Comparison With Acclimated

The current Acclimated MoonCats contract is a separate wrapper. Its reviewed source documents token ID as rescue order. That rule is scoped to the Acclimated contract and does not apply to WMCR.

To relate a WMCR token ID to a bytes5 cat ID, use the exact WMCR mapping getter or source-defined wrap/unwrap event context. If a rescue-order/API index is then needed, perform the separately documented bytes5-to-rescue-order lookup. There is no direct WMCR tokenID-to-rescueOrder conversion documented here.

## Identifier Boundaries

- bytes5 cat ID: direct input to WMCR `wrap` and the mapping's cat-side key.
- WMCR token ID: sequential/mapping-backed ERC-721 identifier for this exact contract.
- rescue order/API original rescue index: not used by the reviewed WMCR source.
- current Acclimated ERC-721 token ID: a separate contract-scoped identifier documented as rescue order.
- OpenSea URL ID: marketplace-facing value that must be scoped to the collection contract; no WMCR conversion is asserted here.
- local rescue-order index: not a WMCR token ID without an independently verified mapping path.

## Limitations

- Other historical or unofficial wrapper contracts are not inventoried here.
- No full source, ABI, storage, event history, current ownership, supply, activity, or per-token mapping is imported.
- No marketplace or current-chain-state claim is made.
