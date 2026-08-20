# MoonCatDAO Name-Index Integration

## Scope

[`mooncatdao/name-index`](https://github.com/mooncatdao/name-index) is the
preferred maintained source for finalized MoonCat naming state and canonical
`CatNamed` history in this KB's reviewed boundary. Its CC0-1.0 repository was
reviewed locally at commit `5d3b265613e987e4ca2c32e2afd7edf3178a146a` on
2026-08-11. This does not assert the state of a newer revision, a deployed
workflow, or the live chain.

Use [`data/name-index-integration.json`](../data/name-index-integration.json)
for the machine-readable contract, artifact roles, identifier fields, and
revision-bound metadata observation.

## Choose the finalized artifact

- Use `data/names-simple.json` for a lightweight finalized
  rescue-order-to-display-name map.
- Use `data/current-names.json`, `data/names-by-cat-id.json`, or
  `data/names-by-rescue-order.json` for detailed finalized current-name
  records. Choose the index that matches the input identifier.
- Use `data/events.jsonl` for finalized naming history, auditing, blank-event
  history, or rebuilding current-name artifacts. It is the canonical finalized
  event history; current-name files are derived from it.
- Read `data/metadata.json` with any generated downstream use so the input
  revision and finalized metadata remain explicit.

Detailed records preserve `nameRaw` separately from decoded `text` and status.
`eventId` is `transactionHash:logIndex`; `namedOrder` is canonical event
ordering for successful names; `namedYear` is derived from the canonical UTC
block timestamp; and `namer` is the immediate transaction sender, not proof of
the human chooser or beneficial owner.

## Finalized versus provisional

The `*-live.json` files, `data/pending-events.json`, and
`data/metadata-live.json` are provisional overlays. They may be reconciled,
removed, or replaced, so they are not canonical static state. Do not use them
as the source for a canonical generated population artifact.

Blank `CatNamed` attempts are different from successful names. An all-zero
`bytes32` event remains in `data/events.jsonl`, but it does not consume the
one-time naming state and produces no current-name record. A nonzero finalized
name is immutable per cat under the original contract semantics. The named
population can grow only by naming previously unnamed cats. Therefore, a
changed finalized nonblank name for a cat already named is an invariant
violation or data-corruption signal to investigate, not a routine refresh.

## Relationship to the KB snapshot

`data/mooncat-names.json` remains intact. It is a deterministic historical and
source-comparison snapshot generated from the local `mooncat_traits.json`
reference, useful for reproducing that source's rows and comparing sources. It
is not the preferred maintained source for finalized current names, canonical
event history, namer information, naming order/year, or blank-event history
when name-index is available.

Original protocol/storage semantics remain in
[`docs/mooncat-naming.md`](mooncat-naming.md). The maintained index does not
replace original-contract evidence for `nameCat`, `catNames`, or byte-level
semantic questions.

## Full-population index integration

The generated 25,440-cat population index embeds finalized nonblank name-index
data directly as a source-attributed monotonic enrichment. Its manifest records
the exact repository revision and pinned finalized inputs. Each rebuild must
record the exact repository revision and finalized metadata/artifact it used,
then be deliberately regenerated when newly finalized names appear. It may use
a pinned local name-index checkout or copied CC0 finalized artifact, so the
generation path does not require live network access.

The population generator excludes provisional/live name-index data and fails
for investigation rather than accepting a mutation to a previously finalized
nonblank name. See
[`docs/mooncat-population-index.md`](mooncat-population-index.md) and
`data/mooncat-population/manifest.json` for the implemented field provenance,
pinned revision, counts, and exclusions.

## Freshness boundary

The reviewed metadata counts are observations tied to the review date and
commit; they can advance. Use the reviewed finalized artifact for a
revision-bounded answer. Seek a newer name-index revision or authorized live
verification only when a request genuinely needs data newer than that boundary.
