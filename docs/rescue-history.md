# Rescue History

Machine-readable rescue data lives in `data/rescue-ranges.json`.

## Current Status

Partially verified.

The first import pass records contract-derived supply counts only. It does not yet define historical rescue ranges, early-rescue categories, block numbers, timestamps, or exact rescue-order thresholds.

## Verified from contract source

- Total supply: `25600`
- Initial normal rescue cat supply: `25344`
- Genesis cat supply cap: `256`

These are supply constants, not rescue-history ranges.

## Still needed

- rescue-order based ranges
- early-rescue definitions
- historical thresholds by block or timestamp
- source-backed ID membership lists
- community convention notes, if applicable

## Rules

- State whether a range is based on ID, rescue order, block, timestamp, supply constant, or community convention.
- Add exact values only with source references.
- Keep historical explanation in this document and exact ranges/counts in JSON.
