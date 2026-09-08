import { type ReactNode, useState } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http, type Config } from 'wagmi'

import { brand, site } from '@/config/brand'
import { robinhoodChain, robinhoodChainTestnet } from '@/config/chains'

/* ============================================================================
 * Reown AppKit (WalletConnect).
 *
 * IMPORTANT: imported only from the lazily loaded /app route. wagmi, viem and
 * AppKit together are a large dependency and the marketing and docs routes
 * must never pay for them. Do not import this file from anything reachable by
 * `/` or `/docs`.
 *
 * The project id comes from VITE_REOWN_PROJECT_ID. A Reown project id is a
 * public client identifier by design: restrict it by domain in the Reown
 * dashboard rather than treating it as a secret.
 * ========================================================================= */

export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined

/** False until a project id is configured. The UI explains rather than breaks. */
export const isWalletConfigured = Boolean(projectId)

const networks = [robinhoodChain, robinhoodChainTestnet] as const

let cached: Config | null = null

/**
 * Builds the wagmi config once.
 *
 * Without a project id this still returns a working config, just one with no
 * connectors. Public chain reads keep working, `useAccount` reports
 * disconnected, and every section renders normally instead of crashing on a
 * missing provider.
 */
function buildConfig(): Config {
  if (cached) return cached

  if (!projectId) {
    cached = createConfig({
      chains: [robinhoodChain, robinhoodChainTestnet],
      connectors: [],
      transports: {
        [robinhoodChain.id]: http(),
        [robinhoodChainTestnet.id]: http(),
      },
    })
    return cached
  }

  const adapter = new WagmiAdapter({
    networks: [...networks],
    projectId,
    ssr: false,
  })

  createAppKit({
    adapters: [adapter],
    networks: [...networks],
    defaultNetwork: robinhoodChain,
    projectId,
    metadata: {
      name: `${brand.name} ${brand.suffix}`,
      description: site.description,
      url: site.url,
      icons: [`${site.url}/brand/png/veyl-mark-256.png`],
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    // Match the marketing site rather than shipping default AppKit purple.
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#4f5d31',
      '--w3m-color-mix': '#faf9f5',
      '--w3m-color-mix-strength': 8,
      '--w3m-border-radius-master': '2px',
      '--w3m-font-family': 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
  })

  cached = adapter.wagmiConfig
  return cached
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [config] = useState(buildConfig)

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
