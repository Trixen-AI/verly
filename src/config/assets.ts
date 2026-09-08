import type { Address } from 'viem'

/* ============================================================================
 * Tokenized equities the protocol accepts.
 *
 * Addresses come from the environment so the same build can point at mainnet,
 * testnet or a local fork without a code change. Set them as a JSON map:
 *
 *   VITE_ASSET_ADDRESSES={"AAPL":"0x...","AMZN":"0x..."}
 *
 * An asset with no address is still listed and still selectable; the deposit
 * form reads its address at submit time and surfaces a real error if it is
 * missing, rather than pretending the transfer went through.
 * ========================================================================= */

export type Asset = {
  symbol: string
  name: string
  logo: string
  address?: Address
  /** ERC20 decimals. Tokenized equities commonly use 18. */
  decimals: number
}

function addressMap(): Record<string, Address> {
  const raw = import.meta.env.VITE_ASSET_ADDRESSES as string | undefined
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, Address>
  } catch {
    // A malformed map should not take the app down; the forms will report the
    // missing address per asset instead.
    console.warn('VITE_ASSET_ADDRESSES is not valid JSON, ignoring it')
    return {}
  }
}

const ADDRESSES = addressMap()

/**
 * The stock tokens deployed on Robinhood Chain. Each address in the env map
 * was verified against the live RPC: symbol() matches the ticker, decimals()
 * is 18, and the account has contract bytecode.
 */
const CATALOGUE: Omit<Asset, 'address'>[] = [
  { symbol: 'AAPL', name: 'Apple', logo: '/logos/aapl.svg', decimals: 18 },
  { symbol: 'AMZN', name: 'Amazon', logo: '/logos/amzn.svg', decimals: 18 },
  { symbol: 'GOOGL', name: 'Alphabet Class A', logo: '/logos/googl.svg', decimals: 18 },
  { symbol: 'META', name: 'Meta Platforms', logo: '/logos/meta.svg', decimals: 18 },
  { symbol: 'MSFT', name: 'Microsoft', logo: '/logos/msft.svg', decimals: 18 },
  { symbol: 'MSTR', name: 'Strategy Inc.', logo: '/logos/mstr.svg', decimals: 18 },
  { symbol: 'NVDA', name: 'NVIDIA', logo: '/logos/nvda.svg', decimals: 18 },
  { symbol: 'QCOM', name: 'Qualcomm', logo: '/logos/qcom.svg', decimals: 18 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', logo: '/logos/spy.svg', decimals: 18 },
  { symbol: 'TSLA', name: 'Tesla', logo: '/logos/tsla.svg', decimals: 18 },
]

export const assets: Asset[] = CATALOGUE.map((a) => ({ ...a, address: ADDRESSES[a.symbol] }))

export const assetBySymbol = (symbol: string) => assets.find((a) => a.symbol === symbol)
