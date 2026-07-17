# 0008 - `mcrLib` Structure
**Updated:** 18 Mar 2023

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Proposed

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
The current `libmooncat` module is forked from ponderware’s [original library](https://gitlab.com/ponderware/libmooncat). As the MoonCat ecocsystem grows to incorporate new applications and uses, the needs for a common parsing library have grown too. Additionally, the `libmooncat` library is currently based on Clojure, which has fewer comunity members knowledgeable of and able to contribute to the development of.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
Create a new resource as `mcrLib` (MoonCatRescueLib), which has the following guiding principles:

- Do everything from a static/cached context (not reaching out to the blockchain) by default. This means separating converter/parser functions from fetching functions.
- Provide "catch-up" functions that when called manually, update the internal caches of the library to the latest blockchain data.
- Adhere to [ADR0007](/adr/0007-blockchain-state-storage.md) for blockchain data that changes over time; reporting back to the client applications precisely how fresh the data is.

The new library shall be built in Typescript, and published via NPM distribution.

## Consequences
<!-- Outcomes, both positive and negative -->
Switching the base language to Typescript will require rewriting the entirety of the library. But it can start by providing only a few of the functions the `libmooncat` library does (doesn’t have to be a “big bang” release).

Setting the library to Typescript will help with client applications that use Typescript as well, to aid in implementation by verifying input data into the library functions is as expected.

The library name changing to reference “MoonCatRescue” rather than just “MoonCat” helps illustrate it is designed as a helper library for the whole MoonCat ecosystem (has supporting functions for Accessories, lootprints, MoonCatPop, etc.).

Working from a static/cached context means embedding some data into the library bundle itself. The format of that embedding (i.e. will it be saved as JSON, SQLite, or other?) and how much size it takes up will need to be decided. Saving static MoonCat trait data (25,440 data elements) as [a JSON-formatted file](https://gitlab.com/mooncatrescue/snapshot/-/blob/master/output/mooncat_traits.json) uses 5.6MB of space, for context. Saving local copies of Log/Event data are even more numerous in size. Saving the files as JSON makes them human-friendly to read, but large in size. Uzing BZ2 compression on the JSON files would greatly-reduce their size.