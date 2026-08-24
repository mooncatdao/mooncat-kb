# Factual retrieval benchmark

`data/factual-retrieval-cases.json` is a deterministic review contract for
MoonCat factual answers. It is separate from `data/agent-query-cases.json`:
the routing benchmark checks whether a coding agent receives safe, minimal
context, while this benchmark specifies what a source-bounded answer must
contain or refuse to infer.

## Purpose

Each case constrains a reviewer or external agent with a question, required
concepts and KB files, forbidden claims, provenance distinctions, expected
limitations, and whether current external state requires a live check. The
dataset intentionally stores no narrative gold answers, evaluator, embedding,
or network harness.

## Schema and classes

The dataset defines its closed enums and 64 coverage cases: 16 each for direct
lookup, cross-source synthesis, provenance-boundary, and
live-verification-stop. This is a count of defined benchmark cases, not a 64/64
score of model answers; this repository does not maintain a scored model
baseline:

- `direct-lookup`: retrieve a bounded fact or KB policy from its owning file.
- `cross-source-synthesis`: combine narrow sources while retaining their
  different evidence roles.
- `provenance-boundary`: preserve an unresolved fact, source limitation, or
  intent-versus-implementation distinction.
- `live-verification-stop`: stop a static answer and require separately
  authorized current evidence.

Answer modes identify whether an answer can come from static data, must include
qualified uncertainty, must separate ADR intent from implementation, or must
stop for live verification.

The Genesis collection-rationale synthesis case is distinct from the direct
population-arithmetic case: it asks for the historical explanation assembled
from release-group, post-vote, collection-total, and unresolved-mechanism
evidence. The bounded fully-on-chain materialization case separately
synthesizes reviewed contract roles and evidence layers without asserting
current deployment, output availability, or present fully-on-chain status.
The naming cases separately cover original-contract write guards and the
boundary between `CatNamed` history, all-zero event effects, current storage,
display decoding, and the checked-in snapshot.

Public-release coverage also includes the complete static population and its
field-level trust, rescue ranges, released-versus-unreleased Genesis mechanics,
Genesis payment wording, pinned finalized-name freshness, contract identity
versus live deployment, ABI event shape versus observed history, historical
wrapper scope, community character categories, accessory definition/wear
state, current rescue availability, current materialization output, and IPFS
payload availability. These cases preserve the no-gold-prose design: expanding
risk coverage does not create a parallel fact database.

## Running a review

1. Select a case and load its `requiredFiles`; load optional files only when
   the case needs the added context.
2. Verify that the answer covers every required concept and provenance
   distinction, avoids each forbidden claim, and states listed limitations.
3. For `stop-for-live-verification`, do not manufacture a present-tense result
   from source code, an index, historical data, or a configured URL.
4. Record any missing source, unclear boundary, or unrouted compact data file
   as a KB gap rather than guessing a result.

Run `python scripts/validate-factual-retrieval-cases.py` to validate the
benchmark's case definitions, structure, coverage, references, and
static/live-boundary policy. Its passing 64-case message means that those
defined coverage cases pass these contract checks; it is not a 64/64 answer
accuracy result, LLM-quality score, or answer evaluation.

## What it does not score

The benchmark does not measure prose style, tool use, model quality, semantic
similarity, live endpoint availability, chain state, marketplace state, or
whether a human/external agent actually answered a question. It does not alter
canonical MoonCat facts to make a benchmark case pass.

## Failure follow-up

A failed factual review should lead to one of three actions: load the owning
file more precisely, report the evidence boundary or live-verification stop, or
open a focused source/data/routing gap. Do not fold these cases into the
coding-agent routing benchmark: they answer different regression questions.
