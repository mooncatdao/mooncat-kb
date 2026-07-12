# MoonCatAccessoryImages

Machine-readable summary: `data/mooncat-accessory-images-internals.json`.

## Current Status

Compact source review complete for accessory composition and PNG materialization behavior.

MoonCatAccessoryImages is the on-chain contract linked from the official MoonCatRescue `Chained to the Future` log page. The reviewed Etherscan source is verified as an exact match for `MoonCatAccessoryImages` at `0x91CF36c92fEb5c11D3F5fe3e8b9e212f7472Ec14`, compiled with Solidity `v0.8.1+commit.df193b15`, optimization enabled with 200 runs, under GNU AGPLv3.

This page documents the contract role and compact internals only. It does not import Solidity source, ABI JSON, bytecode, accessory arrays, placement tables, palette values, PNG bytes, generated SVGs, or per-cat outputs.

## Role

MoonCatAccessoryImages composes accessorized MoonCat SVG strings and constructs accessory PNG data URIs for embedding in those SVGs. It consumes base MoonCat materialization helpers from MoonCatSVGs; it does not replace MoonCatSVGs as the source of base MoonCat pixel/SVG construction.

Unlike MoonCatSVGs, the reviewed public image entrypoints accept a numeric `uint256 rescueOrder`, not a bytes5 cat ID. The explicit-accessory composition path and `accessoryPNG` require `rescueOrder < 25440` before reading the original MoonCatRescue `rescueOrder` lookup. Do not substitute a bytes5 cat ID, ERC-721 token ID, local array index, or accessory ID without separately verified conversion context.

## Dependencies

- MoonCatRescue: fixed interface used to convert rescue order to bytes5 cat ID.
- MoonCatAccessories: fixed dependency used to enumerate records, verify rescue-order ownership, and obtain accessory image inputs. Its definition and ownership lifecycle are documented separately in `docs/mooncat-accessories.md`; taxonomy and current state remain outside scope.
- MoonCatTraits: constructor-supplied interface used for facing, expression, pattern, and pose.
- MoonCatColors: constructor-supplied interface used for base colors, accessory colors, palette data, and alpha data.
- MoonCatSVGs: constructor-supplied interface used for base pixel data, bounding boxes, SVG wrappers, glow, mirroring, and number formatting.
- MoonCatReference: constructor-supplied documentation/reference interface used by `doc()`.

## Image Composition Flow

For `accessorizedImageOf(uint256, OwnedAccessory[], uint8, bool)`, the reviewed source:

1. Requires `rescueOrder < 25440`, converts to a bytes5 cat ID, and reads traits/colors for base MoonCat pixels.
2. Reads cat-specific accessory colors and prepares the supplied accessory records.
3. Requires source-level ownership for each supplied accessory, separates prepared records into background and foreground lists, and sorts each by `zIndex`.
4. Builds a PNG data URI for each prepared accessory and embeds it as an SVG image snippet; source-directed mirroring uses MoonCatSVGs `flip`.
5. Expands the base MoonCatSVGs bounding box to cover prepared accessory placement.
6. Emits background snippets, base MoonCat pixel data, and foreground snippets in an SVG wrapper.

The overload that does not receive an explicit accessory list reads the list through the MoonCatAccessories interface at invocation time, then delegates to the explicit-list path. This is source behavior only, not a statement of any MoonCat's current accessories, ownership, or availability.

## Glow Behavior

The reviewed assembly source distinguishes three cases:

- `glowLevel == 0`: no glow wrapper.
- `glowLevel == 1`: glow applied to base MoonCat pixels.
- Other `glowLevel` values: glow applied to the assembled background, base, and foreground bytes.

No broader glow-level semantic range or rendered-output claim is made here.

## PNG Materialization

`accessoryPNG(uint256,uint256,uint16)` returns a `data:image/png;base64` string. The source assembles PNG bytes from a PNG header, `IHDR`, `PLTE`, `tRNS`, and `IDAT` chunks plus a PNG footer. It resolves the selected accessory palette through MoonCatColors helpers and source accessory image data.

The same PNG assembly path supplies the inline image snippets used in accessorized SVG composition. Exact palette values, alpha values, image data, PNG bytes, dimensions, and rendered outputs are intentionally not recorded.

## Public Surface Categories

- Accessorized image entrypoints: four `accessorizedImageOf` overloads accepting a rescue order with optional glow, verification flag, or explicit `OwnedAccessory` records.
- PNG/placement entrypoints: `accessoryPNG` and `placementOf`.
- Preparation/helpers: `prepAccessories`, `crc32`, `generatePNGChunk`, `PNGHeader`, `PNGFooter`.
- Documentation/admin: `doc`, `owner`, `transferOwnership`, `setReferenceContract`, `withdrawForeignERC20`, `withdrawForeignERC721`.

An explicit `OwnedAccessory` record has source-declared fields `accessoryId`, `paletteIndex`, and `zIndex`. It remains separate from MoonCat IDs and rescue-order identifiers. No accessory taxonomy or generic ID conversion is defined by this review.

## Limitations

- MoonCatAccessories lifecycle is reviewed separately; accessory taxonomy, current ownership, approval state, availability, and other current state are not imported.
- No accessory IDs, placement tables, palettes, color thresholds, IDAT data, PNG bytes, SVG strings, or per-cat outputs are imported.
- No exact rendering or materialization result has been independently reproduced from this KB.
- Base SVG behavior remains documented separately in `docs/mooncat-svgs.md` and `data/mooncat-svg-internals.json`.
