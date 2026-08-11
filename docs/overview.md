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

This KB has bounded source-backed contract, identifier, trait, and naming
subsystems; it remains incomplete for live chain state, complete event
histories, broad metadata imports, and unreviewed source surfaces.

For the reviewed accessory subsystem, start with [`docs/mooncat-accessory-system.md`](mooncat-accessory-system.md), then follow the separate lifecycle and rendering reviews for exact source behavior. Current accessory state and exact generated output remain outside the checked-in overview.

For original MoonCat naming semantics, start with
[`docs/mooncat-naming.md`](mooncat-naming.md). For revision-bounded maintained
finalized current names and canonical history, start with
[`docs/name-index-integration.md`](name-index-integration.md). The local
generated snapshot remains source-bounded historical/source-comparison evidence
and does not establish live storage or a newer-than-reviewed event history.

## Editing Principles

- Do not invent MoonCat IDs or exact trait data.
- Prefer primary sources for protocol-level claims.
- Keep source notes near the data or explanation that depends on them.
- Update both Markdown and JSON when a curated list changes.
