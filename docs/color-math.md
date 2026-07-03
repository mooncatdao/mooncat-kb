# Color Math

Color and hue data belongs in `data/color-hues.json`.

## Current Status

Incomplete.

No canonical MoonCat hue names, hue degrees, special coat categories, or pale-coat adjustments are verified in this repository yet.

## Circular Hue Distance

For future hue comparisons, circular distance can compare two degree values:

```js
function hueDistance(a, b) {
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}
```

This formula is a useful method note, not a verified canonical MoonCat trait mapping.

## Pale Handling

Status: experimental.

Any pale-coat adjustment rules must stay experimental until source data and expected behavior are documented.
