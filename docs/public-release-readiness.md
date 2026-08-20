# Public release readiness

## Assessment

**Ready with accepted evidence boundaries.** The maintained repository is
suitable for public v1 use as a static, source-aware MoonCat technical and
research reference. This assessment is conditional on the zero-network release
gates below remaining green. It is not a claim that external services,
contracts, ownership, names, markets, accessories, or content are current.

No release blocker remains in the reviewed local scope. The unresolved domains
listed below are accepted boundaries because the public entrypoints, routed
data, benchmark, and validators require them to remain explicit.

## Audit method

The release-candidate pass was adversarial rather than stylistic. It:

- traced repeated high-risk facts to their owning data and checked them across
  public docs, routes, recipes, generated manifests, and focused validators;
- separated direct source statements, deterministic derivations, community
  curation, pinned source review, reviewer synthesis, and live/current state;
- reviewed total population, Genesis arithmetic and mechanics, rescue ranges,
  naming freshness, identifier domains, contract/address/ABI/event roles,
  accessory terminology, color/classification trust, and materialization
  wording;
- scanned maintained public surfaces for stale phase language, local absolute
  paths, unresolved repo-relative references, temporary markers, and licensing
  overreach; and
- used only checked-in evidence. No browser, network, RPC, API, marketplace,
  explorer, IPFS, Firebase, or deployment check was performed.

## Material issues corrected

- `docs/fully-on-chain-evidence-readiness.md` still said the benchmark had 33
  cases and its synthesis gap was open. The implemented case already existed;
  the page now describes the covered benchmark boundary and acknowledges the
  exact local ABI registry without upgrading it to bytecode or live state.
- The name-index integration still described finalized population enrichment
  as future work. The data, docs, and recipe now point to the implemented
  25,440-row population artifact and its pinned revision/count checks.
- `docs/traits-and-ids.md`, `docs/mooncat-types.md`, `data/trait-index.json`, and
  related planning notes denied or deferred full-population, identifier, and
  released-Genesis capabilities that are already implemented. They now route
  to the owning artifacts while retaining canonical-dictionary, freshness, and
  live-state limits.
- Rescue-history prose said its method and Cat ID conversion were still
  undocumented. It now distinguishes the recorded UTC/timestamp method from
  the still-unperformed full event-log derivation and separates the 25,600
  contract supply constant from the 25,440 final collection.
- Public contract/identifier wording now refers to the reviewed
  MoonCatAcclimator identity instead of using “current contract” as an
  unqualified freshness claim.
- The prior generated audit report captured an absolute local repository path
  and predated the current required-command set. Audit summaries now sanitize
  the repository root; the report is regenerated only after all dependent
  artifacts are current.
- Public onboarding now links this assessment and gives a tagged,
  provenance-aware zero-network lookup example. Licensing text explicitly
  prevents `references/` or vendored files from inheriting the repository's
  general CC0 release.

## Mechanical release invariants

`scripts/validate-kb.py` now enforces 13 cross-file release invariants in
addition to the existing source/path and Genesis-versus-character checks. The
new checks require:

- 256 planned Genesis Cats = 96 released + 160 locked/unreleased;
- six release groups x 16 members = 96 released members;
- protocol normal/Genesis constants to agree with the Genesis reconstruction;
- 25,344 Rescue Cats + 96 released Genesis Cats = 25,440 collection members;
- population and parser-render manifests to each cover 25,440 rows;
- the population Genesis count to remain 96; and
- the population's pinned name revision and 1,233 named rows to agree with the
  reviewed name-index integration, which must identify the implemented
  population artifact.

The separate generated `data/mooncat-names.json` comparison snapshot remains
at 1,225 source rows. The population documentation and benchmark preserve the
reason for the eight-row difference: the pinned finalized name-index revision
contains eight additional finalized names. Neither count is presented as live.

The dedicated Genesis, population, render, contract/ABI/event, identifier,
color, materialization, routing, manifest, and audit validators continue to own
their deeper domain invariants. The release pass did not duplicate those
checks as prose-only assertions.

## Provenance completion

