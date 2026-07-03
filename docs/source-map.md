# Source Map

This document explains how sources should be tracked in this knowledge base.

Canonical source entries live in `data/sources.json`.

## Source Categories

- `primary`: original project, contract, metadata, or protocol source.
- `source-code`: public repository for implementation, parser, contract, or site code.
- `community`: community-maintained reference or explanation.
- `derived`: data generated from another source by script, analysis, or curation.
- `unknown`: placeholder for a needed source that has not been verified.

## Current Sources

## Primary sources

- MoonCatRescue website: `mooncatrescue-website`
- Build with MoonCats developer page: `mooncatrescue-build`
- MoonCatRescue contract documentation: `mooncatrescue-contract-docs`
- MoonCatRescue GitLab group: `mooncatrescue-gitlab`
- ChainStation source: `chainstation-source`
- LibMoonCat: `libmooncat`
- ponderware GitHub: `ponderware-github`
- Original MoonCat parser: `ponderware-mooncatparser`
- Original MoonCatRescue contract repository: `ponderware-contract`

## Community / derived sources

- MoonCatCommunity website: `mooncat-community-website`
- MoonCat DAO GitHub: `mooncat-dao-github`
- Discord posts
- DAO discussions
- CatMoon implementation notes
- HOF website implementation notes
- MoonCat DAO website implementation notes
- Reddit technical posts
- Historical community explanations

## Data trust levels

- Canonical: on-chain, official parser, official contract docs
- Historical-primary: original ponderware parser and contract repositories
- Strong: MoonCatRescue GitLab, ChainStation source, libMoonCat source
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
