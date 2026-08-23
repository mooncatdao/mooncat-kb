# CatMoon decisions and failure boundaries

## Detail-card and export parity

The live card and PNG exporter share classification and Genesis detection.
The export code uses a fixed 600 × 840 canvas, the same template frame,
atlas tile source rectangle, trait ordering, card summary, and classification
footer. Black Genesis cards switch the footer to white for contrast; ordinary
and white Genesis cards retain the dark footer. Text is fitted or truncated to
the available card width, and export waits for the local Pixel Operator fonts
when the document font loader is available.

This is presentation parity, not proof that the card is a canonical rendering
or that its trait source is live.

## Theme and accessibility decisions

`cat-details-theme.js` normalizes the versioned
`catmoon.detailsTheme.v1` value to the only currently registered
`template-card` theme. Invalid or unavailable storage falls back to that
theme. The implementation leaves a stable extension point for future themes
without letting arbitrary storage values select CSS behavior.

The coordinator preserves dialog focus, uses labels and expanded/pressed
states on controls, keeps transient overlays `aria-hidden` when inactive, and
restores focus from the detail action panel. These source-level behaviors
were inspected statically; no browser or screen-reader check was performed.

## Failure handling

- Required face textures and slot metadata fail the geometry load when missing,
  malformed, or dimension-incompatible.
- Filter manifest failure falls back to all faces; invalid filter data or
  category arrays reject the affected data load.
- Names are optional at runtime: a failed names load disables Named Cats and
  leaves other filter paths available.
- Detail shards are validated for face length, expected rescue order, field
  types, and non-empty strings. A failed shard is removed from the loader
  cache so retry can try again; the dialog keeps preview and external links
  available while showing a trait-load error.
- Wallet responses reject malformed top-level data and surface HTTP/API
  errors without creating a false empty success.
- Storage failures fall back to in-memory defaults, and PNG export reports
  unavailable image/canvas/encoding stages rather than silently downloading a
  partial card.

## Rejected or unsupported in this evidence set

The reviewed source and README document explicit legacy/unsupported paths:
the local-traits name extractor remains available only under the explicitly
legacy command, and `npm run preview` does not provide the Pages Function.
The source review does not contain a general decision log for every prior
rendering or interaction experiment. Do not turn the current module shape
into an unrecorded historical claim about why an alternative was rejected.

Source paths: `src/main.js`, `src/js/cat-details.js`,
`src/js/cat-details-export.js`, `src/js/cat-details-theme.js`,
`src/js/filters.js`, `src/js/catmoon-geometry.js`, `src/js/wallet.js`, and
`README.md`.
