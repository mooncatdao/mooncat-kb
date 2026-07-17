# ChainStation Web Implementation Surfaces

Machine-readable index: `data/chainstation-surfaces.json`.

## Scope and evidence method

This audit reviews a compact source snapshot of MoonCatRescue ChainStation Web at commit `5df03ab465d46f59f3e4d4a05e4e85fc90abdc0a` on `master`. `references/upstream/chainstation-web-audit/SNAPSHOT.json` records the public repository, branch evidence, retrieval date and commands, commit, package-metadata license observation, and the exact hashes, sizes, source paths, and line ranges for all copied files.

The snapshot is deliberately small. It copies selected application, configuration, API, wallet, rendering, and deployment files but excludes the complete repository, dependencies, build output, caches, environment values, secrets, full trait JSON, and unreviewed routes. Whole-file copies make each listed surface reproducible without presenting the snapshot as a vendored application.

## System map

```text
Next route/app shell
  -> local MoonCat trait lookup (rescueOrder or catId)
  -> detail page / grid
       -> ChainStation API helpers and application route adapters
       -> image and VOX gateway URLs
       -> wallet, RPC, configured contract-action helpers
       -> Firebase/session configuration where needed
```

The map is evidence of source relationships, not a runtime trace. A helper can be present in the reviewed source while its API, RPC, gateway, contract, Firebase project, wallet, or deployment is unavailable or behaves differently now.

## High-value observed flows

### MoonCat data, detail, and image flow

`lib/getMoonCatData.ts` reads the checked-in `lib/mooncat_traits.json` and matches a rescue order or lowercased Cat ID. The MoonCat detail route repeats route-input normalization, obtains API-backed details through `lib/getMoonCatDetails.ts`, and builds image URLs using the configured API root. The detail route also loads Sequence listing data, but the audit does not index that helper's internals.

This is mixed local and runtime evidence: the trait input is checked-in application data, while details, ownership, images, and listings depend on services or external state. The audit does not make a current trait, name, owner, image, listing, or API-availability claim.

### Filtering and search

`components/MoonCatGrid.tsx` keeps filter and page state in the URL, then calls `/api/mooncats` with GET for the all-MoonCats case or POST for a bounded set. `app/api/mooncats/route.ts` is included to show the application route boundary. This gives coding agents a concrete path from user controls to the adapter without importing all UI components or response data.

### Wallet, ownership, and contract-facing code

`lib/wagmi-config.ts`, `lib/publicClient.ts`, `lib/tokens.tsx`, `lib/useOwnedTokens.ts`, and `lib/onchainActions.ts` show configured wallet/RPC clients, token formatting, owner-profile consumption, and queued action handling. `app/api/siwe-verify/route.ts` and `lib/firebase.ts` show a session-verification and Firebase-admin boundary.

Configured addresses, RPCs, or ABIs in these files are source/configuration evidence only. They do not demonstrate a connected wallet, successful signature, transaction, authenticated session, current owner, valid endpoint, or live contract result.

### Rendering and static assets

`components/MoonCatSprite.tsx` constructs an animated sprite background from an IPFS path. The plain VOX route tries a small ordered list of IPFS gateways and invokes `public/vox.js`. The viewer code is included, but its loader and all external asset responses are outside the compact evidence set. Therefore the audit can identify the source path and fallback design, not pixel-level output, gateway availability, or public-page availability.

### Build and deployment boundaries

`package.json`, Next/TypeScript settings, Firebase/App Hosting files, `.gitlab-ci.yml`, and `firebase_deploy.sh` establish intended local commands and CI/deployment configuration at the pinned revision. No deployment, secret, CI result, or current hosting state was queried. Conventional tracked test paths were not observed by the bounded tree search recorded in `SNAPSHOT.json`; that is not proof that the project has no tests.

## ADR and source boundaries

The audit links the application shell only to ADR 0005 as a direct conceptual web-architecture relationship. ADR 0005 is deprecated and remains an intent record; it does not prove that the pinned application implements its design, that the design was rolled out, or that any current site matches it. For any question that combines an ADR and ChainStation behavior, load `data/architecture-decisions.json` and `data/chainstation-surfaces.json` separately, then state which conclusion comes from which source.

Likewise, a pinned ChainStation source file is not a source of current deployment, live API, chain, ownership, marketplace, Firebase, or external-IPFS state. Obtain separately authorized live evidence for those questions.

## Coding-agent use

Use the `trace-chainstation-implementation` route for implementation questions. Start with the compact index and this document, then choose only the surface's named KB files and snapshot paths if source detail is necessary. Follow a UI route to its copied helper/route/config files; do not load the full snapshot, full trait table, or arbitrary application tree by default.

Stop when a request needs unreviewed source, a live service response, deployment status, current chain state, or user-specific state. The route and benchmark cases intentionally preserve those boundaries.
