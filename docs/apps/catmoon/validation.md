# CatMoon validation

The CatMoon README documents these source-repository commands:

```sh
npm run check
npm test
npm run build
npm run sync:names
npm run build:details
```

`npm run check` runs Node syntax checks over `src/main.js` and all
`src/js/*.js`; `npm test` runs the module tests under `test/`. The tests cover
geometry, filters, rescue URLs, wallet normalization, detail behavior,
export, theme normalization, rendering, and name synchronization. The build
is the Vite production build. `npm run sync:names` and
`npm run build:details` are data-generation commands, not merely tests.

This ingestion did not install dependencies or run those application
commands. It also did not run a browser, Cloudflare deployment, wallet API,
ENS lookup, RPC query, or live ownership check. The source notes therefore
report source-declared behavior only.

## Canonical name synchronization pattern

`tools/sync-mooncat-names.js` is the active name path. It accepts a plain
object, requires canonical decimal rescue-order keys within `0..25439`,
requires string values, sorts by numeric rescue order, serializes stable
two-space JSON, compares bytes before writing, and installs changed output via
an exclusive temporary file plus rename. The checked workflow runs validation
and commits only `public/data/mooncat-names.json` when bytes changed. The
legacy local-traits extractor remains explicit and is not a substitute for the
registered name-index input.

The workflow and tests are source evidence for deterministic output, atomic
writes, and change-only automation. They do not establish that a remote
name-index revision or deployed site is current.
