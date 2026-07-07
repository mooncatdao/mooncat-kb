# MoonCatSVGs

Machine-readable summary: `data/mooncat-svg-internals.json`.

## Current Status

Compact source review complete for base MoonCat SVG materialization.

MoonCatSVGs is the on-chain SVG image-generation contract linked from the official MoonCatRescue `Chained to the Future` log page. The reviewed Etherscan source is verified as an exact match for `MoonCatSVGs` at `0xB39C61fe6281324A23e079464f7E697F8Ba6968f`, compiled with Solidity `v0.8.1+commit.df193b15`, optimization enabled with 200 runs, under GNU AGPLv3.

This page documents the contract role and compact internals only. It does not import Solidity source, ABI JSON, bytecode, coordinate constants, pattern arrays, generated SVGs, or per-cat outputs.

## Role

MoonCatSVGs assembles base MoonCat SVG image strings from MoonCat trait and color inputs. The source-confirmed public `imageOf` overloads accept either a bytes5 cat ID or a rescue-order number, with variants for explicit glow behavior.

The rescue-order overloads require `rescueOrder < 25440` and convert the rescue order to a bytes5 cat ID through the original MoonCatRescue `rescueOrder` lookup.

## Dependencies

- MoonCatRescue: fixed interface used for `rescueOrder(uint256)` and `catOwners(bytes5)`.
- MoonCatTraits: constructor-supplied interface used for `kTraitsOf(catId)`, specifically facing, expression, pattern, and pose in the reviewed image path.
- MoonCatColors: constructor-supplied interface used for `colorsOf(catId)`, returning the color data consumed by SVG assembly.
- MoonCatReference: constructor-supplied documentation/reference interface used by `doc()`.
- Acclimated contract address: stored address used by `imageOf(bytes5)` to decide default glow behavior when `catOwners(catId)` equals that address.

## Rendering Flow

For `imageOf(bytes5,bool)`, the reviewed source:

1. Reads facing, expression, pattern, and pose from MoonCatTraits.
2. Reads `uint8[24]` color data from MoonCatColors.
3. Builds base pixel data with `getPixelData`.
4. Applies `glowGroup` with the first RGB triple from `colorsOf` when glow is enabled.
5. Computes a bounding box from facing and pose.
6. Returns a string made from `svgTag(...)`, the generated pixel data, and a closing `</svg>`.

The SVG wrapper uses a pixel-art style surface: `preserveAspectRatio="xMidYMid slice"`, `shape-rendering="crispEdges"`, `image-rendering:pixelated`, and width/height values derived from the computed viewBox dimensions.

## Public Surface Categories

- Image entrypoints: `imageOf(bytes5,bool)`, `imageOf(bytes5)`, `imageOf(uint256,bool)`, `imageOf(uint256)`.
- SVG helpers: `flip`, `polygon`, `setPixel`, `pixelGroup`, `getPattern`, `colorGroup`, `glowGroup`, `getPixelData`, `svgTag`, `boundingBox`, `uint2str`.
- Public geometry/pattern data surfaces: `CatBox`, `Face`, `Border`, `Coat`, `Tummy`, `Skin`, `Whiskers`, `Eyes`, `Patterns`.
- Documentation/admin: `doc`, `owner`, `transferOwnership`, `setReferenceContract`, `withdrawForeignERC20`, `withdrawForeignERC721`.

## Relationship To Other Materialization Contracts

MoonCatSVGs consumes trait and color data; it does not replace MoonCatTraits or MoonCatColors as the source for trait parsing or color derivation. Use `data/color-hues.json` for the compact MoonCatColors internals review.

Accessory image composition is separate. The MoonCatAccessoryImages contract remains the surface for accessorized image and PNG helper behavior, and its internals are not reviewed here.

## Limitations

- No SVG coordinate data, pattern arrays, or generated SVG output is imported.
- No per-cat image, trait, color, accessory, ownership, or chain-state result is derived.
- No exact rendered-output behavior is claimed beyond the reviewed source path.
- Accessory rendering and PNG materialization remain out of scope for this pass.
