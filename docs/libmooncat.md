# libMoonCat Upstream Review

Machine-readable source entries live in `data/sources.json`.

This page records a README and top-level inventory review of the MoonCatRescue GitLab `libmooncat` repository. It does not import library source code, generated bundles, mappings, trait data, accessory data, or behavior into the KB.

## Current Status

Inspected upstream entrypoint.

The MoonCatRescue repository is registered as `mooncatrescue-libmooncat-gitlab`. The Ponderware historical repository remains registered separately as `libmooncat`.

GitLab project metadata checked on 2026-07-03 reports:

- project path: `mooncatrescue/libmooncat`
- web URL: `https://gitlab.com/mooncatrescue/libmooncat`
- default branch: `master`
- visibility: public
- last activity: 2023-02-08
- fork relationship: forked from `ponderware/libmooncat`

Under `docs/reference-policy.md`, treat this repository as a MoonCatRescue current-maintainer fork/copy entrypoint. Treat the Ponderware repository as the historical primary source for original libMoonCat provenance.

## README-Level Role

The checked README describes libMoonCat as a MoonCatCommunity library for Clojure, ClojureScript, and JavaScript. It lists broad utility areas including MoonCat information, MoonCat Accessories, image generation, and Ethereum RPC queries.

The README also points JavaScript users to `dist-js/README.md`, node users to `dist-node/README.md`, and Clojure users to Clojars/project metadata.

These README statements are useful for inventory planning. They should not be treated as detailed API behavior until a focused API-surface review inspects the relevant source, distribution README, generated bundle, and tests.

## Top-Level Inventory

Top-level repository inventory checked through the GitLab tree API:

- directories: `dist-js`, `dist-node`, `resources`, `src`, `test`
- files: `.gitignore`, `.gitlab-ci.yml`, `CHANGELOG.md`, `LICENSE`, `README.md`, `project.clj`

Selected directory inventory:

- `src/libmooncat`: `accessory/`, `data/`, `ethereum/`, `image/`, `build_js.clj`, `core.cljc`, `filter.cljc`, `jslib.cljs`, `traits.cljc`, `util.cljc`
- `test/libmooncat`: `core_test.clj`
- `resources`: `mooncatdata/`, `README-js.md`, `allERC721TraitsFromMoonCatDataImplemention.edn`, `license-node.js`, `license.js`
- `resources/mooncatdata`: rescue-order, cat-id, palette, hue, group, rescuer, design, and lootprint EDN files by filename
- `dist-js`: `README.md`, `demo.html`, `libmooncat-limited.js`, `libmooncat.js`
- `dist-node`: `README.md`, `index.js`, `package-lock.json`, `package.json`

This is an inventory of visible paths only. File contents were not reviewed except README and package/build metadata files listed below.

## Checked Metadata Files

Directly checked metadata/raw documentation files:

- `README.md`: high-level repository role and language/distribution entrypoints
- `dist-js/README.md`: browser JavaScript distribution overview and candidate helper surface documentation
- `dist-node/package.json`: node package metadata for package name, version, main entrypoint, license, and dependencies
- `project.clj`: Clojure project metadata, version, dependencies, resource path, ClojureScript build targets, and aliases

Observed package/build metadata from checked files:

- Clojure project id: `com.ponderware/libmooncat`
- version in checked Clojure and node metadata: `1.1.4`
- node package name: `libmooncat`
- license indicated by checked metadata: AGPL v3 / AGPLv3
- ClojureScript build targets include browser full, browser limited, development, and node outputs

Do not infer runtime behavior from this metadata alone.

## Candidate Future Review Files

Good future review targets:

- `dist-js/README.md`: browser-facing helper surface documentation
- `dist-js/libmooncat-limited.js`: generated limited browser bundle already mirrored locally under `references/upstream/mooncatrescue/`
- `dist-js/libmooncat.js`: full generated browser bundle, likely larger because it includes more data
- `dist-node/package.json` and `dist-node/index.js`: node package metadata and generated node entrypoint
- `project.clj`: build, dependency, and generated-output configuration
- `src/libmooncat/jslib.cljs`: likely JavaScript export surface
- `src/libmooncat/core.cljc`, `traits.cljc`, `filter.cljc`: candidate trait, identifier, filter, and core helper surfaces
- `src/libmooncat/accessory/`, `ethereum/`, `image/`, and `data/`: candidate accessory, RPC, image, and embedded-data surfaces
- `resources/mooncatdata/*.edn`: candidate generated/source data inputs; do not import without a focused data strategy
- `test/libmooncat/core_test.clj`: candidate validation behavior for library helpers

## Promotion Rules

Before any libMoonCat-derived data or behavior is promoted into curated KB files:

- choose the exact source file or generated artifact
- register sourceRefs for the raw file or metadata endpoint
- document whether the MoonCatRescue fork or Ponderware historical source is the intended provenance
- validate any copied reference file locally if it is large or generated
- avoid importing full mappings, generated bundles, ABIs, accessory data, or trait data unless the pass explicitly covers that dataset
- keep behavior claims scoped to the reviewed file and its version/branch

## Current Limits

This pass did not clone the repository, did not copy files into `references/`, did not import code, did not inspect source bodies beyond package/build metadata, and did not update identifier or trait strategy claims.
