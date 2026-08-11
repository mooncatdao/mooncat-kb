# MoonCat Knowledge Base

Plain-text and Markdown knowledge base for MoonCat technical facts, explanations, and source notes.

Start here:

### Agent entrypoints

- `data/agent-index.json` — preferred first load target for task-specific agent context routing
- `data/agent-query-cases.json` and `data/agent-context-packs.json` — deterministic coding-agent benchmark and minimal generated context packs
- `data/factual-retrieval-cases.json` and `docs/factual-retrieval-benchmark.md` — provenance-aware factual retrieval cases, separate from coding-route validation
- `docs/agent-usage.md` and `data/agent-coding-patterns.json` — route selection, uncertainty, and tested local workflow pointers
- `AGENTS.md` and `llms.txt` — instructions and compact entrypoints for agents and crawlers

### Core generated datasets

- `data/mooncat-population/manifest.json` and `docs/mooncat-population-index.md` — deterministic 25,440-row sharded lookup with exhaustive validation, pinned finalized names, and a zero-network query CLI
- `data/genesis-cats.json` and `docs/genesis-cats.md` — source-backed Genesis population and historical reconstruction with current-state limits
- `data/name-index-integration.json`, `data/mooncat-names.json`, and `docs/name-index-integration.md` — revision-bounded finalized naming evidence and canonical finalized `CatNamed` history
- `data/contract-registry.json`, `data/event-registry.json`, and `docs/contract-abi-event-registry.md` — exact local ABI/event registry, contract-scoped identifiers, and zero-network indexer recipes
- `data/kb-manifest.json`, `data/kb-audit-report.json`, and `docs/kb-integrity.md` — generated maintained-file inventory, bounded integrity audit, and manifest policy

### Technical subsystems

- `docs/overview.md` — high-level context; `docs/source-map.md` — canonical and supporting source routing
- `docs/mooncat-types.md`, `docs/traits-and-ids.md`, `docs/traits.md`, and `docs/generated-trait-data.md` — category, trait, and retained fixture guidance
- `docs/identifier-conventions.md` and `docs/identifier-verification.md` — identifier terminology, conversion rules, and executable verification boundaries
- `docs/contracts.md` and `data/contract-surfaces.json` — compact contract identities, roles, and reviewed surfaces
- `docs/mooncat-accessory-system.md`, `docs/mooncat-accessories.md`, and `docs/mooncat-accessory-images.md` — accessory lifecycle and rendering reviews
- `docs/mooncat-svgs.md`, `docs/color-math.md`, and `docs/color-classification.md` — SVG internals, hue methods, and derived display labels
- `docs/mooncat-naming.md`, `data/mooncat-naming.json`, and `data/mooncat-accessory-system.json` — naming semantics and accessory-system integration index

### Supporting indexes and references

- `data/sources.json` — curated source/provenance index
- `data/architecture-decisions.json` and `docs/architecture-decisions.md` — pinned development-environment ADR inventory and intent boundaries
- `data/chainstation-surfaces.json` and `docs/chainstation-surfaces.md` — pinned ChainStation implementation/data surface audit
- `docs/glossary.md`, `docs/rescue-history.md`, `docs/rescue-mining.md`, and `docs/api-notes.md` — recurring terms, rescue history, mining, and API notes
- `data/mooncat-types.json`, `data/special-cats.json`, `data/color-hues.json`, and `data/trait-index.json` — category, hue, and trait metadata scaffolds
- `data/character-cats.json`, `data/character-cat-index.json`, `data/rescue-ranges.json`, `data/rescue-buckets.json`, and `data/rescue-mining.json` — curated classifications, ranges, buckets, and algorithm notes
- `data/identifier-conventions.json`, `data/contracts.json`, `data/mooncat-svg-internals.json`, and `data/protocol-constants.json` — identifier, contract, SVG, and protocol metadata
- `data/ipfs-cids.json`, `data/api-endpoints.json`, `data/api-examples.json`, `data/project-links.json`, and `data/link-index.json` — artifact, API, navigation, and preserved research indexes
- `data/task-recipes.json` and `data/kb-gap-index.json` — workflow guardrails and current routing/gap audit
- `examples/rescue-mining.js` and `examples/rescue-mining-widget/` — wallet-free rescue-mining examples

Repository conventions:

- `docs/` contains explanations, reasoning, and source notes.
- `data/` contains exact canonical or curated data.
- Incomplete information is marked explicitly instead of guessed.

## Validation

Run the structural KB validator from the repo root:

```sh
python scripts/validate-kb.py
```

It checks `data/*.json` parsing, required routed file references, and `sourceRef` consistency.
The script locates the repo root automatically when invoked by path from a subdirectory.

For coding-agent route/pack changes, also run `python scripts/generate-agent-context-packs.py --check` and `python scripts/validate-agent-routing.py`.

For Genesis population or member-mapping changes, run `python scripts/validate-genesis-cats.py` before the general checks.

For contract ABI/event registry changes, run `python scripts/extract-contract-abis.py --check` and `python scripts/validate-contract-registry.py`.

For full-population index changes or refresh checks, run:

```sh
python scripts/generate-mooncat-population.py --check
python scripts/validate-mooncat-population.py
python scripts/diff-mooncat-population.py --check
```

These population, ABI, manifest, and audit checks are deterministic and zero-network; they validate local generated artifacts and provenance boundaries rather than live chain state.

For the repo-wide zero-network integrity workflow, run:

```sh
python scripts/generate-kb-manifest.py --check
python scripts/validate-kb-manifest.py
python scripts/audit-kb.py
```

## License

This knowledge base is released under CC0 1.0 Universal (`CC0-1.0`) unless otherwise noted. Attribution is not required, but appreciated.

Suggested attribution:

> Uses data and documentation from MoonCat KB.
> https://github.com/mooncatdao/mooncat-kb

Reference files under `references/` and vendored files under `examples/**/vendor/` may have upstream licenses or terms and are not automatically relicensed under CC0.
