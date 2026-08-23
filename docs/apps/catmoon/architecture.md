# CatMoon architecture

## Coordinator and modules

The browser entrypoint imports Three.js, TrackballControls, the feature
modules listed in [the overview](overview.md), and the stylesheet. State is
kept in the coordinator where cross-feature sequencing matters: active filter,
hovered/pinned rescue order, detail-dialog request token, wallet lookup,
render mode, and local settings. The modules expose narrow normalization and
loading helpers rather than creating alternate application state machines.

## Rhombic-triacontahedron geometry

`src/js/catmoon-geometry.js` builds an icosahedron, dualizes its vertices and
faces, and uses the 30 edge relationships to produce the 30 rhombus faces of
the moon. Each face is a four-vertex indexed mesh with diamond UVs. The
construction asserts both geometry count and coverage:

```text
30 faces × 848 cats per face = 25,440 atlas entries
```

The rescue-order address is intentionally explicit:

```text
faceIndex = floor(rescueOrder / 848)
slotId    = rescueOrder mod 848
```

The slot metadata maps the slot to texture-space center and hit rectangle.
The target resolver then maps the hit to a local point, normal, and projected
face-up vector for focus and pin placement. This is a CatMoon presentation
address, not a generic ERC-721 token conversion.

## Atlas and texture paths

`src/js/config.js` defines a 160 × 159 atlas of 21 × 22 pixel tiles, so the
atlas is 3,360 × 3,498 pixels and `MAX_ID` is 25,439. The source paths are:

- `/img/allcats.png` for preview/detail atlas access;
- `/img/tri-faces/tri-face-00.png` through `tri-face-29.png` for the 3D
  rhombus-face textures;
- `/img/tri-faces/tri-face-slots.compact.json` for validated slot metadata;
- `/img/filters/<filter>/tri-face-<face>.png` for prepared filter overlays;
- `/data/mooncat-filters.json` and `/data/mooncat-names.json` for filter
  membership and names;
- `/data/mooncat-details/face-<face>.json` for lazy detail shards.

The 3D face meshes begin with placeholder textures, then load their required
face textures asynchronously. A failed required face texture rejects the
ready promise and increments the texture-error counter. Filter manifests
limit overlay loads to the faces listed for a filter; an invalid or missing
manifest falls back to trying all 30 faces. Named Cats, Character Cats, and
Wallet Cats use runtime-generated membership overlays, while the other
configured categories can use prepared textures.

`allcats.png` is deliberately loaded by the preview manager only when a
preview/detail surface needs it. This keeps the large atlas out of the
initial path for features that can use the face textures alone.

## Render modes

The renderer normalizes persisted values to `pixel`, `smooth`, `afterimage`,
`depth-of-field`, or `lit`; obsolete aliases normalize to a supported mode.
Texture filtering and mipmap settings are changed through one texture manager.
The afterimage pipeline preserves alpha, and the depth-of-field pipeline saves
clean alpha and restores it after Bokeh processing. Lit mode switches the
base geometry between basic and standard materials and manages scene lights.

Source paths: `src/js/config.js`, `src/js/catmoon-geometry.js`,
`src/js/rendering.js`, `src/js/filters.js`, and `src/js/preview.js`.
