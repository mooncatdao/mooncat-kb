# Upstream Repositories

Machine-readable source entries live in `data/sources.json`.

This page summarizes MoonCatRescue GitLab repositories registered as durable upstream resources. It is an entrypoint map only; it does not import repository contents, contract details, ABIs, parser logic, trait data, CIDs, or API endpoints.

## Source Tier Rules

Use `docs/reference-policy.md` when choosing a repository as evidence.

- MoonCatRescue GitLab repositories are current-maintainer technical sources when they contain maintained technical artifacts.
- Ponderware repositories remain historical primary sources for original MoonCatRescue contract and parser behavior.
- MoonCatRescue namespace forks or mirrors of Ponderware repositories should be used as current-maintainer copies or archive entrypoints, not as replacements for the original historical sourceRefs.
- Repository existence does not prove a technical claim. Review the relevant file, commit, release, or README before importing facts.

## Registered MoonCatRescue GitLab Repos

- `mooncatrescue-contracts-gitlab`: `https://gitlab.com/mooncatrescue/contracts`
  - Verified public GitLab project under the MoonCatRescue namespace.
  - Intended use: entrypoint for focused reviews of current-maintainer contract artifacts.
  - Current KB status: content not reviewed; no source files imported.
- `mooncatrescue-libmooncat-gitlab`: `https://gitlab.com/mooncatrescue/libmooncat`
  - Verified public GitLab project under the MoonCatRescue namespace.
  - GitLab metadata reports it is forked from `ponderware/libmooncat`.
  - Intended use: entrypoint for current-maintainer libMoonCat reviews while preserving `libmooncat` as the Ponderware historical sourceRef.
  - README/top-level inventory review: `docs/libmooncat.md`.
- `mooncatrescue-mooncatparser-gitlab`: `https://gitlab.com/mooncatrescue/mooncatparser`
  - Verified public GitLab project under the MoonCatRescue namespace.
  - GitLab metadata describes it as a fork of the original Ponderware script for MoonCatRescue.
  - Intended use: current-maintainer parser fork entrypoint; use `ponderware-mooncatparser` for historical original behavior.
- `mooncatrescue-contract-gitlab`: `https://gitlab.com/mooncatrescue/MoonCatRescue-Contract`
  - Verified public GitLab project under the MoonCatRescue namespace.
  - GitLab metadata describes it as a fork of the original Ponderware Solidity contract repository.
  - Intended use: current-maintainer contract fork entrypoint; use `ponderware-contract` for historical original-contract provenance.
- `mooncatrescue-web-gitlab`: `https://gitlab.com/mooncatrescue/mooncatrescue-web`
  - Verified public GitLab project under the MoonCatRescue namespace.
  - GitLab metadata describes it as original `mooncatrescue.com` content archive and reports a fork relationship to `ponderware/mooncatrescue-archive`.
  - Intended use: historical website/archive source review, not a freshness source for current webpage details.
- `mooncatrescue-utility-contracts-gitlab`: `https://gitlab.com/mooncatrescue/utility-contracts`
  - Verified public GitLab project under the MoonCatRescue namespace.
  - Intended use: entrypoint for focused utility-contract source reviews.
  - Current KB status: content not reviewed; no source files imported.

## Verification Notes

On 2026-07-03, the six repository URLs returned HTTP 200, and GitLab API project metadata was fetched for each. The metadata check established namespace, path, default branch, visibility, and fork/archive descriptions where present. It did not review repository file contents.

## Next Passes

Good follow-up passes:

- inspect README and top-level file lists for one repository at a time
- register specific raw files only after their role is clear
- copy large exact artifacts into `references/upstream/` only when repeatable local review is needed
- promote normalized data into `data/` only after documenting generation method, validation, and limits
