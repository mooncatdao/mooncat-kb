# KB integrity audit

## Purpose and scope

`python scripts/audit-kb.py` is the authoritative zero-network entrypoint for repository-wide integrity checks. It orchestrates existing focused validators and generator drift checks; it does not replace their domain rules, fetch external services, or infer MoonCat facts.

The audit writes `data/kb-audit-report.json` with compact command status/output summaries, measured durations, duplicate-ID results, internal-path results, PII warnings, and explicit skipped checks. The report is intentionally generated on each audit run and is not a self-hashed manifest entry.

## Maintained-file manifest

`python scripts/generate-kb-manifest.py` writes `data/kb-manifest.json`; `--check` detects drift. Each maintained entry records its path, role, topics, curation mode, statuses, bytes, SHA-256, routes, recipes, generated-artifact commands where applicable, generated provenance owner, source-backed status, and direct-agent-load guidance.

Roles and curation modes are closed enums recorded in the manifest. Classification is an explicit path table in the generator; an unmatched maintained file is a generation failure, rather than a guessed category. Routes and recipe references are derived directly from `data/agent-index.json` and `data/task-recipes.json`.

The maintained inventory covers regular repository files except the explicit policy exclusions: `.git`, `.chatgpt` run artifacts, local agent/editor/cache/dependency directories, the local `codex-handoff.md` session artifact, upstream/reference snapshots, vendored example dependencies, and the two recursive/generated audit outputs. `data/kb-manifest.json` is excluded because a hash of itself would not stabilize; `data/kb-audit-report.json` is excluded because command durations are dynamic. These exclusions are policy entries, not orphaned KB content.

Generated artifacts remain owned by their existing generators:

- `data/agent-context-packs.json` — `scripts/generate-agent-context-packs.py --check`
- `data/mooncat-names.json` — `scripts/generate-mooncat-names.py --check`
- `data/mooncat-visual-traits.sample.json` — `scripts/generate-visual-traits.py --check`
- `data/materialization-parity-results.json` — `scripts/generate-materialization-parity.py --check`
- `data/mooncat-population/` — `scripts/generate-mooncat-population.py --check`
- `data/mooncat-renders/` — `scripts/generate-mooncat-renders.py --check`
- `data/onchain-materialization/` —
  `scripts/validate-onchain-materialization.py`; its committed representative
  snapshot is block-pinned, while its network generator is explicit and is
  never run by the zero-network audit
- `data/contract-registry.json`, `data/event-registry.json`,
  `data/event-indexer-recipes.json`, and `data/abi-registry/` —
  `scripts/extract-contract-abis.py --check`
- `data/kb-manifest.json` — `scripts/generate-kb-manifest.py --check`
- `data/kb-audit-report.json` — `scripts/audit-kb.py`

Curated indexes with focused validators are also registered in manifest entry metadata. `data/architecture-decisions.json` is checked by `scripts/validate-architecture-decisions.py`; its ADR records remain source summaries rather than generated domain data. `data/factual-retrieval-cases.json` is checked by `scripts/validate-factual-retrieval-cases.py`; it is a deterministic provenance-boundary benchmark, separate from coding-route validation in `data/agent-query-cases.json`.

The manifest generator registers those relationships and their focused
validators; it does not duplicate generation logic. The zero-network audit
runs each registered domain's established check and validator for the public
release surface, including names, population, renders, and contract/ABI/event
artifacts.

The audit runs `scripts/validate-onchain-materialization.py --allow-missing`.
That command always exercises the dependency-free Ethereum Keccak/ABI helper
self-tests, validates a committed snapshot fully when present, and reports an
explicit skip while the documented RPC-derived artifact is absent. Default
focused validation does not allow a missing snapshot. In this checkout the
snapshot exists, so the audit validates its hashes, block identity, 48-row
evidence, and tri-state comparison accounting rather than taking the skip path.

The manifest's `provenanceCoverage` section provides deterministic accounting,
not a new factual registry. It summarizes registered source paths, important
input path bindings and exact unresolved revision/retrieval/license keys,
source-backed curated canonical files, and generated-artifact ownership. Each
generated artifact has a `provenancePath` pointing to its existing owning
manifest or registry. The manifest validator requires complete
generator/check/validator ownership for maintained generated outputs, with the
dynamic audit report recorded as the sole explicit check-command exception.

## Validation and warning policy

Run these after changing integrity policy, routes, recipes, generated-artifact registration, or maintained files:

```sh
python scripts/generate-kb-manifest.py --check
python scripts/validate-kb-manifest.py
python scripts/audit-kb.py
```

The manifest validator checks deterministic output, complete classification coverage, explicit exclusions, path uniqueness, hashes and sizes, enum values, derived route/recipe references, registered command paths, existing provenance owners, complete generated-artifact registration, and aggregate provenance counts. The audit also checks duplicate IDs inside registered namespaces only; the same ID in unrelated collections is not a duplicate.

Internal link checks are intentionally bounded to `README.md`, `AGENTS.md`, `llms.txt`, `docs/*.md`, and repo-relative paths in `data/*.json`. They do not validate external URLs or parse Markdown semantically. Missing ordinary internal targets are errors; legacy local-source `path` records are warnings because they can describe unavailable historical context rather than a loadable route.

The PII scan is warning-only and scans maintained text files for conventional email, phone, home-directory, IP-address, and configured denylist patterns. It supports explicit regex allowlists and denylist literals in `scripts/audit-kb.py`. Public contract addresses, source URLs/authors, and documentation examples are not treated as PII matches. The scan is conservative and cannot prove that a repository is free of sensitive information; it does not edit, redact, delete, or inspect Git history. A history scan, if needed, must be an explicit separate review.

## Future imports

When importing ADR or ChainStation material, first decide whether it is curated `data/`, explanatory `docs/`, an example, or a reference snapshot. Register a source in `data/sources.json` before relying on a non-obvious external reference. Add an explicit classification rule if the new maintained path does not fit an existing rule, register a generator/check only when an existing deterministic relationship supports it, update the relevant route/recipe if agents should discover it, and rerun the audit. Do not use this manifest as a universal entity graph or semantic conflict detector.
