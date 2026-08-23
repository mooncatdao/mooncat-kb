# CatMoon interaction patterns

## Rescue URL state

`src/js/rescue-url.js` accepts a decimal rescue order in the `0..25439`
domain. `?rescue=<id>` normalizes to a pinned selection. Adding
`&view=details` opens the existing detail dialog after focus; `view=pin` and
unknown values normalize to the pinned form. Clearing the selection removes
both `rescue` and `view`.

`src/main.js` calls `history.replaceState`, not `pushState`, for selection,
pinning, detail open/close, and clearing. The helper clones the current URL,
changes only its owned parameters, and serializes pathname, query, and hash,
so wallet parameters, unrelated query parameters, and the hash survive.
Focus animation, pin state, and detail state remain one flow: a URL lookup
focuses the target, pins it, and optionally opens the existing card rather
than inventing a deep-link-only card.

## Hover, focus, pinning, and details

The main coordinator distinguishes transient hover from a pinned rescue. A
short hover-intent delay avoids accidental desktop tooltips; touch hover is
suppressed during gestures. Selecting the already pinned cat opens details,
selecting another replaces the pin, and selecting empty space or closing the
preview clears it. A rescue lookup temporarily remembers whether auto-tumble
was enabled so closing the lookup-created pin can resume it consistently.

The detail dialog uses `showModal()`, keeps request tokens so stale async
responses cannot overwrite a newer selection, and supports close, Escape,
backdrop behavior, action-panel focus restoration, and a retry state. The
pinned preview is keyboard-focusable only while a cat is pinned and exposes
its disabled state with `aria-disabled`.

## Wallet lookup and local history

The browser helper calls `/api/wallet-cats?address=...`, requires an `ids`
array, removes non-integer/out-of-range IDs, deduplicates, and sorts ascending.
The Pages Function accepts an address or normalized ENS-like name, resolves ENS
through an environment-provided Ethereum mainnet RPC when needed, extracts
rescue orders from supported ownership API shapes, labels ownership surfaces,
and returns cacheable successful results. This is implementation capability,
not a current ownership claim.

Local lookup records are normalized on read, invalid/empty records are
dropped, records are sorted by `lastUsed`, and the list is capped at eight.
The wallet URL uses the resolved name when available and otherwise the
address; URL updates also use `replaceState` and preserve the hash. Lookup
history, render preferences, detail theme, and Hide Moon are browser-local;
they are not a wallet connection, signature, synchronized account state, or
cross-device store. Hide Moon only applies to the active Wallet Cats view and
resets when that filter exits.

Source paths: `src/main.js`, `src/js/rescue-url.js`, `src/js/wallet.js`,
`src/js/cat-details.js`, and `functions/api/wallet-cats.js`.
