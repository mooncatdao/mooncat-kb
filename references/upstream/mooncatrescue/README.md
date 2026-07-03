# MoonCatRescue Upstream Reference Snapshot

This directory stores local upstream reference files used for focused review passes.

## Files

- `libmooncat-limited.js`: browser-oriented `LibMoonCat` bundle. In the checked snapshot it exposes `getMoonCatIdByRescueIndex`, `getCatId`, `getRescueOrder`, `parseCatId`, and typed `getTraits` helpers.
- `mooncat_traits.json`: 25,440-row array-backed dataset. Each checked row is ordered by `rescueOrder` and includes a `catId` field.
- `mooncatparser.js`: original-style MoonCat parser reference that accepts bytes5 cat IDs for image parsing behavior.

## KB Usage

These files are reference inputs, not curated KB data. Do not copy the full 25,440-entry catId mapping into `data/` without a focused generated-data pass that documents provenance, normalization rules, and validation results.

For identifier conversion, use these files only to document array-backed lookup behavior:

- rescue order to bytes5 cat ID through the ordered array or `LibMoonCat.getMoonCatIdByRescueIndex`
- bytes5 cat ID to rescue order through the reverse array index / `LibMoonCat.getRescueOrder`

This is not a closed-form formula for deriving rescue order from the bytes5 value.
