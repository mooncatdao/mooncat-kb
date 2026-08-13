# Supplied MoonCat event decoder

This dependency-free ESM example decodes one already-supplied Ethereum log
against the checked-in exact MoonCat contract and event registries. It is a
local conformance kit, not a log fetcher or indexer: it makes no RPC, API,
explorer, provider, history, database, or ChainStation calls.

## API

```js
import { decodeMooncatEvent } from './decode-mooncat-event.mjs';

const result = await decodeMooncatEvent({
  contract: {
    key: 'mooncatRescue',
    address: '0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6',
  },
  log: {
    address: '0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6',
    topics: ['0x...topic0...', '0x...indexed-word...'],
    data: '0x...abi-data...',
  },
});
```

The contract context requires both a reviewed registry key and its exact
reviewed address. The log address must match that context. The first topic is
matched to the exact registry `topic0`; indexed topics and non-indexed data are
then decoded using the registry's ordered parameter types and flags.

The returned `rawLog` is a copy of the supplied log. Each returned parameter
contains its raw word(s), decoded value, indexed flag, and the existing
`identifierKind` annotation when present. Integer values are decimal strings so
large Ethereum values remain exact. Fixed bytes remain hex, and fixed arrays
are decoded element-by-element. The current 32-event registry uses only
supported static types (`address`, `bool`, `uint*`, `bytes*`, and `bytes5[16]`).
If a future registry shape is dynamic or otherwise unsupported, the decoder
fails with `UNSUPPORTED_ABI_TYPE`; an indexed dynamic value would be exposed
only as a non-recoverable topic hash.

## Covered boundaries

Fixtures cover original `CatNamed`, Acclimation `MoonCatAcclimated`, WMCR
`Wrapped`, accessory `AccessoryApplied`, and generic WMCR `Transfer`. Generic
events retain the identifier meaning of the emitting contract: an ERC-721
token ID, WMCR token ID, MoonCat rescue-order annotation, accessory ID, and
other registry kinds are not collapsed into one global token meaning.

The event semantics and raw evidence remain historical. The decoder rejects
an explicit current-state assertion and never returns current name, owner,
wrapping, accessory-wear, market, or other storage state. In particular,
`CatNamed` presence is not proof of consumed/current naming state, and an
accessory event is not a complete reconstruction of current wear state.

Errors are `MooncatEventDecoderError` instances with stable codes including
`UNKNOWN_CONTRACT`, `CONTRACT_ADDRESS_MISMATCH`, `LOG_CONTRACT_MISMATCH`,
`UNKNOWN_EVENT_TOPIC`, `MALFORMED_TOPICS`, `DATA_SHAPE_MISMATCH`,
`UNSUPPORTED_ABI_TYPE`, and `CURRENT_STATE_UNSUPPORTED`.

## Test

From the repository root:

```sh
node --test examples/mooncat-event-decoder/*.test.mjs
```

