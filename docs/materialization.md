# MoonCat Materialization

`data/materialization-internals.json` summarizes the checked-in paths used to discuss MoonCat materialization without promoting generated images, palettes, or contract state into KB data.

The local `mooncatparser.js` accepts a bytes5-style Cat ID and produces a nested pixel/color grid. LibMoonCat provides array-backed identifier and extended-trait helpers; its browser image helpers require a DOM and are not used as a headless renderer here. The reviewed MoonCatSVGs contract accepts bytes5 or guarded rescue-order inputs, reads MoonCatTraits and MoonCatColors, and returns an SVG string. MoonCatAccessoryImages is a separate rescue-order-based composition path that additionally needs accessory definitions, owned records, palettes, image data, and layering inputs.

This KB has no checked-in per-cat MoonCatSVGs output, executable MoonCatColors palette result, DOM rendering environment, deterministic accessory record set, or current ownership/worn state. Therefore a materialization discussion must distinguish executable parser structure from documented contract behavior and from unavailable palette, SVG-serialization, and accessory layers.

Use `docs/materialization-parity.md` and `data/materialization-parity-results.json` for the bounded zero-network fixture harness. Do not treat that harness as full-population render proof, a byte-identical SVG test, palette reconstruction, current-state evidence, or an assertion that derived color labels prove RGB/hex/palette orientation.
