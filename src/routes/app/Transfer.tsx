import { useMemo, useState } from 'react'
import { isAddress, parseUnits, type Address } from 'viem'
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import { EyeOff, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AmountField,
  AssetPicker,
  ConnectGate,
  Panel,
  SectionHead,
  TextField,
  TxStatus,
} from '@/components/app/primitives'
import { assets } from '@/config/assets'
import { activeChain } from '@/config/chains'
import { contracts, vaultAbi } from '@/config/contracts'
import { encryptAmount } from '@/lib/fhe'
import { readableError, useTxFlow } from '@/hooks/useTxFlow'

export default function Transfer() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  const [asset, setAsset] = useState(assets[0])
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [encrypting, setEncrypting] = useState(false)
  const { state, send, reset, setState } = useTxFlow()

  const parsed = useMemo(() => {
    if (!amount) return null
    try {
      const v = parseUnits(amount, asset.decimals)
      return v > 0n ? v : null
    } catch {
      return null
    }
  }, [amount, asset.decimals])

  const recipientValid = to.length === 0 || isAddress(to)
  const self = isAddress(to) && address && to.toLowerCase() === address.toLowerCase()
  const canSubmit =
    isConnected &&
    parsed !== null &&
    isAddress(to) &&
    !self &&
    !encrypting &&
    state.kind !== 'signing'

  async function submit() {
    if (!parsed || !address || !isAddress(to)) return
    reset()

    // Addresses come from the environment. If one is unset the write throws a
    // real error from viem, which TxStatus renders.
    const vault = contracts.vault as Address
    const token = asset.address as Address

    // The amount is sealed before it leaves the browser.
    setEncrypting(true)
    let encrypted
    try {
      encrypted = await encryptAmount({
        contract: vault,
        sender: address,
        amount: parsed,
      })
    } catch (err) {
      setState({ kind: 'error', message: readableError(err) })
      setEncrypting(false)
      return
    }
    setEncrypting(false)

    await send(
      {
        address: vault,
        abi: vaultAbi,
        functionName: 'confidentialTransfer',
        args: [token, to as Address, encrypted.handle, encrypted.proof],
        chainId: activeChain.id,
      },
      { kind: 'Transfer', summary: `Transfer ${asset.symbol}` },
    )
  }

  return (
    <>
      <SectionHead
        title="Transfer"
        blurb="Send a tokenized equity to another account with the amount sealed. The transaction is visible on chain; the quantity is not."
      />

      {!isConnected ? (
        <ConnectGate onConnect={() => open()} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Panel title="Confidential transfer">
            <AssetPicker value={asset} onChange={setAsset} />

            <div className="mt-5">
              <TextField
                id="recipient"
                label="Recipient"
                value={to}
                onChange={setTo}
                placeholder="0x..."
                invalid={!recipientValid || Boolean(self)}
                hint={
                  !recipientValid
                    ? 'That is not a valid address.'
                    : self
                      ? 'That is your own address.'
                      : `An account on ${activeChain.name}.`
                }
              />
            </div>

            <div className="mt-5">
              <AmountField value={amount} onChange={setAmount} symbol={asset.symbol} />
            </div>

            <div className="mt-5 flex gap-3 rounded-xl border border-olive/25 bg-olive-wash p-4">
              <EyeOff className="mt-0.5 size-3.5 shrink-0 text-olive" strokeWidth={1.5} />
              <p className="text-[0.75rem] leading-[1.6] text-ink-soft">
                This amount is encrypted in your browser before it is submitted. It is never
                written to logs, explorers or indexers.
              </p>
            </div>

            <Button className="mt-6 w-full" size="lg" onClick={submit} disabled={!canSubmit}>
              {encrypting
                ? 'Encrypting amount'
                : state.kind === 'signing'
                  ? 'Confirm in wallet'
                  : 'Send sealed transfer'}
            </Button>

            <TxStatus state={state} />
          </Panel>

          <Panel title="What is visible">
            <dl className="space-y-4">
              {[
                ['Amount', 'Encrypted', true],
                ['Your balance after', 'Encrypted', true],
                ['Recipient balance after', 'Encrypted', true],
                ['That a transfer happened', 'Public', false],
                ['Sender and recipient', 'Public', false],
                ['Block and timestamp', 'Public', false],
              ].map(([label, value, sealed]) => (
                <div key={label as string} className="flex items-center justify-between gap-4">
                  <dt className="text-[0.8125rem] text-ink-soft">{label}</dt>
                  <dd
                    className={
                      sealed
                        ? 'flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wide text-olive uppercase'
                        : 'font-mono text-[0.6875rem] tracking-wide text-ink-muted uppercase'
                    }
                  >
                    {sealed && <Lock className="size-3" strokeWidth={1.8} />}
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-line pt-5 text-[0.75rem] leading-[1.6] text-ink-muted">
              Confidentiality is not anonymity. If your address is already linked to you, this
              hides your figures, not the fact that the address is yours.
            </p>
          </Panel>
        </div>
      )}
    </>
  )
}
