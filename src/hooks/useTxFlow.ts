import { useCallback, useEffect, useState } from 'react'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { BaseError } from 'viem'

import type { TxState } from '@/components/app/primitives'
import { activeChain } from '@/config/chains'

/* ============================================================================
 * Transaction submission and local history.
 *
 * History holds transactions this browser actually submitted, keyed by chain.
 * It is real data: every entry is a hash that went to the network, and its
 * status is resolved from a receipt rather than assumed.
 * ========================================================================= */

export type TxRecord = {
  hash: `0x${string}`
  kind: 'Deposit' | 'Transfer' | 'Redeem' | 'Approve'
  summary: string
  at: number
  chainId: number
}

const KEY = 'veyl:tx-history'
const LIMIT = 25

function read(): TxRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as TxRecord[]) : []
  } catch {
    return []
  }
}

function write(list: TxRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, LIMIT)))
  } catch {
    /* private mode or quota. History is a convenience, not a source of truth. */
  }
}

/** Notifies every mounted subscriber, since storage events do not fire in the
 *  tab that made the change. */
const subscribers = new Set<() => void>()
const notify = () => subscribers.forEach((fn) => fn())

export function recordTx(entry: Omit<TxRecord, 'at' | 'chainId'>) {
  write([{ ...entry, at: Date.now(), chainId: activeChain.id }, ...read()])
  notify()
}

export function useTxHistory() {
  const [list, setList] = useState<TxRecord[]>(read)

  useEffect(() => {
    const sync = () => setList(read())
    subscribers.add(sync)
    window.addEventListener('storage', sync)
    return () => {
      subscribers.delete(sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const clear = useCallback(() => {
    write([])
    setList([])
    notify()
  }, [])

  return { history: list.filter((t) => t.chainId === activeChain.id), clear }
}

/** Turns a wallet or node error into one readable line. */
export function readableError(err: unknown): string {
  if (err instanceof BaseError) {
    return err.shortMessage || err.message
  }
  if (err instanceof Error) return err.message
  return 'The transaction could not be submitted.'
}

/**
 * One write, tracked from signature to receipt.
 *
 * `state` drives TxStatus directly: signing while the wallet is open, pending
 * once a hash exists, success only after the receipt confirms it.
 */
export function useTxFlow() {
  const [submitted, setSubmitted] = useState<TxState>({ kind: 'idle' })
  const { writeContractAsync } = useWriteContract()

  const hash = submitted.kind === 'pending' ? submitted.hash : undefined
  const { data: receipt, isError: receiptFailed } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: Boolean(hash) },
  })

  // Derived during render rather than pushed through an effect: the receipt is
  // already reactive, so mirroring it into state would only cost an extra pass.
  const state: TxState =
    submitted.kind === 'pending'
      ? receipt
        ? receipt.status === 'success'
          ? { kind: 'success', hash: submitted.hash }
          : { kind: 'error', message: 'The transaction reverted on chain.' }
        : receiptFailed
          ? { kind: 'error', message: 'The receipt could not be fetched.' }
          : submitted
      : submitted

  const reset = useCallback(() => setSubmitted({ kind: 'idle' }), [])

  const send = useCallback(
    async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: any,
      meta: { kind: TxRecord['kind']; summary: string },
    ) => {
      setSubmitted({ kind: 'signing' })
      try {
        const txHash = await writeContractAsync(request)
        recordTx({ hash: txHash, kind: meta.kind, summary: meta.summary })
        setSubmitted({ kind: 'pending', hash: txHash })
        return txHash
      } catch (err) {
        setSubmitted({ kind: 'error', message: readableError(err) })
        return null
      }
    },
    [writeContractAsync],
  )

  return { state, send, reset, setState: setSubmitted }
}
