# 0004 - Public Testnet
**Updated:** 13 May 2024

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
Most of the contract testing done for MoonCat​Rescue projects is done using [Hardhat](https://hardhat.org/) on locally-running, short-lived, personal testnets. However, in order to see how our contracts interact with other projects (especially the web front-ends of other projects), deploying them to one of the long-running, [public Ethereum testnets](https://ethereum.org/en/developers/docs/networks/#testnets) can be helpful.

Sepolia is a long-lived, public testnet that could be used. However, re-deploying the same or similar contracts over and over again wouldn’t be effective. And using the testnet at all requires “test Ether”, which doesn’t just appear in your wallet like it does with Hardhat.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
Use the [Sepolia](https://ethereum.org/en/developers/docs/networks/#sepolia) testnet when needing to do public testing or integration testing with other applications. Sepolia is planned to enter long-term-support in 2026. After January 2026, this decision MUST be re-evaluated and determine if there is a different testnet that should be utilized.

### Shared development addresses
To keep organized on Sepolia as a team, the project maintainers use a shared mnemonic phrase to keep testnet ETH in, so those developers don’t need to each get their own cache of testnet ETH and other testnet assets. These are the first few accounts from that seed phrase; each are given a nickname/persona to make referring to them easier:

1. Alice: [`0x0EDB5F5BDE6269cAe419c711B8E40962681B62e5`](https://sepolia.etherscan.io/address/0x0EDB5F5BDE6269cAe419c711B8E40962681B62e5)
2. Bob: [`0xED81627B4c9f4c3061299C7347d29420770a558A`](https://sepolia.etherscan.io/address/0xED81627B4c9f4c3061299C7347d29420770a558A)
3. Carol: [`0x14537966E61B1fE99EEE866777C55465Db679FBB`](https://sepolia.etherscan.io/address/0x14537966E61B1fE99EEE866777C55465Db679FBB)
4. Deb: [`0x93f5D57DbE5E3811c37273368704c080Ebd60a25`](https://sepolia.etherscan.io/address/0x93f5D57DbE5E3811c37273368704c080Ebd60a25)
5. Eve: [`0x40255A452566d929F84e89E97e078065C0de142b`](https://sepolia.etherscan.io/address/0x40255A452566d929F84e89E97e078065C0de142b)

Following the conventions of [Alice and Bob as cryptographic character stand-ins](https://en.wikipedia.org/wiki/Alice_and_Bob), “Eve” is cast as the eavesdroppper/evil character, so is the address that by default should have no special privileges, but then gets used to try and break the system (attempting actions she shouldn’t be allowed to do).

As “Alice” and “Bob” should emulate end-users, they should not be set as default administrators of different contracts. Instead, “Deb” is the account that should be set as Administrator/Creator/Deployer of contracts on Sepolia.

### Third-party Contracts

- Etherscan: [blockchain explorer](https://sepolia.etherscan.io/)
- Opensea: [web UI](https://testnets.opensea.io/)
- Ethereum Name Service (ENS): The “Deb” account has registered the `mooncatrescue.eth` ENS name on Sepolia (expires 12 May 2029), which can be used to set subdomains to make easy pointers to things on that network, if desired. [ENS manager](https://app.ens.domains/)

## MoonCat​Rescue deployments

**Gnosis Safe:** [`0x5Cdda2917862da514522cCC3B67DcaD617E000a5`](https://app.safe.global/home?safe=sep:0x5Cdda2917862da514522cCC3B67DcaD617E000a5)
Set up to be a 2-of-4 multisig, using the first four addresses from the development seed phrase.

## Consequences
<!-- Outcomes, both positive and negative -->
The Sepolia network is one of the more widely-used testnets, and target applications MoonCat​Rescue wants to interact with are already present there, which makes it a good choice to use. If those other applications move to other testnets, MoonCat​Rescue may need to reconsider and move its infrastructure to another testnet.
