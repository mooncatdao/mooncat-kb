# Using MoonCat KB

MoonCat KB is a local, source-aware technical knowledge base for building,
researching, and reviewing MoonCat software. It is designed to answer bounded
questions well: identify a MoonCat correctly, inspect the full static
population, understand a contract or event, trace naming or accessory
semantics, find provenance, or start a small implementation from a tested
example.

The repository serves developers and technically curious users first. It also
contains routing, validation, and gap-review machinery for contributors and AI
coding agents. It is not a live MoonCat service, blockchain indexer, wallet,
marketplace, or substitute for current chain verification.

## Choose a goal

| Goal | Start here | What you get |
| --- | --- | --- |
| Look up a MoonCat | `data/mooncat-population/manifest.json` and `docs/mooncat-population-index.md` | A validated static row with identifiers, traits, classifications, Genesis membership, and pinned finalized name data |
| Interpret an identifier | `docs/identifier-conventions.md` and `docs/identifier-verification.md` | Contract-scoped meanings and tested supported/unsupported conversions |
| Understand names | `docs/mooncat-naming.md` and `docs/name-index-integration.md` | Original contract semantics plus revision-bounded finalized history/current-name evidence |
| Inspect a contract or event | `data/contract-registry.json`, `data/event-registry.json`, and `docs/contract-abi-event-registry.md` | Exact local ABI/event shapes, topic0 values, parameter annotations, and state caveats |
| Study rendering, color, or accessories | `docs/source-map.md`, then the routed subsystem guide | Reviewed parser, SVG, color, lifecycle, and image-materialization boundaries |
| Check a claim's provenance | `data/sources.json` and `docs/reference-policy.md` | Source identity, trust, status, and limits |
| Find useful work to do | `data/kb-gap-index.json` through the `review-kb-gaps` route | Current gaps, usability impact, next data passes, and recommended priorities |

For a task not listed here, use `data/agent-index.json` to select the narrowest
route rather than loading the whole repository.

## What the KB is useful for

### Static MoonCat profiles and population questions

The generated population index covers all 25,440 MoonCats in fixed
rescue-order shards. It joins source-backed identity and trait data with
Genesis membership, derived display-color labels, rescue buckets,
community-curated character categories, and names pinned to a reviewed
finalized snapshot. The manifest records field-level trust and exclusions once
for the whole index.

Use `scripts/query-mooncats.py` for bounded lookup and filtering. Use the
profile resolver described below when JavaScript code needs one explicit
`catIdBytes5` or `rescueOrder` lookup. Neither surface supplies current owners,
accessories, prices, provisional names, or other live state.

### Identifier-safe integrations

MoonCat software uses several values that can look interchangeable but are
not: bytes5 Cat IDs, rescue order, Acclimated ERC-721 token IDs, WMCR token IDs,
accessory IDs, palette and record indexes, external child token IDs, and
addresses. The identifier docs and verification fixtures show which
conversions are supported and where a contract-specific equivalence applies.

This is one of the KB's most important safety features. A generic `tokenId`
must not silently become rescue order, and a wrapper rule must not be applied
to another contract.

### Contracts, events, naming, and accessories

The contract/event subsystem provides a deterministic registry for ten
reviewed contracts: nine have exact local ABI artifacts and CatNamer remains
explicitly semantic-only. The event registry covers 32 exact events with
Ethereum Keccak-256 topic0 values, ordered/indexed parameters, identifier
annotations, and bounded semantics. Five recipes describe downstream event
consumption without claiming a live index.

Separate guides explain original naming behavior, maintained finalized naming
artifacts, accessory lifecycle, accessory image composition, SVG generation,
and related contract surfaces. Event presence is historical evidence: it does
not by itself prove a current name, owner, wrapping state, offer, or accessory
wear state.

### Provenance-aware research

`data/sources.json` is the curated source index. Compact `data/` records may be
canonical, curated, community-curated, or generated; read each artifact's
status, scope, source references, and limitations. `docs/` explains reasoning
and boundaries. `references/` contains pinned or local upstream evidence and is
not automatically curated KB content.

When two sources conflict, preserve the conflict and their trust levels. Do not
silently choose a preferred value merely to make an answer complete.

## Static evidence versus current information

The KB is intentionally local and revision-bounded:

- **Curated data** records reviewed facts, classifications, indexes, or source
  summaries. Some curated categories are explicitly community-maintained or
  incomplete.
- **Generated data** is reproducible from checked-in inputs and validated by
  its owning scripts. Generation makes the transformation auditable; it does
  not make the inputs live.
- **Reference evidence** preserves upstream material for inspection and
  repeatability. It is not promoted into curated truth automatically.
- **Documentation** explains how to interpret those artifacts and where the
  evidence stops.
- **Live/current information** such as ownership, balances, offers, accessory
  wear, contract storage, deployment status, or newer events requires a
  separately authorized and sourced live check.

An exact ABI proves the checked-in interface artifact, not deployed-bytecode
equivalence. An event proves that supplied historical evidence can be decoded,
not the current storage result. A pinned name is finalized at its recorded
revision, not necessarily the newest chain state.

