# MoonCat Knowledge Base

Plain-text and Markdown knowledge base for MoonCat technical facts, explanations, and source notes.

Start here:

- `data/agent-index.json` — preferred first load target for task-specific agent context routing
- `data/agent-query-cases.json` and `data/agent-context-packs.json` — deterministic coding-agent benchmark and minimal generated context packs
- `docs/agent-usage.md` — route/pack selection, uncertainty, and validation workflow
- `data/agent-coding-patterns.json` — pointers to tested local coding patterns and validators
- `data/kb-manifest.json` and `data/kb-audit-report.json` — generated maintained-file inventory and latest bounded integrity-audit report
- `docs/kb-integrity.md` — audit scope, manifest policy, warning limits, and future-import guidance
- `data/architecture-decisions.json` and `docs/architecture-decisions.md` — 18-record pinned dev-environment ADR inventory and design-intent boundaries
- `docs/overview.md` — high-level context
- `docs/source-map.md` — where to find canonical or supporting sources
- `docs/glossary.md` — short definitions for recurring terms
- `docs/mooncat-types.md` — category definitions and status notes
- `docs/color-math.md` — hue comparison method notes
- `docs/traits-and-ids.md` — trait and ID mapping rules
- `docs/identifier-conventions.md` — identifier terminology and conversion status
- `docs/contracts.md` — compact contract identities, roles, and reviewed-surface notes
- `docs/mooncat-svgs.md` — compact MoonCatSVGs internals review
- `docs/rescue-history.md` — rescue range and historical bucket notes
- `docs/rescue-mining.md` — original browser rescue/mining seed-search notes
- `docs/api-notes.md` — API endpoint placeholder notes
- `data/sources.json` — curated source/provenance index
- `data/mooncat-types.json` — top-level category scaffold
- `data/character-cats.json` — community-curated character-cat definitions and partial hue-range notes
- `data/character-cat-index.json` — exact community-curated character-cat membership/index numbers
- `data/special-cats.json` — special-category placeholder scaffold
- `data/color-hues.json` — hue/coating scaffold plus community-curated character hue notes
- `data/trait-index.json` — trait schema metadata and curated per-cat model guidance
- `data/identifier-conventions.json` — identifier terminology and conversion-status reference
- `data/rescue-ranges.json` — rescue range definitions, methods, and status notes
- `data/rescue-buckets.json` — canonical-derived rescue/history bucket membership arrays
- `data/rescue-mining.json` — compact rescue/mining algorithm reference
- `data/contracts.json` — verified and partially verified contract identity index
- `data/contract-surfaces.json` — compact routing index for contract roles and reviewed surfaces
- `data/mooncat-svg-internals.json` — compact reviewed MoonCatSVGs behavior
- `data/ipfs-cids.json` — source-observed IPFS artifact references and limitations
- `data/api-endpoints.json` — compact OpenAPI-derived endpoint manifest
- `data/api-examples.json` — checked and manifest-derived request examples
- `data/project-links.json` — project navigation links with verification status
- `data/link-index.json` — preserved research and navigation links
- `data/protocol-constants.json` — first imported contract-derived protocol constants
- `data/task-recipes.json` — agent workflow sequencing, guardrails, and stop conditions
- `data/kb-gap-index.json` — current compact KB gap and routing audit
- `llms.txt` — compact entrypoint list for LLMs and crawlers
- `AGENTS.md` — instructions for LLM/code agents
- `examples/rescue-mining.js` — wallet-free normal MoonCat seed-search example
- `examples/rescue-mining-widget/` — embeddable wallet-free rescue-mining widget example

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
