# Rescue Mining

Machine-readable summary: `data/rescue-mining.json`.

Reusable example snippet: `examples/rescue-mining.js`.

## Current Status

Original browser reviewed, contract-compatible example added.

This page documents the browser-side search used by the original MoonCatRescue website to find a valid normal MoonCat seed before calling the original contract. It is scoped to normal, non-genesis rescue mining.

## What Rescue Mining Meant

Normal MoonCats were not selected by choosing a visible cat ID directly. The browser searched for a 32-byte seed that, together with the contract `searchSeed`, produced a valid hash. A valid result gave the browser a candidate normal `catId` and a seed that could be submitted to the original `rescueCat(seed)` contract function.

The reviewed browser path stops at a transaction boundary: the mining code finds a seed and displays the candidate cat, while the rescue action calls `mcr.rescueCat(catSeed)`. The reusable example in this repo stops before that boundary and contains no wallet, provider, account, private-key, gas, or transaction code.

## Reviewed Browser Flow

The local clone of `https://gitlab.com/mooncatrescue/mooncatrescue-web` was inspected at these files:

- `public/scan.html`
- `public/js/mine.js`
- `public/js/mine-worker.js`

The reviewed page defines this `searchSeed`:

```text
0xd14b1349b8662386a0002c6dbc7f8ced11312226af1da67a1be7b28f66fed6cd
```

`scan.html` passes that value into `createMiner(searchSeed)`. `mine.js` removes the leading `0x` and starts web workers. `mine-worker.js` converts the search seed to bytes, repeatedly generates random 32-byte candidate seeds, hashes the candidate seed concatenated with the search seed, accepts a hash whose first three bytes are zero, and derives the normal `catId` from the hash tail.

No sequential seed increment behavior was observed in the reviewed browser worker. Candidate generation in the reviewed worker is random.

## Hash And Cat ID Relationship

The browser-side operation is:

```text
hash = keccak256(seedBytes || searchSeedBytes)
valid when hash starts with 000000
catId = 0x00 || last 4 bytes of hash
```

The contract-side rule already recorded in `data/protocol-constants.json` matches this shape: normal rescue cat IDs are derived from `keccak256(seed, searchSeed)` when the first three bytes of the hash are zero, and the `catId` uses the last four bytes plus a byte indicating genesis status. For the normal browser-mined case, the leading byte is `0x00`.

## Reusable Example

Use `examples/rescue-mining.js` when you need a small, wallet-free seed search example. The caller must provide an Ethereum-compatible `keccak256` function for raw bytes. The example returns:

- `seed`
- `hash`
- `catId`
- `iterations`

It does not submit a rescue transaction.

## Embeddable Widget Example

Use `examples/rescue-mining-widget/` for a plain HTML/CSS/JS widget that can be mounted into an existing page:

```html
<div id="mooncat-miner"></div>
<script src="vendor/sha3.min.js"></script>
<script src="vendor/mooncatparser.js"></script>
<script src="mooncat-render-adapter.js"></script>
<script src="rescue-mining-widget.js"></script>
<script>
  mountMoonCatRescueMiner("#mooncat-miner", {
    difficultyPrefix: "000000",
    knownRescuedCatIds: []
  });
</script>
```

The widget keeps the original scanner-style start/stop/found flow and recreates the space/moon scanner visual with CSS and canvas. It does not hotlink the original remote credit URLs and does not import the original lunar image, star backgrounds, fonts, Web3 code, workers, or transaction code.

The widget example vendors the original site's `public/js/sha3.min.js` as `examples/rescue-mining-widget/vendor/sha3.min.js`. That file identifies js-sha3 0.6.1 by Chen, Yi-Cyuan under MIT and preserves its upstream header. Hash provider selection is: host-supplied `options.keccak256(bytes)`, then global js-sha3 `keccak_256`, then the widget's internal Ethereum Keccak-256 fallback. Each path hashes raw bytes equivalent to `seedBytes || searchSeedBytes`.

The widget also vendors `mooncatparser.js` from `references/upstream/mooncatrescue/mooncatparser.js`, which is byte-identical to the original site mirror's `public/js/mooncatparser.js`. `mooncat-render-adapter.js` mirrors the original site's rendering path by calling `mooncatparser(catId)` and drawing the returned color cells into a canvas. This renders the found bytes5 `catId` as a MoonCat image, but it does not add trait, ownership, current availability, or chain-state claims.

The widget defaults to `difficultyPrefix: "000000"`, the original reviewed rescue difficulty, with an expected average of about 16.8M attempts. It also includes a visible demo-mode control for `difficultyPrefix: "0000"` so local UI testing can finish faster. Demo mode has an expected average of about 65,536 attempts and is not the original rescue difficulty.

`knownRescuedCatIds` may be an array or `Set`. When supplied, the widget continues scanning until the valid `catId` is not in that set, then labels the result as a valid unlisted candidate. It still does not check current chain state and must not be used to claim that a cat is currently rescuable.

## Limitations

- This is not a byte-for-byte copy of the original browser worker.
- The full original website frontend, bundled libraries, minified files, UI code, wallet code, and transaction code are not imported.
- The embeddable widget recreates scanner styling and renders found candidates through mooncatparser.js; it does not treat the rendered pixels as trait, ownership, current availability, or chain-state data.
- The widget does not rely on dead remote assets at runtime; original moon/sphere credits are preserved in the widget README and data notes only.
- The widget vendors only the original site's js-sha3 dependency and the registered mooncatparser.js reference; it does not import Web3, workers, images, or unrelated frontend code.
- The example does not prove that any cat is still rescuable or that a transaction would succeed.
- This does not define image rendering, parser behavior, traits, rescue-order membership, current ownership, or current API behavior.
- The reviewed files support the browser mining operation and transaction boundary only.
