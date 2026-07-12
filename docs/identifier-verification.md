# Identifier Conversion Verification

## Purpose and Scope

`data/identifier-conversion-cases.json` and `scripts/validate-identifier-conversions.py` turn the existing identifier boundaries into a deterministic, zero-network verification suite. The fixture set is representative; it deliberately does not import a full 25,440-row mapping or current chain state.

The validator loads the registered local `mooncat_traits.json` reference, invokes the checked-in `libmooncat-limited.js` helpers through Node, and requires both sources to agree for supported fixtures. It uses no API, RPC, explorer, marketplace, or ownership calls.

## Supported Conversions

- `rescueOrder -> catIdBytes5`: a checked integer in `0..25439` uses the array-backed `LibMoonCat.getMoonCatIdByRescueIndex` / `getCatId` lookup and is cross-checked against `mooncat_traits.json[rescueOrder].catId`. This is bijective only for known rescued values in the stated fixture domain; it is not a closed-form formula.
- `catIdBytes5 -> rescueOrder`: the suite requires a lowercase `0x` prefix and exactly five bytes, accepts uppercase hexadecimal digits, lowercases through the observed `parseCatId` behavior, and then uses `getRescueOrder`. A syntactically valid unknown value is rejected as an unknown local lookup.
- `acclimatedTokenId -> rescueOrder` and `acclimatedTokenId -> catIdBytes5`: for the exact reviewed Acclimated MoonCats contract, token ID is documented as rescue order. The latter performs that contract-scoped identity step and then the separate array-backed lookup.

The Acclimated equivalence is contextual, not a generic ERC-721 rule. It must not be applied to WMCR, other wrappers, unrelated collections, or marketplace URLs without their own source-backed contract convention.

## Unsupported and Negative Boundaries

WMCR token IDs are sequential/mapping-backed wrapper IDs. The exact `MoonCatsWrapped` source provides `_tokenIDToCatID` and `_catIDToTokenID`, but this repository does not import mapping contents or event history. The suite therefore rejects direct `wmcrTokenId -> rescueOrder` and `wmcrTokenId -> catIdBytes5` conversions rather than guessing numeric equality.

The fixture suite also rejects `accessoryId`, `paletteIndex`, `ownedAccessoryIndex`, `managedAccessoryIndex`, `batchOwnedAccessoryIndex`, and `marketplaceUrlIdentifier` as MoonCat identity inputs. Accessory IDs identify definition-array entries; palette and owned-record indexes are local context fields; manager and batch indexes are operation-specific; marketplace values require collection and contract context.

Rescue orders outside `0..25439`, decimal text supplied under the integer `rescueOrder` type, floats, malformed bytes5 widths, a missing or uppercase `0X` prefix, non-hex input, and syntactically valid but unknown bytes5 values are all explicit negative cases.

## Fixture Types and Reversibility

Every case names its input type, conversion key, expected output type or rejection, sourceRefs, and reversibility classification. Public type names are qualified: `rescueOrder`, `catIdBytes5`, `acclimatedTokenId`, `wmcrTokenId`, `accessoryId`, `paletteIndex`, `ownedAccessoryIndex`, `managedAccessoryIndex`, `batchOwnedAccessoryIndex`, and `marketplaceUrlIdentifier`. Generic `tokenId` is intentionally not used.

Round-trip assertions are run only for array-backed rescue-order/bytes5 pairs and for the Acclimated identity step followed by that lookup. WMCR and other contextual or unsupported conversions are tested as limitations instead of being forced into symmetry.

Run:

```text
python scripts/validate-identifier-conversions.py
```

This validates fixture sourceRefs, schema/type coverage, formatting and range rules, LibMoonCat/parser-compatible normalization, trait cross-checks, round-trip counts, negative cases, and unsupported identifier boundaries.

## Limits

The suite does not establish a bytes5 mapping for unrescued IDs, deacclimated cats, unknown wrappers, or marketplace-specific identifiers. It does not inspect live ownership, current accessory totals, WMCR mapping state, or contract calls. The canonical terminology and broader source limitations remain in `data/identifier-conventions.json` and `docs/identifier-conventions.md`.
