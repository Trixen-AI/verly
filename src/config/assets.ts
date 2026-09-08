import type { Address } from 'viem'

/* ============================================================================
 * Tokenized equities the protocol accepts.
 *
 * Addresses are baked in rather than read from the environment: they are
 * public on-chain identifiers, not configuration, and every one below was
 * verified against the live Robinhood Chain RPC (chain 4663):
 *
 *   - the account has contract bytecode
 *   - symbol() returns the ticker shown here
 *   - decimals() returns 18
 *
 * Source: docs.robinhood.com/chain/contracts
 *
 * VITE_ASSET_ADDRESSES can still override any entry, keyed by ticker, for a
 * testnet or a local fork:
 *
 *   VITE_ASSET_ADDRESSES={"AAPL":"0x..."}
 * ========================================================================= */

export type Asset = {
  symbol: string
  name: string
  logo: string
  address?: Address
  /** ERC20 decimals. Robinhood Chain stock tokens all use 18. */
  decimals: number
}

const CATALOGUE: Required<Omit<Asset, 'decimals'>>[] = [
  { symbol: 'AAPL',  name: 'Apple',                  logo: '/logos/aapl.svg',  address: '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9' },
  { symbol: 'AMZN',  name: 'Amazon',                 logo: '/logos/amzn.svg',  address: '0x12f190a9F9d7D37a250758b26824B97CE941bF54' },
  { symbol: 'GOOGL', name: 'Alphabet Class A',       logo: '/logos/googl.svg', address: '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3' },
  { symbol: 'META',  name: 'Meta Platforms',         logo: '/logos/meta.svg',  address: '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35' },
  { symbol: 'MSFT',  name: 'Microsoft',              logo: '/logos/msft.svg',  address: '0xe93237C50D904957Cf27E7B1133b510C669c2e74' },
  { symbol: 'MSTR',  name: 'Strategy Inc.',          logo: '/logos/mstr.svg',  address: '0xec262a75e413fAfD0dF80480274532C79D42da09' },
  { symbol: 'NVDA',  name: 'NVIDIA',                 logo: '/logos/nvda.svg',  address: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC' },
  { symbol: 'QCOM',  name: 'Qualcomm',               logo: '/logos/qcom.svg',  address: '0x0f17206447090e464C277571124dD2688E48AEA9' },
  { symbol: 'SPY',   name: 'SPDR S&P 500 ETF Trust', logo: '/logos/spy.svg',   address: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C' },
  { symbol: 'TSLA',  name: 'Tesla',                  logo: '/logos/tsla.svg',  address: '0x322F0929c4625eD5bAd873c95208D54E1c003b2d' },
]

function overrides(): Record<string, Address> {
  const raw = import.meta.env.VITE_ASSET_ADDRESSES as string | undefined
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, Address>
  } catch {
    // A malformed override should not take the app down or silently swap an
    // address; fall back to the verified defaults.
    console.warn('VITE_ASSET_ADDRESSES is not valid JSON, using built-in addresses')
    return {}
  }
}

const OVERRIDES = overrides()

export const assets: Asset[] = CATALOGUE.map((a) => ({
  ...a,
  decimals: 18,
  address: OVERRIDES[a.symbol] ?? a.address,
}))

export const assetBySymbol = (symbol: string) => assets.find((a) => a.symbol === symbol)
