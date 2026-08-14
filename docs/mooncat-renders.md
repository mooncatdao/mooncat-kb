# Full MoonCat Render Artifacts

## Status and purpose

`data/mooncat-renders/manifest.json` describes deterministic, zero-network,
parser-derived render data for all 25,440 source-backed MoonCat IDs. The data is
split into the same fixed 1,000-rescue-order shard boundaries as the population
index, with a final 440-row shard.

This is renderer-neutral unit-cell data. It is intended for static local image
and profile tools that need exact `mooncatparser.js` colors and cells without
shipping the parser or storing 25,440 loose images. It is not an SVG, PNG,
data URL, accessory composition, or live-state dataset.

## Row and encoding contract

Each row contains `catId`, `rescueOrder`, logical `width` and `height`, a local
`palette`, and packed `pixels`. Palette index 0 is `null` and represents a
transparent cell. All other palette entries are the exact CSS hex strings
returned by the checked-in parser, retained without color classification or
on-chain palette reinterpretation.

`pixels` uses `palette-index-nibble-base64-v1`:

1. Traverse the parser matrix in X-major order.
2. For each X/column, traverse Y/row from top to bottom.
3. Replace each cell with its 4-bit local palette index.
4. Pack the first index in a byte's high nibble and the second in its low
   nibble; a final unused low nibble is zero.
5. Base64-encode those packed bytes.

The complete measured source output has 9,138,249 logical cells. Nibble packing
reduces those indexes to 4,572,212 raw bytes before base64 and JSON framing.
The generated manifest records the committed shard byte total and average
bytes per cat.

## Coordinate orientation

Orientation follows the reviewed
`examples/rescue-mining-widget/mooncat-render-adapter.js` contract exactly:

- the parser outer array index is X/column;
- the parser inner array index is Y/row;
- `width` is the outer array length;
- `height` is each column's inner length; and
- flattened offset is `x * height + y`.

Do not treat the parser's outer arrays as conventional row-major Y rows. A
downstream SVG renderer should decode each nontransparent cell to a unit
rectangle at `x=<outer index>`, `y=<inner index>`, with width and height 1.
Scaling the SVG viewBox or CSS display size preserves crisp pixel geometry.

For example, `mckb-library` can select the shard by explicit rescue order,
verify the row's `catId`, decode the palette indexes, and create an SVG with
`viewBox="0 0 <width> <height>"`. That SVG presentation belongs to the library;
the KB stores only the compact source-derived cells and palette.

## Generation and validation

Generate or check the artifacts with:

```sh
python scripts/generate-mooncat-renders.py
python scripts/generate-mooncat-renders.py --check
python scripts/validate-mooncat-renders.py
```

Generation invokes only the checked-in `mooncat_traits.json` identity sequence
and `mooncatparser.js`. The validator decodes all 25,440 rows; checks identity,
range, uniqueness, dimensions, palettes, cell counts, nonempty output, shard
hashes/sizes, source hashes, and deterministic regeneration; then compares the
eight materialization fixtures cell-for-cell against fresh parser output. The
fixture set covers normal and Genesis cats, all poses and patterns, both facing
directions, pale states, and multiple colors. A non-square asymmetric fixture
makes the X/Y orientation check transpose-sensitive.

## Provenance and limits

The manifest records exact hashes for the checked-in identity and parser
inputs. The artifact is evidence of deterministic output from that pinned
parser snapshot. It does not establish current MoonCatSVGs serialization,
on-chain palette equality, contract deployment or state, ownership, balances,
markets, current accessories, or accessory layering.

The existing parser snapshot license evidence remains unresolved. Neither this
artifact nor this documentation makes a licensing determination for
`mooncatparser.js` or parser-derived visual output. Consumers must preserve that
provenance limitation rather than inheriting the repository's general CC0
statement automatically.
