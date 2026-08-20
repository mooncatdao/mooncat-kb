# MoonCat Naming System

## Scope

This page documents a source-bounded naming consumer model. It describes the
original MoonCatRescue naming storage and event surface, the generated local
snapshot, display/moderation boundaries, and adjacent CatNamer context. For
maintained finalized current-name and history artifacts, see
[`docs/name-index-integration.md`](name-index-integration.md). This KB does
not provide its own live event indexer, RPC client, or sync path.

## Original contract semantics

The original MoonCatRescue contract stores its canonical name value in
`catNames(bytes5) => bytes32`. It exposes `catNames`, `getCatNames()`, the
name field through `getCatDetails`, and `nameCat(bytes5,bytes32)`.

`nameCat` requires that `msg.sender == catOwners[catId]`, that the stored name
is zero, and that the cat has no active adoption offer. It stores the supplied
`bytes32` and then emits `CatNamed(bytes5 indexed catId, bytes32 catName)`.
An EOA owner can make that call directly. When the original MoonCat is owned
by another contract, that owning contract must make the call or expose a path
that makes it.

Consequently, a nonzero stored name is permanent in this storage model, while
duplicate names are permitted because there is no global uniqueness check.
The protocol accepts arbitrary `bytes32` values, not only valid UTF-8 strings.

### All-zero edge case

An all-zero `bytes32` still produces a `CatNamed` event, but leaves storage at
zero. It therefore does not consume the one-time naming state and repeated
zero-name events remain possible. Event presence alone is not a current-name
proof.

## Event-consumer record

Persist an event record with at least:

- `contractAddress`, `catId`, and raw `catName`/`nameRaw` as bytes32 hex;
- a `decodeStatus` and an optional decoded display string;
- `transactionHash` and `logIndex` as the event identity;
- `blockNumber`, `transactionIndex`, and `logIndex` for canonical ordering;
- a `stateEffect` such as `stored-nonzero-name` or `zero-name-no-storage-change`.

Retain raw bytes even when a display decoder cannot produce a safe string. Do
not turn invalid bytes into replacement-character text and call that the exact
on-chain name. UTF-8 decoding and platform moderation are presentation layers:
the official documentation describes invalid-byte handling and off-chain
redaction, while the original contract retains the underlying bytes.

Consumers that track logs should checkpoint a finalized position, tolerate
reorg removal/replay, and only promote sufficiently confirmed logs to a final
history view. A log is identified by transaction hash plus log index, not by
cat ID or name text. No complete historical log set is checked in here.

## Preferred API event ingestion (optional)

`data/api-endpoints.json` documents the preferred MoonCatRescue API entry
`mooncatrescue.get.events`: `GET /events`. A downstream consumer may use that
documented request surface as one optional ingestion route for `CatNamed`:

- `contract` accepts an Ethereum address; use the original MoonCatRescue
  contract address when that is the intended event scope.
- `event` filters records by event name; use `CatNamed` only when the consumer
  wants that event category.
- `mooncat` accepts a bytes5 `catId` (`0x` plus 10 hex characters) or decimal
  rescue index from 0 through 25,439.
- `limit` has a documented range of 1 through 500.
- `start_after` is documented as a block number and event log index separated
  by a `hypen` (the spelling used by the endpoint manifest).

This is request-shape guidance from the checked-in endpoint manifest, not a
service guarantee. It does not establish current API uptime, complete event
coverage, canonical ordering, reorg behavior, response contents or freshness,
current chain state, or equivalence to direct logs or current `catNames`
storage. Retain the event record and finality rules above even when an API
response is available.

## IDs and current state

`CatNamed` carries a bytes5 `catId`, not a rescue order. A consumer may enrich
it through a separately source-backed mapping (the checked trait snapshot,
LibMoonCat, documented API, or original-contract rescue-order lookup), but
must not invent the conversion from the bytes alone.

For a revision-bounded finalized name, canonical finalized history, naming
order/year, namer, or blank-event history, prefer the reviewed MoonCatDAO
name-index integration and its finalized artifacts. Current `catNames` storage,
current ownership/offer eligibility, a newer-than-reviewed name-index revision,
current named counts, and a live complete event count require separately
authorized verification. The official named-MoonCats page is a current display
surface, not a timeless canonical population count.

## Checked-in naming snapshot

`data/mooncat-names.json` is generated from the local 25,440-row
`mooncat_traits.json` reference. It contains all 1,225 name-bearing source
rows: 1,207 source strings and 18 boolean invalid/unparsed markers. It keeps
the exact `nameRaw` bytes32 values, `rescueOrder`, `catId`, `namedOrder`, and
`namedYear`; string names are retained exactly as present in the source and
markers have `decodedName: null`.

Run:

```sh
python scripts/generate-mooncat-names.py --check
python scripts/validate-mooncat-names.py
```

This is a checked-in historical/source-comparison snapshot, not current
contract truth, maintained finalized event history, display-policy evidence, or
a live completeness claim. It remains useful for deterministic comparison to
its `mooncat_traits.json` source, but is not the preferred maintained current
finalized naming source where the name-index artifacts are available.

## Maintained finalized naming artifacts

The separately maintained CC0-1.0 MoonCatDAO name-index repository provides
the preferred reviewed source for finalized current names and canonical
`CatNamed` history. Its `data/events.jsonl` is canonical finalized history and
its finalized current-name files are derived from that ledger. Blank events
remain in history but do not create current-name records.

See [`docs/name-index-integration.md`](name-index-integration.md) and
[`data/name-index-integration.json`](../data/name-index-integration.json) for
artifact selection, provisional/live exclusion, revision-bound freshness, and
implemented full-population-index guidance. Original protocol semantics in this
document remain the source for `nameCat`/`catNames` behavior.

## CatNamer boundary

CatNamer at `0x6103760180D12eE883b93C988D0bEbbab51f3668` is adjacent utility
context. Official helper material describes a flow that de-acclimates an
Acclimated MoonCat, names it through original MoonCatRescue, and re-acclimates
it; related material also describes naming-rights sale flows. It does not
replace original `catNames` as the canonical permanent-name storage and is not
one of the eight core materialization contracts. Its current state, complete
ABI, transactions, and sale activity remain out of scope.

## Sources and limitations

See `data/mooncat-naming.json` and `data/sources.json` for the exact source
registry. A user-supplied assertion about a large number of repeated empty-name
events is intentionally not promoted here: it has not been independently
verified from chain/event evidence.
