/* ============================================================================
 * Documentation content.
 *
 * Prose lives here as structured blocks rather than as JSX, so the docs can be
 * edited without touching components and later moved to MDX or a CMS without
 * rewriting the pages.
 *
 * House style: no em dashes. Use a colon, a semicolon, or a second sentence.
 * ========================================================================= */

import { brand, infra } from './brand'

const B = brand.name
const CHAIN = infra.chain
const FHE = infra.fhe

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'ordered'; items: string[] }
  | { type: 'table'; head?: [string, string]; rows: [string, string][] }
  | { type: 'code'; code: string }
  | { type: 'note'; tone?: 'info' | 'warn'; text: string }

export type DocPage = {
  slug: string
  title: string
  summary: string
  blocks: Block[]
}

export type DocGroup = {
  title: string
  pages: DocPage[]
}

export const docsMeta = {
  title: 'Documentation',
  tagline: `How ${B} keeps tokenized equity positions confidential while keeping settlement verifiable.`,
}

export const docs: DocGroup[] = [
  {
    title: 'Overview',
    pages: [
      {
        slug: 'introduction',
        title: 'Introduction',
        summary: `What ${B} is, what problem it solves, and what it deliberately does not do.`,
        blocks: [
          {
            type: 'p',
            text: `${B} is a confidential settlement layer for tokenized equities. It lets a holder keep tokenized stock onchain without publishing the size of the position or the amount of each transfer, while leaving settlement independently verifiable.`,
          },
          { type: 'h', text: 'The problem' },
          {
            type: 'p',
            text: `Tokenized equities inherit the transparency of the chain they settle on. A public ledger records the amount of every transfer and the balance of every account. Anyone with a block explorer can size a holder down to the share, watch entries and exits as they happen, and map counterparties through the transfer graph. That is a level of disclosure no traditional broker is asked to provide.`,
          },
          {
            type: 'p',
            text: `The usual answer is to move the activity offchain, which gives up settlement guarantees, or to mix funds, which breaks auditability. ${B} takes a third route: keep everything onchain, and encrypt the values.`,
          },
          { type: 'h', text: 'The approach' },
          {
            type: 'p',
            text: `Balances and transfer amounts are held as ciphertext. Using Fully Homomorphic Encryption, the protocol evaluates transfer logic directly over encrypted inputs, so account state can be checked and updated without any value being decrypted at any point in the process.`,
          },
          {
            type: 'list',
            items: [
              'Balances are stored encrypted, not merely hidden behind an interface.',
              'Transfer amounts are never emitted to logs, explorers or indexers.',
              'Validators confirm a transfer is well-formed and solvent without reading the figures.',
              `Assets remain redeemable one-to-one back to ${CHAIN}.`,
            ],
          },
          { type: 'h', text: 'What this is not' },
          {
            type: 'p',
            text: `${B} is infrastructure, not a wallet and not a mixer. It does not custody keys, it does not pool user funds to obscure their origin, and it does not attempt to hide that a transaction happened. Read the privacy model for a precise account of what stays public.`,
          },
        ],
      },
      {
        slug: 'how-it-works',
        title: 'How it works',
        summary: 'The full path an asset takes through the confidential layer.',
        blocks: [
          {
            type: 'p',
            text: `An asset makes a round trip. It enters the confidential layer, is held and transferred there with its value sealed, and leaves through the same route it came in. Custody assumptions do not change along the way; only what an observer can read changes.`,
          },
          { type: 'h', text: 'The lifecycle' },
          {
            type: 'ordered',
            items: [
              `Deposit. A tokenized equity on ${CHAIN} is locked by the bridge contract, and an equivalent encrypted balance is credited inside ${B}.`,
              'Encrypt. The credited amount is stored as ciphertext under a key the holder controls. From this point the figure does not exist in plaintext onchain.',
              'Transfer. Sending to another account runs the balance arithmetic homomorphically. The sender balance decreases and the recipient balance increases, with all three values encrypted throughout.',
              'Verify. The network checks that the transfer is well-formed and that the sender was solvent, using proofs over the ciphertext rather than the underlying numbers.',
              `Redeem. Burning the encrypted balance releases the locked asset back to ${CHAIN}, one-to-one against the original deposit.`,
            ],
          },
          { type: 'h', text: 'Why the round trip matters' },
          {
            type: 'p',
            text: `The confidential layer is a settlement environment the asset passes through, not a destination it is locked into. Redemption is a first-class operation, not an emergency exit. A holder who wants public, composable exposure again simply redeems.`,
          },
          {
            type: 'note',
            text: `Deposit and redemption are the two points where an amount necessarily becomes visible, because the origin chain has to record the lock and the release. See the privacy model for what that implies.`,
          },
        ],
      },
    ],
  },
  {
    title: 'Protocol',
    pages: [
      {
        slug: 'encryption',
        title: 'Fully Homomorphic Encryption',
        summary: 'What FHE is, why it is the right primitive here, and what it costs.',
        blocks: [
          {
            type: 'p',
            text: `Most encryption protects data at rest and in transit. To actually use a value, you decrypt it first. Fully Homomorphic Encryption removes that step: operations performed on ciphertext produce a result which, once decrypted by the key holder, matches what the same operations would have produced on the original values.`,
          },
          {
            type: 'p',
            text: `For a settlement layer that property is the whole game. The network needs to add to one balance, subtract from another, and check that the subtraction does not go below zero. FHE lets it do all three without ever seeing a number.`,
          },
          { type: 'h', text: 'Why not the alternatives' },
          {
            type: 'table',
            head: ['Approach', 'Why it falls short here'],
            rows: [
              [
                'Mixers and pools',
                'Break the audit trail and create regulatory exposure. Equities need a clean provenance, not a broken one.',
              ],
              [
                'Offchain computation',
                'Gives up the settlement guarantee that made putting equities onchain worthwhile.',
              ],
              [
                'Zero-knowledge proofs alone',
                'Excellent for proving a statement about a value. Harder when the network must persist and update encrypted state that many parties keep writing to.',
              ],
              [
                'Trusted hardware',
                'Moves trust into a vendor and its firmware supply chain rather than removing it.',
              ],
            ],
          },
          { type: 'h', text: 'The honest tradeoff' },
          {
            type: 'p',
            text: `FHE is computationally expensive. Operations over ciphertext cost orders of magnitude more than the same arithmetic in plaintext, which shapes what the protocol does and does not attempt to encrypt. ${B} spends that budget on the values that leak the most information about a holder: balances and transfer amounts.`,
          },
          { type: 'h', text: `The ${FHE} stack` },
          {
            type: 'p',
            text: `${B} builds on the FHE cryptography and tooling developed by ${FHE}. The encryption scheme and the confidential execution environment come from ${FHE}. The settlement design, the asset handling and the redemption path are ${B}.`,
          },
        ],
      },
      {
        slug: 'confidential-balances',
        title: 'Confidential balances',
        summary: 'How an encrypted balance behaves and who can read it.',
        blocks: [
          {
            type: 'p',
            text: `A confidential balance is a ciphertext stored in contract state. It is a real onchain value that anyone can fetch, and nobody without the key can interpret.`,
          },
          { type: 'h', text: 'Who can read a balance' },
          {
            type: 'table',
            head: ['Party', 'What they see'],
            rows: [
              ['The holder', 'The plaintext balance, by decrypting locally with their own key.'],
              [
                'A counterparty',
                'Nothing beyond what the holder chooses to disclose for a specific transfer.',
              ],
              [
                'The public',
                'That an account exists and that it has been active. Not the amount.',
              ],
              [
                'An auditor or regulator',
                'Whatever the holder grants through a viewing key. Disclosure is selective and deliberate rather than all or nothing.',
              ],
            ],
          },
          { type: 'h', text: 'Viewing keys' },
          {
            type: 'p',
            text: `Confidentiality that cannot be lifted is not usable in regulated markets. A holder can issue a viewing key that lets a specific party decrypt a specific scope: one account, or one period. The chain records that the capability was granted; the grant does not make the balance public.`,
          },
          {
            type: 'note',
            tone: 'warn',
            text: `Losing your key means losing the ability to read your own balance. The ciphertext remains onchain and remains yours, but nothing in the protocol can recover a plaintext view of it for you.`,
          },
        ],
      },
      {
        slug: 'settlement',
        title: 'Deposits and redemption',
        summary: `Moving assets between ${CHAIN} and the confidential layer.`,
        blocks: [
          {
            type: 'p',
            text: `Deposits and redemptions are the boundary between the public chain and the confidential layer. They are the only two operations where an amount is necessarily observable, because the origin chain must record the asset being locked and released.`,
          },
          { type: 'h', text: 'Deposit' },
          {
            type: 'ordered',
            items: [
              `Approve the bridge contract to move the tokenized equity on ${CHAIN}.`,
              'Submit the deposit. The asset is locked and the amount is recorded publicly on the origin chain.',
              'An equal encrypted balance is credited inside the confidential layer.',
            ],
          },
          { type: 'h', text: 'Redemption' },
          {
            type: 'ordered',
            items: [
              'Submit a redemption for an amount you hold.',
              'The protocol verifies solvency over the ciphertext and burns the encrypted balance.',
              `The bridge releases the locked asset back to your address on ${CHAIN}, one-to-one.`,
            ],
          },
          { type: 'h', text: 'Timing as a privacy consideration' },
          {
            type: 'p',
            text: `Because the deposit amount and the redemption amount are both public, depositing and immediately redeeming the same unusual figure links the two events. Holding across a period, and redeeming in amounts that do not exactly match a deposit, is what makes the confidential layer useful rather than decorative.`,
          },
        ],
      },
    ],
  },
  {
    title: 'Reference',
    pages: [
      {
        slug: 'network',
        title: 'Network',
        summary: `Connection details for ${CHAIN}.`,
        blocks: [
          {
            type: 'p',
            text: `${B} settles on ${CHAIN}, an Arbitrum Orbit layer 2 that posts to Ethereum and uses ETH for gas. It is fully EVM compatible, so standard tooling works without modification.`,
          },
          { type: 'h', text: 'Mainnet' },
          {
            type: 'table',
            head: ['Field', 'Value'],
            rows: [
              ['Chain ID', '4663'],
              ['Public RPC', 'https://rpc.mainnet.chain.robinhood.com'],
              ['Explorer', 'https://robinhoodchain.blockscout.com'],
              ['Native currency', 'ETH (18 decimals)'],
            ],
          },
          { type: 'h', text: 'Testnet' },
          {
            type: 'table',
            head: ['Field', 'Value'],
            rows: [
              ['Chain ID', '46630'],
              ['Public RPC', 'https://rpc.testnet.chain.robinhood.com'],
              ['Explorer', 'https://explorer.testnet.chain.robinhood.com'],
              ['Native currency', 'ETH (18 decimals)'],
            ],
          },
          {
            type: 'note',
            text: `The public RPC endpoints are rate limited and are fine for reading state from a browser. Production deployments should use a dedicated provider endpoint.`,
          },
          { type: 'h', text: 'Adding the network with viem' },
          {
            type: 'code',
            code: `import { defineChain } from 'viem'

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
})`,
          },
        ],
      },
      {
        slug: 'privacy-model',
        title: 'Privacy model',
        summary: 'A precise account of what is hidden and what is not.',
        blocks: [
          {
            type: 'p',
            text: `Any privacy system that is vague about its boundaries is a system you cannot reason about. This page states them plainly. ${B} conceals financial values. It does not conceal the existence of activity.`,
          },
          { type: 'h', text: 'What is concealed' },
          {
            type: 'list',
            items: [
              'Account balances inside the confidential layer.',
              'The amount moved in a confidential transfer.',
              'The resulting balances of both parties after a transfer.',
              'Position sizes across the instruments you hold.',
            ],
          },
          { type: 'h', text: 'What remains public' },
          {
            type: 'list',
            items: [
              'That a transaction occurred, and in which block.',
              'Which addresses participated in it.',
              'Gas paid, and the general shape and timing of your activity.',
              'Deposit and redemption amounts, because the origin chain records the lock and the release.',
              'Aggregate protocol totals such as total value locked.',
            ],
          },
          { type: 'h', text: 'What that means in practice' },
          {
            type: 'p',
            text: `An observer can tell that an address interacts with ${B} and roughly how often. They cannot tell how much it holds or how much it moved. Metadata analysis over timing and gas remains possible, as it is on every public chain, and an address that deposits and redeems an unusual amount in a short window narrows its own anonymity set.`,
          },
          {
            type: 'note',
            tone: 'warn',
            text: `Confidentiality is not anonymity. If your address is already tied to your identity, ${B} hides your figures, not the fact that the address is yours.`,
          },
        ],
      },
      {
        slug: 'security',
        title: 'Security',
        summary: 'Trust assumptions, audit status, and known limitations.',
        blocks: [
          { type: 'h', text: 'Audit status' },
          {
            type: 'note',
            tone: 'warn',
            text: `The protocol contracts are not deployed and have not been audited. Nothing on this site should be read as a claim that reviewed, production-ready contracts exist today. This page will be updated with audit reports when they exist.`,
          },
          { type: 'h', text: 'Trust assumptions' },
          {
            type: 'list',
            items: [
              `The soundness of the underlying FHE scheme, as implemented by ${FHE}.`,
              'The correctness of the bridge contracts that hold locked assets.',
              `The liveness and data availability guarantees of ${CHAIN} and, beneath it, Ethereum.`,
              'Your own key management. The protocol cannot recover a lost key.',
            ],
          },
          { type: 'h', text: 'Known limitations' },
          {
            type: 'list',
            items: [
              'FHE operations are computationally expensive, which constrains throughput compared to plaintext settlement.',
              'Deposit and redemption amounts are public by construction.',
              'Timing and metadata analysis is not addressed by encrypting values.',
              'Tokenized equities may be restricted in some jurisdictions regardless of the privacy properties of the settlement layer.',
            ],
          },
          { type: 'h', text: 'Reporting an issue' },
          {
            type: 'p',
            text: `Security reports should go to the team directly rather than to a public issue tracker. A disclosure policy and contact address will be published alongside the first deployment.`,
          },
        ],
      },
    ],
  },
]

/** Flat list in sidebar order, for prev/next navigation. */
export const flatDocs = docs.flatMap((g) => g.pages)
