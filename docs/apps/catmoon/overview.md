# CatMoon overview

## Scope

CatMoon is a Vite application that presents the 25,440 rescued MoonCats as
an interactive Three.js rhombic-triacontahedron viewer. The application adds
rescue lookup, filters, wallet overlays, previews, detail cards, rendering
modes, and local preferences.

This reference is bounded to the clean local checkout of
`zibzub/catmoon` at commit
`4acf66a54081a9f70a378e87b26e65eba2922cfb`, reviewed on 2026-08-22. The
checkout's current `HEAD` matched that commit and its working tree was clean.
The source is community-maintained application evidence. It does not prove
protocol behavior, current ownership, deployment, live API/RPC responses, or
current chain state.

## Active source tree

`src/main.js` is the coordinator for DOM references, application state, HUD
events, rendering, filters, lookup flows, and detail-card integration.
Feature responsibilities are split across:

- `src/js/catmoon-geometry.js` — rhombic-triacontahedron construction,
  per-face slot metadata, rescue-order addressing, and target geometry;
- `src/js/rendering.js` — texture settings, render-mode normalization,
  afterimage, Bokeh, lit rendering, and DPR handling;
- `src/js/controls.js` — pointer, touch, tumble, roll, zoom, and focus motion;
- `src/js/filters.js` — filter data, manifests, prepared overlays, and runtime
  set loading;
- `src/js/rescue-url.js` and `src/js/wallet.js` — URL and wallet-boundary
  helpers;
- `src/js/cat-details*.js` — detail shards, classification, export, text fit,
  and theme normalization;
- `functions/api/wallet-cats.js` — the Cloudflare Pages wallet endpoint;
- `tools/sync-mooncat-names.js` — canonical name-index synchronization.

## Revision-bound project details

The reviewed `package.json` records Three.js `^0.165.0`, viem `^2.53.1`, and
Vite `^8.1.4`, with JavaScript ESM modules. It documents Vite build/preview,
Node syntax checks, module tests, detail generation, and name synchronization.
These are source-repository declarations, not proof of a deployed build.

The README describes Cloudflare Pages deployment with a Pages Function for
`/api/wallet-cats`, but deployment and endpoint checks were not run during
this KB ingestion.

## Related pages

- [Architecture](architecture.md)
- [Domain rules](domain-rules.md)
- [Interaction patterns](interaction-patterns.md)
- [Decisions and failures](decisions-and-failures.md)
- [Validation](validation.md)
