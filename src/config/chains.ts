import { defineChain } from 'viem'

/* ============================================================================
 * Robinhood Chain.
 *
 * An Arbitrum Orbit L2 settling to Ethereum, ETH as the gas token. Values below
 * are from docs.robinhood.com/chain/connecting and were verified against the
 * live public RPC (eth_chainId returned 0x1237 = 4663).
 *
 * The public RPCs are rate limited. For production, put an Alchemy key in
 * VITE_RPC_MAINNET / VITE_RPC_TESTNET; the app falls back to public otherwise.
 * ========================================================================= */

const RPC_MAINNET =
  (import.meta.env.VITE_RPC_MAINNET as string | undefined) ||
  'https://rpc.mainnet.chain.robinhood.com'

const RPC_TESTNET =
  (import.meta.env.VITE_RPC_TESTNET as string | undefined) ||
  'https://rpc.testnet.chain.robinhood.com'

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_MAINNET] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
  testnet: false,
})

export const robinhoodChainTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_TESTNET] },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.testnet.chain.robinhood.com',
    },
  },
  testnet: true,
})

/** Chain the dashboard expects. Flip with VITE_USE_TESTNET=true. */
export const activeChain =
  import.meta.env.VITE_USE_TESTNET === 'true' ? robinhoodChainTestnet : robinhoodChain

/** Build an explorer link for an address or transaction. */
export function explorerUrl(
  kind: 'address' | 'tx' | 'block',
  value: string,
  chainId: number = activeChain.id,
) {
  const chain = chainId === robinhoodChainTestnet.id ? robinhoodChainTestnet : robinhoodChain
  return `${chain.blockExplorers.default.url}/${kind}/${value}`
}
