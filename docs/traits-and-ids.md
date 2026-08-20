# Traits and IDs

This page is a compact router. Complete static lookup lives in
`data/mooncat-population/manifest.json` and
[`mooncat-population-index.md`](mooncat-population-index.md). Schema and source
observations live in `data/trait-index.json` and [`traits.md`](traits.md).

Identifier terminology and verified conversion limits live in
`data/identifier-conventions.json`,
[`identifier-conventions.md`](identifier-conventions.md), and the zero-network
fixtures described in [`identifier-verification.md`](identifier-verification.md).

## Current status

The repository has an exhaustively validated 25,440-row static joined view and
a separate 64-row representative fixture. The full view includes source-backed
Cat ID/rescue-order identity, selected raw traits, released Genesis membership,
derived color labels, rescue buckets, community-curated character categories,
and pinned finalized names. It is generated from checked-in evidence and is not
live chain, ownership, accessory, API, or marketplace state.

Bytes5 Cat IDs and rescue order are connected by a checked array-backed lookup,
not arithmetic. The reviewed MoonCatAcclimator contract uses rescue order as
its token ID; the historical MoonCatsWrapped/WMCR contract instead uses a
counter and explicit mappings. Neither rule may be generalized to another
wrapper, marketplace ID, accessory ID, palette index, or local record index.

## Rules

- Do not invent IDs, mappings, or trait labels.
- Keep raw source traits, derived display labels, and community classifications
  in their recorded provenance classes.
- Keep exact mappings in generated/curated JSON and explanatory boundaries in
  Markdown.
- Stop for separately authorized live verification when the requested result
  is current rather than revision-bounded.
