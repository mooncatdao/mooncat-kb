# MoonCat Accessory System

Machine-readable summary: `data/mooncat-accessory-system.json`.

This is a thin integration overview, not a replacement for the detailed [MoonCatAccessories lifecycle review](mooncat-accessories.md) or [MoonCatAccessoryImages rendering review](mooncat-accessory-images.md). It connects their source-described responsibilities while preserving the boundary between static capability, current chain state, and generated output.

## End-to-end flow

1. `MoonCatAccessories` creates and manages append-only accessory definitions. An `accessoryId` identifies a definition-array entry; the overview does not import the taxonomy, definitions, prices, supplies, palettes, or image bytes.
2. Purchase or manager assignment records an accessory under a MoonCat `rescueOrder` after the reviewed Acclimated ownership or approval checks. An `OwnedAccessory` record is not an ERC-721 and does not store a wallet owner.
3. Authorized alteration changes the record's `paletteIndex` and `zIndex`. `zIndex == 0` retains ownership but suppresses wearing; it is not removal, burning, or deletion.
4. `MoonCatAccessoryImages` consumes the records and definition image inputs. It applies the separate metadata-bit verification gate, filters unworn records, prepares background and foreground placement, and orders the prepared accessories.
5. The rendering contract materializes accessory PNG data-URI snippets and composes them around the base MoonCat SVG path using the reviewed trait, color, and SVG dependencies.

The two contracts have separate jobs: `MoonCatAccessories` owns definitions, assignment, ownership records, and mutable wear settings; `MoonCatAccessoryImages` is a rendering consumer and does not create or transfer accessory ownership. Verification filtering is distinct from purchase eligibility and from Acclimated ERC-721 operator approval.

## Identifier boundaries

Keep these types distinct: `rescueOrder`, `catIdBytes5`, `acclimatedTokenId`, `accessoryId`, `ownedAccessoryIndex`, `paletteIndex`, and `zIndex`. The exact Acclimated review uses `rescueOrder` in its token authorization path, but that scoped relationship is not a generic token-ID conversion and does not apply automatically to WMCR or other wrappers. `accessoryId` selects a definition; `ownedAccessoryIndex` selects a record within one rescue order; `paletteIndex` selects a definition palette slot; and `zIndex` is a wear/drawing-order value.

## Evidence and unresolved state

The checked-in reviews establish source-described lifecycle, ownership-record, verification, placement, PNG materialization, and SVG composition behavior. They do not establish current ownership, worn or verified state, manager or eligibility state, prices, supply, availability, complete definitions, taxonomy, image data, event history, exact palettes, or exact generated PNG/SVG output. Current claims require live chain storage, events, or calls; exact local output requires a separately scoped deterministic input set.

For exact behavior and limitations, follow the two detailed reviews linked above and the corresponding machine-readable internals files. Do not infer missing identifier conversions, current state, or generated output from this integration overview.
