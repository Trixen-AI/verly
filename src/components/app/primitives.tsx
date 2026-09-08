import * as React from 'react'
import { CircleCheck, CircleX, ExternalLink, Loader } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { assets, type Asset } from '@/config/assets'
import { activeChain, explorerUrl } from '@/config/chains'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ shell -- */

export function Panel({
  title,
  children,
  className,
  aside,
}: {
  title?: string
  children: React.ReactNode
  className?: string
  aside?: React.ReactNode
}) {
  return (
    <section className={cn('card-float min-w-0 p-6 md:p-7', className)}>
      {title && (
        <div className="flex items-center justify-between gap-4">
          <h2 className="label-mono">{title}</h2>
          {aside}
        </div>
      )}
      <div className={title ? 'mt-5' : undefined}>{children}</div>
    </section>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3 last:border-b-0">
      <dt className="text-[0.8125rem] text-ink-muted">{label}</dt>
      <dd className="text-right font-mono text-[0.8125rem] text-ink tabular-nums">{children}</dd>
    </div>
  )
}

export function SectionHead({ title, blurb }: { title: string; blurb: string }) {
  return (
    <header className="mb-8">
      <h1 className="display text-[2rem] md:text-[2.5rem]">{title}</h1>
      <p className="mt-3 max-w-[62ch] text-[1rem] leading-[1.7] text-ink-soft">{blurb}</p>
    </header>
  )
}

/* ----------------------------------------------------------- asset picker -- */

export function AssetPicker({
  value,
  onChange,
}: {
  value: Asset
  onChange: (a: Asset) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3.5 text-left transition-colors hover:border-line-strong"
        >
          <img
            src={value.logo}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-md border border-line bg-surface object-contain p-1 opacity-70 grayscale"
          />
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[0.8125rem] text-ink">{value.symbol}</span>
            <span className="block truncate text-[0.75rem] text-ink-muted">{value.name}</span>
          </span>
          <span className="label-mono shrink-0">Change</span>
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select an instrument</DialogTitle>
          <DialogDescription>
            Tokenized equities accepted by the {activeChain.name} settlement layer.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-6 max-h-[22rem] space-y-1 overflow-y-auto pr-1">
          {assets.map((a) => (
            <li key={a.symbol}>
              <button
                type="button"
                onClick={() => {
                  onChange(a)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                  a.symbol === value.symbol
                    ? 'border-olive/40 bg-olive-wash'
                    : 'border-transparent hover:bg-canvas-alt',
                )}
              >
                <img
                  src={a.logo}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                  className="size-8 shrink-0 rounded-md border border-line bg-surface object-contain p-1 opacity-70 grayscale"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[0.8125rem] text-ink">{a.symbol}</span>
                  <span className="block truncate text-[0.75rem] text-ink-muted">{a.name}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

/* ----------------------------------------------------------- amount field -- */

export function AmountField({
  value,
  onChange,
  symbol,
  balance,
  onMax,
  label = 'Amount',
}: {
  value: string
  onChange: (v: string) => void
  symbol: string
  balance?: string
  onMax?: () => void
  label?: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="amount" className="label-mono">
          {label}
        </label>
        {balance !== undefined && (
          <span className="font-mono text-[0.6875rem] text-ink-muted tabular-nums">
            Balance {balance} {symbol}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex min-w-0 items-center gap-2 rounded-xl border border-line bg-surface p-3.5 transition-colors focus-within:border-olive/50">
        <input
          id="amount"
          size={1}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={value}
          // Digits and a single decimal point only. Rejecting at the keystroke
          // avoids a parse error surfacing after the user has already signed.
          onChange={(e) => {
            const v = e.target.value
            if (v === '' || /^\d*\.?\d*$/.test(v)) onChange(v)
          }}
          className="min-w-0 flex-1 bg-transparent font-display text-[1.5rem] text-ink tabular-nums outline-none placeholder:text-ink-faint"
        />
        <span className="label-mono shrink-0">{symbol}</span>
        {onMax && (
          <button
            type="button"
            onClick={onMax}
            className="shrink-0 rounded-full border border-line px-2.5 py-1 font-mono text-[0.625rem] tracking-wide text-ink-muted uppercase transition-colors hover:border-olive/40 hover:text-olive"
          >
            Max
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ text field -- */

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  invalid,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  invalid?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="label-mono">
        {label}
      </label>
      <input
        id={id}
        size={1}
        value={value}
        spellCheck={false}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className={cn(
          'mt-2.5 w-full min-w-0 rounded-xl border bg-surface p-3.5 font-mono text-[0.875rem] text-ink outline-none transition-colors placeholder:text-ink-faint',
          invalid ? 'border-down/50' : 'border-line focus:border-olive/50',
        )}
      />
      {hint && <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-muted">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------- tx status -- */

export type TxState =
  | { kind: 'idle' }
  | { kind: 'signing' }
  | { kind: 'pending'; hash: `0x${string}` }
  | { kind: 'success'; hash: `0x${string}` }
  | { kind: 'error'; message: string }

export function TxStatus({ state }: { state: TxState }) {
  if (state.kind === 'idle') return null

  const map = {
    signing: {
      icon: Loader,
      spin: true,
      tone: 'neutral' as const,
      title: 'Confirm in your wallet',
      body: 'Waiting for you to approve the transaction.',
    },
    pending: {
      icon: Loader,
      spin: true,
      tone: 'neutral' as const,
      title: 'Submitted',
      body: `Waiting for confirmation on ${activeChain.name}.`,
    },
    success: {
      icon: CircleCheck,
      spin: false,
      tone: 'good' as const,
      title: 'Confirmed',
      body: 'The transaction was included on chain.',
    },
    error: {
      icon: CircleX,
      spin: false,
      tone: 'bad' as const,
      title: 'Not submitted',
      body: '',
    },
  }[state.kind]

  const hash = 'hash' in state ? state.hash : undefined

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'mt-5 flex gap-3.5 rounded-xl border p-4',
        map.tone === 'bad'
          ? 'border-down/25 bg-down/[0.04]'
          : map.tone === 'good'
            ? 'border-olive/30 bg-olive-wash'
            : 'border-line bg-canvas-alt',
      )}
    >
      <map.icon
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          'mt-0.5 size-4 shrink-0',
          map.spin && 'animate-spin',
          map.tone === 'bad' ? 'text-down' : map.tone === 'good' ? 'text-olive' : 'text-ink-muted',
        )}
      />
      <div className="min-w-0">
        <p className="text-[0.875rem] font-medium text-ink">{map.title}</p>
        <p className="mt-1 text-[0.8125rem] leading-[1.6] break-words text-ink-soft">
          {state.kind === 'error' ? state.message : map.body}
        </p>
        {hash && (
          <a
            href={explorerUrl('tx', hash)}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[0.75rem] text-olive underline underline-offset-4"
          >
            {hash.slice(0, 10)}...{hash.slice(-8)}
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  )
}

/* --------------------------------------------------------- connect gate -- */

export function ConnectGate({ onConnect }: { onConnect: () => void }) {
  return (
    <Panel>
      <div className="py-6 text-center">
        <p className="text-[0.9375rem] text-ink-soft">
          Connect a wallet to continue.
        </p>
        <Button size="sm" className="mt-5" onClick={onConnect}>
          Connect wallet
        </Button>
      </div>
    </Panel>
  )
}
