# Stasis architecture

## Source-to-presentation pipeline

`scripts/build-stasis-data.mjs` reads sibling checkout artifacts from
`../mooncat-holder-activity` and `../catmoon`:

```text
holders.json + holding-tenure.json + dormancy-findings.md
       + CatMoon mooncat-names.json + allcats.png
       -> pinned-reference/schema validation
       -> holder and cat joins
       -> deterministic bands and presentation fields
       -> public/data/stasis.json + public/img/allcats.png
       -> self-contained browser runtime using generated local artifacts
```

The generator validates both ownership-reference objects against the pinned
Ethereum block/timestamp, checks source schema versions and full-snapshot
totals, verifies findings text, joins cats by rescue order and CatID, and
copies the atlas only after the source checks pass. The runtime does not
re-query those sources.

## Vite and vanilla TypeScript

`index.html` owns the static shell, preload hints, methodology text, menu
buttons, and field container. `src/main.ts` imports local Oxanium 400/600
styles, loads generated JSON plus the atlas, builds the layout, renders Canvas
chunks, and handles controls/inspection. `src/styles.css` owns responsive
layout, menu styling, the continuous stage, inspection annotation, atmosphere
panels, and the Moon surface ending. There is no UI framework and no
continuous animation loop.

The runtime's only data endpoints are local `/data/stasis.json` and
`/img/allcats.png`. It checks the loaded atlas dimensions against the generated
schema and rejects a dataset whose cat count does not match its cohort. There
is no UI framework, and the normal browser runtime does not depend on sibling
repositories, RPC, or external APIs; package and build dependencies still
belong to the source project and its build process.

## Provenance class separation

Holder records, cat records, names, holding-tenure surfaces, rescue
classifications, and the atlas are joined for presentation but remain
distinct fields and input classes. A generated join is reproducible output;
it does not promote a sibling-repo field to canonical MoonCat or live-state
truth.
