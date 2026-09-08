/* ============================================================================
 * CONTENT. Every word on the marketing site lives here.
 * The brand name is injected from `brand.ts`, so components never hardcode it.
 * ========================================================================= */

import { brand, infra } from './brand'

const B = brand.name
const CHAIN = infra.chain
const FHE = infra.fhe

export const nav = {
  links: [
    { label: 'Thesis', href: '#thesis' },
    { label: 'Protocol', href: '#protocol' },
    { label: 'Settlement', href: '#settlement' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: 'Launch App',
}

export const hero = {
  eyebrow: 'Confidential settlement layer',
  // The word wrapped in {braces} renders as olive italic serif.
  headline: 'Hold equities onchain without {publishing} your book.',
  lede: `${B} encrypts balances and transfer amounts at the settlement layer. Tokenized stock positions stay private to the people who hold them, while every transaction remains independently verifiable onchain.`,
  primaryCta: 'Launch App',
  secondaryCta: 'Read the docs',
  metrics: [
    { value: 'FHE', label: 'Encrypted execution' },
    { value: 'Hidden', label: 'Transfer amounts' },
    { value: 'Onchain', label: 'Final settlement' },
  ],
  /**
   * Seed values for the hero instruments. These are the fallback shown before
   * live quotes resolve, and the permanent state if the quotes API is
   * unreachable or unconfigured. See src/lib/quotes.ts.
   */
  featured: {
    symbol: 'HOOD',
    name: 'Robinhood Markets',
    logo: '/logos/hood.png',
    price: '103.62',
    change: '+11.54%',
    direction: 'up' as const,
    range: 'Trailing 30 sessions',
    axis: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
    series: [22, 31, 27, 44, 38, 55, 49, 66, 61, 79, 72, 92],
  },
  side: [
    {
      symbol: 'AMZN',
      name: 'Amazon',
      logo: '/logos/amzn.svg',
      price: '262.07',
      change: '+0.47%',
      direction: 'up' as const,
    },
    {
      symbol: 'COIN',
      name: 'Coinbase',
      logo: '/logos/coin.svg',
      price: '179.48',
      change: '-1.68%',
      direction: 'down' as const,
    },
  ],
  chips: [
    { title: 'FHE powered', note: 'Computation over ciphertext' },
    { title: 'Private transfers', note: 'Amounts never revealed' },
    { title: 'Onchain settlement', note: 'Built for tokenized equities' },
  ],
}

export const thesis = {
  label: 'The problem',
  heading: 'A public ledger turns every portfolio into a press release.',
  body: 'Tokenized equities inherit the transparency of the chain they settle on. Position sizes, entry timing, rebalances and counterparties become permanently readable by anyone with a block explorer. That is disclosure no traditional broker would ever be asked to publish.',
  points: [
    {
      icon: 'ScanEye',
      title: 'Positions are readable',
      body: 'One address lookup sizes a holder down to the share, and the record stays there permanently.',
    },
    {
      icon: 'Activity',
      title: 'Strategy leaks on execution',
      body: 'Entries, exits and rebalances broadcast in real time, handing observers a free view of intent.',
    },
    {
      icon: 'Share2',
      title: 'Counterparties are exposed',
      body: 'Transfer graphs link desks, treasuries and funds to each other long after settlement clears.',
    },
  ],
}

export const protocol = {
  label: 'The protocol',
  heading: 'Privacy as infrastructure, not as an afterthought.',
  body: `${B} brings encrypted computation, confidential transfers and onchain settlement into one layer that tokenized equities can move through, and back out of, without changing how they are custodied or redeemed.`,
  cta: 'Explore the protocol',
  pillars: [
    {
      index: '01',
      icon: 'Lock',
      title: 'Encrypted ownership',
      body: 'Balances are held as ciphertext. Holders keep provable title to their equities without the amount ever appearing in plaintext.',
    },
    {
      index: '02',
      icon: 'ArrowLeftRight',
      title: 'Confidential transfers',
      body: 'Send tokenized stock between accounts while the transferred quantity stays sealed from public observers and indexers.',
    },
    {
      index: '03',
      icon: 'BadgeCheck',
      title: 'Verifiable settlement',
      body: 'Validators confirm a transaction is well-formed and solvent without decrypting a single financial value.',
    },
  ],
  /**
   * The instrument rail. Logos are vendored into public/logos/ rather than
   * hotlinked, so the rail cannot break when a third-party CDN changes.
   */
  instruments: [
    { symbol: 'AAPL', name: 'Apple', logo: '/logos/aapl.svg' },
    { symbol: 'AMZN', name: 'Amazon', logo: '/logos/amzn.svg' },
    { symbol: 'GOOGL', name: 'Alphabet Class A', logo: '/logos/googl.svg' },
    { symbol: 'META', name: 'Meta Platforms', logo: '/logos/meta.svg' },
    { symbol: 'MSFT', name: 'Microsoft', logo: '/logos/msft.svg' },
    { symbol: 'MSTR', name: 'Strategy Inc.', logo: '/logos/mstr.svg' },
    { symbol: 'NVDA', name: 'NVIDIA', logo: '/logos/nvda.svg' },
    { symbol: 'QCOM', name: 'Qualcomm', logo: '/logos/qcom.svg' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', logo: '/logos/spy.svg' },
    { symbol: 'TSLA', name: 'Tesla', logo: '/logos/tsla.svg' },
  ],
  split: [
    {
      label: 'Encrypted computation',
      body: 'Fully Homomorphic Encryption lets the protocol evaluate transfer logic directly over encrypted inputs, so account state is updated without any value being decrypted along the way.',
    },
    {
      label: 'Confidential transfers',
      body: 'Transfers execute inside a settlement environment where the moved quantity is never emitted to logs, explorers or indexers. Only the proof that the move was valid.',
    },
  ],
}

export const settlement = {
  label: 'Cross-chain settlement',
  heading: 'One route in. One route back.',
  body: `Move tokenized equities from ${CHAIN} into the confidential layer, hold and transfer them privately, then redeem back to the originating environment whenever you choose. Custody assumptions do not change; only what the public can read.`,
  cta: 'Read the docs',
  caption: 'Deposit, seal, redeem',
  note: 'Assets stay redeemable one-to-one. Only the readability of the values changes.',
  steps: [
    {
      step: '01',
      icon: 'Import',
      title: 'Deposit',
      body: `Bridge tokenized equities from ${CHAIN} into the ${B} settlement layer.`,
    },
    {
      step: '02',
      icon: 'ShieldCheck',
      title: 'Hold and transfer',
      body: 'Balances become ciphertext. Transfers settle with the amount sealed.',
    },
    {
      step: '03',
      icon: 'Send',
      title: 'Redeem',
      body: `Withdraw back to ${CHAIN} at any time, one-to-one against the deposit.`,
    },
  ],
  flow: [CHAIN, `${B} Protocol`, CHAIN],
}

export const capabilities = {
  label: 'Capabilities',
  heading: 'Privacy built into the settlement layer.',
  body: `${B} is designed to protect financial information across the whole transaction lifecycle. Fully Homomorphic Encryption lets the protocol compute over encrypted data, so sensitive values never need to be exposed in order to be used.`,
  items: [
    {
      icon: 'Binary',
      title: 'Fully Homomorphic Encryption',
      body: 'Arithmetic runs directly on ciphertext, so financial state can be updated while it stays encrypted end to end.',
    },
    {
      icon: 'WalletMinimal',
      title: 'Encrypted balances',
      body: 'Portfolio size stays confidential instead of being reconstructed from public transaction history.',
    },
    {
      icon: 'EyeOff',
      title: 'Private transfer amounts',
      body: 'The quantity moved stays hidden while the transaction is still checked, ordered and finalised.',
    },
    {
      icon: 'FileCheck2',
      title: 'Verifiable settlement',
      body: 'Keep onchain verifiability without turning every financial value into public information.',
    },
    {
      icon: 'Cpu',
      title: 'Confidential computation',
      body: 'Execute transfer and accounting logic over encrypted inputs without revealing the underlying figures.',
    },
    {
      icon: 'Sparkle',
      title: `FHE powered by ${FHE}`,
      body: `${B} builds on the ${FHE} FHE stack to bring encrypted computation to tokenized real-world assets.`,
    },
  ],
}

export const closing = {
  label: 'Get started',
  heading: 'Make onchain equities private.',
  body: 'Confidential ownership and sealed settlement for tokenized stocks, powered by encrypted computation.',
  primaryCta: 'Launch App',
  secondaryCta: 'Read the docs',
}

export const faq = {
  label: 'FAQ',
  heading: 'Frequently asked questions',
  body: `Direct answers to what people ask most about ${B}.`,
  items: [
    {
      q: `How does ${B} protect financial information?`,
      a: `${B} settles transactions using Fully Homomorphic Encryption. Balances and transfer amounts are stored and processed as ciphertext, so the protocol can validate and apply a transaction without ever turning those values back into readable numbers.`,
    },
    {
      q: 'What is Fully Homomorphic Encryption?',
      a: 'FHE is a form of encryption that supports computation on encrypted data. Operations run on the ciphertext produce a result that, once decrypted by the key holder, matches what the same operations would have produced on the original values, so data can be used without first being exposed.',
    },
    {
      q: `What role does ${FHE} play?`,
      a: `${FHE} develops the FHE cryptography and tooling that ${B} builds on. ${B} applies that stack to tokenized equities: the encryption scheme and confidential execution environment come from ${FHE}, while the settlement design, asset handling and redemption path belong to ${B}.`,
    },
    {
      q: 'Are stock balances completely private?',
      a: `Balances and transfer amounts are encrypted and are not published in plaintext to explorers or indexers. Some information stays inherently public: that a transaction happened, when it happened, and which accounts took part. ${B} conceals the financial values, not the existence of activity.`,
    },
    {
      q: `Can assets be redeemed back to ${CHAIN}?`,
      a: `Yes. Deposits into ${B} are redeemable one-to-one back to ${CHAIN}. The confidential layer is a settlement environment the asset passes through, not a destination it is locked into.`,
    },
    {
      q: `Is ${B} a wallet?`,
      a: `No. ${B} is privacy infrastructure that sits at the settlement layer. It does not custody keys or replace your wallet; you keep using your own and connect it to interact with the protocol.`,
    },
  ],
}

export const footer = {
  blurb: 'Privacy infrastructure for tokenized equities: confidential ownership and sealed transfers through encrypted computation.',
  columns: [
    {
      title: 'Protocol',
      links: [
        { label: 'Overview', href: '#top' },
        { label: 'Settlement', href: '#settlement' },
        { label: 'Capabilities', href: '#capabilities' },
        { label: 'Documentation', href: 'docs' as const },
      ],
    },
    {
      title: 'Markets',
      links: [
        { label: 'Launch App', href: 'app' as const },
        { label: 'Buy on DEX', href: 'dex' as const },
        { label: 'Chart', href: 'chart' as const },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'X / Twitter', href: 'x' as const },
        { label: 'FAQ', href: '#faq' },
      ],
    },
  ],
  legal: [
    { label: 'Terms', href: 'terms' as const },
    { label: 'Privacy', href: 'privacy' as const },
  ],
  disclaimer:
    'Nothing on this page is investment advice or an offer to buy or sell securities. Tokenized equities may be restricted in some jurisdictions. Market data is provided for illustration and may be delayed.',
}
