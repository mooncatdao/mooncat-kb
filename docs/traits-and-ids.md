# Traits and IDs

Machine-readable trait placeholders live in `data/trait-index.json`.

Identifier terminology and conversion status live in `data/identifier-conventions.json` and `docs/identifier-conventions.md`.

## Current Status

Incomplete.

This repository does not yet define exact MoonCat ID format conventions, parser-derived traits, metadata traits, visual traits, or category mappings.

The identifier conventions reference distinguishes bytes5 MoonCat IDs, API original rescue indexes, local rescue-order indexes, token-facing IDs, OpenSea IDs, Ethereum addresses, and accessory IDs.

Local rescue-order indexes are now recorded as aligned with API rescueOrder/original rescue indexes for the checked numeric convention. The reference still does not define conversion to bytes5 cat IDs, token-facing IDs, OpenSea IDs, or trait mappings.

## Rules

- Do not invent IDs or trait labels.
- Record the source of each trait namespace.
- Keep exact mappings in JSON and explanatory notes in Markdown.
