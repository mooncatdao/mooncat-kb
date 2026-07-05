# Contributing to MoonCat KB

Thanks for helping improve the MoonCat Knowledge Base. This repo is intended to be useful to both people and LLM/code agents, so contributions should be clear, source-backed, and easy to validate.

This guide is especially for contributors who use LLMs such as ChatGPT, Codex, Claude, Gemini, Cursor, Cline, or other coding/research agents.

## Start here

Before making changes, ask your LLM or agent to read:

```text
AGENTS.md
README.md
data/agent-index.json
data/task-recipes.json
```

For planning or gap work, also read:

```text
data/kb-gap-index.json
```

For provenance or source-sensitive changes, also read:

```text
data/sources.json
docs/reference-policy.md
```

## Repository model

Use the repo this way:

- `data/` is for compact machine-readable facts, indexes, manifests, and curated data.
- `docs/` is for explanations, reasoning, source notes, and human-readable context.
- `references/` is for upstream/reference material and should not be treated as curated KB data by default.
- `AGENTS.md` contains agent behavior rules.
- `data/agent-index.json` tells agents which files to load for common tasks.
- `data/task-recipes.json` gives workflow sequences, guardrails, and stop conditions.

The README should remain a map, not the canonical home for every fact.

## Good LLM workflow

A safe LLM-assisted contribution usually looks like this:

1. Identify the exact knowledge area: identifiers, traits, colors, contracts, APIs, sources, rescue buckets, links, or rendering.
2. Load the relevant route from `data/agent-index.json`.
3. Load the matching workflow from `data/task-recipes.json` if the task crosses multiple files.
4. Inspect existing files before editing.
5. Make a small, scoped change.
6. Preserve uncertainty and limitations.
7. Validate JSON and repo references.
8. Review the diff manually before committing.

Avoid asking an LLM to "improve the KB" without file boundaries. Prefer narrow tasks such as:

```text
Update data/contract-surfaces.json with a compact reviewed summary of one contract surface. Do not import ABI/source blobs. Preserve unresolved questions.
```

or:

```text
Add source-backed notes for one project link. Update only data/project-links.json and data/sources.json if needed. Do not promote navigation links into canonical facts without trust notes.
```

## Source and provenance expectations

Do not add non-obvious facts without a source or method.

Use `data/sources.json` for curated source references. If a fact depends on a source that is not registered yet, either:

- add a focused source entry with trust and limitation notes, or
- leave the fact out and mark the gap instead.

Prefer primary sources for protocol, contract, API, and historical claims. Good source types include official MoonCatRescue pages, verified contract/source pages, maintained project repositories, official API specs, and clearly attributable maintainer explanations.

Community sources can be useful, but mark them as community-curated or interpretive when appropriate.

## What not to do

Do not ask an LLM to:

- invent MoonCat IDs, cat names, contract addresses, CIDs, URLs, dates, traits, token IDs, or source claims
- treat rescue-order indexes, bytes5 `catId`s, ERC-721 token IDs, OpenSea IDs, local array indexes, accessory IDs, and Ethereum addresses as interchangeable
- import full upstream datasets unless a focused generated-data pass explicitly allows it
- copy full contract source, ABI JSON, OpenAPI specs, API response bodies, generated images, SVG arrays, or large per-cat mappings into compact KB files
- silently resolve conflicting sources
- remove uncertainty markers such as `partial`, `incomplete`, `needs-verification`, `community-curated`, or `reference-only`
- reformat unrelated files

## Data-file rules

For JSON in `data/`:

- use 2-space indentation
- keep files human-readable
- keep source references resolvable through `data/sources.json`
- add `relatedFiles` when another file materially explains or constrains the data
- avoid giant single-line arrays
- do not mix exact curated data with loose notes unless the file already uses that structure

If a file has `status`, `scope`, `limitations`, or `todos`, update those fields when your change affects them.

## Markdown rules

For Markdown in `docs/`:

- preserve stable headings where possible
- use links or file references to canonical data rather than duplicating large data
- keep explanations source-aware
- state limitations plainly
- prefer short sections that agents can route to and summarize

## Common validation commands

Run these from the repo root when possible:

```sh
python scripts/validate-kb.py
git diff --check
```

For changed JSON files, also run:

```sh
python -m json.tool data/example-file.json >/dev/null
```

Replace `data/example-file.json` with each JSON file you changed.

## Suggested pull request checklist

Before opening a PR, confirm:

- [ ] The change is scoped to a clear knowledge area.
- [ ] Existing routing and recipe files were checked when relevant.
- [ ] New or changed facts are source-backed or explicitly marked as unresolved.
- [ ] No large upstream dataset, generated output, ABI, source blob, or API body was imported accidentally.
- [ ] Identifier boundaries are preserved.
- [ ] `python scripts/validate-kb.py` passes.
- [ ] Changed JSON files parse with `python -m json.tool`.
- [ ] `git diff --check` passes.
- [ ] The diff was manually reviewed after LLM edits.

## Example LLM prompt template

```text
You are editing mooncat-kb, a compact MoonCat technical knowledge base.

Objective:
<one narrow task>

Inspect first:
- AGENTS.md
- README.md
- data/agent-index.json
- data/task-recipes.json
- <task-specific files>

Allowed paths:
- <specific files the agent may edit>

Forbidden:
- Do not invent MoonCat facts, IDs, addresses, CIDs, URLs, dates, source claims, or exact mappings.
- Do not import large upstream data, ABI/source blobs, OpenAPI specs, API response bodies, generated images, or per-cat tables unless explicitly allowed.
- Do not reformat unrelated files.

Acceptance criteria:
- Existing limitations are preserved or tightened.
- New claims are source-backed or marked unresolved.
- JSON remains valid and human-readable.
- Related gap/routing files are updated only if the task changes them.

Validation:
- python scripts/validate-kb.py
- python -m json.tool <changed-json-file> >/dev/null
- git diff --check

Report:
- files changed
- facts or guidance added
- limitations preserved
- validation results
- follow-up gaps
```

## When in doubt

Prefer a smaller contribution that preserves uncertainty over a larger contribution that appears complete but is not well sourced.

It is acceptable to add a gap, limitation, or model decision instead of adding data immediately.
