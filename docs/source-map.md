# Source Map

This document explains how sources should be tracked in this knowledge base.

Canonical source entries live in `data/sources.json`.

Detailed source-tier, local upstream snapshot, and promotion rules live in `docs/reference-policy.md`.

## Source Categories

- `primary`: original project, contract, metadata, or protocol source.
- `source-code`: public repository for implementation, parser, contract, or site code.
- `community`: community-maintained reference or explanation.
- `derived`: data generated from another source by script, analysis, or curation.
- `unknown`: placeholder for a needed source that has not been verified.

Use `data/link-index.json` for preserved research or navigation links that should not be promoted into `data/sources.json`.

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
- Rate My Mooncat: `rate-my-mooncat`
- MoonCat DAO old wiki: `mooncat-dao-wiki`
- MoonCats FAQ and official links local file: `mooncats-faq-official-links`
- Extracted source links local file: `extracted-source-links-2026-07-02`
- Etherscan original contract page: `etherscan-original-contract`
- MoonCatRescue Medium publication: `mooncatrescue-medium`
- MoonCats On-Chain Guide: `mooncats-on-chain-guide`
- On Chain, Generative Art?: `on-chain-generative-art`
- Of Mice and MoonCats: `of-mice-and-mooncats`
- MoonCat Explainer: `mooncat-explainer`
- MoonCatRescue on the Blockchain GitHub repo: `cryptocopycats-mooncatrescue`
- Dune MoonCat Rescue dashboard: `dune-mooncat-rescue`
- Dune MoonCat Characters dashboard: `dune-mooncat-characters`
- Dune Rare Mooncat Dashboard: `dune-rare-mooncat`
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
- Community-curated: subjective or narrative category sources, including character-cat charts
- Community-derived: dashboards, analyses, or tools derived from another data source
- Project-link: useful navigation, marketplace, social, visualization, or owner-page links
- Supporting-context: local notes or Discord-derived references that need review before fact import
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
- Apply `docs/reference-policy.md` when deciding whether a raw upstream artifact belongs in `references/` or should be promoted into curated `data/`.
- Use Discord/community posts as supporting context unless explicitly marked as canonical.
- Character-cat, early-rescue, and vibe-based classifications may be curated and should be marked as such.
- Do not promote marketplace, social, video, visualization, or owner-page links into canonical sources only because they are useful to preserve.
- If a list is incomplete, mark it with `"status": "incomplete"` or say so in the related Markdown.
