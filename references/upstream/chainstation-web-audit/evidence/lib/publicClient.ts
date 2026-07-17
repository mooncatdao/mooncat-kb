import { createPublicClient, fallback, http, webSocket } from 'viem'
import { arbitrum, mainnet } from 'viem/chains'

/**
 * Collection of connections to Ethereum RPC nodes.
 * These clients are intended to be used by back-end processes to do blockchain data lookups.
 * These connections are not authenticated, so can only read data, not trigger signing of new transactions/messages.
 */

// Can check https://chainlist.org/chain/1 periodically to update this list of stable public nodes
export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http('https://rpc.flashbots.net'),
    http('https://eth.blockrazor.xyz'),
    http('https://ethereum-rpc.publicnode.com'),
    http('https://eth.drpc.org'),
    // If we fall back to here, try using viem's default public endpoints
    http(),
  ]),
})

// Can check https://chainlist.org/chain/42161 periodically to update this list of stable public nodes
export const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: fallback([
    http('https://1rpc.io/arb'),
    webSocket('wss://arbitrum.callstaticrpc.com'),
    http('https://arbitrum.meowrpc.com'),
    http('https://arbitrum.drpc.org'),
    http('https://arb-pokt.nodies.app'),
    // If we fall back to here, try using viem's default public endpoints
    http(),
  ]),
})
