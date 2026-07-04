# MoonCat Knowledge Base

Plain-text and Markdown knowledge base for MoonCat technical facts, explanations, and source notes.

Start here:

- `data/agent-index.json` — preferred first load target for task-specific agent context routing
- `docs/overview.md` — high-level context
- `docs/source-map.md` — where to find canonical or supporting sources
- `docs/glossary.md` — short definitions for recurring terms
- `docs/mooncat-types.md` — category definitions and status notes
- `docs/color-math.md` — hue comparison method notes
- `docs/traits-and-ids.md` — trait and ID mapping rules
- `docs/identifier-conventions.md` — identifier terminology and conversion status
- `docs/contracts.md` — contract placeholder notes
- `docs/rescue-history.md` — rescue range placeholder notes
- `docs/api-notes.md` — API endpoint placeholder notes
- `data/sources.json` — curated source/provenance index
- `data/mooncat-types.json` — top-level category scaffold
- `data/character-cats.json` — community-curated character-cat definitions and partial hue-range notes
- `data/character-cat-index.json` — exact community-curated character-cat membership/index numbers
- `data/special-cats.json` — special-category placeholder scaffold
- `data/color-hues.json` — hue/coating scaffold plus community-curated character hue notes
- `data/trait-index.json` — trait mapping placeholder scaffold
- `data/identifier-conventions.json` — identifier terminology and conversion-status reference
- `data/rescue-ranges.json` — rescue range placeholder scaffold
- `data/rescue-buckets.json` — canonical-derived rescue/history bucket membership arrays
- `data/contracts.json` — contract placeholder scaffold
- `data/ipfs-cids.json` — IPFS CID placeholder scaffold
- `data/api-endpoints.json` — API endpoint placeholder scaffold
- `data/project-links.json` — project link placeholder scaffold
- `data/link-index.json` — preserved research and navigation links
- `data/protocol-constants.json` — first imported contract-derived protocol constants
- `llms.txt` — compact entrypoint list for LLMs and crawlers
- `AGENTS.md` — instructions for LLM/code agents
- `context.md` — setup notes that informed this initial scaffold

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
