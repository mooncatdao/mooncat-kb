# Static MoonCat profile resolver

This dependency-free ESM example resolves one explicitly tagged identifier
against the committed full-population manifest and rescue-order shards. It is
local and zero-network: it does not call an RPC, API, contract, wallet, or
marketplace, and it does not create a second profile dataset.

## API

```js
import { resolveMooncat } from './resolve-mooncat.mjs';

const result = await resolveMooncat({
  kind: 'catIdBytes5',
  value: '0x00958b3253',
});

console.log(result.row);          // the existing generated population row
console.log(result.provenance);  // manifest and field-group provenance
```

Only these tags are accepted:

- `catIdBytes5`: a lowercase `0x` prefix followed by exactly five bytes. Hex
  digits may be uppercase and are normalized for the lookup.
- `rescueOrder`: an integer in the documented inclusive range `0..25439`.

The resolver rejects bare values, generic `tokenId`, WMCR token IDs, accessory
IDs, malformed values, and syntactically valid Cat IDs absent from the local
population. Errors are `MooncatProfileResolverError` instances with stable
codes such as `INVALID_CAT_ID`, `UNKNOWN_CAT_ID`, and
`UNSUPPORTED_IDENTIFIER_KIND`.

The returned `row` is the parsed row from its existing generated shard. The
`provenance` envelope exposes the existing manifest scope, source references,
field-group provenance, shard path, and exclusions; it does not claim current
ownership, accessories, market data, live chain state, provisional names, or
complete naming event history. Names are the manifest's pinned finalized
enrichment, and color/category meanings retain their documented trust limits.

## Test

From the repository root:

```sh
node --test examples/mooncat-profile/resolve-mooncat.test.mjs
```

The tests cover rescue-order boundaries, a released Genesis row, named and
unnamed rows, both identifier kinds, normalization, malformed and unknown Cat
IDs, invalid rescue orders, unsupported kinds, and live-state exclusions.

