# Rescue Mining Widget Example

Plain embeddable MoonCat normal rescue-mining widget. It recreates the original
scanner page flow in a self-contained, wallet-free form:

```html
<link rel="stylesheet" href="rescue-mining-widget.css">
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

The widget searches random 32-byte candidate seeds using the original reviewed
browser rule:

```text
hash = keccak256(seedBytes || searchSeedBytes)
valid when hash starts with 000000
catId = 0x00 || last 4 bytes of hash
```

The default `difficultyPrefix` is `"000000"`, matching the original reviewed
rescue-mining difficulty. That mode has an expected average of about 16.8M
attempts per valid candidate.

For faster local UI testing, use demo mode in the visible difficulty selector or
mount with:

```js
mountMoonCatRescueMiner("#mooncat-miner", {
  difficultyPrefix: "0000"
});
```

Demo mode has an expected average of about 65,536 attempts and is not the
original rescue difficulty.

For quick browser checks of the found state, the example page also accepts local
query parameters without changing the default:

```text
index.html?difficultyPrefix=0&autostart=1
```

The example vendors the original site's `public/js/sha3.min.js` at
`vendor/sha3.min.js`. The vendored file identifies js-sha3 0.6.1 by Chen,
Yi-Cyuan under MIT and preserves the upstream header comment. The widget chooses
a hash provider in this order:

1. `options.keccak256(bytes)`, if supplied by the host.
2. Global js-sha3 `keccak_256`, if `vendor/sha3.min.js` or another compatible
   js-sha3 build is loaded.
3. The widget's internal Ethereum Keccak-256 fallback.

Each path hashes raw bytes equivalent to `seedBytes || searchSeedBytes`. The
vendored dependency keeps the demo closer to the original site. The fallback
keeps the widget usable without Web3, a wallet, a provider, network access, or
the vendored script.

The example also vendors `mooncatparser.js` from the registered local reference
`references/upstream/mooncatrescue/mooncatparser.js`, which is byte-identical to
the original site mirror's `public/js/mooncatparser.js`. That parser file has no
header comment in the inspected copy. `mooncat-render-adapter.js` keeps the
parser integration separate from the mining logic and mirrors the original
site's `drawCat(catId, size)` canvas loop: call `mooncatparser(catId)`, then draw
each returned color cell into a canvas.

## Filtering Known Rescues

Pass `knownRescuedCatIds` as an array or `Set` of lowercase or mixed-case cat IDs.
When supplied, the miner keeps scanning until it finds a valid cat ID that is not
in that set. The result is labeled as a valid unlisted candidate, not as currently
rescuable.

This widget renders the found `catId` with mooncatparser.js, but it does not
check chain state, ownership, rescue availability, or traits.

## Original Source Notes

A local mirror of mooncatrescue-web was inspected for this widget:

- `public/scan.html`
- `public/js/mine.js`
- `public/js/mine-worker.js`
- `public/js/search.js`
- `public/css/site.css`
- `public/js/background.js`
- `public/img/bg0.png`
- `public/img/bg2.png`
- `public/img/lunarsurface.jpg`
- `public/js/sha3.min.js`
  copied to `vendor/sha3.min.js`
- `public/js/mooncatparser.js`
  copied from the registered local reference to `vendor/mooncatparser.js`

No repo-root `LICENSE`, `COPYING`, `README`, or package metadata file was present
in the mirror. The copied `public/js/sha3.min.js` header identifies js-sha3 0.6.1
by Chen, Yi-Cyuan under MIT. `public/js/search.js` contains these credits:

- moon image: `http://binarymillenium.soup.io/post/195579525/Lunar-DTM100-to-Blender-displacment-map`
- 3d sphere: `http://www.codesin.net/post/Mapping-Images-on-Spherical-Surfaces-Using-Javascript-and-HTML5-Canvas/`

This widget does not copy the original lunar image, star background images,
fonts, Web3 code, worker files, or transaction code. It vendors only js-sha3 and
mooncatparser.js from reviewed/reference sources, adapts the visible
scan/start/stop/found-state behavior, and recreates the moon/space scanner
styling with CSS and canvas.

## Limitations

- Does not call `rescueCat`.
- Does not submit transactions.
- Does not use a wallet, provider, account, private key, or gas settings.
- Does not claim a found cat is currently rescuable on-chain.
- Does not import a rescued-cat dataset.
- Renders the found `catId` with mooncatparser.js, but does not infer traits,
  ownership, current availability, or current chain state from that rendering.
