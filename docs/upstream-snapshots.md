# Upstream Snapshot Provenance

Machine-readable manifest: `data/upstream-snapshot-manifest.json`.

## Purpose and Current Status

The manifest records important checked-in reference inputs and compact derived reviews without refreshing or replacing vendored files. Each entry includes the local path, SHA-256, byte count, local-history evidence, upstream project/path evidence, revision status, copy/adaptation status, license evidence, confidence, freshness status, source references, dependencies, and limitations.

The current inventory covers the trait JSON, LibMoonCat bundle, MoonCat parser, the pinned MoonCatRescue Development Environment ADR directory, the rescue-widget parser and js-sha3 vendor files, the extracted original rescue-contract constants summary, and the derived rescue-mining review. This is an important-input inventory, not an exhaustive listing of every reference, binary, cache, or generated file.

## Evidence Boundaries

The local reference README explicitly says copied/retrieved dates are not recorded. Git commits identify when this repository received a copy, not when or from which upstream revision the content was retrieved. The manifest therefore leaves the exact upstream commit/tag unresolved for the three core local reference files.

The rescue-mining review is stronger: its inspected archive clone recorded revision `941cabe56315efeb5cb0d97966419b59acc14115` on 2026-07-07. The vendored js-sha3 file is tied to that reviewed archive path and carries its own js-sha3 0.6.1 MIT header. The vendored parser is byte-identical to the local parser reference, but that comparison does not prove an upstream commit or license.

The original rescue contract is not vendored here. `data/protocol-constants.json` is an extracted compact summary that points to the registered Ponderware raw Solidity source; its manifest entry deliberately marks the branch-only reference and does not pretend to pin a Solidity snapshot.

The ADR directory is a stronger pinned snapshot: `references/upstream/mooncatrescue-dev-environment-adr/SNAPSHOT.json` records the master commit, retrieval date/method, every copied file's bytes and SHA-256, and the observed license gap. The copied Markdown files remain byte-preserved under that directory; the compact ADR index paraphrases them and does not substitute for their source text.

## Validator

Run the zero-network validator:

```sh
python scripts/validate-upstream-snapshots.py
```

It checks schema enums, unique keys, required local paths, byte counts, SHA-256 matches, sourceRef resolution, and explicit limitations for incomplete provenance. A changed reference file fails validation until the manifest is deliberately reviewed and updated.

## Safe Refresh Workflow

Refreshing a snapshot is a deliberate review, not an automated network operation:

1. Identify the exact upstream project, path, revision/tag, retrieval date, and license evidence. If any remain unknown, preserve an unresolved status.
2. Review the upstream diff against the current local file and decide whether historical behavior should remain pinned. A newer revision is not automatically preferable.
3. Replace the local file only in an explicitly authorized snapshot-refresh task. This pass does not replace any file under `references/` or `examples/`.
4. Record the new local SHA-256 and byte count, local commit evidence, upstream revision evidence, copy/adaptation boundary, freshness status, and limitations.
5. Regenerate dependent artifacts only where their documented workflow requires it; do not silently change generated outputs from a snapshot refresh.
6. Run the snapshot validator, `scripts/validate-kb.py`, JSON parsers, and `git diff --check`.
7. Summarize source changes, hash changes, dependent outputs, unresolved provenance, and validation results.

Do not add scheduled network checks, auto-update behavior, full upstream repositories, archives, or large source payloads to this KB.
