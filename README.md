# MoonCat Knowledge Base

MoonCat KB is a local, source-aware technical knowledge base for reliable
MoonCat lookup, integration, research, and agent-assisted development. It
combines curated explanations, exact indexes, reproducible generated data,
tested examples, provenance boundaries, and zero-network validation.

Start with [`docs/mooncat-kb-guide.md`](docs/mooncat-kb-guide.md). It explains
what the KB can do, how to use it with people or AI agents, how to distinguish
static evidence from current information, and how to find useful areas to
improve.

## Main capabilities

- Complete static lookup: `data/mooncat-population/manifest.json` describes a
  validated 25,440-row sharded index with pinned finalized names and explicit
  live-state exclusions.
- Complete static renders: `data/mooncat-renders/manifest.json` describes
  compact parser-derived palettes and X-major unit cells for all 25,440 cats,
  suitable for deterministic downstream SVG reconstruction without stored
  image files or network access.
- Identifier safety: `docs/identifier-conventions.md` and
  `docs/identifier-verification.md` keep bytes5 Cat IDs, rescue order, contract
  token IDs, wrapper IDs, accessory IDs, and local indexes distinct.
- Contracts and events: `data/contract-registry.json`,
  `data/event-registry.json`, and `docs/contract-abi-event-registry.md` provide
  exact local ABI/event shapes, topic0 values, and scoped semantics.
- Naming, traits, rendering, and accessories: `docs/source-map.md` routes to
  focused source-backed subsystem docs and data.
- Agent workflow and integrity: `data/agent-index.json`,
  `data/task-recipes.json`, generated context packs, and the manifest/audit
  pipeline provide narrow context, guardrails, and repeatable checks.

## Executable examples

- [`examples/rescue-mining-widget/`](examples/rescue-mining-widget/) and
  `examples/rescue-mining.js`: wallet-free rescue-seed search without
  transaction submission or current-availability claims.
- [`examples/mooncat-profile/`](examples/mooncat-profile/): dependency-free ESM
  lookup of an explicitly tagged Cat ID or rescue order through the existing
  population shards, returning the existing row and provenance.
- [`examples/mooncat-event-decoder/`](examples/mooncat-event-decoder/):
  dependency-free decoding of an already-supplied log using explicit reviewed
  contract context and the existing event registry, without fetching history
  or inferring current state.

## Agent and contributor entrypoints

- `AGENTS.md` — repository rules and required validation workflow
- `data/agent-index.json` — first-load task routing
- `data/task-recipes.json` — workflow sequencing, guardrails, and stop conditions
- `data/agent-context-packs.json` — generated minimal coding context
- `data/agent-coding-patterns.json` — tested implementation/validator pointers
- `data/kb-gap-index.json` — current usability gaps and recommended next passes
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution and validation guidance

`data/` holds compact canonical, curated, or generated artifacts; read each
file's status and provenance. `docs/` holds explanations and reasoning.
`references/` holds upstream evidence and is not curated KB data by default.
Incomplete information stays explicit rather than being guessed.

## Validation

Run the general structural check:

```sh
python scripts/validate-kb.py
```

Run focused validators for the subsystem you changed. For routing or maintained
documentation changes, finish with:

```sh
python scripts/generate-agent-context-packs.py --check
python scripts/validate-agent-routing.py
python scripts/generate-mooncat-renders.py --check
python scripts/validate-mooncat-renders.py
python scripts/generate-kb-manifest.py --check
python scripts/validate-kb-manifest.py
python scripts/audit-kb.py
git diff --check
```

These checks validate local artifacts and provenance boundaries; they do not
establish live chain, API, marketplace, ownership, accessory, or naming state.

## License

This knowledge base is released under CC0 1.0 Universal (`CC0-1.0`) unless
otherwise noted. Attribution is not required, but appreciated.

> Uses data and documentation from MoonCat KB.
> https://github.com/mooncatdao/mooncat-kb

Reference files under `references/` and vendored files under
`examples/**/vendor/` may have upstream licenses or terms and are not
automatically relicensed under CC0.

`data/mooncat-renders/manifest.json` and `docs/mooncat-renders.md` preserve the
unresolved licensing boundary for the parser snapshot and parser-derived
visual output; this repository does not make a licensing determination for
either.