## Practical AI-agent workflow

Use an agent as a narrow, evidence-constrained collaborator:

1. Read `AGENTS.md`; its source, provenance, routing, and validation rules are
   implementation constraints.
2. Open `data/agent-index.json` and choose the narrowest matching route. Load
   primary files first.
3. If the task has several steps, use the matching entry in
   `data/task-recipes.json` for load order, outputs, guardrails, and stop
   conditions.
4. For a covered coding case, load the matching generated record in
   `data/agent-context-packs.json`. Packs point to files; they do not replace
   the underlying evidence.
5. Check `data/agent-coding-patterns.json` for a tested local implementation or
   validator before inventing a new pattern.
6. Keep warnings, forbidden claims, and stop conditions in the plan. Stop when
   a requested fact needs missing provenance, an unsupported identifier
   conversion, unreviewed source, or live state.
7. Make the smallest scoped change and run the task-specific validator. If
   routing or maintained-file coverage changed, refresh the dependent context
   packs, manifest, and audit in that order.

Do not create a universal “load all of MoonCat KB” prompt. Large context makes
source and identifier boundaries harder to preserve.

### Copyable prompts

Lookup:

```text
Using the query-mooncat-population route, return the static profile for
rescueOrder 100 with field provenance. Do not claim current owner, accessories,
market data, or newer-than-pinned naming state.
```

Coding:

```text
Read AGENTS.md and the supplied-mooncat-event-decoder coding pattern. Show how
to decode an already-supplied WMCR Wrapped log using explicit contract context.
Preserve raw values and identifierKind annotations; make no RPC call.
```

Provenance-sensitive review:

```text
Use the check-source-provenance route to explain which local evidence supports
the MoonCat color label in this row. Separate raw hue, derived display policy,
and renderer/palette claims, and stop where the evidence does.
```

Gap review:

```text
Use the review-kb-gaps route. Compare fileGaps by agentUsabilityImpact and
nextDataPass, then recommend one small source-backed improvement. Exclude work
that requires live state or an unreviewed identifier mapping.
```

## Executable examples

The examples are small conformance surfaces, not application frameworks:

- `examples/rescue-mining.js` and `examples/rescue-mining-widget/` demonstrate
  the reviewed wallet-free rescue-seed search. The widget can render a found
  Cat ID but does not submit a rescue or establish current availability.
- `examples/mooncat-profile/` provides a dependency-free ESM resolver over the
  existing generated population shards. It accepts only tagged
  `catIdBytes5`/`rescueOrder` inputs and returns the existing row plus manifest
  provenance.
- `examples/mooncat-event-decoder/` decodes an already-supplied Ethereum log
  using explicit reviewed contract/address context and the existing event
  registry. It preserves raw words and contract-scoped identifier annotations;
  it does not fetch logs or reconstruct current state.

Each example has its own README and focused tests. Reuse its boundaries as well
as its code.

## Finding worthwhile improvements

Use the `review-kb-gaps` route in `data/agent-index.json`, with
`data/kb-gap-index.json` as the primary file. The gap index is a planning aid,
not a source of new MoonCat facts.

Key fields answer different questions:

- `fileGaps` lists current artifact-level limitations.
- `gapTypes` gives compact categories such as incomplete provenance,
  live-state exclusion, freshness risk, or intentional compact scope.
- `agentUsabilityImpact` explains what an agent can and cannot safely do with
  the current artifact.
- `nextDataPass` defines a bounded way to improve that artifact.
- `recommendedNextPasses` collects worthwhile cross-file follow-ups and their
  priority.

A useful improvement usually addresses at least one of these problems:

- missing knowledge that a primary or clearly bounded source can support;
- weak provenance, freshness, revision, license, or derivation notes;
- poor discovery through the current route/recipe structure;
- a missing tested usage pattern for a repeated developer task;
- an unsafe conflation, especially between identifier kinds or historical and
  current state;
- a generated or curated artifact without proportionate validation; or
- a repeated workflow that lacks safe sequencing, guardrails, and stop
  conditions.

Prefer a small improvement with repeatable evidence and validation over a broad
import. Historical “resolved” entries in the gap index document earlier work;
do not rewrite them merely because current counts have advanced.

## Contributing and downstream interfaces

`CONTRIBUTING.md` describes file conventions, source expectations, and
validation by change type. New facts normally need a registered source before
they enter curated data. New maintained paths may need an explicit manifest
classification, and agent-facing changes may require routing and generated
context refreshes.

`mckb-library` may eventually offer a friendlier downstream human interface to
some of this material, but it is not a dependency, promised release, or source
of truth for this repository.

## Integrity and limits

`data/kb-manifest.json` inventories maintained files and their hashes, routes,
recipes, and validator relationships. `python scripts/audit-kb.py` runs the
bounded zero-network integrity workflow and writes `data/kb-audit-report.json`.
The audit checks local consistency; it deliberately skips external URL/RPC/API
verification, Git-history PII review, and universal semantic contradiction
detection.

When accuracy depends on one of those skipped domains, say so and perform a
separately scoped verification rather than upgrading static evidence into a
current claim.
