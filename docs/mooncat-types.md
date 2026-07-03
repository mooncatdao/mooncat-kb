# MoonCat Types

This document explains MoonCat category data files.

Canonical or curated membership belongs in JSON, not prose:

- `data/mooncat-types.json`
- `data/character-cats.json`
- `data/special-cats.json`

## Genesis Cats

Status: partially verified.

The contract source verifies the Genesis supply cap and generation pattern, but this repository does not yet materialize the exact Genesis Cat ID list.

Related files:

- `data/protocol-constants.json`
- `data/special-cats.json`

## Character Cats

Status: community-curated and incomplete.

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

`data/character-cats.json` now records Rate My Mooncat as a community-curated source and imports partial hue-range notes where the current public page/change history gives enough information. It still contains no MoonCat IDs.

Important constraints:

- Treat character-cat categories as community-curated narratives, not canonical traits.
- Do not add exact MoonCat IDs without a separate derivation/import pass.
- Preserve whether a hue range wraps over zero, such as Pink Panther's all-range.
- Keep premium/two-star ranges separate from all-range definitions.

## Special Cats

Status: partially verified.

Special categories may include protocol-defined, historical, or community-curated groupings. Keep those categories separate and mark their trust level clearly.
