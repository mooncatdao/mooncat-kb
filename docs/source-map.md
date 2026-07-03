# Source Map

This document explains how sources should be tracked in this knowledge base.

Canonical source entries live in `data/sources.json`.

## Source Categories

- `primary`: original project, contract, metadata, or protocol source.
- `community`: community-maintained reference or explanation.
- `derived`: data generated from another source by script, analysis, or curation.
- `unknown`: placeholder for a needed source that has not been verified.

## Current Sources

## Primary sources

- MoonCatRescue website
- MoonCatRescue GitLab group
- ChainStation source
- LibMoonCat
- Original MoonCat parser
- Contract documentation
- DAO GitHub repositories

## Community / derived sources

- Discord posts
- DAO discussions
- CatMoon implementation notes
- HOF website implementation notes
- MoonCat DAO website implementation notes
- Reddit technical posts
- Historical community explanations

## Data trust levels

- Canonical: on-chain, official parser, official contract docs
- Strong: MoonCatRescue GitLab / ChainStation source
- Community-maintained: DAO repos, curated Discord posts
- Experimental: CatMoon color filters, character-cat classifications, prototype notes

## Adding a Source

When adding a source:

- add an entry to `data/sources.json`;
- include a stable label and source type;
- include a URL only when it has been verified;
- describe what the source supports;
- mark limitations or incomplete coverage clearly.

## Provenance rules

- Every non-obvious data claim should have a source.
- Prefer on-chain data, official parser logic, official contract docs, and MoonCatRescue GitLab for canonical technical facts.
- Use Discord/community posts as supporting context unless explicitly marked as canonical.
- Character-cat, early-rescue, and vibe-based classifications may be curated and should be marked as such.
- If a list is incomplete, mark it with `"status": "incomplete"` or say so in the related Markdown.
