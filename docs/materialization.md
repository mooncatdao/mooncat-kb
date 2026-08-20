# MoonCat Materialization

`data/materialization-internals.json` summarizes the checked-in paths used to discuss MoonCat materialization without promoting generated images, palettes, or contract state into KB data.

The local `mooncatparser.js` accepts a bytes5-style Cat ID and produces a nested pixel/color grid. LibMoonCat provides array-backed identifier and extended-trait helpers; its browser image helpers require a DOM and are not used as a headless renderer here. The reviewed MoonCatSVGs contract accepts bytes5 or guarded rescue-order inputs, reads MoonCatTraits and MoonCatColors, and returns an SVG string. MoonCatAccessoryImages is a separate rescue-order-based composition path that additionally needs accessory definitions, owned records, palettes, image data, and layering inputs.

The block-pinned snapshot stores compact fingerprints and normalizations rather
than raw SVG strings. At block `25798234`, it retains exhaustive per-cat
identity/traits and colors/hue/glow outputs plus explicit-false MoonCatSVG
hashes and parsed cell structure for all 25,440 cats. Its separate 48-cat
representative evidence covers true/default SVG behavior, pinned owner/glow,
and SVG/Colors subset checks. It does not provide a DOM rendering environment,
a deterministic accessory record set, current ownership/worn state, exhaustive
true/default SVG modes, or exhaustive SVG/Colors subset comparison.

Use `docs/materialization-parity.md` and `data/materialization-parity-results.json` for the bounded zero-network fixture harness. Do not treat that harness as full-population render proof, a byte-identical SVG test, palette reconstruction, current-state evidence, or an assertion that derived color labels prove RGB/hex/palette orientation.

`docs/onchain-materialization.md` documents the separate read-only RPC verifier
and checked-in exhaustive result. Its zero-network validator confirms 8
runtime-code records, the retained 48 successful base comparisons, and three
25,440-row exhaustive surfaces with 0 definite mismatches. Explicit-false SVG
structure passes for all 25,440 cats; the 48 SVG/contract-color subset passes
remain representative. Accessory and current-state claims remain unresolved.
