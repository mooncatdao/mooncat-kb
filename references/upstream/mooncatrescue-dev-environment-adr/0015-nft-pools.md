# 0015 - NFT Pools
**Updated:** <!-- DD Mon YYYY --> 5 May 2025

## Status
<!-- Proposed | Accepted | Rejected | Deprecated | Superseded -->
Accepted

## Context
<!-- What is the issue that we’re seeing, that is motivating this decision or change -->
The MoonCatRescue ecosystem has a few Non-Fungible Token (NFT) collections (MoonCats themselves, plus lootprints and MoonCatMoments), which by definition are distinct items from all others in the collection (they're not fungible with others in the collection). But for much of the collection, there's a common valuation that most fall under (the "floor" price), and hence tooling has emerged to _pool_ NFTs together and make them fungible. Several external platforms have incorporated this idea, but which (if any) should the community be encouraged to participate in? Which (if any) should be incorporated into the ChainStation interface and allow visitors to interact with it directly through the project website?


### NFT20
Created by [Nifty Museum](https://x.com/niftymuseum) (which became Muse DAO). 

- Old-wrapped MoonCats (MCAT20): `0xf961A1Fa7C781Ecd23689fE1d0B7f3B6cBB2f972` [web](https://nft20.io/asset/0xf961a1fa7c781ecd23689fe1d0b7f3b6cbb2f972), [contract](https://etherscan.io/address/0xf961a1fa7c781ecd23689fe1d0b7f3b6cbb2f972)
- Acclimated MoonCats (CAT20): `0x67BDcD02705CEcf08Cb296394DB7d6Ed00A496F9` [web](https://nft20.io/asset/0x67bdcd02705cecf08cb296394db7d6ed00a496f9), [contract](https://etherscan.io/address/0x67bdcd02705cecf08cb296394db7d6ed00a496f9)

This platform has a farming/rewards infrastructure, which uses Uniswap v2 liquidity positions as the item to be rewarded. The farms earned $MUSE tokens, but have not been renewed by the Muse DAO team.

- Old-wrapped liquidity (MCAT20/ETH): [`0x1e8703458ad891fbf78c9320cd78a343fb2f73b3`](https://etherscan.io/address/0x1e8703458ad891fbf78c9320cd78a343fb2f73b3)
- Acclimated liquidity (CAT20/ETH): [`0x31c507636a4cab752a8a069b865099924bd5f1a9`](https://etherscan.io/address/0x31c507636a4cab752a8a069b865099924bd5f1a9)
- NFT20 Rewards Farm (`MasterChef`): [`0x193b775aF4BF9E11656cA48724A710359446BF52`](https://etherscan.io/address/0x193b775aF4BF9E11656cA48724A710359446BF52)
- NFT20 Dutch Auction factory: [`0x18304eF06f474A027b28Eb0099F675Fc258776dF`](https://etherscan.io/address/0x18304eF06f474A027b28Eb0099F675Fc258776dF)


### NFTX
Created by a team with the same name as the product, and has gone through three different major versions. The MoonCatRescue project has "vaults" (pools) in the v2 and v3 infrastructures.

The NFTX team has shifted their focus away from the vault web UIs, in favor of its new platform [ƒlayer](https://x.com/flayerApp), which is located on the Base sidechain. ƒlayer itself might also become a candidate for use in the future, but it's too early to tell at the moment.

- [Documentation](https://docs.nftx.io/)
- [Marketplace Integration guide](https://docs.nftx.io/integrations/marketplace-integration)


#### NFTX v2

- MoonCat vault (MOONCAT): `0x98968f0747E0A261532cAcC0BE296375F5c08398` [web](https://v2.nftx.io/vault/0x98968f0747e0a261532cacc0be296375f5c08398), [contract](https://etherscan.io/address/0x98968f0747e0a261532cacc0be296375f5c08398)
- 2017-rescued MoonCats (MCAT17): `0xA8b42C82a628DC43c2c2285205313e5106EA2853` [web](https://v2.nftx.io/vault/0xa8b42c82a628dc43c2c2285205313e5106ea2853), [contract](0xA8b42C82a628DC43c2c2285205313e5106EA2853)

This platform has a farming/rewards infrastructure that rewards liquidity put into the sushi AMM. It also has the abiliy to stake just the vault token (single-sided). The rewards are paid out in the vault token, taken from the fees users give performing swaps.

- NFTX Inventory staking: [`0x3E135c3E981fAe3383A5aE0d323860a34CfAB893`](https://etherscan.io/address/0x3E135c3E981fAe3383A5aE0d323860a34CfAB893#readProxyContract) This contract acts as a front interface/router for staking into all of the NFTX v2 vaults. The deposit function accepts a vault ID as well as an amount, and then this contract routes the request to the proper "xToken" contract. It acts as a "beacon" for all "xToken" contracts; calling `childImplementation` on this contract points to their logic implementation.
- MoonCat single-sided Liquidity (xMOONCAT): [`0x573f76519Bb7fd10c95B38f4Ffd569D9A3989C39`](https://etherscan.io/address/0x573f76519Bb7fd10c95B38f4Ffd569D9A3989C39)
- MoonCat sushi Liquidity (MOONCATWETH): [`0x0aa1E808bbA7CDE5210D13D23eE726de37b8a8bb`](https://etherscan.io/address/0x0aa1E808bbA7CDE5210D13D23eE726de37b8a8bb)
- MoonCat staked Liquidity (xMOONCATWETH): [`0x2a811dA74F22B3222F67cF034467536b97494f9c`](https://etherscan.io/address/0x2a811dA74F22B3222F67cF034467536b97494f9c)
- 2017-rescued MoonCats single-sided Liquidity (xMCAT17): [`0x29f033720d84d0F85c1becCf80E51449C06Ca2d2`](https://etherscan.io/address/0x29f033720d84d0F85c1becCf80E51449C06Ca2d2)
- 2017-rescued MoonCats sushi Liquidity (MCAT17WETH): [`0x11a4975b0eB5a37ec637fe395AD767ca4D4AEF7f`](https://etherscan.io/address/0x11a4975b0eB5a37ec637fe395AD767ca4D4AEF7f)
- 2017-rescued MoonCats staked Liquidity (xMCAT17WETH): [`0x4f9295A18334a3dB3cc8C158bCb186706d047F31`](https://etherscan.io/address/0x4f9295A18334a3dB3cc8C158bCb186706d047F31)

#### NFTX v3

Modeled after Uniswap v3, to give concentrated liquidiy options, and represent positions as ERC721 tokens rather than ERC20s. But NFTX created their own AMM fork/clone, because the liquidity position tokens earn not just liquidity rewards (ETH and vault token rewards from swapping between the two), but also platform rewards (paid in the vault token) when people swap NFTs in and out of the vaults. This means single-sided and double-sided liquidity positions earn platform fees without needing to be staked into a separate contract (there's no "xToken" holding container like in the v2 infrastructure).

Additionally, the v3 vaults added an [automatic Dutch auction](https://docs.nftx.io/integrations/marketplace-integration#premium-nft-auctions) for every token added to a pool. The auction puts a 500% premium on the token, which declines to 0% over 10 hours. This is intended as a safety check for naïve users who add a valuable token into a "floor" pool. Arbitrageurs who are watching the pool will purchase the token while there's still a premium on it, and the profit will go back to the depositor as a bonus.

- NFTX Router [`0x70A741A12262d4b5Ff45C0179c783a380EebE42a`](https://etherscan.io/address/0x70A741A12262d4b5Ff45C0179c783a380EebE42a) replaced by [`0x3B3e4E76cac64EB29C399dcad1f3c401D2254f5f`](https://etherscan.io/address/0x3B3e4E76cac64EB29C399dcad1f3c401D2254f5f)
- Uniswap v3 Factory: [`0xa70e10beB02fF9a44007D9D3695d4b96003db101`](https://etherscan.io/address/0xa70e10beB02fF9a44007D9D3695d4b96003db101)
- Nonfungible Position Manager [`0x26387fcA3692FCac1C1e8E4E2B22A6CF0d4b71bF`](https://etherscan.io/address/0x26387fcA3692FCac1C1e8E4E2B22A6CF0d4b71bF)
- NFTX v3 Fee Distributor [`0x6845fF5f102bEF9D785468F0bEb535b4687406E7`](https://etherscan.io/address/0x6845fF5f102bEF9D785468F0bEb535b4687406E7)
- MoonCat vault (MOONCAT): `0xD4fe01ce79C84C68f9307D415B8f392D140c242C` [web](https://v3.nftx.io/eth/info/tokens/0xd4fe01ce79c84c68f9307d415b8f392d140c242c), [contract](https://etherscan.io/address/0xd4fe01ce79c84c68f9307d415b8f392d140c242c)
- MoonCat Liquidity (ETH/MOONCAT): `0x0a844BAead2519b83dCaCb1B0b5F7eD4e4784a3A` [web](https://v3.nftx.io/eth/info/pools/0x0a844baead2519b83dcacb1b0b5f7ed4e4784a3a), [contract](https://etherscan.io/address/0x0a844baead2519b83dcacb1b0b5f7ed4e4784a3a)

### sudoswap

The sudoswap platform creates NFT pools not on a per-collection basis, but per-liquidity-provider. This means that users who put their NFTs into a sudoswap pool still own those tokens and can claim those specific tokens back, because "their tokens" are the only tokens in "their pool". To create a marketplace front-end for an entire collection, it requires enumerating over all the pools that have been created, and noting all the ones that target the desired collection. Then also updating that set of pool contract addresses over time as new liquidity providers create pools for themselves.

- [Creating a Trade Pool guide](https://docs.sudoswap.xyz/user-guide/creating-a-pool/#trade-pool-buy-and-sell)
- Pair Factory: `0xA020d57aB0448Ef74115c112D18a9C231CC86000`
- Router: `0x090C236B62317db226e6ae6CD4c0Fd25b7028b65`


## Decision
<!-- What is the change that we’re actually proposing or doing. -->
The NFTX v3 platform is the preferred base to build upon. Interfaces built into the MoonCat Chainstation web interfaces should encourage visitors to interact with that platform by default. Interfaces for other pools may be integrated too, but those should have an emphasis on helping the user identify if they have existing positions on those platforms and transition them away from those other pools to NFTX v3.

The sudoswap infrastructure includes the ability to create [Dutch auctions](https://docs.sudoswap.xyz/user-guide/creating-an-auction/) for any ERC20 token, so could be used instead of the automatic Dutch auction set on NFTX v3 pools or any other pool's ERC20 token.

For a user wishing to adopt a MoonCat, searching across all pools should be done, to help the visitor find the true lowest adoption price at the time.

## Consequences
<!-- Outcomes, both positive and negative -->
The NFTX team shifting its focus to other projects means integrating the NFTX vaults into ChainStation becomes a higher priority (rather than just linking visitors to the NFTX UI), but that was a desired goal anyway. It means there is no "fallback" option if the ChainStation interfaces break, but it gives more control over interacting with the vaults directly alongside MoonCat project lore.

The NFTX v3 infrastructure is a bit more complicated to manage, due to there being both single-sided and paired liquidity options, plus needing to use the NFTX AMM for best liquidity means making your own swap UI too (rather than just redirecting the user to Uniswap's web UI, because it [cannot find a NFTX route](https://app.uniswap.org/swap?chain=mainnet&inputCurrency=NATIVE&outputCurrency=0xd4fe01ce79c84c68f9307d415b8f392d140c242c&value=.05)).