/* ============================================================================
 * BRAND. Single source of truth for identity and outbound links.
 * Nothing else in the codebase hardcodes the name, ticker or domain.
 * ========================================================================= */

export const brand = {
  /** Wordmark shown in nav and footer. */
  name: 'Veyl',
  /** Descriptor rendered after the wordmark in the nav lockup. */
  suffix: 'Protocol',
  /** Token ticker, without the leading $. */
  ticker: 'VEYL',
  /** Canonical domain. Used for metadata and absolute URLs, not shown in UI. */
  domain: 'veylprotocol.com',
  /** Year shown in the copyright line. */
  year: 2026,
} as const

export const site = {
  url: `https://${brand.domain}`,
  title: `${brand.name} ${brand.suffix} | Confidential settlement for tokenized equities`,
  description: `${brand.name} encrypts balances and transfer amounts at the settlement layer, so tokenized stock positions stay private while every transaction remains verifiable onchain.`,
} as const

/**
 * Infrastructure the protocol is built on. Swap these if the settlement origin
 * or the FHE provider changes; the copy reads from here, not from literals.
 */
export const infra = {
  /** Origin chain that tokenized equities are bridged in from. */
  chain: 'Robinhood Chain',
  /** FHE technology provider. */
  fhe: 'Zama',
} as const

/**
 * Every link on the site. Paths starting with `/` are routed client side by
 * AppLink; anything else opens as a normal anchor. `#` means not live yet.
 */
export const links = {
  app: '/app',
  docs: '/docs',
  x: 'https://x.com/VeylProtocol',
  dex: '#',
  chart: '#',
  terms: '#',
  privacy: '#',
} as const
