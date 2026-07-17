# Architecture decisions

## Scope

`data/architecture-decisions.json` is a compact index of MoonCatRescue architecture decision records (ADRs) that are evidenced by checked-in references or registered high-confidence source locations. It does not copy ADR bodies and does not claim that its current records are a complete ADR corpus.

The current index contains ADR 0017, *MoonCat Color Math*. Its registered MoonCatRescue GitLab source is current-maintainer technical evidence. No local ADR directory or corpus listing is checked in, so missing ADR numbers are deliberately not inferred or synthesized.

## Reading a decision record

An ADR records design intent, rationale, and stated consequences. It is not direct proof of current deployed contracts, current API behavior, selected MoonCat state, or implementation completion. Use the index to explain why a documented design direction exists, then load the relevant parser, contract, generated-data, or current-state evidence before making an implementation claim.

For ADR 0017, the index preserves the documented color-model direction and its limits: the JavaScript parser is the color reference, integer hue handling and human-facing labels have a defined role, pure-coat visual matching has a stated caveat, and `MoonCatColors.mapColors` is edge-case context. The index does not establish exact RGB/hex values, palette output, current contract storage, or any particular rendered image.

## Status, dates, and supersession

Statuses are recorded only when reviewed evidence states them. ADR 0017 is recorded as accepted because its registered source notes that status. Its decision date is `null`: the reviewed source record reports an update date, not a decision date. Supersession links remain empty with `not-evidenced` status unless an ADR explicitly identifies a relationship.

The validator rejects duplicate IDs/numbers, unknown source references, invalid source locations or enums, missing related paths, self-links, and non-reciprocal supersession links. It validates only relationships entered in the index; it does not infer missing ADRs or links.

## Source and implementation boundaries

Follow [the reference policy](reference-policy.md) and [the source map](source-map.md) when promoting ADR-derived guidance. A current-maintainer ADR can support a concise decision summary, but domain data must still be supported by the appropriate implementation surface. Preserve source conflicts, incomplete coverage, and current-state limits rather than filling them from ADR intent.

Use these checks after changing the index:

```sh
python scripts/validate-architecture-decisions.py
python scripts/generate-agent-context-packs.py --check
python scripts/validate-agent-routing.py
python scripts/audit-kb.py
```
