# MoonCatAccessories

Machine-readable summary: `data/mooncat-accessories-internals.json`.

## Current Status

Compact source review complete for the exact Ethereum mainnet `MoonCatAccessories` contract at `0x8d33303023723dE93b213da4EB53bE890e747C63`.

Etherscan reports an exact-match verified source compiled with Solidity `v0.8.1+commit.df193b15`, optimization enabled with 200 runs, and GNU AGPLv3. The deployment transaction is `0x21b831be284a48d6f2d72b84e94cfdd8123ec4b28779b098e8bc8caa7f02755a`, mined on 2021-07-02 at 03:33:42 UTC by the address Etherscan labels `Official MoonCats - Acclimated: Deployer`. The checked-in LibMoonCat bundle independently contains the same address and an aligned ABI surface.

This review records source behavior, not current chain state. It does not import accessory definitions, taxonomy, names, palettes, PNG data, ownership lists, event history, prices, supply, or approval state.

## Storage and Roles

Accessory definitions are appended to an internal `AllAccessories` array. An `accessoryId` is the definition's zero-based array index. A definition stores a manager address, width, height, metadata flags, price, total and available supply, a fixed name, seven palette slots, four pose positions, and PNG IDAT bytes.

Three kinds of ownership or control remain separate:

- Definition management belongs to a wallet address. The manager controls price, added palettes, eligibility, management transfer, manager assignment, and discontinuation, and receives sales proceeds after fees.
- Accessory ownership belongs to a MoonCat rescue-order identity. The stored record contains no wallet address and is not an ERC-721 token.
- Permission to buy, assign, or alter a cat-owned record follows the current Acclimated ERC-721 owner, token approval, or operator approval for that rescue-order token ID, after confirming the original cat is held by the Acclimator.

The two `balanceOf` overloads therefore mean different things: `balanceOf(address)` counts definitions managed by an address, while `balanceOf(uint256 rescueOrder)` counts records owned by a MoonCat.

## OwnedAccessory

Each cat-owned record has only:

- `accessoryId: uint232`: index into the definition array
- `paletteIndex: uint8`: index into that definition's palette slots
- `zIndex: uint16`: wear and drawing-order setting

`zIndex == 0` means the accessory remains owned but is not worn. A local `ownedAccessoryIndex` selects a record within one rescue order's array; it is not the same as `accessoryId`. Likewise, a manager enumeration index is local to that manager's set.

## Source-Confirmed Lifecycle

1. Public creation validates dimensions, palette count/content, supply, price, and IDAT uniqueness; masks the metadata byte to its low five bits; appends the definition; and assigns management to the creator. An optional overload activates a rescue-order eligibility list.
2. The contract owner has an exceptional creation path that can run while frozen, accept an unmasked metadata byte, and deliberately bypass duplicate rejection. Managers can later change price, add palettes, manage eligibility, or transfer management.
3. Standard purchase requires the caller to own or be approved for the Acclimated token, pass any active eligibility list, choose a stored palette, pay the price, and use remaining supply. It decrements supply, appends one `OwnedAccessory` under the rescue order, and rejects a second copy of the same `accessoryId` for that cat.
4. The token owner or approved operator can alter only the record's palette and z-index. Batch functions repeat purchase or alteration semantics.
5. A manager can discontinue a definition: price becomes not-for-sale, management moves to the zero address, total supply is reduced to issued quantity, and available supply becomes zero. Existing owned records remain.
6. Wallet transfer of the Acclimated token does not move accessory records because they are already keyed by rescue order. Later mutation authorization follows the new token owner or approvals. The source has no explicit accessory cleanup/migration path for deacclimation.

There is no source function to transfer a cat-owned accessory to another rescue order, remove its array record, clear its membership, or burn it. Setting z-index to zero is not removal.

## Eligibility, Verification, and Approvals

Purchase eligibility is an optional per-definition rescue-order bit set managed by the definition manager. An inactive list allows all rescue orders; an active list checks the requested rescue-order bit. Manager assignment bypasses eligibility but still consumes supply and requires authorization for the target cat.

Rendering verification is separate. Public accessory creation clears the top three metadata bits. The contract owner can mutate metadata, and the reviewed MoonCatAccessoryImages source treats metadata bit 7 as approval: unless `allowUnverified` is true, it suppresses an accessory by multiplying its z-index by `meta >> 7`. Default image overloads disallow unverified accessories.

This approval bit does not control purchase or ownership in MoonCatAccessories. It is also unrelated to Acclimated ERC-721 approvals, which authorize a wallet to act for a MoonCat token.

## accessoryImageData and Image Integration

`accessoryImageData(accessoryId)` returns stored positions, seven palette slots, width, height, metadata, and IDAT bytes. It does not return ownership, supply, manager, price, eligibility, or wear state.

MoonCatAccessoryImages consumes MoonCatAccessories as follows:

1. `balanceOf(rescueOrder)` and `ownedAccessoryByIndex` enumerate stored records.
2. `doesMoonCatOwnAccessory` confirms rescue-order/accessory membership.
3. `accessoryImageData` supplies definition data for placement and PNG reconstruction.
4. MoonCatAccessoryImages applies z-index wear state, verification filtering, placement, foreground/background sorting, and rendering.

Rendering details remain in `docs/mooncat-accessory-images.md`; this page owns definition, assignment, and lifecycle semantics.

## Administration and Mutability

The contract owner can reversibly freeze/unfreeze public creation and new assignments, set fee denominators, transfer contract ownership, mutate metadata flags, use exceptional creation, and rescue foreign ERC-20/ERC-721 assets. There is no irreversible global finalization or renunciation function.

Managers can change the mutable definition fields listed above but cannot edit stored names, dimensions, positions, IDAT, or already-filled palette slots through the reviewed source. `discontinueAccessory` is the per-definition terminal sale/management action; global `freeze` is reversible.

## Identifier Boundaries

- `rescueOrder`: cat-owned record key and exact Acclimated token ID context used by this source
- bytes5 `catId`: obtained only through the original MoonCatRescue lookup during authorization
- `accessoryId`: definition-array index, unrelated to MoonCat IDs or wrapper token IDs
- `ownedAccessoryIndex`: local index in one cat's records
- `managedAccessoryIndex`: local index in one manager's set
- `paletteIndex`: local slot in one definition's palettes
- `zIndex`: wear/drawing-order value, not an identifier
- wallet address: owner, manager, referrer, token owner, or operator role
- foreign ERC-721 `tokenId`: used only by the asset-rescue admin function

The Acclimated rescue-order token convention is scoped to that exact contract. It does not apply to MoonCatsWrapped/WMCR or other wrappers.

## Limitations

- No current state values are asserted.
- No full definitions, ownership, event history, taxonomy, rarity, categories, palettes, or image bytes are imported.
- Reserved metadata bits beyond the source-confirmed bit-7 image approval check remain uninterpreted.
- No independent execution or storage-layout audit was performed.
