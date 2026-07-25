# Independent Antigravity factual-retrieval pilot

Date: 2026-07-25

## Purpose and isolation

This is an independent required-files-only regression pilot for the factual
retrieval benchmark. It exercised exactly these cases:

- synthesis-genesis-collection-rationale
- synthesis-fully-on-chain-materialization-path

The model reported by RUN-NOTES.md was Gemini 3.6 Flash (High). The run was
performed in the isolated directory /tmp/mooncat-kb-pilot. Each case received
only its QUESTION.md and its declared required files. The run notes report no
access outside that directory, no web search, HTTP/API queries, blockchain
calls, or external tools.

These controls provide a useful required-files-only regression signal, but they
do not prove that a base model has no training-data contamination or that the
pilot is perfectly blind to every prior exposure.

## Preserved raw artifacts

The raw answers and run notes remain untouched at:

- .chatgpt/pilot-runs/2026-07-25-antigravity-two-case/genesis.md
- .chatgpt/pilot-runs/2026-07-25-antigravity-two-case/onchain.md
- .chatgpt/pilot-runs/2026-07-25-antigravity-two-case/RUN-NOTES.md

Recorded SHA-256 values:

| Artifact | SHA-256 |
| --- | --- |
| genesis.md | 8c6ad05e686547739c27d1ad257d2fe209040cd08beac83d13677fac4ee04cf4 |
| onchain.md | c6c809d5de7902e6b300e984099808ef5ce9af09e8c1b240caede2a1bb1f56d2 |
| RUN-NOTES.md | dfd2253a3ee82e5e77bb4ebd0bd45c46893bc3d0bcb01092af40d5596b534448 |

## Grading outcome

### Genesis case: pass

The answer covered the required concepts, including 256 planned Genesis Cats,
six released groups of 16, 96 released members, 160 permanently locked and
unreleased members, and the deterministic 25,344 + 96 = 25,440 arithmetic.
It preserved the unresolved final technical locking mechanism and did not
promote private-key destruction to a verified post-vote fact. It also retained
the current-state and payment-aggregate limits. The only minor wording concern
was its use of off-chain in describing the unreleased outcome; the evidence
boundary itself remained correct.

### Fully-on-chain case: partial pass

The answer included all eight required core roles: MoonCatRescue,
MoonCatAcclimator, MoonCatReference, MoonCatTraits, MoonCatColors, MoonCatSVGs,
MoonCatAccessories, and MoonCatAccessoryImages. It also separated several
important source, ADR, historical deployment, and current-state limitations.

The partial result had these exact issues:

- It added MoonCatsWrapped/WMCR as a ninth supporting path, which blurred
  adjacent historical-wrapper context into the required core materialization
  path.
- It did not explicitly enumerate the complete off-chain boundary of API,
  hosting, IPFS, Firebase, marketplace, and frontend availability.
- It blended some source-implementation and historical-address evidence
  instead of consistently labeling those as separate layers.
- Deterministic derivation, current admin/ownership limits, and
  endpoint/content limitations were less explicit than the case constraints
  require.

This is a partial answer-quality result from one model run, not evidence that
the case or its required-files set is defective.

## Decision and follow-up

The pilot demonstrates that both cases are answerable from their required
files, while also exposing useful pressure points in the on-chain case. Do
not edit either benchmark case, its validator, requiredFiles, hidden grading
fields, or the canonical KB based on this single run. Defer benchmark edits
until another independent run either reproduces the same boundary failures or
shows that they were model-specific.

Recommended follow-up: run a six-case independent control pilot containing the
fully-on-chain synthesis case plus nearby cross-source synthesis,
provenance-boundary, and live-verification controls. Compare the same
required-files-only isolation, exact artifact hashes, and boundary-focused
grading before considering any benchmark change.

At this point the benchmark remains 34 cases with class counts 8 direct lookup,
10 cross-source synthesis, 8 provenance boundary, and 8 live-verification
stop. This report records pilot evidence only; it does not add a prose gold
answer or change canonical facts.
