import { useAccount } from 'wagmi'
import { ArrowUpRight, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Panel, SectionHead } from '@/components/app/primitives'
import { activeChain, explorerUrl } from '@/config/chains'
import { useTxHistory } from '@/hooks/useTxFlow'
import { cn } from '@/lib/utils'

const KIND_TONE: Record<string, string> = {
  Deposit: 'bg-olive-soft text-olive-deep',
  Transfer: 'bg-olive-wash text-olive',
  Redeem: 'bg-canvas-alt text-ink-soft',
  Approve: 'bg-canvas-alt text-ink-muted',
}

export default function Activity() {
  const { history, clear } = useTxHistory()
  const { address } = useAccount()

  return (
    <>
      <SectionHead
        title="Activity"
        blurb="Transactions submitted from this browser. Amounts on confidential transfers stay sealed here too: this is a record of what you sent, not a decryption of it."
      />

      <Panel
        title={`${history.length} transaction${history.length === 1 ? '' : 's'}`}
        aside={
          history.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wide text-ink-muted uppercase transition-colors hover:text-down"
            >
              <Trash2 className="size-3" strokeWidth={1.6} />
              Clear
            </button>
          )
        }
      >
        {history.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[0.9375rem] text-ink-muted">
              Nothing submitted from this browser yet.
            </p>
            <p className="mx-auto mt-2 max-w-[52ch] text-[0.8125rem] leading-[1.6] text-ink-faint">
              This list is local to your device. Your full public history is always on the explorer.
            </p>
            {address && (
              <Button variant="outline" size="sm" className="mt-6" asChild>
                <a href={explorerUrl('address', address)} target="_blank" rel="noreferrer">
                  View address on explorer
                  <ArrowUpRight className="size-3.5" />
                </a>
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {history.map((tx) => (
              <li key={tx.hash} className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 items-center gap-3.5">
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 font-mono text-[0.625rem] tracking-wide uppercase',
                      KIND_TONE[tx.kind] ?? 'bg-canvas-alt text-ink-muted',
                    )}
                  >
                    {tx.kind}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.875rem] text-ink">{tx.summary}</p>
                    <p className="font-mono text-[0.6875rem] text-ink-muted">
                      {new Date(tx.at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>

                <a
                  href={explorerUrl('tx', tx.hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1.5 font-mono text-[0.75rem] text-olive underline underline-offset-4"
                >
                  {tx.hash.slice(0, 8)}...
                  <ArrowUpRight className="size-3" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="mt-5 text-[0.75rem] leading-relaxed text-ink-muted">
        Records are stored in this browser only, scoped to {activeChain.name}. They are never sent
        anywhere.
      </p>
    </>
  )
}
