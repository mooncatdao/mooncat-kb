# 0012 - Generic Token Metadata
**Updated:** <!-- DD Mon YYYY --> 31 July 2025

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
There are several EIP standards that define "tokens" and metadata about them (notably [ERC721](https://eips.ethereum.org/EIPS/eip-721) and [ERC1155](https://eips.ethereum.org/EIPS/eip-1155)). Individual projects can expand above the base metadata those standards allow (many follow the [OpenSea guidelines](https://docs.opensea.io/docs/metadata-standards) for token metadata).

For a website dedicated to a specific project/token, the web application would clearly want to show as much metadata about that project's tokens as possible. But in showing information about their specific tokens, likely other tokens from other projects will need to get mentioned. Having a standard for describing a token generically allows for web apps to show mixed lists of tokens from different sources (e.g. an individual address' full portfolio), without needing to go into full detail on each one.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
The core metadata information saved about each token in a generic list (which may be a token that is "ours" or "some other collection"):

```typescript
export interface TokenMeta {
  collection: {
    chainId?: number
    address: `0x${string}`
    label?: string
  },
  name?: string
  id: `0x${string}`
  imageSrc?: string
  dynamic?: React.ReactElement
  link?: string
}
```

The `id` property correlates to the ERC721 token identifier value (a `uint256` in Solidity). As a 256-bit integer, canonically it's a very large decimal number (zero to 4,​039,​457,​584,​007,​913,​129,​639,​936). However that large of a number does not fit in a JavaScript `number` variable. If it were stored as a `bigint` variable, it would not be serializable into JSON without a custom parser. So, for the core metadata definition, the identifier should be stored as a hex-encoded string, to enable the best storage and translation.

The `dynamic` attribute is roughly similar to the `animation_url` in the OpenSea metadata guidelines. If the web application has a more-complicated viewer for the token, this value will be set to the React Component that does that visualization. The expectation is that if the `dyanamic` attribute is set, it is interactive and should receive mouse events. Therefore, if the token also has a `link` attribute, the `<a>` tag to navigate to that link should not wrap around the `dynamic` element. Because this element is the literal React Component to be embedded into the page, it would not serialize well into JSON. If the generic token metadata needs to be saved in a simpler form, it may be saved as a string that is the name of the Component, and re-hydrated during de-serialization.

React Components used as `dynamic` viewers for specific tokens should be highly-responsive to different size containers. They should always fill 100% of width and height of whatever container they're placed in, and adjust their content to containers that change size after the initial page render.

The `collection.chainId` value is optional, for situations where a list is known to all be in one chain, so no need to have that additional data on every element of the list.

## Consequences
<!-- Outcomes, both positive and negative -->
Having the token identifier stored as a hex string means the front-end of the web application will need to make a choice if it shows the identifier as a hex string or as an integer. Many projects keep their collection size under 10,000, and only use the identifiers that are close to zero, so most should just be converted to decimal and displayed.