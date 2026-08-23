# CatMoon domain rules

## Identifier boundaries

CatMoon uses rescue order as its local population index and atlas index. A
bytes5 Cat ID, a contract-scoped token ID, a wallet address, an ENS input, and
a local array index are different values with different owners and
conversion rules. The application source does not justify treating them as
interchangeable. In particular, the OpenSea URL in `src/js/cat-details.js`
uses the Acclimated contract and a rescue-order-shaped path segment; it is not
evidence that every contract's token ID equals rescue order.

## Filter definitions and runtime unions

`src/js/config.js` declares the filter definitions:

- `named` from names;
- `genesis`, `day1`, `week1`, `2017`, `2018`, `2019`, `2020`,
  `earlyRescues`, and `2021` from named category sets;
- `characters` as the runtime union of `garfield`, `cheshire`, `pinkpanther`,
  `alien`, `zombie`, `simba`, `golden`, and `pikachu`;
- `wallet` as a lookup-created runtime set rather than a prepared category.

`src/js/filters.js` constructs sets from category ID arrays. It derives the
Character Cats set by inserting every member of the eight subtype sets, so a
cat in more than one subtype is counted once in the union. The filter manager
keeps set membership and display counts separate and can leave Named Cats
unavailable when the names payload fails validation.

## Character and Genesis presentation boundaries

`src/js/cat-details.js` applies rescue timing first (`day 1`, `day 2`, or
`week 1`) and then adds `genesis` or the first matching character subtype.
Genesis takes precedence over character labels. Genesis detail detection is
the source-local pair `hueInt === 1000` plus `hueName === "black"`, or
`hueInt === 2000` plus `hueName === "white"`; this is a detail-card rule, not
a replacement for canonical protocol trait evidence.

The rescue timing boundaries in the source are rescue orders `0..491` for
Day 1 and `492..903` for Day 2. Week 1 membership comes from the loaded
category set. These UI boundaries should not overwrite canonical curated
classification data.

## Invariants worth preserving

- `0..25439` is the accepted rescue-order domain.
- 30 face meshes each contain 848 slots and cover the 25,440-entry atlas once.
- Compact slot metadata must declare version 1, matching texture dimensions,
  30 faces, 848 slots per face, and seven finite values per slot tuple.
- Filter category arrays are required when their definitions are used.
- Character union counts come from the union set, not a copied aggregate.
- Detail shards must contain exactly 848 validated records for their face and
  each record's rescue order must match its expected slot.

Source paths: `src/js/config.js`, `src/js/filters.js`,
`src/js/catmoon-geometry.js`, `src/js/cat-details.js`, and
`src/js/cat-details-export.js`.
