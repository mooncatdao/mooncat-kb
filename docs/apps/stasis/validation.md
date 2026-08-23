# Stasis validation

The Stasis README documents:

```sh
npm run check
npm run build
npm run sync:data
npm run build:fresh
```

`npm run check` runs TypeScript `tsc --noEmit`; `npm run build` builds from
the committed JSON and assets; `npm run sync:data` runs the deterministic
source join; and `npm run build:fresh` syncs data before building. Normal
browser runtime use is self-contained around generated local artifacts and
does not depend on sibling repositories, RPC, or external APIs; package and
build dependencies remain part of the source project's development process.

This ingestion did not install application dependencies or run these commands.
It did not run a browser, visual screenshot comparison, deployment check,
API/RPC query, or live-state verification. A source-declared static runtime
boundary must not be reported as a live deployment result.

The key focused checks for future changes are: keep the pinned block and
timestamp unchanged unless a deliberate snapshot refresh is intended; rerun
the data generator for source/input changes; rerun the type check and build for
runtime changes; and separately inspect browser behavior when visual or
accessibility claims matter.
