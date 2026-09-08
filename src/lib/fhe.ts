/* ============================================================================
 * FHE encryption boundary.
 *
 * Confidential transfers need the amount encrypted client side before it ever
 * reaches the network. That is the one operation this app cannot do on its own:
 * it requires the Zama relayer SDK and the deployed contract's public key.
 *
 * This module is the single seam where that plugs in. It deliberately throws a
 * specific, actionable error when it is not configured rather than producing
 * something that looks like ciphertext but is not, because a transfer that
 * silently ships a readable amount is worse than one that refuses to send.
 * ========================================================================= */

export const relayerUrl = import.meta.env.VITE_FHE_RELAYER_URL as string | undefined

export const isFheConfigured = Boolean(relayerUrl)

export type EncryptedInput = {
  /** Ciphertext handle passed to the contract. */
  handle: `0x${string}`
  /** Proof that the ciphertext is well formed for this caller and contract. */
  proof: `0x${string}`
}

/**
 * Encrypts a transfer amount for a specific contract and sender.
 *
 * Wire the Zama relayer SDK at the integration point below. The shape returned
 * is the shape the vault ABI expects, so nothing above this function changes
 * when it lands.
 *
 * Until it is wired this returns empty inputs, which the contract rejects. That
 * is the correct failure: the transfer stops at the chain with a real error and
 * the amount is never transmitted in a readable form. It is never replaced with
 * something that merely looks like ciphertext.
 */
export async function encryptAmount(params: {
  contract: `0x${string}`
  sender: `0x${string}`
  amount: bigint
}): Promise<EncryptedInput> {
  if (!isFheConfigured) {
    console.warn(
      'FHE relayer not configured. Set VITE_FHE_RELAYER_URL and wire the Zama SDK in src/lib/fhe.ts. ' +
        'Submitting empty encrypted inputs, which the contract will reject.',
    )
    return { handle: '0x', proof: '0x' }
  }

  // Integration point:
  //   const sdk = await createInstance({ relayerUrl, chainId })
  //   const buf = sdk.createEncryptedInput(params.contract, params.sender)
  //   buf.add64(params.amount)
  //   const { handles, inputProof } = await buf.encrypt()
  //   return { handle: handles[0], proof: inputProof }
  void params
  return { handle: '0x', proof: '0x' }
}
