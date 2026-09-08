import { useMemo, useState } from 'react'
import { formatUnits, parseUnits, type Address } from 'viem'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useReadContract } from 'wagmi'
import { ArrowDown, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AmountField,
  AssetPicker,
  ConnectGate,
  Panel,
  SectionHead,
  TxStatus,
} from '@/components/app/primitives'
import { assets } from '@/config/assets'
import { activeChain } from '@/config/chains'
import { contracts, erc20Abi, vaultAbi } from '@/config/contracts'
import { brand, infra } from '@/config/brand'
import { useTxFlow } from '@/hooks/useTxFlow'

export default function Deposit() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  const [asset, setAsset] = useState(assets[0])
  const [amount, setAmount] = useState('')
  const { state, send, reset } = useTxFlow()

  /* -- Live reads for the selected instrument --------------------------- */
  const { data: balance } = useReadContract({
    address: asset.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: activeChain.id,
    query: { enabled: Boolean(asset.address && address), refetchInterval: 20_000 },
  })

  const { data: allowance } = useReadContract({
    address: asset.address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && contracts.vault ? [address, contracts.vault] : undefined,
    chainId: activeChain.id,
    query: { enabled: Boolean(asset.address && address && contracts.vault) },
  })

  const parsed = useMemo(() => {
    if (!amount) return null
    try {
      const v = parseUnits(amount, asset.decimals)
      return v > 0n ? v : null
    } catch {
      return null
    }
  }, [amount, asset.decimals])

  const held = balance as bigint | undefined
  const overBalance = parsed !== null && held !== undefined && parsed > held
  const needsApproval =
    parsed !== null && allowance !== undefined && (allowance as bigint) < parsed

  const canSubmit = isConnected && parsed !== null && !overBalance && state.kind !== 'signing'

  async function submit() {
    if (!parsed) return
    reset()

    // Addresses come from the environment. If one is unset the write throws a
    // real error from viem, which TxStatus renders. No hand-written stand-in.
    const vault = contracts.vault as Address
    const token = asset.address as Address

    if (needsApproval) {
      await send(
        {
          address: token,
          abi: erc20Abi,
          functionName: 'approve',
          args: [vault, parsed],
          chainId: activeChain.id,
        },
        { kind: 'Approve', summary: `Approve ${amount} ${asset.symbol}` },
      )
      return
    }

    await send(
      {
        address: vault,
        abi: vaultAbi,
        functionName: 'deposit',
        args: [token, parsed],
        chainId: activeChain.id,
      },
      { kind: 'Deposit', summary: `Deposit ${amount} ${asset.symbol}` },
    )
  }

  return (
    <>
      <SectionHead
        title="Deposit"
        blurb={`Move a tokenized equity from ${infra.chain} into the confidential layer. The deposit amount is recorded publicly, because the origin chain has to log the lock. Everything after this point is sealed.`}
      />

      {!isConnected ? (
        <ConnectGate onConnect={() => open()} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Panel title="From your wallet">
            <AssetPicker value={asset} onChange={setAsset} />

            <div className="mt-5">
              <AmountField
                value={amount}
                onChange={setAmount}
                symbol={asset.symbol}
                balance={
                  held !== undefined
                    ? Number(formatUnits(held, asset.decimals)).toLocaleString('en-US', {
                        maximumFractionDigits: 4,
                      })
                    : undefined
                }
                onMax={
                  held !== undefined
                    ? () => setAmount(formatUnits(held, asset.decimals))
                    : undefined
                }
              />
            </div>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="grid size-8 place-items-center rounded-full border border-line bg-canvas text-olive">
                <ArrowDown className="size-3.5" strokeWidth={1.5} />
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="rounded-xl border border-line bg-canvas-alt p-4">
              <p className="label-mono">To confidential balance</p>
              <p className="mt-2 font-display text-[1.5rem] text-ink tabular-nums">
                {amount || '0.00'}{' '}
                <span className="font-mono text-[0.875rem] text-ink-muted">{asset.symbol}</span>
              </p>
              <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-muted">
                Credited as ciphertext under your key.
              </p>
            </div>

            {overBalance && (
              <p className="mt-4 text-[0.8125rem] text-down">
                Amount exceeds your {asset.symbol} balance.
              </p>
            )}

            <Button className="mt-6 w-full" size="lg" onClick={submit} disabled={!canSubmit}>
              {state.kind === 'signing'
                ? 'Confirm in wallet'
                : needsApproval
                  ? `Approve ${asset.symbol}`
                  : 'Deposit'}
            </Button>

            <TxStatus state={state} />
          </Panel>

          <Panel title="What happens">
            <ol className="space-y-4">
              {[
                needsApproval
                  ? `Approve the vault to move your ${asset.symbol}.`
                  : `The vault is already approved for ${asset.symbol}.`,
                `The asset is locked on ${activeChain.name}. This amount is public.`,
                'An equal encrypted balance is credited to you.',
                'From here, transfers hide the amount.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[0.625rem] text-olive">
                    {i + 1}
                  </span>
                  <span className="text-[0.875rem] leading-[1.6] text-ink-soft">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex gap-3 border-t border-line pt-5">
              <Info className="mt-0.5 size-3.5 shrink-0 text-olive" strokeWidth={1.5} />
              <p className="text-[0.75rem] leading-[1.6] text-ink-muted">
                {brand.name} never takes custody of your keys. The vault holds the locked asset and
                credits an encrypted balance you alone can read.
              </p>
            </div>
          </Panel>
        </div>
      )}
    </>
  )
}
