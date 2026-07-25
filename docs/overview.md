# Overview

This repository is a plain-text MoonCat technical knowledge base.

It separates explanatory context from exact data:

- `docs/` explains concepts, history, source notes, and reasoning.
- `data/` stores canonical or curated machine-readable data.

## Scope

The initial scope is intentionally small:

- point readers and agents to the right files;
- record source/provenance expectations;
- define recurring terms;
- leave incomplete MoonCat facts marked as incomplete.

## Current Status

Incomplete.

This scaffold does not yet include canonical MoonCat ID lists, contract addresses, CIDs, trait mappings, color values, rescue data, or metadata indexes.

For the reviewed accessory subsystem, start with [`docs/mooncat-accessory-system.md`](mooncat-accessory-system.md), then follow the separate lifecycle and rendering reviews for exact source behavior. Current accessory state and exact generated output remain outside the checked-in overview.

## Editing Principles

- Do not invent MoonCat IDs or exact trait data.
- Prefer primary sources for protocol-level claims.
- Keep source notes near the data or explanation that depends on them.
- Update both Markdown and JSON when a curated list changes.
