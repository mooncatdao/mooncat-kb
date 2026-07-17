# 0009 - Ethereum Interface Library
**Updated:** <!-- DD Mon YYYY --> 29 Jul 2023

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
To interface with the Ethereum blockchain, a connection needs to be made to an Ethereum node. Ethereum nodes have standardized on a set of [JSON-RPC](https://ethereum.org/en/developers/docs/apis/json-rpc/) functionality that get query data about the blockchain state and allow submitting transactions. Most web applications interfacing with Ethereum use some sort of library to make the process a little more human-friendly, and use language-specific features of the specific programming language. While the JSON-RPC endpoints of Ethereum nodes change very slowly over time, the possibilities for interfacing libraries change more rapidly, and choosing which interface library to use can direct the development style of the web app itself, so is something that should be researched with intention.

In the JavaScript space, the [`web3`](https://www.npmjs.com/package/web3) library was one of the first to gain traction in the space. The [`ethers`](https://www.npmjs.com/package/ethers) library emerged after that, and a newcomer to the space is [`viem`](https://www.npmjs.com/package/viem).

Because of the way JavaScript packaging dependencies go, libraries and components that build in a method of connecting to Ethereum need to pick what sort of connection they communicate with. So, if a web application wishes to use a specific higher-level component, that component might have a bias for which Ethereum Interface Libray is used, and that can therefore restrict a web application’s options.

For MoonCatRescue projects:
- Solidity projects prefer using Hardhat, which has a close tie to `ethers`. It is coded [as a plugin](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-ethers), so in theory others could be slotted in, but at this time no others are part of the core Hardhat codebase.
- Front-end project prefer using NextJS as a ReactJS architecture. For using Ethereum data within ReactJS components, using React’s [hooks](https://react.dev/reference/react) system is ideal for getting that asynchronous data cleanly. The `wagmi` library is a versatile option that works well in the React ecosystem ([comparison](https://wagmi.sh/react/comparison)).
- Front-end projects prefer using the `@web3modal/ethereum` library for managing how visitors connect to their own Ethereum wallets. That component uses `wagmi` under the hood to connect to Ethereum.

The `wagmi` library in their major-version upgrade from v0.12 to v1.0 switched from `ethers` to `viem` as their Ethereum Interface Library (the `viem` library is maintained by the same team that maintains `wagmi`). So any component that upgrades to use the latest `wagmi` library also needs to include `viem`.

It’s possible to have all the Ethereum Interface libraries installed alongside each other, though it adds clutter/bloat to the application to have more than one.

It is not feasible to have multiple versions of the same JavaScript library installed in the project (e.g. both `wagmi` v0.12 and v1.0), when other modules use them as a [peer dependency](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#peerdependencies) at a specific version.

## Decision
<!-- What is the change that we’re actually proposing or doing. -->
The `viem` library doesn’t have much of a track record, but does seem to be feature-complete (there’s nothing MoonCatRescue projects are doing with `ethers` that doesn’t have a corresponding feature in `viem`). The `@web3modal/ethereum` library has already updated to use `wagmi` >1.0, and the `@superfluid-finance/widget` requires `wagmi` >1.0, so for front-end applications that use those modules, using the latest version of `wagmi` and `viem` is preferred.

MoonCatRescue ecosystem projects can use `ethers` (either in addition to `viem` or instead of `viem`), and solidity repositories will likely continue using it for quite a while, as there seems to be no indication the Hardhat project is considering switching.

## Consequences
<!-- Outcomes, both positive and negative -->
The `viem` library being newer runs the risk of having unexpected bugs in it, but that is mitigated a bit by the development team seeming very active, so issues would in theory be addressed rather rapidly. Existing MoonCatRescue projects using `ethers` will need to be updated. There is a [migration guide](https://viem.sh/docs/ethers-migration.html) that covers how to move to `viem` from `ethers` that is fairly complete, so the process of upgrading shouldn’t be too convoluted.