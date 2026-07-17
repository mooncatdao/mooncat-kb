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
- For coding tasks, start with `data/agent-index.json`; when available, load the matching case from `data/agent-context-packs.json` before broader files.
- Treat pack warnings, forbidden claims, and stop conditions as implementation constraints. Packs reference files; they do not replace underlying source limits.
- After changing routing or benchmark context, run `python scripts/generate-agent-context-packs.py --check` and `python scripts/validate-agent-routing.py`.
- For integrity, manifest, or maintained-file coverage changes, load `data/kb-manifest.json` and `docs/kb-integrity.md`, then run `python scripts/generate-kb-manifest.py --check`, `python scripts/validate-kb-manifest.py`, and `python scripts/audit-kb.py`.
- Keep manifest classification and exclusion rules explicit; the audit orchestrates focused validators and does not authorize network scans, Git-history scans, or automatic PII edits.

## File conventions

- JSON files in `data/` should be valid and human-readable.
- Use 2-space indentation for JSON.
- Do not use minified or single-line JSON files.
- Large numeric arrays may wrap across multiple lines; avoid giant single-line arrays.
- Do not reformat unrelated files unless formatting is the task.
- Markdown docs should use stable headings so links do not break.
- Include sources/notes for non-obvious classifications.
