# Stasis data contracts

## Generated shape

`public/data/stasis.json` records schema version 2 with:

- `snapshot`: finalized Ethereum chain, block, timestamp, source, and findings
  references;
- `atlas`: 3,360 × 3,498 pixels, 160 columns, 159 rows, 21 × 22 tiles, and
  `index: "rescueOrder"`;
- `cohort`: threshold 4 years, 886 holders, and 2,578 cats;
- `bands`: six labels, bounds, and counts;
- `holders`: deduplicated numeric holder entries with address/account type;
- `cats`: rescue order, bytes5-shaped CatID text, optional name, current
  holding surface, holder reference, exact outgoing timestamps, rescue
  classifications, band, and holding-since timestamps.

The numeric `holder` field is a generated local holder-table reference. It is
not an Ethereum address, an ERC token ID, or a rescue order.

## Generator invariants

`build-stasis-data.mjs` fails closed when:

- the pinned ownership references, block, timestamp, or findings text disagree;
- expected source schema versions or full snapshot totals are absent;
- names are not a plain object with decimal rescue-order keys and string values;
- a qualifying holder lacks a valid address, exact outgoing timestamp, or cat
  array;
- a rescue order or CatID is duplicated, malformed, out of range, or mismatched
  across the holder and tenure joins;
- tenure lacks a resolved holding timestamp, supported current surface, or the
  expected current holder;
- generated cohort, uniqueness, or six-band counts disagree; or
- the copied CatMoon atlas is not a PNG with the expected dimensions.

The exact UTC calendar-anniversary cutoff function is in the generator. It
assigns the six bands from outgoing timestamps and checks the expected counts
before writing output.

## Runtime checks and limits

The runtime checks the local atlas dimensions and that `cats.length` matches
the generated cohort count. It trusts the already generated fields for the
rest of presentation. Therefore schema validation at generation time and
runtime loading are complementary, not interchangeable. A static snapshot
and its generated joins do not establish current ownership, current holding
surface, or live dormancy.

Source paths: `scripts/build-stasis-data.mjs`, `src/main.ts` interfaces and
`start()`, and `public/data/stasis.json` in the reviewed application checkout.
