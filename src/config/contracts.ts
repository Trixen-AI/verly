import type { Address } from 'viem'

/* ============================================================================
 * Protocol contracts and ABIs.
 *
 * Addresses come from the environment, so a deployment does not require a code
 * change:
 *
 *   VITE_VAULT_ADDRESS=0x...
 *
 * The ABIs below mirror the settlement model described in the docs:
 *   - deposit and redeem move public amounts, because the origin chain has to
 *     record the lock and the release either way
 *   - transfer moves an encrypted amount with an accompanying input proof
 * ========================================================================= */

const env = (key: string) => {
  const v = import.meta.env[key] as string | undefined
  return v && /^0x[a-fA-F0-9]{40}$/.test(v) ? (v as Address) : undefined
}

export const contracts = {
  /** Confidential balance registry and settlement entry point. */
  vault: env('VITE_VAULT_ADDRESS'),
}

/** Minimal ERC20 surface the deposit flow needs. */
export const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
] as const

export const vaultAbi = [
  /* -- Deposit: public amount, locked on the origin chain ----------------- */
  {
    type: 'function',
    name: 'deposit',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },

  /* -- Transfer: amount stays sealed -------------------------------------- */
  {
    type: 'function',
    name: 'confidentialTransfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'encryptedAmount', type: 'bytes' },
      { name: 'inputProof', type: 'bytes' },
    ],
    outputs: [],
  },

  /* -- Redeem: public amount, released on the origin chain ---------------- */
  {
    type: 'function',
    name: 'redeem',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },

  /* -- Reads --------------------------------------------------------------- */
  {
    type: 'function',
    name: 'encryptedBalanceOf',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ type: 'bytes' }],
  },
  {
    type: 'function',
    name: 'totalDeposited',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

/** Thrown by the forms when an address has not been configured yet. */
export class MissingAddressError extends Error {
  constructor(what: string) {
    super(
      `No address configured for ${what}. Set it in your environment file and restart the dev server.`,
    )
    this.name = 'MissingAddressError'
  }
}
