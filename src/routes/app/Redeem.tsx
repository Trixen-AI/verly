import { useMemo, useState } from 'react'
import { parseUnits, type Address } from 'viem'
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import { ArrowDown, TriangleAlert } from 'lucide-react'

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
import { contracts, vaultAbi } from '@/config/contracts'
import { infra } from '@/config/brand'
import { useTxFlow } from '@/hooks/useTxFlow'

export default function Redeem() {
  const { isConnected } = useAccount()
  const { open } = useAppKit()

  const [asset, setAsset] = useState(assets[0])
  const [amount, setAmount] = useState('')
  const { state, send, reset } = useTxFlow()

  const parsed = useMemo(() => {
    if (!amount) return null
    try {
      const v = parseUnits(amount, asset.decimals)
      return v > 0n ? v : null
    } catch {
      return null
    }
  }, [amount, asset.decimals])

  const canSubmit = isConnected && parsed !== null && state.kind !== 'signing'

  async function submit() {
    if (!parsed) return
    reset()

    // Addresses come from the environment. If one is unset the write throws a
    // real error from viem, which TxStatus renders.
    const vault = contracts.vault as Address
    const token = asset.address as Address
    await send(
      {
        address: vault,
        abi: vaultAbi,
        functionName: 'redeem',
        args: [token, parsed],
        chainId: activeChain.id,
      },
      { kind: 'Redeem', summary: `Redeem ${amount} ${asset.symbol}` },
    )
  }

  return (
    <>
      <SectionHead
        title="Redeem"
        blurb={`Burn an encrypted balance and release the underlying asset back to ${infra.chain}, one-to-one against your deposit.`}
      />

      {!isConnected ? (
        <ConnectGate onConnect={() => open()} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Panel title="From confidential balance">
            <AssetPicker value={asset} onChange={setAsset} />

            <div className="mt-5">
              <AmountField value={amount} onChange={setAmount} symbol={asset.symbol} />
            </div>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="grid size-8 place-items-center rounded-full border border-line bg-canvas text-olive">
                <ArrowDown className="size-3.5" strokeWidth={1.5} />
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="rounded-xl border border-line bg-canvas-alt p-4">
              <p className="label-mono">To your wallet on {activeChain.name}</p>
              <p className="mt-2 font-display text-[1.5rem] text-ink tabular-nums">
                {amount || '0.00'}{' '}
                <span className="font-mono text-[0.875rem] text-ink-muted">{asset.symbol}</span>
              </p>
            </div>

            <Button className="mt-6 w-full" size="lg" onClick={submit} disabled={!canSubmit}>
              {state.kind === 'signing' ? 'Confirm in wallet' : 'Redeem'}
            </Button>

            <TxStatus state={state} />
          </Panel>

          <Panel title="Before you redeem">
            <div className="flex gap-3 rounded-xl border border-down/25 bg-down/[0.04] p-4">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-down" strokeWidth={1.5} />
              <p className="text-[0.75rem] leading-[1.6] text-ink-soft">
                The redeemed amount is public. It has to be, because the origin chain records the
                release.
              </p>
            </div>

            <p className="mt-5 text-[0.875rem] leading-[1.65] text-ink-soft">
              Redeeming the exact figure you deposited, shortly after depositing it, links the two
              events to each other. Holding across a period, and redeeming amounts that do not
              match a single deposit, is what makes the confidential layer useful rather than
              decorative.
            </p>
          </Panel>
        </div>
      )}
    </>
  )
}
