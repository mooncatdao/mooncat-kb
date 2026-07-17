# 0016 - User Galleries
**Updated:** 14 July 2025

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
The concept of User-created Lists ([ADR0010](./0010-user-created-lists.md)) is useful for allowing any user to showcase a list of NFT tokens. However the proposed solution has a few limitations and drawbacks that would be ideal to address:

- The ADR0010 process requires formally revoking Attestations when edits are made. This is a slight cost to users, and an extra complication for the process. Making revoking past states optional would be preferred.
- The ADR0010 structure results in a list of tokens with a name and description for the list, but the ordering and presentation of the tokens in the list is left ambiguous (should ordering be in the order added to the list, or in alphabetical order, or numerically by ID?). Adding in ordering and visual display preferences would elevate the "list" to a "gallery", arranging the tokens in relation to each other.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
The end result is to have a data structure that is a Gallery of tokens. Each Gallery shall have:

- Owner: Ethereum address who created the Gallery and has editing rights to it
- Name: What the Gallery should be titled
- Description: A paragraph of text by the owner to describe what the Gallery is about
- Tokens: A list of items that belong to the Gallery. Each item shall have data properties of:
  - Collection Address: Ethereum address of the overall collection
  - Token identifier: Unique identification value for the token within the collection

For any service wishing to display a Gallery, they should arrange the tokens in the Gallery into a series of "display pannels", using the "display size" and "display order" to arrange the items.

Each "display panel" is a virtual grid divided evenly into 8x8 cells. The panel should be presented as square, or up to a 16:9 ratio. A gallery that has many tokens may fill more than one display panel, and the service displaying the gallery may lay out the display panels horizontally or vertically in sequence, striving to present the experience that a viewer visiting the gallery will experience display panel #1 first, then display panel #2, and so on.

The logic of placing tokens into the display panels generally follows the logic of a CSS grid layout, with `grid-auto-flow: row`. By default, each token gets displayed as filling a 2x2 space in the display panel, so if a Gallery has no display preferences set, it should be displayed as a 4x4 array of tokens, with the first token in the top-left, with the others laid out left-to-right, top-to-bottom. If that Gallery has more than 16 tokens defined, the 17th token would be the top-left position of a second panel for that gallery.

If a token has a display column or row specified that is would cause it to overflow the panel (e.g. size of 3, with column set to 7. That would indicate the token should occupy columns 7, 8, and 9, but a display panel is only 8 columns wide), the size should be honored, and the invalid row or column setting assumed to be "auto" (wrap the token to the next row/column).

To save those display preferences, each token in the Gallery can have the following optional attributes:

- Display size: defaults to "2", meaning shown as a 2x2 grid area. Tokens that are not owned by the owner of the Gallery may have sizes of 1 or 2. Tokens that are owned by the owner of the Gallery may be displayed in any size, up to 8 (to be shown as taking up a full 8x8 panel space).
- Display column: the column the top-left corner of the token should start being displayed in (equivalent to CSS `grid-column-start` value)
- Display row: the column the top-left corner of the token should start being displayed in (equivalent to CSS `grid-column-start` value)
- Display style: Preference on how the token should be shown within the panel cell. Options are:
  - "padded": Show the image of the token center-aligned in the cell, with some padding between it and the edges of the display cell.
  - "fit": scale the image up such that the larger dimension (width or height) is the size of the cell, and center-align the other dimension.
  - "cover": scale the image up such that the smaller dimension (width or height) is the size of the cell, and crop the other dimension.

### Attestations
To represent a Gallery, several Attestations will be used. When assembling a Gallery's current state, visualization services should query for all "Token Gallery" Attestations by the Gallery owner, order by timestamp, and remove revoked entries. For each "name" value, keep the most-recent Attestation; all older Token Gallery Attestations with the same name by the same owner should be considered obsolute and treated as revoked.

Each Token Gallery Attestation has the following properties:

- The `to` address should be the zero address.
- The `from` address is the owner of the Gallery.
- The `name` value must be 20 characters or less.
- The `collections`, and `tokenIds` arrays must be the same length, and contain all the tokens in the Gallery.
- The `displayProps` array contains the optional additional display properties for the tokens in the Gallery.

The `displayProps` values shall be `uint32` values that are treated as compacted data. That value is 4 bytes long, so contains 8 nibbles of data, each with a value between 0 and 15. These 8 slots represent:

- slot 1: display style (0: padded, 1: fit, 2: cover)
- slot 2: display size (valid values 1 through 8)
- slot 3: display column (valid values 0 through 8, with 0 meaning "auto")
- slot 4: display row (valid values 0 through 8, with 0 meaning "auto")
- slot 5: reserved
- slot 6: reserved
- slot 7: reserved
- slot 8: reserved


## Consequences
<!-- Outcomes, both positive and negative -->
All existing User Lists will need to be updated to use the new Attestation schema. That means the ChainStation web interface will need to keep the logic for how to parse those Attestations for a while, plus add new interfaces for converting.

The conversion process should keep the older User List structure once the Gallery attestation is in place, as a backup. Then once all User Lists are converted, they can all be purged at once.