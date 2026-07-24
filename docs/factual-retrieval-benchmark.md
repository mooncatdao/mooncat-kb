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

The dataset defines its closed enums and contains four balanced classes:

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

## Running a review

1. Select a case and load its `requiredFiles`; load optional files only when
   the case needs the added context.
2. Verify that the answer covers every required concept and provenance
   distinction, avoids each forbidden claim, and states listed limitations.
3. For `stop-for-live-verification`, do not manufacture a present-tense result
   from source code, an index, historical data, or a configured URL.
4. Record any missing source, unclear boundary, or unrouted compact data file
   as a KB gap rather than guessing a result.

Run `python scripts/validate-factual-retrieval-cases.py` to check the dataset's
structure, coverage, references, and static-boundary policy. This is an
offline dataset validator, not an LLM-quality score or an answer evaluator.

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
