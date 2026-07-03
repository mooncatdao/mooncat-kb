# AGENTS.md

This repository is a MoonCat technical knowledge base.

## Source of truth rules

- Prefer files in `data/` for exact IDs, numeric values, and canonical indexes.
- Prefer files in `docs/` for explanations and reasoning.
- Do not invent MoonCat IDs.
- Do not invent contract addresses, content hashes, CIDs, URLs, dates, or exact trait mappings.
- If a category is incomplete, say it is incomplete.
- Keep generated site/tool code separate from canonical data.
- When updating a list, update both the relevant JSON file and the explanatory Markdown if needed.

## Source and provenance rules

- Use `data/sources.json` as the curated source index.
- Add a source entry before relying on a non-obvious external reference.
- Prefer primary sources for protocol facts, contracts, metadata, and historical claims.
- Mark unverified, partial, or community-curated information clearly.
- If a source conflicts with another source, document the conflict instead of choosing silently.

## Agent workflow rules

- Inspect existing files before editing.
- Keep changes small and scoped to the requested knowledge area.
- Validate JSON after editing files in `data/`.
- Preserve stable Markdown headings unless the user asks for a restructure.
- Do not remove `README.md`, `AGENTS.md`, or `context.md`.

## File conventions

- JSON files in `data/` should be valid and compact.
- Markdown docs should use stable headings so links do not break.
- Include sources/notes for non-obvious classifications.
