# AGENTS.md

This repository is a MoonCat technical knowledge base for bounded, source-aware research and implementation work.

## Repository layers

- Use `data/` for exact IDs, numeric values, curated/generated indexes, routing metadata, and compact machine-readable facts. Read each file's status, scope, source references, and limitations.
- Use `docs/` for explanations, provenance boundaries, derivation notes, and human-readable context.
- Treat `references/` as upstream/reference evidence, not curated KB truth by default.
- Treat `examples/` as narrow tested construction/conformance patterns, not canonical datasets, live services, or application frameworks.
- Treat `scripts/` as the owners of deterministic generators, queries, focused validators, and the zero-network integrity audit.
- Use `docs/mooncat-kb-guide.md` for broad human orientation. Do not load the whole repository when a narrow route can answer the task.

## Source of truth and provenance rules

- Do not invent MoonCat IDs, names, contract addresses, hashes, CIDs, URLs, dates, exact trait mappings, or source claims.
- Use `data/sources.json` as the curated source index. Add a source entry before relying on a non-obvious external reference in curated KB data.
- Prefer primary evidence for protocol facts, contracts, APIs, metadata, and historical claims.
- Preserve `partial`, `incomplete`, `community-curated`, `reference-only`, revision, and freshness limits instead of normalizing them away.
- If sources conflict, document the conflict and their trust boundaries instead of silently choosing one.
- Generated artifacts are reproducible from checked-in inputs; generation does not make those inputs live or current.
- Historical events, pinned snapshots, local ABIs, ADRs, and generated population rows do not by themselves establish current chain, API, ownership, marketplace, naming, accessory, deployment, or storage state.

## Identifier rules

- Keep identifier kinds explicit and contract-scoped.
- Do not treat bytes5 Cat IDs, rescue order, generic/ERC token IDs, Acclimated token IDs, WMCR token IDs, accessory IDs, palette indexes, owned-record indexes, local array indexes, addresses, or marketplace IDs as interchangeable without the documented scoped evidence.
- Use `data/identifier-conventions.json` and the relevant route/fixture before converting identifiers.
- Stop rather than infer a conversion from numeric coincidence or an adjacent contract's behavior.

## Agent workflow rules

- Inspect existing files before editing and keep changes small and scoped to the requested knowledge area.
- Start with `data/agent-index.json` and choose the narrowest matching route. Load primary files first and optional files only when the task needs them.
- Use `data/task-recipes.json` when a task needs ordered steps, outputs, guardrails, or stop conditions across multiple files.
- For covered coding work, use the matching record in `data/agent-context-packs.json`; packs reference evidence and do not replace underlying source limits.
- Check `data/agent-coding-patterns.json` for an existing tested example or validator before inventing a new implementation pattern.
- Use the `review-kb-gaps` route and `data/kb-gap-index.json` for planning and improvement discovery. Gap notes are planning metadata, not MoonCat facts.
- Preserve pack warnings, forbidden claims, identifier scope, provenance limits, and stop conditions as implementation constraints.
- Stop when a requested claim needs missing provenance, an unsupported identifier conversion, unreviewed source, or separately authorized live/current verification.
- Do not remove `README.md` or `AGENTS.md`.

## Validation workflow

- Run the focused generator, test, or validator for the subsystem you changed before broad repository checks.
- Validate edited JSON and keep it human-readable.
- When routing inputs, routes, recipes, benchmark context, or routed docs change, regenerate/check agent context packs and run `python scripts/validate-agent-routing.py`.
- When maintained files, routes, recipes, or path classifications change, regenerate/check `data/kb-manifest.json` and run `python scripts/validate-kb-manifest.py`.
- Run `python scripts/validate-kb.py` for the general structural/source-reference check.
- Run `python scripts/audit-kb.py` after dependent generated artifacts are current when the change affects repository-wide integrity coverage.
- Use `CONTRIBUTING.md` for validation-by-change-type guidance rather than duplicating every focused command here.
- Treat a stale generated artifact as a failed change; do not weaken a validator or hide a maintained path to make checks pass.

## File conventions

- Use 2-space indentation for JSON and keep files human-readable; avoid minified or giant single-line structures.
- Preserve stable Markdown headings where practical so links and routed references remain usable.
- Point documentation to canonical data instead of duplicating large inventories.
- Update related explanatory Markdown when a maintained knowledge model changes and the explanation would otherwise become stale.
- Do not reformat unrelated files unless formatting is the task.
