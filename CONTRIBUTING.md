# Contributing to MoonCat KB

MoonCat KB welcomes small, source-backed improvements that make MoonCat
knowledge easier and safer for people, tools, and coding agents to use. Read
[`docs/mooncat-kb-guide.md`](docs/mooncat-kb-guide.md) for the repository's
capabilities and evidence model before proposing a broad change.

## Start with the repository workflow

Before editing, read:

```text
AGENTS.md
data/agent-index.json
data/task-recipes.json
```

Choose the narrowest route in `data/agent-index.json`. Load its primary files
first and optional files only when the task needs them. If a matching generated
pack exists in `data/agent-context-packs.json`, treat its warnings, forbidden
claims, and stop conditions as implementation constraints. Check
`data/agent-coding-patterns.json` for an existing tested pattern before adding a
new one.

For source-sensitive changes, also read `data/sources.json` and
`docs/reference-policy.md`. For gap planning, use the `review-kb-gaps` route and
`data/kb-gap-index.json`.

## Repository model

- `data/` holds compact canonical, curated, community-curated, workflow, and
  generated artifacts. Read each file's status, scope, source references, and
  limitations.
- `docs/` holds explanations, reasoning, and provenance boundaries without
  duplicating large exact datasets.
- `references/` holds upstream evidence. It is not curated KB data by default.
- `examples/` holds narrow executable patterns, not application frameworks or
  live services.
- `scripts/` owns generators, queries, validators, and the zero-network audit.
- `AGENTS.md` defines repository-wide agent rules.

Keep README as a concise entrypoint and the human guide as the main orientation
document. Domain facts belong in the relevant data/docs pair.

## Finding a useful contribution

Start with a real user or agent limitation, not a desire to add more files.
`data/kb-gap-index.json` records:

- `fileGaps` for current artifact-level limits;
- `gapTypes` for the kind of risk or incompleteness;
- `agentUsabilityImpact` for the work the current artifact enables or blocks;
- `nextDataPass` for a bounded improvement path; and
- `recommendedNextPasses` for cross-file priorities.

A useful contribution commonly fixes one of these:

- missing knowledge supported by an appropriate primary or bounded source;
- weak source, revision, freshness, license, or derivation evidence;
- poor discovery through an existing route or recipe;
- a repeated developer task without a tested usage pattern;
- unsafe identifier, contract, provenance, or static-versus-live conflation;
- missing focused validation for a maintained artifact; or
- a repeated workflow without guardrails and stop conditions.

Do not treat a gap note as evidence for a MoonCat fact. Follow its referenced
files and source requirements. Prefer a small pass that closes one usability
problem over a broad import whose trust and maintenance model are unclear.

## Source and provenance expectations

Do not add non-obvious facts without a source or documented method. Register a
new source in `data/sources.json` before relying on it in curated data. Prefer
primary sources for protocol behavior, contracts, APIs, metadata, and history.
Mark community-curated, partial, historical, generated, or unverified material
explicitly.

If sources conflict, document the conflict and their trust levels instead of
choosing silently. Generated output must name its checked-in inputs and
repeatable generation/validation path. Reference snapshots must retain their
upstream identity and must not be edited into normalized “truth.”

## Preserve important boundaries

Do not:

- invent MoonCat IDs, names, traits, addresses, hashes, CIDs, URLs, dates,
  mappings, or source claims;
- equate bytes5 Cat IDs, rescue order, generic/ERC token IDs, WMCR token IDs,
  accessory IDs, record indexes, palette indexes, or addresses without exact
  scoped evidence;
- present pinned or generated evidence as current chain/API/market state;
- infer current owner, name, offer, wrapping, or accessory wear from event
  presence;
- import full source, ABI, OpenAPI, response, image, SVG, or per-cat blobs into
  compact files without an explicitly scoped generated-data pass;
- remove uncertainty markers merely to make an artifact look complete; or
- reformat unrelated files.

## File conventions

For JSON in `data/`:

- use two-space indentation and readable structures;
- keep every `sourceRef` resolvable through `data/sources.json`;
- use `relatedFiles` when another artifact materially constrains the data;
- update `status`, `scope`, `limitations`, and `todos` when the change affects
  them; and
- do not mix exact data with loose notes unless the existing schema does so.

For Markdown:

- preserve stable headings where practical;
- point to canonical data rather than copying large inventories;
- state source, freshness, uncertainty, and current-state limits plainly; and
- keep route-loaded docs focused enough for an agent to use safely.

New maintained path families may require an explicit classification in
`scripts/generate-kb-manifest.py`. Do not hide a maintained artifact in an
exclusion simply to make the manifest pass.

## Validation by change type

Always run:

```sh
python scripts/validate-kb.py
git diff --check
```

Then use the checks appropriate to the change:

| Change | Required validation |
| --- | --- |
| Curated JSON | `python -m json.tool <file>` plus its focused validator, when one exists |
| Generated artifact or its inputs | Owning generator `--check` and focused validator; regenerate only through the owning generator |
| Identifier data | `python scripts/validate-identifier-conversions.py` and any affected domain validator |
| Population data | Population generator `--check`, population validator, and diff check |
| Contract/ABI/event data | ABI extractor `--check` and contract-registry validator |
| Executable example | Its documented focused test command plus the validators for the data/registry it consumes |
| Route, recipe, benchmark context, or routed doc | Generate/check context packs and run `validate-agent-routing.py` |
| Maintained file, path classification, route, or recipe | Generate/check the KB manifest and run `validate-kb-manifest.py` |
| Repo-wide/integrity change | `python scripts/audit-kb.py` after dependent generated artifacts are current |

The dependency order matters: focused artifact first, then context packs when
routing inputs changed, then manifest, then audit. A stale generated file is a
failed change, not a reason to weaken a check.

## Agent-assisted contribution pattern

A useful agent prompt is narrow and explicit:

```text
You are editing MoonCat KB.

Objective:
<one bounded improvement>

Inspect first:
- AGENTS.md
- data/agent-index.json
- data/task-recipes.json
- <task-specific files>

Allowed paths:
- <exact paths>

Boundaries:
- Do not invent facts or identifier mappings.
- Preserve source, revision, uncertainty, and static-versus-live limits.
- Do not edit unrelated files.

Validation:
- <focused validator>
- python scripts/validate-kb.py
- git diff --check

Report changed files, evidence, limitations, validation, and remaining gaps.
```

Avoid asking an agent to “improve the whole KB.” Review the diff manually and
confirm that the result did not broaden the task, silently normalize a
conflict, or turn an unknown into a claim.

## Pull request checklist

- [ ] The change addresses a clear user/agent need or documented gap.
- [ ] Existing routes, recipes, patterns, and evidence were inspected first.
- [ ] New facts are source-backed or explicitly unresolved.
- [ ] Identifier and historical/current-state boundaries are preserved.
- [ ] No large upstream or generated blob was imported accidentally.
- [ ] Focused generators, validators, and executable tests pass.
- [ ] Context packs are current if routed inputs changed.
- [ ] The maintained-file manifest is current.
- [ ] The repo-wide audit passes when required.
- [ ] JSON parsing, `validate-kb.py`, and `git diff --check` pass.
- [ ] The final diff was reviewed for unrelated changes.

When evidence is incomplete, a precise gap or limitation is a valid and useful
contribution.
