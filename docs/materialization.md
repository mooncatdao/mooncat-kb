# MoonCat Materialization

`data/materialization-internals.json` summarizes the checked-in paths used to discuss MoonCat materialization without promoting generated images, palettes, or contract state into KB data.

The local `mooncatparser.js` accepts a bytes5-style Cat ID and produces a nested pixel/color grid. LibMoonCat provides array-backed identifier and extended-trait helpers; its browser image helpers require a DOM and are not used as a headless renderer here. The reviewed MoonCatSVGs contract accepts bytes5 or guarded rescue-order inputs, reads MoonCatTraits and MoonCatColors, and returns an SVG string. MoonCatAccessoryImages is a separate rescue-order-based composition path that additionally needs accessory definitions, owned records, palettes, image data, and layering inputs.

The block-pinned snapshot stores compact fingerprints and normalizations rather
than raw SVG strings. For 48 deterministic cats at block `25798234`, it retains
actual MoonCatColors arrays and exact MoonCatSVGs byte hashes plus parsed cell
structure. It does not provide a DOM rendering environment, an exhaustive
25,440-cat contract result, a deterministic accessory record set, or current
ownership/worn state. Materialization discussions must keep this representative
pinned evidence separate from source-described behavior and unavailable
exhaustive/accessory/current layers.

Use `docs/materialization-parity.md` and `data/materialization-parity-results.json` for the bounded zero-network fixture harness. Do not treat that harness as full-population render proof, a byte-identical SVG test, palette reconstruction, current-state evidence, or an assertion that derived color labels prove RGB/hex/palette orientation.

`docs/onchain-materialization.md` documents the separate read-only RPC verifier
and checked-in representative result. Its zero-network validator confirms 8
runtime-code records, 48 successful base comparisons, 48 parser-structure
passes, 48 SVG/contract-color subset passes, and 0 definite mismatches at the
exact recorded block. Exhaustive and accessory claims remain unresolved.
