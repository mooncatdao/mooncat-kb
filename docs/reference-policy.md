# Reference Policy

This policy defines how `mooncat-kb` ranks sources, stores local upstream snapshots, and promotes raw reference material into curated KB data.

## Source Tiers

Use the narrowest source that directly supports the claim.

1. Canonical current-maintainer technical sources: MoonCatRescue GitLab, ChainStation source/data artifacts, current MoonCatRescue-maintained code, current API/OpenAPI specs, verified on-chain contract surfaces, and exact contract-source pages. Use these for current technical behavior, source-code facts, API shapes, and maintained data artifacts.
2. Canonical official project context: `mooncatrescue.com` pages, official project documentation, official project logs, and official developer entrypoints. Use these for project context and official links. Non-technical details, general links, and project-page summaries may become stale more easily than source-code, data, API, or on-chain artifacts; check freshness when date, availability, or current behavior matters.
3. Historical primary sources: Ponderware repositories and original-contract/parser sources. Use these for original MoonCatRescue contract behavior, original parser behavior, and historically anchored protocol facts.
4. Community-maintained and community-curated sources: DAO repositories, community sites, Discord-derived notes, dashboards, articles, and character-category references. Use these for community context or curated classifications only when marked with their limits.
5. Local reference snapshots: files under `references/upstream/`. These are local copies of upstream source/data artifacts for review and repeatability. They are reference inputs, not curated KB data.

If sources conflict, document the conflict and the source tier instead of silently choosing one.

## Local Upstream Snapshots

Large or exact upstream artifacts may be copied into `references/upstream/` when a future pass needs repeatable local inspection, structural validation, or stable evidence without importing all data into `data/`.

Each snapshot directory should include a README or equivalent note that records:

- upstream URL or repository path when known
- copied or retrieved date when known
- `data/sources.json` sourceRef IDs
- trust tier and source status
- validation performed
- usage limits
- whether the file is raw upstream material, generated output, or manually curated

Reference snapshots should not be edited to normalize data. If normalization is needed, create a separate generated or curated data artifact with its own provenance.

## Large Files

It is acceptable to keep large upstream files in `references/` when they are needed as evidence or review inputs and the KB should not yet claim their full contents as curated data.

Do not promote a large upstream mapping, ABI, parser table, trait table, color table, accessory table, CID list, or SVG/image payload into `data/` only because it exists locally. Promotion requires a focused pass with documented source, method, validation, and scope.

## Promotion Into Curated Data

Promote raw reference material into `data/*.json` only when all of the following are true:

- the target data model and identifier conventions are defined
- sourceRef entries exist in `data/sources.json`
- the import or derivation method is documented
- validation is repeatable and listed in the related docs or result note
- partial coverage, generated fields, and manual curation are clearly marked
- no unrelated source fields or large blobs are copied into curated data

Promoted data should be small enough and shaped enough to serve KB use cases. If a full upstream mapping is needed, prefer documenting it as generated data with a reproducible script or clear derivation note instead of hand-copying values.

## Validation Expectations

For JSON changes in `data/`, run `python -m json.tool <file> >/dev/null`. For local JSON reference snapshots used as evidence, validate them before relying on their structure.

For source registrations, check that any new sourceRef IDs are present in `data/sources.json` and that notes describe trust, status, and limitations. For Markdown policy/doc changes, run `git diff --check`.

## Usage Notes

Source tier does not make every claim from that source automatically canonical. A current maintainer source-code artifact can support current technical behavior; a project webpage can support official context; a historical repository can support original behavior. Match the claim to the source surface and say when freshness or coverage is incomplete.
