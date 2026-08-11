# Contract ABI and event registry

This registry provides deterministic, zero-network ABI and event lookup for the eight core MoonCat materialization contracts and two reviewed adjacent contracts. It is generated from exact address-bound ABI JSON embedded in the checked-in `libmooncat-limited.js` reference. An ABI is accepted only when its embedded address matches the reviewed address in `data/contracts.json`.

## Files

- `data/contract-registry.json` is the contract-level catalog, including core/adjacent classification, ABI status, artifact hashes, reviewed semantic files, deployment boundaries, and contract-scoped identifier summaries.
- `data/abi-registry/*.json` contains nine normalized exact ABI artifacts: all eight core contracts plus the adjacent historical MoonCatsWrapped/WMCR contract.
- `data/event-registry.json` contains every event from those exact ABIs, including overload-safe canonical signatures, ordered/indexed parameters, Ethereum topic0, generic-event classification, and bounded semantic annotations.
- `data/event-indexer-recipes.json` contains five practical indexing plans for rescue/adoption, naming, Acclimation, WMCR, and accessories.
- `scripts/query-contract-events.py` queries the compact registries without parsing the upstream bundle.

CatNamer remains an adjacent `semantic-only` entry. Its reviewed address and role are useful context, but the local bundle has no exact address-matching ABI for it, so the registry does not claim a full ABI or event surface.

## Deterministic extraction

Run:

```sh
python scripts/extract-contract-abis.py --check
python scripts/validate-contract-registry.py
```

The extractor preserves ABI item and parameter order, tuple components, overloads, event `anonymous` and `indexed` flags, and modern ABI fields. For the original legacy ABI it retains `constant` and `payable` while adding the equivalent `stateMutability` value. Artifact hashes cover the complete normalized artifact file and the recorded provenance includes the checked-in bundle hash.

The validator independently reparses address-bound source ABI strings, recomputes normalized signatures and artifact hashes, compares every event parameter in order, checks identifier annotations against `data/identifier-conventions.json` or the registry's explicit local enum, and ensures the core set remains exactly eight.

## Event topics

Every non-anonymous event includes `topic0`, computed as Ethereum Keccak-256 over its canonical signature. The implementation does not use NIST SHA3-256. The independent validator checks the empty-input Keccak vector, the canonical ERC Transfer topic vector, and every registry event topic.

## Identifier boundaries

Identifier annotations are contract-scoped:

- Original contract `bytes5` event fields are `mooncatIdBytes5`. A separate reviewed lookup is required before adding rescue order.
- MoonCatAcclimator parent `tokenId` values are `erc721TokenId`; their rescue-order equivalence applies only to that exact contract.
- WMCR `tokenID` values are `moonCatsWrappedTokenId`, backed by explicit catId mappings rather than rescue order.
- On-chain parameters literally named `rescueOrder` use the registry-local `mooncatRescueOrder` kind: a contract-level `uint256` MoonCat rescue-order identity, numerically aligned with the reviewed rescue-order convention. It remains distinct from `localRescueOrderIndex`, which is a local membership/bucket index.
- MoonCatAccessories `rescueOrder`, `accessoryId`, `ownedAccessoryIndex`, `managedAccessoryIndex`, and `paletteIndex` remain distinct. `zIndex` is render/wear order, not an identifier.
- ERC-998 child token IDs require the accompanying child-contract address and are never globally interpreted as MoonCat rescue orders.

Generic `Transfer`, `Approval`, `ApprovalForAll`, ERC-998 child events, pause events, and ownership-administration events are retained. Generic events are not discarded and their token IDs are interpreted only in the emitting contract's scope.

## State and history boundaries

An event is historical evidence, not a current-state assertion. Recipes therefore name corroborating read surfaces and require reorg-safe, idempotent indexing when a consumer later adds authorized RPC access.

The naming recipe preserves the all-zero `CatNamed` edge case: the event may emit while `catNames` remains zero, so event presence is not equivalent to a current name or consumed naming state. Use `data/name-index-integration.json` for the reviewed revision-bounded finalized history/current-name artifacts; direct log ingestion is appropriate only for a separately authorized independent history build or audit. The registry does not vendor `events.jsonl`.

The accessory ABI has exact lifecycle events for definition creation and management plus purchase/application. It has no dedicated event for every `alterAccessory` palette or z-index mutation, so event-only reconstruction cannot prove complete current wear state.

Known deployment or start boundaries are retained only where checked-in reviewed files provide them. The naming recipe records its reviewed scan boundary, not a generalized deployment block. MoonCatAccessories retains its reviewed deployment transaction and timestamp while leaving the block unknown. Other missing deployment blocks remain explicit rather than inferred.

## Query examples

```sh
python scripts/query-contract-events.py --event CatNamed --json
python scripts/query-contract-events.py --event MoonCatAcclimated --json
python scripts/query-contract-events.py --event Wrapped --json
python scripts/query-contract-events.py --identifier-kind mooncatIdBytes5 --json
python scripts/query-contract-events.py --classification adjacent
python scripts/query-contract-events.py --recipe accessory-lifecycle --json
```

These commands read only generated/curated local registry files. They do not contact Ethereum, an explorer, an API, or the maintained name-index repository.

## Limits

- Exact local ABI extraction does not prove deployed bytecode equivalence, current ownership, current offers, current names, current accessory state, balances, or marketplace state.
- The registry is not a log dataset, RPC scanner, webhook, database, sync service, or completeness claim.
- No contract ABI is synthesized from function summaries. CatNamer remains semantic-only until a separately reviewed exact local artifact is added.
- Deployment transaction, block, and timestamp fields are not interchangeable; an unknown block remains unknown.
