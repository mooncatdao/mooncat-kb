# Stasis overview

## Scope and revision

Stasis is a Vite/vanilla-TypeScript Canvas visualizer for a generated cohort
of 2,578 MoonCats held by 886 wallets. The reviewed source checkout was clean
at commit `192562fd7087aadc08e0a30d1f571b7db39684e4`, and its current `HEAD`
matched that commit on 2026-08-22.

The source is registered as `zibzub-stasis-repository` in `data/sources.json`.
It supports bounded application implementation notes only. It does not prove
current ownership, current dormancy, deployment, live API/RPC state, or
activity outside the snapshot's defined chain and cutoff.

## Pinned snapshot meaning

The committed generated presentation is pinned to Ethereum mainnet finalized
block `25,784,643`, timestamp `2026-08-18T21:23:35Z`. Dormancy is calculated
from the holder address's last outgoing Ethereum L1 transaction relative to
that point. It is an activity signal: it does not prove lost keys,
abandonment, inactivity on another chain, or that a wallet has no other kind
of activity.

The six source-declared bands are `4–5y: 1,387`, `5–6y: 456`, `6–7y: 28`,
`7–8y: 74`, `8–9y: 543`, and `9y-plus: 90`. These counts belong to the pinned
generated artifact and should not be restated as current live totals.

## Runtime and rights boundary

The normal browser runtime uses committed `public/data/stasis.json` and local
assets as generated local artifacts. It does not depend on sibling
repositories, RPC, external APIs, or blockchain access at runtime. The source
project still has package and build dependencies. `npm run build:fresh`
deliberately runs the input join first and can refresh the snapshot; it is a
different evidence path.

The source repository records GPL-3.0-or-later for source code. Generated
data, MoonCat-derived material, copied CatMoon atlas pixels, local atmosphere
images, fonts, and third-party logos retain separate provenance and rights
boundaries.

## Related pages

- [Architecture](architecture.md)
- [Rendering](rendering.md)
- [Data contracts](data-contracts.md)
- [Visual rationale](visual-rationale.md)
- [Validation](validation.md)
