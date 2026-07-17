# Architecture decisions

## Scope

`data/architecture-decisions.json` is a compact index of every decision file in the pinned MoonCatRescue Development Environment ADR snapshot. It does not copy ADR bodies and does not claim freshness beyond the pinned revision.

The current snapshot is from `master` commit `d6a604e1a37fb5646d7e5059c0858bd15f9b7b83`, retrieved on 2026-07-17. It contains decision files ADR 0001 through ADR 0018, plus a template and directory README. The template and README are preserved as reference files, not fabricated decision records. Missing numbers must still never be inferred in a future snapshot.

## Reading a decision record

An ADR records design intent, rationale, and stated consequences. It is not direct proof of current deployed contracts, current API behavior, selected MoonCat state, or implementation completion. Use the index to explain why a documented design direction exists, then load the relevant parser, contract, generated-data, or current-state evidence before making an implementation claim.

For ADR 0017, the index preserves the documented color-model direction and its limits: the JavaScript parser is the color reference, integer hue handling and human-facing labels have a defined role, pure-coat visual matching has a stated caveat, and `MoonCatColors.mapColors` is edge-case context. The index does not establish exact RGB/hex values, palette output, current contract storage, or any particular rendered image. Other records cover development environments, testnet workflow, web and data architecture, client libraries, attestations, metadata, pool interfaces, galleries, and Moment design; they carry the same intent-versus-implementation limit.

## Status, dates, and supersession

Statuses are recorded only when reviewed evidence states them. The pinned corpus has 16 Accepted records, ADR 0008 as Proposed, and ADR 0005 as Deprecated. Every decision date is `null`: each available date is recorded separately as a source update date, not inferred to be the decision date. Supersession links remain empty with `not-evidenced` status unless an ADR explicitly identifies a relationship.

The validator rejects duplicate IDs/numbers, unknown source references, invalid source locations or enums, stale snapshot file hashes, missing or extra snapshot decision records, missing related paths, self-links, and non-reciprocal supersession links. It validates only relationships entered in the index; it does not infer missing ADRs or links.

## Source and implementation boundaries

Follow [the reference policy](reference-policy.md) and [the source map](source-map.md) when promoting ADR-derived guidance. A current-maintainer ADR can support a concise decision summary, but domain data must still be supported by the appropriate implementation surface. Preserve source conflicts, incomplete coverage, and current-state limits rather than filling them from ADR intent.

Use these checks after changing the index:

```sh
python scripts/validate-architecture-decisions.py
python scripts/generate-agent-context-packs.py --check
python scripts/validate-agent-routing.py
python scripts/audit-kb.py
```
