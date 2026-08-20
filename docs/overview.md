# Overview

MoonCat KB is a mature, local technical knowledge base built for bounded,
source-aware MoonCat questions and implementation work. It separates exact
machine-readable artifacts from explanation, upstream evidence, executable
examples, agent workflow metadata, and generated integrity records.

For the goal-oriented human introduction, start with
[`mooncat-kb-guide.md`](mooncat-kb-guide.md). This overview describes the
repository architecture and scope without duplicating that guide.

The public-release candidate assessment and its evidence-backed exceptions are
in [`public-release-readiness.md`](public-release-readiness.md).

## Architecture

- `data/` contains compact canonical, curated, community-curated, workflow, and
  generated artifacts. Status, source references, scope, and limitations define
  how each file may be used.
- `docs/` explains concepts, provenance, derivation, design choices, and
  uncertainty while pointing to exact data rather than copying it.
- `references/` preserves reviewed upstream inputs. Reference status does not
  promote a file into curated KB truth.
- `examples/` contains bounded executable patterns: wallet-free rescue mining,
  static profile resolution, and supplied-log event decoding.
- `scripts/` owns deterministic generators, focused validators, query tools,
  and the repo-wide zero-network audit.
- `data/agent-index.json`, `data/task-recipes.json`, and generated context packs
  route coding agents to the smallest useful evidence set with explicit stop
  conditions.

The generated maintained-file manifest connects these layers by recording file
roles, hashes, routes, recipes, and validator relationships. The audit checks
that the local repository remains internally coherent.

## Current capability areas

The KB currently provides:

- a generated and exhaustively validated static index for all 25,440 MoonCats,
  including pinned finalized name enrichment and field-level provenance;
- tested identifier conversion rules and negative boundaries across original,
  Acclimated, WMCR, accessory, and contextual index domains;
- exact local ABI artifacts for nine contracts, a ten-contract registry with
  CatNamer kept semantic-only, 32 exact events, and five bounded indexer recipes;
- source-backed naming, Genesis, trait, color, rendering, rescue-mining,
  accessory lifecycle/materialization, and selected ChainStation/ADR reviews;
- deterministic coding-route and factual-retrieval constraint suites;
- three executable example families that demonstrate safe use without adding a
  live service or competing canonical dataset; and
- a complete maintained-file inventory plus a bounded zero-network integrity
  audit.

For complete static per-cat lookup, use
[`mooncat-population-index.md`](mooncat-population-index.md). For exact contract
and event work, use
[`contract-abi-event-registry.md`](contract-abi-event-registry.md). For source
selection and trust, use [`reference-policy.md`](reference-policy.md).

## Scope boundaries

The KB is comprehensive in several reviewed static domains but deliberately
incomplete outside them. It does not claim current ownership, balances,
marketplace activity, accessory wear, contract storage, API availability,
deployment status, provisional naming state, or complete/newer event history.
Those questions require separately authorized live verification.

Generated data is reproducible from checked-in inputs, not automatically
current. Exact ABI extraction proves alignment with reviewed local artifacts,
not deployed bytecode. Event definitions and decoded supplied logs are
historical/interface evidence, not current-state reconstruction. Community
classifications and derived display labels retain their documented trust limits.

## Editing principles

- Do not invent MoonCat IDs, exact mappings, addresses, sources, dates, or live
  state.
- Prefer primary evidence and preserve conflicts or incomplete provenance.
- Keep identifier kinds and contract scope explicit.
- Update data and explanatory Markdown together when a maintained knowledge
  model requires both.
- Reuse existing routes, recipes, generated artifacts, and tested examples
  before creating a new layer.
- Validate the focused subsystem, then refresh dependent context, manifest, and
  audit artifacts when their inputs change.
