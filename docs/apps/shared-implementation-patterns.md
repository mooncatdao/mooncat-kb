# Shared application implementation patterns

These patterns are distilled from the pinned CatMoon and Stasis source
reviews. They are implementation guidance, not MoonCat protocol facts.

## Identifier discipline

Keep rescue order, bytes5 Cat ID, contract-scoped token IDs, holder/wallet
addresses, generated holder references, and local array indexes distinct.
Name the contract or table whenever a token-like value is used. Never infer a
conversion from numeric coincidence or from an adjacent contract's behavior.

## Evidence classes

Label each result as source-code behavior, pinned chain/presentation snapshot,
generated local artifact, deterministic derivation, community classification,
live API/RPC result, or unresolved boundary. A source checkout can document
capability without proving deployment; a generated join can be reproducible
without becoming canonical; a pinned ownership field can be historical
without being current.

## Deterministic data and rendering

The reusable pipeline shape is:

```text
source artifacts
  -> schema and provenance validation
  -> deterministic joins and derived fields
  -> invariant checks
  -> generated presentation artifact
  -> self-contained runtime
```

Define atlas dimensions and tile indexing once. Derive layout from stable
identifiers and snapshot data. Keep layout separate from viewport allocation;
make lazy loading observable through allocation/release invariants. Keep base
imagery, dynamic overlays, and inspection layers independently controllable.

## Interaction state

Route new interactions through one state model. Normalize external input at
the boundary, preserve unrelated URL state, and choose `replaceState` versus
`pushState` intentionally. Reuse existing focus, pinning, detail, and overlay
paths rather than creating parallel URL or selection systems. Treat hover as
transient and pinning as an explicit state suitable for touch and keyboard
use.

## Failure and persistence boundaries

Validate generated inputs before writing outputs. Prefer retryable, fail-closed
loaders for required data and make optional enrichment visibly optional.
Version local storage keys, sanitize every field, and fall back to markup or
in-memory defaults when storage is malformed or unavailable. Keep session-only
UI state separate from local preferences and both separate from wallet
authentication or current ownership.

## Asset and license provenance

Source-code licenses, generated data, MoonCat-derived pixels, copied atlas or
atmosphere assets, fonts, and third-party logos may have different rights.
A project-level license statement must not be generalized to every included
asset.

## Case studies

- [CatMoon](catmoon/overview.md) — interactive 3D module boundaries and
  shareable selection state.
- [Stasis](stasis/overview.md) — pinned data pipeline and continuous Canvas
  presentation.
