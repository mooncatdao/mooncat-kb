# MoonCat Types

This document explains MoonCat category data files.

Canonical or curated membership belongs in JSON, not prose:

- `data/mooncat-types.json`
- `data/character-cats.json`
- `data/character-cat-index.json`
- `data/special-cats.json`

## Genesis Cats

Status: partially verified.

The contract source verifies the Genesis supply cap and generation pattern, but this repository does not yet materialize the exact Genesis Cat ID list.

Related files:

- `data/protocol-constants.json`
- `data/special-cats.json`
- `data/rescue-buckets.json`

`data/rescue-buckets.json` includes a canonical-derived `genesis` rescue-order-index bucket. That bucket is not a bytes5 catId list and does not replace the contract-derived Genesis generation facts.

## Character Cats

Status: community-curated.

Character cats are community-recognized MoonCats that resemble cats or characters from popular media. They are not official protocol traits.

The current category shells are:

- Garfield
- Cheshire Cat
- Pink Panther
- Alien
- Zombie
- Simba
- Golden Lucky Cat
- Pikachu

`data/character-cats.json` records Rate My Mooncat as a community-curated source and imports partial hue-range notes where the current public page/change history gives enough information.

`data/character-cat-index.json` contains exact community-curated membership/index numbers imported from the local user-provided `references/derived/mooncat_rescueOrder_by_category.json` file.

Definitions and materialized membership are intentionally separate:

- `data/character-cats.json` defines category labels, hue ranges, `pale`, and `coat` filters.
- `data/character-cat-index.json` stores the exact imported membership/index arrays.

Important constraints:

- Treat character-cat categories as community-curated narratives, not canonical traits.
- Do not treat the imported index numbers as official protocol traits.
- Confirm the index convention before using the values in UI or import tooling.
- Preserve whether a hue range wraps over zero, such as Pink Panther's all-range.
- Keep premium/two-star ranges separate from all-range definitions.

## Special Cats

Status: partially verified.

Special categories may include protocol-defined, historical, or community-curated groupings. Keep those categories separate and mark their trust level clearly.

## Notes

“rescue-order-index” values are not interchangeable with catId/tokenId unless explicitly converted. The derivation method for rescue buckets still needs to be documented before downstream tools rely on the local artifact as reproducible.
