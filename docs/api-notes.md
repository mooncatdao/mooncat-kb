# API Notes

Machine-readable endpoint summaries live in `data/api-endpoints.json`.

Identifier terminology and conversion status live in `data/identifier-conventions.json` and `docs/identifier-conventions.md`.

## Current Status

Verified partial.

The preferred API is `https://api.mooncatrescue.com`. The older `https://api.mooncat.community` API is still recorded as valid legacy infrastructure, not broken.

## Preferred API

Use the MoonCatRescue API for new integrations when possible:

- Landing page: `https://api.mooncatrescue.com/`
- OpenAPI YAML: `https://api.mooncatrescue.com/spec.yml`
- Swagger UI: `https://api.mooncatrescue.com/docs.html`

The landing page states that the API serves MoonCat metadata and images, uses JSON for traits and metadata, and returns PNG renders unless otherwise noted.

## Legacy API

The MoonCatCommunity API remains useful for older paths and legacy behavior:

- Landing page: `https://api.mooncat.community/`
- OpenAPI YAML: `https://gitlab.com/mooncatrescue/data-api-server/-/raw/master/spec.yml`

Treat this API as `legacy-valid`. It may be deprecated later, but this repository should not mark it as broken unless a future verification pass proves that.

## Path Differences

The preferred API groups MoonCat paths under `/mooncat/...`, for example `/mooncat/traits/:catId_or_rescueIndex` and `/mooncat/image/:catId_or_rescueIndex`.

The legacy API uses root-level paths such as `/traits/:catId_or_rescueIndex`, `/image/:catId_or_rescueIndex`, and multiple image variant paths.

Be careful with `/events`: the preferred API lists `/events` under Blockchain, while the legacy API uses `/events` in older event or holiday accessory context.

## Identifier Notes

Where documented, `catId_or_rescueIndex` can accept either:

- a valid MoonCat ID, for example `0x00d8523a53`
- an original rescue index where `0 <= rescueIndex <= 25439`

Local checks and preferred API samples verify alignment between API rescueOrder/original rescue index values and local `rescue-order-index` values.

Do not confuse these indexes with token IDs, bytes5 cat IDs, OpenSea IDs, or contract call values. Any tool that crosses those identifier systems needs an explicit verified conversion step.

For the centralized terminology reference, see `docs/identifier-conventions.md`.

## Source Use

Use landing pages for concise human-readable endpoint summaries and status notes.

Use OpenAPI specs for exact paths, methods, parameters, and response schemas. Full schemas are intentionally not copied into this repository yet.

Use Swagger UI for interactive exploration of the preferred API.
