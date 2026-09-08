import * as React from 'react'
import {
  Activity, ArrowLeftRight, BadgeCheck, Binary, Cpu, EyeOff, FileCheck2,
  Import, Lock, ScanEye, Send, Share2, Sparkle, ShieldCheck, WalletMinimal,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/* --------------------------------------------------------------------------
 * Icon registry. content.ts stores icon *names* so the copy file stays free
 * of imports. Anything missing falls back to a neutral mark rather than
 * throwing at render time.
 * ----------------------------------------------------------------------- */
const ICONS = {
  Activity, ArrowLeftRight, BadgeCheck, Binary, Cpu, EyeOff, FileCheck2,
  Import, Lock, ScanEye, Send, Share2, Sparkle, ShieldCheck, WalletMinimal,
} as const

export type IconName = keyof typeof ICONS

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name as IconName] ?? Lock
  return <Cmp className={className} strokeWidth={1.4} aria-hidden />
}

/* --------------------------------------------------------------------------
 * Swiss grid: four hairline verticals pinned behind the content, aligned to
 * the same max-width as `.shell`. Purely decorative.
 * ----------------------------------------------------------------------- */
export function GridLines({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className="mx-auto grid h-full w-full max-w-[1280px] grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-full border-r border-line/70',
              i === 0 && 'border-l',
              i > 1 && 'hidden md:block',
            )}
          />
        ))}
      </div>
    </div>
  )
}

/* Mono eyebrow with a leading rule. The section marker used site-wide. */
export function SectionLabel({
  children,
  className,
  tone = 'muted',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'muted' | 'olive'
}) {
  return (
    <p className={cn('label-mono flex items-center gap-3', tone === 'olive' && 'text-olive', className)}>
      <span
        aria-hidden
        className={cn('h-px w-8', tone === 'olive' ? 'bg-olive/40' : 'bg-line-strong')}
      />
      {children}
    </p>
  )
}

/* Section shell: consistent vertical rhythm + optional hairline top border. */
export function Section({
  id,
  children,
  className,
  bordered = true,
  tone = 'canvas',
}: {
  id?: string
  children: React.ReactNode
  className?: string
  bordered?: boolean
  tone?: 'canvas' | 'alt'
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative scroll-mt-28',
        bordered && 'hairline-t',
        tone === 'alt' && 'bg-canvas-alt',
        className,
      )}
    >
      {children}
    </section>
  )
}

/* Small dotted technical corner used on floating cards. */
export function CornerDots({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('pattern-dots-fine pointer-events-none absolute size-16 opacity-70', className)}
    />
  )
}

/* Crosshair tick that sits on grid intersections. */
export function Tick({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('pointer-events-none absolute text-line-strong', className)}>
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  )
}
