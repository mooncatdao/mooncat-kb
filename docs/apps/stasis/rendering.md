# Stasis rendering

## Exact-age ordering and layout

`src/main.ts` sorts a copy of the generated cat array by descending
`lastOutgoingTimestamp`, with rescue order as the deterministic tie-breaker.
The top of the field is therefore the most recently active member of the
pinned dormant cohort and the bottom is the oldest under that snapshot.

The layout is one global field, not independent band cards. Sprite scale and
padding respond to width. Complete rows are justified across the available
width; the final incomplete row is centered. Vertical and horizontal gaps
settle as age increases, while stable sine-derived offsets create deterministic
disorder that fades to zero by the 8-year threshold. The source deliberately
does not rotate sprites or continuously animate them.

## Atlas indexing and Canvas chunks

For each positioned cat, rescue order addresses the 160 × 159 atlas:

```text
atlasColumn = rescueOrder mod 160
atlasRow    = floor(rescueOrder / 160)
```

The source tile is 21 × 22 pixels. Canvas uses `imageSmoothingEnabled =
false`, snaps draw positions to device pixels, and caps `devicePixelRatio` at
2. The tall stage is divided into roughly 1,200-pixel chunks. An
`IntersectionObserver` with a 1,400-pixel root margin allocates canvases near
the viewport and removes them when they leave that working range. If the API
is unavailable, the fallback renders all chunks. Redraws update allocated
chunks only.

## Scroll anchoring and age outlines

The scroll bubble chooses the cat nearest the viewport center at
`SCROLL_ANCHOR_Y_FRACTION = 0.75`, then displays its lower age-band label. A
precomputed SVG overlay can outline each of the six age bands without changing
the Canvas sprite layer. Resize rebuilds the layout for the new width and
releases the prior renderer.

These are deterministic presentation rules. They do not alter the generated
dormancy classification or provide additional chain evidence.

Source paths: `src/main.ts` constants and `buildLayout`, `stableFraction`,
`buildChunks`, `renderChunk`, `createAgeBucketOverlay`, and the resize/runtime
bootstrap; `src/styles.css` for stage/chunk layering.
