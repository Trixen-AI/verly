import { formatUnits } from 'viem'
import { useAccount, useBalance, useBlockNumber } from 'wagmi'
import { ArrowRight, ArrowUpRight, EyeOff, Import, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AppLink } from '@/components/site/AppLink'
import { Field, Panel, SectionHead } from '@/components/app/primitives'
import { activeChain, explorerUrl } from '@/config/chains'
import { brand } from '@/config/brand'
import { useTxHistory } from '@/hooks/useTxFlow'

const SHORTCUTS = [
  {
    to: '/app/deposit',
    icon: Import,
    title: 'Deposit',
    body: 'Bring a tokenized equity into the confidential layer.',
  },
  {
    to: '/app/transfer',
    icon: EyeOff,
    title: 'Transfer',
    body: 'Send with the amount sealed from public view.',
  },
  {
    to: '/app/redeem',
    icon: Send,
    title: 'Redeem',
    body: `Release the asset back to ${activeChain.name}.`,
  },
]

export default function Overview() {
  const { address, isConnected, chainId } = useAccount()
  const { history } = useTxHistory()

  const onActiveChain = chainId === activeChain.id

  // Block height is a public read: it works with or without a wallet.
  const { data: blockNumber } = useBlockNumber({
    chainId: activeChain.id,
    query: { refetchInterval: 12_000 },
  })

  const { data: gas } = useBalance({
    address,
    chainId: activeChain.id,
    query: { enabled: Boolean(address) && onActiveChain, refetchInterval: 20_000 },
  })

  return (
    <>
      <SectionHead
        title="Overview"
        blurb={`Your account on ${activeChain.name}. Public values are read live from the chain; encrypted balances are readable only with your key.`}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Network">
          <dl>
            <Field label="Chain">{activeChain.name}</Field>
            <Field label="Chain ID">{activeChain.id}</Field>
            <Field label="Latest block">
              {blockNumber ? blockNumber.toLocaleString('en-US') : 'Loading'}
            </Field>
          </dl>
          <a
            href={activeChain.blockExplorers.default.url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] text-olive underline underline-offset-4"
          >
            Block explorer
            <ArrowUpRight className="size-3" />
          </a>
        </Panel>

        <Panel title="Gas balance">
          <p className="font-display text-[2rem] leading-none tabular-nums">
            {!isConnected ? (
              <span className="text-ink-faint">Connect wallet</span>
            ) : !onActiveChain ? (
              <span className="text-ink-faint">Wrong network</span>
            ) : gas ? (
              <span className="text-ink">
                {Number(formatUnits(gas.value, gas.decimals)).toFixed(5)}{' '}
                <span className="font-mono text-[0.875rem] text-ink-muted">{gas.symbol}</span>
              </span>
            ) : (
              <span className="text-ink-faint">Loading</span>
            )}
          </p>
          <p className="mt-3 text-[0.8125rem] leading-[1.6] text-ink-muted">
            Native {activeChain.nativeCurrency.symbol}, used for gas. This is not a protocol
            position.
          </p>
        </Panel>

        <Panel title="Confidential balance">
          <p className="flex items-center gap-2 font-display text-[2rem] leading-none text-ink-faint">
            <EyeOff className="size-5" strokeWidth={1.4} />
            Sealed
          </p>
          <p className="mt-3 text-[0.8125rem] leading-[1.6] text-ink-muted">
            Encrypted balances decrypt locally with your key. {brand.name} cannot read them, and
            neither can the network.
          </p>
        </Panel>
      </div>

      {/* Shortcuts into the action sections */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        {SHORTCUTS.map((s) => (
          <AppLink
            key={s.to}
            href={s.to}
            className="card-float group p-6 transition-shadow duration-300 hover:shadow-[var(--shadow-lift)] md:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-olive-wash text-olive transition-transform duration-300 ease-[var(--ease-editorial)] group-hover:-translate-y-0.5">
                <s.icon className="size-4" strokeWidth={1.4} />
              </span>
              <ArrowRight className="size-4 text-line-strong transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-olive" />
            </div>
            <h3 className="mt-6 font-display text-[1.25rem] text-ink">{s.title}</h3>
            <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-soft">{s.body}</p>
          </AppLink>
        ))}
      </div>

      <Panel
        title="Recent activity"
        className="mt-5"
        aside={
          history.length > 0 && (
            <AppLink
              href="/app/activity"
              className="font-mono text-[0.6875rem] tracking-wide text-olive uppercase"
            >
              View all
            </AppLink>
          )
        }
      >
        {history.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[0.9375rem] text-ink-muted">
              Nothing submitted from this browser yet.
            </p>
            {address && (
              <Button variant="outline" size="sm" className="mt-5" asChild>
                <a href={explorerUrl('address', address)} target="_blank" rel="noreferrer">
                  View address on explorer
                  <ArrowUpRight className="size-3.5" />
                </a>
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {history.slice(0, 4).map((tx) => (
              <li key={tx.hash} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[0.875rem] text-ink">{tx.summary}</p>
                  <p className="font-mono text-[0.6875rem] text-ink-muted">
                    {new Date(tx.at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <a
                  href={explorerUrl('tx', tx.hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-mono text-[0.75rem] text-olive underline underline-offset-4"
                >
                  {tx.hash.slice(0, 8)}...
                </a>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
