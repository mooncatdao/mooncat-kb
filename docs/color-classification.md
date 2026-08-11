# MoonCat Color Classification

## Status and Scope

`data/color-classification.json` defines the current derived human-facing label policy used by both the full 25,440-row population index and the retained bounded visual-trait fixture. It is for search, filtering, and display. It does not replace the source fields `hueInt`, `hueName`, `pale`, or `genesis`.

The selected policy follows the accepted MoonCatRescue ADR's integer-truncated, 15-degree-shifted 30-degree hue boundaries. The policy represents those boundaries as exact start-inclusive, end-exclusive integer intervals after modulo-360 normalization. This preserves the ADR's lower-exclusive, upper-inclusive integer result: red is `[346, 360)` plus `[0, 16)`, orange is `[16, 46)`, and so on through fuchsia `[316, 346)`.

## Derived Labels

The normal circular labels are Red, Orange, Yellow, Chartreuse, Green, Teal, Cyan, Sky Blue, Blue, Purple, Magenta, and Fuchsia. `Sky Blue` deliberately normalizes the source snapshot's compact `skyblue` spelling for display; the raw `hueName` remains unchanged.

The policy considered raw `hueName`, unshifted 30-degree buckets, ADR-shifted buckets, and Genesis black/white categories. It selects the ADR-shifted buckets because they are the reviewed current-maintainer technical boundary definition. It rejects unshifted buckets because they would move the documented boundaries.

## Genesis and Pale Handling

Genesis Black and Genesis White are evaluated before circular hue classification, only when the source fields agree on the Genesis marker and the exact `1000`/`black` or `2000`/`white` sentinel pair. Those sentinels are not hue degrees and are never reduced modulo 360. Inconsistent sentinel combinations remain explicitly unresolved.

`pale` is retained as a separate boolean modifier. It does not alter the derived label because this policy does not establish an exact rendering, palette, or palette-orientation rule for pale MoonCats. The derived object therefore records `paletteOrientation: "not-classified"`.

## Integration and Limits

The population generator and `scripts/generate-visual-traits.py` add a `colorClassification` object to generated rows from the policy file. It records the scheme ID/version, label, bucket or special category, raw-field modifiers, method, source-hue relation, and derived provenance. The raw visual traits and the existing LibMoonCat mismatch report remain separate; a display-vocabulary normalization is not a source disagreement.

Run `python scripts/validate-color-classification.py` for policy boundary, wrap, special-sentinel, pale, and version checks. Run `python scripts/validate-visual-traits.py` to verify the retained fixture uses the policy and covers all normal buckets plus both Genesis categories. Run `python scripts/validate-mooncat-population.py` to validate policy-derived color fields across the complete generated population.

This policy is not a canonical on-chain trait list, rarity model, palette/RGB/hex record, normal-versus-inverted palette assertion, or render proof. The full population and the 64-row fixture both retain raw source fields alongside the derived display label; neither artifact proves live rendering or current chain state.
