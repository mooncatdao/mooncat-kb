# Application implementation references

This is the canonical index for bounded implementation notes about the
community-maintained CatMoon and Stasis applications. These pages describe
source-code behavior at the revisions recorded in `data/sources.json`; they
are not protocol specifications, canonical MoonCat datasets, current
ownership/deployment evidence, live API or RPC results, or browser visual
checks.

## Choose a reference

- [CatMoon overview](catmoon/overview.md) — revision, active source tree,
  dependencies, and evidence boundary.
- [CatMoon architecture](catmoon/architecture.md) — Vite/Three.js modules,
  geometry, atlas, texture paths, and loading.
- [CatMoon domain rules](catmoon/domain-rules.md) — identifier kinds,
  filters, classification unions, and invariants.
- [CatMoon interaction patterns](catmoon/interaction-patterns.md) — rescue
  URLs, selection, wallets, local history, and session state.
- [CatMoon decisions and failures](catmoon/decisions-and-failures.md) —
  detail/export parity, themes, accessibility, and failure paths.
- [CatMoon validation](catmoon/validation.md) — source-documented commands
  and ingestion limits.
- [Stasis overview](stasis/overview.md) — revision, pinned snapshot, dormancy
  meaning, rights, and runtime boundary.
- [Stasis architecture](stasis/architecture.md) — source-to-presentation
  pipeline and vanilla TypeScript/Canvas runtime.
- [Stasis rendering](stasis/rendering.md) — age ordering, continuous layout,
  deterministic disorder, chunks, scroll anchoring, and DPR.
- [Stasis data contracts](stasis/data-contracts.md) — schema joins and
  validation invariants.
- [Stasis visual rationale](stasis/visual-rationale.md) — inspection,
  accessibility, settings, atmosphere, and responsive tradeoffs.
- [Stasis validation](stasis/validation.md) — source-documented commands and
  static/runtime limits.
- [Shared implementation patterns](shared-implementation-patterns.md) —
  reusable evidence, identifier, data-pipeline, rendering, interaction, and
  asset-provenance patterns.

## Evidence classes

Keep these classes separate when reusing a note:

1. source-code behavior at a pinned commit;
2. checked-in generated output and its deterministic inputs;
3. pinned historical chain or presentation snapshot;
4. community or application-local classification;
5. live API/RPC/deployment/current-state evidence, which is outside these
   notes unless separately verified.

CatMoon is registered as `zibzub-catmoon-repository` and Stasis as
`zibzub-stasis-repository` in `data/sources.json`. Their URLs were derived
from local Git remotes during review and were not live-checked in this pass.
