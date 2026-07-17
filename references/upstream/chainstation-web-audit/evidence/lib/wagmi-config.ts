import { cookieStorage, createStorage, fallback, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, defineChain } from '@reown/appkit/networks'

const hardhat = defineChain({
  id: 1337,
  name: 'Hardhat (Mainnet)',
  nativeCurrency: mainnet.nativeCurrency,
  rpcUrls: {
    public: { http: ['http://127.0.0.1:29990'] },
    default: { http: ['http://127.0.0.1:29990'] },
  },
  contracts: mainnet.contracts,
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1337',
})

export const walletConnectProject = '705e98fb7f922815cbb7c1e82e0fbb5a'

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: walletConnectProject,
  networks: [mainnet, arbitrum, polygon, hardhat],
  transports: {
    [mainnet.id]: fallback([
      http('https://rpc.flashbots.net'),
      http('https://eth.blockrazor.xyz'),
      http('https://ethereum-rpc.publicnode.com'),
      http('https://eth.drpc.org'),
      http('https://mainnet.infura.io/v3/2FAhNKMb6KWsFVO6pimHFKn7gfX'),
      http(),
    ]),
  },
})
export const config = wagmiAdapter.wagmiConfig
