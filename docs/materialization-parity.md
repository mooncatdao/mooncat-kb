# Materialization Parity Fixtures

## Scope

`data/materialization-parity-cases.json` selects eight fixed MoonCats from the existing visual-trait prototype. The generated `data/materialization-parity-results.json` compares the same explicit `catIdBytes5` and `rescueOrder` across the checked-in trait snapshot, LibMoonCat, and mooncatparser. It is deterministic and zero-network.

The set covers first and last rescue, black and white Genesis, pale and non-pale cats, both facing directions, all four poses, a rescue-year boundary, and the existing Genesis sentinel plus `skyblue`/`skyBlue` mismatch edges.

## Parity Levels

- Identifier parity passes only when the fixture ID/order agrees with the trait snapshot and LibMoonCat forward/reverse lookup.
- Source-trait parity compares shared traits. Five declared differences remain intentional: three compact `skyblue` versus LibMoonCat `skyBlue` values, plus black/white Genesis snapshot hue sentinels `1000`/`2000` versus LibMoonCat `-1`/`-2`.
- Structural render parity runs mooncatparser twice and normalizes each nested grid to row/width counts, occupied-coordinate SHA-256, bounding box, distinct-color count, sorted per-color cell counts, and a color-partition SHA-256. It retains geometry and color-role distribution while removing literal color strings, DOM/canvas wrappers, SVG whitespace, attribute order, metadata, and wrapper elements.
- Color/palette parity is explicitly not executable: no checked-in artifact supplies executable per-cat MoonCatColors output. A derived display label is recorded separately but never used as palette evidence.
- Exact serialization parity is explicitly not executable: no MoonCatSVGs output is checked in and LibMoonCat image helpers require a DOM. A strict serialization mismatch would not automatically disprove structural equivalence anyway.
- Documented materialization parity is documented-only. The reviewed MoonCatSVGs path accepts the same bytes5/rescue-order identity and consumes traits/colors, but the harness does not fabricate contract SVG output.
- Accessory composition is deferred. Deterministic definitions, owned records, image data, palettes, layering inputs, and current worn state are absent; the harness never infers them.

## Running the Harness

```text
python scripts/generate-materialization-parity.py
python scripts/generate-materialization-parity.py --check
python scripts/validate-materialization-parity.py
```

The generator invokes only checked-in Node/Python inputs. The validator checks sourceRefs, explicit identifier alignment, fixture/result identity, expected status enums, structural fingerprints, coverage, intentional differences, and generated-result determinism.

## Consumer Limits

Fixture success does not establish full-population parity, exact renderer equivalence, canonical palette values, RGB/hex values, normal/inverted palette orientation, current ownership, acclimation/glow state, or currently worn accessories. It is a small source-bound cross-check, not a live materialization service.
