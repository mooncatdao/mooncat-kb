# Genesis Cats: history and population reconstruction

`data/genesis-cats.json` is the canonical KB reconstruction for Genesis
population, released-member mapping, adoption history, and the March 2021
vote. It keeps contract facts, deterministic derivations, historical reports,
and current-state boundaries separate.

## Population model

The original design provided for 256 Genesis Cats. The documented final
collection contains 25,344 ordinary Rescue Cats and 96 Genesis Cats:

```text
25,344 Rescue Cats + 96 Genesis Cats = 25,440 collection cats
256 planned Genesis Cats - 96 released Genesis Cats = 160 locked and unreleased
```

The 96 were the six released groups of 16. Their exact Genesis-index, bytes5
Cat ID, and rescue-order relationships are stored once in the new dataset as
aligned arrays. The validator compares them with the existing Genesis
rescue-order bucket, the checked-in trait reference, and the contract formula.

The remaining indices 96 through 255 are a contract-planned, formula-derivable
range only. This KB does not claim that they were minted, adopted, owned,
entered into `rescueOrder`, or exist as current tokens.

## Terminology and release mechanics

Original materials call ordinary MoonCats **rescued**. Genesis Cats were
released in groups and offered for **adoption**. “Minted” appears in later
community usage, but is not interchangeable with the original distinction.

The historical contract formula is:

```text
(bytes5(genesisCatIndex) << 24) | 0xff00000ca7
```

`addGenesisCatGroup` is the documented group-release mechanism. A group has
16 members. Six released groups are a deterministic calculation (`96 / 16`),
not a claim that all twelve planned groups were ever offered.

The original project information describes a schedule beginning at 0.3 ETH for
the first group, rising by 0.3 ETH per later group. The dataset lists the
scheduled prices for groups 1–6 only. It deliberately makes no hypothetical
unreleased-group price, number of completed purchases, or aggregate ETH claim.

## Payment-routing bug

The original information page says the adoption proceeds were intended for the
developers, but a QA change caused Genesis adoption payments to go to the zero
address. Its “burned Ether” language describes that payment destination; it
does not establish a transaction-derived total. The claim is restricted to
Genesis adoption payments and must not be generalized to other contract flows.

## March 2021 Genesis Vote

The contemporaneous official pre-vote notice set a 48-hour window beginning
2021-03-20 12:00 UTC. It described eligibility as prior interaction with the
original MoonCatRescue contract or main WMCR before Ethereum block 12,047,300.
The later maintainer retrospective describes a custom contract using a Merkle
tree of 6,110 eligible addresses, one vote per address, and 1,311 voting
addresses (21.46% when deterministically rounded from 1,311 / 6,110).

The official post-vote outcome says the remaining 160 would stay on the moon,
which is why they are modeled as permanently locked and unreleased. A
contemporary Decrypt report described *proposed* private-key destruction before
the vote. No direct post-vote evidence in this focused bundle establishes that
key destruction was the final technical act. Therefore the technical locking
mechanism is intentionally `unresolved` rather than inferred as a destroyed
key, a lost authority, or a particular on-chain transaction.

## Sources and confidence

The compact [research inventory](../references/research-notes/genesis-cats/SOURCES.json)
records URLs, source classes, access status, bounded notes, and note hashes.

- Historical-primary contract/original-site evidence supports the formula,
  group/adoption vocabulary, price schedule, and payment bug.
- Official MoonCatRescue about/log pages support the final population and
  post-vote outcome.
- The maintaining-team Medium retrospective supports vote method and
  participation details; it is historical context, not direct live-chain proof.
- Decrypt is pre-vote contemporary context only.
- The direct Reddit thread and specified X post were inaccessible in this pass;
  neither contributes a factual claim.
- The checked-in trait file is an upstream-reference snapshot with unresolved
  upstream revision provenance. It is used solely as a cross-check alongside
  the already-curated rescue-order bucket, not promoted as a replacement
  canonical data source.

## Limits

This is a historical, offline reconstruction. It does not answer who owns a
Genesis Cat now, whether a contract key or address is presently usable, current
market prices, current site availability, or live chain state. Those questions
require separately authorized and sourced current-state evidence.
