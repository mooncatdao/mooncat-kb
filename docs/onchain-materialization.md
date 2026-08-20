# Pinned On-Chain Materialization Verification

## Status

This checkout contains a validated exhaustive snapshot at Ethereum mainnet
finalized block `25798234`, hash
`0x17116d2e0879e2a3ef5b611090662fb9532e9f6380d4492d6cae93bdefc89218`,
timestamp `2026-08-20T18:49:59Z`. It records non-empty runtime code for all eight
core contracts and block-pinned Traits, Colors, SVG, and original-owner calls.
Existing `data/materialization-parity-results.json` remains the separate
zero-network baseline.

All 48 required representative base comparisons passed. The exhaustive
identity/traits, colors/hue/glow, and explicit-glow-false SVG surfaces each
cover rescue orders `0..25439` in 26 contiguous shards. Each surface has 0
definite mismatches, 0 incomparable results, and 0 not-evaluated results. The
SVG surface has 25,440 parser-structure passes and exact bytes5/rescue-order
overload equality for all 25,440 cats. The exhaustive run does not perform the
SVG/Colors subset comparison; that result remains the representative 48
passed, 0 failed, 0 not evaluated. Accessories were not requested. All results
remain historical and block-bounded, not current-forever evidence.

## Safety and block selection

`scripts/verify-onchain-materialization.py` reads an endpoint only from the
environment-variable name supplied with `--rpc-env` (default `ETH_RPC_URL`). It
never prints or persists the value. The output records only a non-secret
provider classification and the environment-variable name.

At a new run, the verifier:

1. requires `eth_chainId` to equal Ethereum mainnet chain ID 1;
2. requests `eth_getBlockByNumber("finalized")` and otherwise falls back to the
   observed head minus at least 64 confirmations;
3. records the selected block's number, hash, timestamp, and selection mode;
4. passes that exact block number to every `eth_getCode` and `eth_call`; and
5. fetches the block again after verification and requires the same hash.

An explicit `--block-number` can reproduce a historical snapshot only when it
is at or before the provider's finalized block, or at or before the same
conservative fallback ceiling when the finalized tag is unavailable. `--resume`
requires the checkpoint's block number to resolve to the same hash before any
additional calls. No transaction, signature, trace, impersonation, or state
mutation method is implemented.

## Local plan and network runs

The local plan checks all eight registry/ABI relationships, resolves every
required overloaded canonical signature, selects 48 deterministic
representatives, and estimates exhaustive calls without reading an endpoint:

```text
python scripts/verify-onchain-materialization.py --plan --mode full --full-svg --accessories
```

A bounded representative run is:

```text
python scripts/verify-onchain-materialization.py --rpc-env ETH_RPC_URL --mode representative --accessories
```

The full identity/trait and color sweep, with the optional full non-glow SVG
surface used for this snapshot, is:

```text
python scripts/verify-onchain-materialization.py --rpc-env ETH_RPC_URL --mode full --full-svg
```

Resume the exact checkpointed block with:

```text
python scripts/verify-onchain-materialization.py --rpc-env ETH_RPC_URL --mode full --full-svg --resume
```

After normalizer or reporting-code changes, rebuild only the identical
checkpointed representative sample with:

```text
python scripts/verify-onchain-materialization.py --rpc-env ETH_RPC_URL --mode representative --resume --refresh-representative
```

The refresh mode refuses to select a new block, requires the existing sample
orders to match deterministic selection, verifies the checkpoint block hash
before overwriting representative evidence, and leaves exhaustive surfaces
untouched.

The default 48-cat set starts with the existing eight offline fixtures and
fixed rescue boundaries, then greedily covers previously unseen checked-in
Genesis, pale, facing, expression, pattern, pose, rescue-year, rescue-bucket,
and hue-edge categories before deterministic evenly spaced fill. These are
existing population categories, not new classifications.

## Verified surfaces

For every representative, the verifier calls and compares:

- `MoonCatTraits.catIdOf(uint256)` and both `kTraitsOf` overloads;
- both bytes5/rescue-order overloads of `colorsOf`, `hueIntOf`, and `glowOf`;
- both identifier overloads of `imageOf(...,false)`,
  `imageOf(...,true)`, and default `imageOf(...)`; and
- `MoonCatRescue.catOwners(bytes5)` for the pinned default-glow condition.

Returned SVG strings are compared as exact UTF-8 bytes and stored as byte
length plus SHA-256 and Ethereum Keccak-256, not as raw strings. Default outputs
are classified as equal to explicit false, explicit true, or neither. The
owner comparison is block-bounded and does not become a current ownership or
acclimation claim.

