# Fully-on-chain architecture synthesis: evidence readiness

## Verdict

**Ready with explicit limitations.** The repository can support one narrowly
scoped future cross-source synthesis case about the documented on-chain
materialization path and the roles of its reviewed contracts. It cannot support
an unqualified answer that MoonCats are fully on-chain now, that every
historical deployment still matches the reviewed source, or that current
ownership, administration, availability, or content state is established.

This audit does not add a factual-retrieval case. The benchmark remains at 33
cases, and the fully-on-chain architecture synthesis gap remains open.

## Evidence layers

The evidence roles must remain separate:

| Layer | Existing repository support | What it can establish | What it cannot establish |
| --- | --- | --- | --- |
| ADR/design intent | data/architecture-decisions.json, docs/architecture-decisions.md, and the pinned ADR records 0007, 0008, 0009, and 0012 | documented architecture direction for blockchain state, library structure, Ethereum interfaces, and token metadata | implementation completion, selected deployed contracts, deployment, or live state |
| Source implementation | data/contracts.json, docs/contracts.md, data/contract-surfaces.json, data/materialization-internals.json, and the compact contract-internals reviews | reviewed function roles and source-described relationships among rescue, wrapper, traits, colors, SVG, and accessory surfaces | complete source/ABI bodies, complete mappings, generated outputs, or bytecode equivalence |
| Historical deployment evidence | contract records with Ethereum-mainnet addresses, verified-source status, registered Etherscan references, and the official Chained to the Future log source reference | that an exact address/source relationship was recorded and reviewed at the stated check dates | that the deployment is still active, unchanged, or equivalent to current bytecode |
| Live/current chain state | no checked-in live query result or current-state snapshot in this audit | none | current code, admin/owner state, proxy configuration, storage, ownership, supply, endpoint availability, IPFS/Firebase content, or transaction behavior |

Direct source statements, deterministic derivations, and reviewer inference
must also stay separate. For example, the contract summaries directly state
function roles; the materialization path is a reviewer synthesis across those
roles; and “fully on-chain now” would be an unsupported current-state
inference.

## Relevant contracts and mechanisms

| Contract or mechanism | Role in a future synthesis | Strongest local evidence | Boundary |
| --- | --- | --- | --- |
| MoonCatRescue | original rescue-order lookup, owner/cat identity foundation, Genesis formula and supply constants | data/contracts.json, docs/contracts.md, data/protocol-constants.json, registered historical source references | source and recorded mainnet address do not prove current storage, ownership, or bytecode |
| MoonCatAcclimator | ERC-721/ERC-998 wrapper path from original MoonCats; reviewed token identity uses rescue order within this exact contract | data/contracts.json and data/contract-surfaces.json | exact source/address review is historical; current wrapper state and approvals require live evidence |
| MoonCatReference | on-chain documentation/reference registry for materialization contracts | data/contracts.json and data/contract-surfaces.json | stored documentation records and current registry contents are not imported |
| MoonCatTraits | compact and human-readable trait lookup, including rescue-order helpers | data/contracts.json, data/contract-surfaces.json, data/materialization-internals.json | full trait tables, mappings, and current outputs are absent |
| MoonCatColors | RGB, hue, palette, glow, and accessory-color helper surface | data/contracts.json, data/contract-surfaces.json, data/materialization-internals.json | palette values, override values, and current storage are absent |
| MoonCatSVGs | source-reviewed SVG assembly from trait and color inputs, with cat ID and rescue-order entrypoints | data/contracts.json, data/contract-surfaces.json, data/mooncat-svg-internals.json | coordinate data and rendered output are absent; source review is not deployed-output proof |
| MoonCatAccessories | definitions, assignment, rescue-order-keyed owned records, and mutable wear state | data/contracts.json, data/contract-surfaces.json, data/mooncat-accessories-internals.json | taxonomy, records, approvals, managers, supply, and current worn state are absent |
| MoonCatAccessoryImages | accessory composition and PNG/SVG helper path using the other materialization surfaces | data/contracts.json, data/contract-surfaces.json, data/mooncat-accessory-images-internals.json | accessory data, image bytes, palettes, and rendered results are absent |

The historical MoonCatsWrapped wrapper is not part of the narrowest core
materialization path. Include it only if a future question explicitly compares
wrapper identity; its mapping-backed token IDs must not be generalized to the
Acclimated contract.

## Proposed future case

Recommended question:

> Which reviewed contracts and source-described mechanisms form the MoonCat
> on-chain materialization path, and what does each evidence layer establish
> about that path?

This wording is supportable because it asks for a source-bounded architecture
synthesis. It should not ask whether the path is currently live, whether all
outputs are presently retrievable, or whether source and deployed bytecode are
identical.

### Narrow required-files set

1. data/architecture-decisions.json
2. docs/architecture-decisions.md
3. data/contracts.json
4. docs/contracts.md
5. data/contract-surfaces.json
6. data/materialization-internals.json

No optional files are recommended for the first case. Add
data/mooncat-svg-internals.json, data/mooncat-accessories-internals.json, or
data/mooncat-accessory-images-internals.json only when the question requires
that contract’s detailed mechanism. Do not load the full references tree or
the upstream source snapshots as generic background.

### Required provenance boundaries

The future case must require the answer to distinguish:

- ADR/design intent from source implementation;
- source implementation from historical deployed-address/source evidence;
- historical deployment evidence from current/live chain state;
- direct source statements from deterministic derivations;
- reviewer synthesis of a multi-contract path from a claim made by any one
  contract;
- on-chain materialization surfaces from off-chain API, hosting, IPFS, Firebase,
  marketplace, or frontend availability.

### Forbidden claims

The future case must forbid claims that:

- the ADRs prove implementation or deployment;
- a verified source page proves current bytecode equivalence or active deployment;
- the recorded addresses prove current admin, owner, proxy, storage, supply, or
  token ownership state;
- a source-described SVG, palette, trait, or accessory path proves current
  retrievability or exact rendered output;
- the contract set proves every MoonCat asset is currently fully on-chain;
- a configured API, IPFS, Firebase, or frontend URL is presently available
  without live verification.

### Expected limitations

The expected answer should state that the KB has compact role/function
summaries and historical source/address evidence, but does not contain full
ABIs, Solidity bodies, bytecode, constructor arguments, storage snapshots,
complete trait/accessory/palette mappings, generated outputs, current admin or
ownership reads, or current endpoint/content checks.

## Concrete missing evidence

The requested paths docs/on-chain.md, data/source-registry.json, and
references/research-notes/onchain-contracts/ are absent in this checkout.
The registered source index is data/sources.json, and docs/contracts.md plus
the compact data surfaces currently fill the relevant local roles. Their
absence does not block the bounded case, but it means the future case should
cite the existing files directly rather than imply a dedicated on-chain
research bundle exists.

The following evidence remains missing or requires a separately authorized
pass:

- current deployment and proxy/implementation state for each address;
- current owner/admin/approval/storage and ownership reads;
- source-to-deployed-bytecode equivalence at a pinned block;
- current contract output or transaction-level materialization checks;
- current API, RPC, IPFS, Firebase, hosting, and frontend availability;
- complete mappings and generated asset outputs.

## Gap decision

Keep fully-on-chain-architecture-synthesis open. The evidence is sufficient to
design a carefully bounded future benchmark case, but not to mark the
architecture synthesis gap covered until that case is added and validated with
these boundaries intact.