The follow-up zero-network provenance pass traced the maintained public surface
across five distinct roles: source-of-fact, checked-in source-of-input,
deterministic derivation, generated output, and human/community
classification. It corrected stale input-use notes, registered the exact local
ChainStation snapshot relationship, made the population's pinned name-snapshot
input explicit, and added stable checks for sourceRef resolution, overlapping
source/snapshot paths, pinned metadata and inventories, dependent paths, and
generated-artifact ownership.

`data/kb-manifest.json` now gives aggregate provenance accounting and a
`provenancePath` for every registered generated output. That summary is derived
from existing owners; it is not a duplicate fact database. The exact remaining
important-input gaps are five incomplete upstream revisions, five unknown
retrieval or verification dates, and seven entries with unresolved upstream/input
license evidence. These unknowns
remain disclosed and were not filled from filenames, URLs, nearby repositories,
or this repository's CC0 license.

## Factual benchmark coverage

The factual-retrieval benchmark expanded from 38 to 64 cases. It now has 16
cases in each class: direct lookup, cross-source synthesis,
provenance-boundary, and live-verification stop.

New adversarial coverage includes complete population scope, Day 1/Day 2/Week
1 rescue boundaries, released versus formula-only Genesis identifiers,
Genesis prices and payment totals, pinned naming freshness, Cat ID/rescue-order
lookup, historical wrapper scope, contract identity versus deployment,
ABI-event shape versus occurrence/state, community character categories,
fully-on-chain wording, current rescue/accessory/name/event/bytecode/output
questions, and IPFS payload availability. The validator requires representative
public-release risk cases and preserves the no-gold-prose design.

## Accepted unresolved boundaries

These are not public-v1 blockers because the repository labels and routes them
as unavailable, partial, historical, community-curated, or live-verification
work:

- current ownership, balances, wrapping/acclimation, names, offers, markets,
  accessory ownership/wear/definitions, contract storage, administration,
  bytecode, deployment, and event history;
- live API, RPC, ChainStation, IPFS, Firebase, marketplace, hosting, frontend,
  and content availability;
- the final technical mechanism used to lock the 160 unreleased Genesis Cats;
- a complete inventory of additional historical or unofficial wrappers;
- exhaustive on-chain SVG/palette output parity, accessory composition, and
  present “fully-on-chain” retrievability beyond the pinned representative block;
- exact upstream revision evidence for five important inputs, retrieval or
  verification dates for five, and license evidence for seven, as enumerated
  in `data/upstream-snapshot-manifest.json`;
- canonical protocol status for community character categories and derived
  human-facing color labels; and
- freshness beyond each recorded source revision or generated input hash.

The repository now contains a validated representative snapshot at mainnet
block `25798234`. It records non-empty runtime code for all eight core
addresses, successful required base checks for 48 cats, byte-identical
identifier overloads for false/true/default SVG output, 48 parser-structure
passes, 48 SVG/contract-color subset passes, and 0 definite mismatches. This
closes only that exact historical sample: exhaustive surfaces and accessories
were not requested, runtime hashes do not prove source/compiler equivalence,
and the block is not current forever.

`references/` remains upstream evidence rather than curated truth. Its files,
and vendored example dependencies, retain their recorded upstream or unresolved
license boundaries and are not automatically CC0.

## Release gates

Run in this order after focused generators are current:

```sh
python scripts/validate-kb.py
python scripts/validate-onchain-materialization.py
python scripts/validate-factual-retrieval-cases.py
python scripts/generate-agent-context-packs.py --check
python scripts/validate-agent-routing.py
python scripts/generate-mooncat-names.py --check
python scripts/validate-mooncat-names.py
python scripts/generate-mooncat-population.py --check
python scripts/diff-mooncat-population.py --check
python scripts/validate-mooncat-population.py
python scripts/generate-mooncat-renders.py --check
python scripts/validate-mooncat-renders.py
python scripts/extract-contract-abis.py --check
python scripts/validate-contract-registry.py
python scripts/generate-kb-manifest.py --check
python scripts/validate-kb-manifest.py
python scripts/audit-kb.py
git diff --check
```

The existing validators, generated maintained-file manifest, and generated
audit report already form a compact deterministic release gate, so this pass
does not add a second structured readiness source of truth.