The observed MoonCatSVGs representation uses four opaque orthogonal polygons,
integer `rgb(r,g,b)` fills, inherited-fill `use` cells, and an optional
`scale(-1,1) translate(-128,0)` horizontal reflection. The normalizer models
paint order and overdraw, rasterizes only grid-aligned orthogonal polygons,
converts integer RGB fills exactly, and applies scale/translate transforms only
when resulting cells remain exact. Each observed base SVG also has a one-cell
transparent border on all four sides; the result records both viewBox
dimensions/margins and tight occupied bounds before comparing with the
mooncatparser matrix.

All 48 explicit-false SVGs normalize to the same tight dimensions, occupied
coordinates, color-role counts, and color partitions as their parser rows.
The tight dimension distribution is `17x22: 13`, `20x21: 12`, `21x17: 12`,
and `20x14: 11`; the corresponding SVG viewBox cell dimensions are `19x24`,
`22x23`, `23x19`, and `22x16`. All 48 have transparent margins of exactly one
cell on the left, right, top, and bottom.
Rotations, skew/matrix transforms, paths, non-orthogonal or non-grid polygons,
visible rectangles, images, fractional cells, strokes, opacity, clipping,
masks, filters, and unsupported fill syntax remain explicitly incomparable.
The validator never forces parity for those forms.

Contract colors are retained as raw `uint8[24]` arrays and RGB triplets.
Literal colors used by a cell-normalized base SVG are checked against that
contract output. The representative result is 48 passes. Human-facing KB color
labels are not contract palette evidence and are never used in this comparison.

Reporting is tri-state where required. Only false Boolean assertions and
explicit `failed` comparison states enter `mismatchCounts`. Structural
`incomparable` and color-subset `not-evaluated` states have separate counters
and cannot be mislabeled as mismatches.

## Full sweep and outputs

Full mode uses ascending rescue order, bounded JSON-RPC batches, retry/backoff,
atomic JSON writes, fixed-size shards, and a checkpoint containing the exact
block and next rescue order. The completed snapshot records:

- 76,320 identity/trait calls for all 25,440 cats;
- 152,640 color/hue/glow calls for all 25,440 cats; and
- when `--full-svg` is selected, 50,880 explicit-false SVG calls.

The resulting 279,840 per-cat `eth_call`s cover all three surfaces. Each has
`completedCount=targetCount=25440` and 26 shards: 25 shards of 1,000 rows plus a
final 440-row shard. Identity/traits and colors/hue/glow have no comparison
states beyond their Boolean assertions and have zero definite mismatches. The
explicit-false SVG surface has 25,440 structural passes, 0 failures, 0
incomparables, exact identifier-overload equality for every row, and zero
definite mismatches. SVG color-subset counts are all zero on this surface
because that cross-contract comparison is not part of its compact exhaustive
row schema; the representative result owns the 48 SVG/Colors subset passes.

Successful or partial network evidence is written under
`data/onchain-materialization/`. Its manifest owns the block, eight runtime-code
lengths/hashes, exact input hashes, representative evidence, exhaustive
completion plus mismatch/incomparable/not-evaluated counts, shard hashes, accessory status, and claim
boundaries. Partial provider/runtime stops retain exact checkpointed counts and
can be resumed; representative success is never reported as full-population
proof.

The accessory phase runs only when required representative base checks succeed.
It scans a bounded rescue-order prefix for cats with accessory records, limits
both cats and owned records, and records compact `ownedAccessoryByIndex`,
`placementOf`, base-image, and accessorized-image evidence at the same block.
It is not a full accessory ownership, definition, or worn-state index.

## Zero-network validation and claim boundary

After a snapshot exists, run:

```text
python scripts/validate-onchain-materialization.py
```

The validator checks local helper self-tests, block/address/hash shapes, all
eight contract records, input and generated-file hashes, stable JSON
serialization, representative overload comparisons, local identities/traits,
SVG output fingerprints, parser structure comparisons, shard coverage,
completion counts, tri-state comparison accounting, checkpoint agreement, and bounded
accessory evidence without using the network. The audit's `--allow-missing`
mode still performs full validation whenever this committed manifest exists;
default validation fails if it is absent.

This snapshot establishes deployed runtime presence and exhaustive ABI-call
behavior for the three recorded per-cat surfaces only at its exact block. The
48-row evidence separately covers default/true SVG behavior, pinned owner/glow
conditions, and SVG/Colors subset checks that were not repeated exhaustively.
Runtime-code hash presence does not establish verified-source/compiler
equivalence, and a pinned block is not current forever. Accessory composition,
current state, exhaustive true/default SVG modes, and exhaustive SVG/Colors
subset comparison remain outside this snapshot.
