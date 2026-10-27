# Architecture decisions

## Scope

`data/architecture-decisions.json` is a compact index of every decision file in the pinned MoonCatRescue Development Environment ADR snapshot. It does not copy ADR bodies and does not claim freshness beyond the pinned revision.

The current snapshot is from reviewed `master` commit `9930b11e10bf60f3af785a40ae2193fa4281d718`, retrieved on 2026-10-27. It contains decision files ADR 0001 through ADR 0018, plus a template, directory README, and two supporting PNGs referenced by ADR 0018. The four nondecision files are reference evidence, not fabricated decision records. Missing numbers must still never be inferred in a future snapshot.

## Reading a decision record

An ADR records design intent, rationale, and stated consequences. It is not direct proof of current deployed contracts, current API behavior, selected MoonCat state, or implementation completion. Use the index to explain why a documented design direction exists, then load the relevant parser, contract, generated-data, or current-state evidence before making an implementation claim.

For ADR 0017, the index preserves the documented color-model direction and its limits: the JavaScript parser is the color reference, integer hue handling and human-facing labels have a defined role, pure-coat visual matching has a stated caveat, and `MoonCatColors.mapColors` is edge-case context. The index does not establish exact RGB/hex values, palette output, current contract storage, or any particular rendered image. Other records cover development environments, testnet workflow, web and data architecture, client libraries, attestations, metadata, pool interfaces, galleries, and Moment design; they carry the same intent-versus-implementation limit.

## Reviewed refresh and historical context

ADR 0015's source update of 2026-07-22 replaces its former NFTX v3 preference
with waiting for NFTX v4 and evaluating whether it should become primary.
Evaluation does not mean adoption. The ADR describes interim ChainStation v2
interfaces; this is an upstream statement, not independently verified source
behavior or deployment. The index's historical context preserves the v3 direction
at [the prior snapshot revision](https://gitlab.com/mooncatrescue/dev-environment/-/blob/d6a604e1a37fb5646d7e5059c0858bd15f9b7b83/adr/0015-nft-pools.md),
retrieved on 2026-07-17. No new decision date or supersession relationship is inferred.

ADR 0018's source update of 2026-06-24 adds consistent gradient/dithering guidance
and suggests accessory-palette colors for backdrops. Its source/public/print/
thumbnail dimensions and scaling text are preserved unchanged. The referenced
[dithering example](../references/upstream/mooncatrescue-dev-environment-adr/dither-patterns.png)
and [accessory palette](../references/upstream/mooncatrescue-dev-environment-adr/accessory-palette.png)
are supporting design examples, not canonical color data or evidence of rendered
output. The user confirmed redistribution permission for these two PNGs only;
this does not imply CC0 or a license for other upstream material. General upstream
licensing remains unresolved in the snapshot metadata.

## Status, dates, and supersession

Statuses are recorded only when reviewed evidence states them. The pinned corpus has 16 Accepted records, ADR 0008 as Proposed, and ADR 0005 as Deprecated. Every decision date is `null`: each available date is recorded separately as a source update date, not inferred to be the decision date. Supersession links remain empty with `not-evidenced` status unless an ADR explicitly identifies a relationship.

The validator rejects duplicate IDs/numbers, unknown source references, invalid source locations or enums, stale snapshot file hashes, missing or extra evidence files (including PNGs), incorrect file roles/counts, source/index status mismatches, missing or extra snapshot decision records, missing related paths, self-links, and non-reciprocal supersession links. It validates only relationships entered in the index; it does not infer missing ADRs or links.

## Source and implementation boundaries

Follow [the reference policy](reference-policy.md) and [the source map](source-map.md) when promoting ADR-derived guidance. A current-maintainer ADR can support a concise decision summary, but domain data must still be supported by the appropriate implementation surface. Preserve source conflicts, incomplete coverage, and current-state limits rather than filling them from ADR intent.

Use these checks after changing the index:

```sh
python scripts/validate-architecture-decisions.py
python scripts/validate-adr-snapshot-inventory.py
python scripts/generate-agent-context-packs.py --check
python scripts/validate-agent-routing.py
python scripts/audit-kb.py
```
