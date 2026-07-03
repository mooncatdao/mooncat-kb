# Color Math

Color and hue data belongs in `data/color-hues.json`.

## Current Status

Partially documented.

Canonical MoonCat hue names, coat trait mappings, special coat categories, and pale-coat adjustments are still not verified in this repository.

Community-curated character-cat hue ranges are referenced from `data/character-cats.json`. These are narrative/filter ranges, not official protocol traits.

## Circular Hue Distance

For future hue comparisons, circular distance can compare two degree values:

```js
function hueDistance(a, b) {
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}
```

This formula is a useful method note, not a verified canonical MoonCat trait mapping.

## Hue ranges that wrap over zero

Some character-cat filter ranges may cross from high hue values back to zero. Store these with `wrapsZero: true` in JSON rather than splitting or silently dropping the wrapped portion.

Example: Pink Panther's community-curated all-range is recorded as `325-10` with `wrapsZero: true`.

## Pale Handling

Status: experimental.

Any pale-coat adjustment rules must stay experimental until source data and expected behavior are documented.
