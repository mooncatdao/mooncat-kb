# Stasis visual rationale and interaction

## Continuous atmosphere

The source builds one chronological field and layers a non-interactive
atmosphere background behind the Canvas chunks. `createAtmosphereBackground`
selects local `0.jpg`–`5.jpg` panels, and CSS masks/overlaps them through the
active Atmosphere 4 treatment before the Moon surface ending. The continuous
field, sparse age outlines, and scroll bubble make a long timeline read as one
place while leaving the sprites as the primary data signal. This is an
implementation-level visual rationale inferred from the layout and CSS; it is
not a product-history or user-study claim.

The tradeoff is deliberate: a long Canvas stage and precomputed layout avoid
thousands of independent DOM cards, while chunk allocation limits active pixel
surfaces near the viewport. Mobile uses smaller sprite scales and padding;
desktop uses larger tiles. The fallback without `IntersectionObserver` favors
compatibility over memory savings.

## Hover, touch, and pinning

Desktop pointer movement performs binary-search row hit testing and transient
inspection. Touch/click uses a movement threshold so scrolling does not pin a
cat accidentally. A pinned cat keeps its annotation visible, outlines the
sprite, adds a holder count, dims non-holder sprites when group highlighting is
active, and adds an Etherscan wallet link in a new tab. Escape clears the pin.
When scrolling moves a pinned cat offscreen, the pin is cleared. Annotation
placement tries positions around the cat and minimizes overlap with the
holder's visible group.

The stage is keyboard-focusable, has a group label and description, and the
inspection annotation is a polite live region. The age bubble is also live.
These are static source observations; browser and assistive-technology checks
were not run.

## Versioned display settings

The four controls in `index.html` are `Highlight wallets`, `Outline Ages`,
`Show rescue years`, and `Show rescue IDs`. `readDisplaySettings` reads
`stasis.display-settings.v1`, accepts only four booleans, and falls back to
the markup's `aria-pressed` defaults for malformed or unavailable storage.
Only toggle changes are persisted. Settings affect overlay presentation, not
the underlying snapshot.

Source paths: `src/main.ts` inspection/settings/bootstrap functions,
`index.html`, and `src/styles.css` atmosphere/chunk/inspection rules.
