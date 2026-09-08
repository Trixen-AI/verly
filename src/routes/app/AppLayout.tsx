import { Suspense, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useSwitchChain } from 'wagmi'
import { ChevronDown, ShieldAlert, Wallet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AppLink } from '@/components/site/AppLink'
import { VeylMark } from '@/components/site/VeylMark'
import { WalletProvider, isWalletConfigured } from '@/config/appkit'
import { brand } from '@/config/brand'
import { activeChain } from '@/config/chains'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/deposit', label: 'Deposit' },
  { to: '/app/transfer', label: 'Transfer' },
  { to: '/app/redeem', label: 'Redeem' },
  { to: '/app/activity', label: 'Activity' },
]

const truncate = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`

function WalletButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  if (!isConnected || !address) {
    return (
      <Button size="sm" className="shrink-0" onClick={() => open()}>
        <Wallet className="size-3.5" />
        <span className="hidden sm:inline">Connect wallet</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => open({ view: 'Account' })}
      className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pr-3 pl-2 transition-colors duration-200 hover:border-line-strong sm:pr-4"
    >
      <span aria-hidden className="size-5 shrink-0 rounded-full bg-olive" />
      <span className="truncate font-mono text-[0.8125rem] text-ink">{truncate(address)}</span>
    </button>
  )
}

/** Banner shown when the wallet sits on a chain the protocol does not settle on. */
function NetworkGuard() {
  const { chain, chainId, isConnected } = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected || chainId === undefined || chainId === activeChain.id) return null

  return (
    <div className="border-b border-down/20 bg-down/[0.05]">
      <div className="shell flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2.5 text-[0.875rem] leading-[1.5] text-ink-soft">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-down" strokeWidth={1.5} />
          <span>
            Wallet is on {chain?.name ?? `chain ${chainId}`}. {brand.name} settles on{' '}
            {activeChain.name}.
          </span>
        </p>
        <Button
          size="sm"
          className="shrink-0"
          onClick={() => switchChain({ chainId: activeChain.id })}
          disabled={isPending}
        >
          {isPending ? 'Switching' : 'Switch network'}
        </Button>
      </div>
    </div>
  )
}

/**
 * Section navigation.
 *
 * Desktop gets a tab row. Mobile gets a toggle that names the current section:
 * a horizontal rail has to be swiped before you can see what is in it, and it
 * was also what pushed the page into sideways scroll on narrow screens.
 */
function SectionNav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const scope = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  const current =
    SECTIONS.find((s) => (s.end ? pathname === s.to : pathname.startsWith(s.to)))?.label ??
    'Overview'

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(sheet.current, { height: 0, autoAlpha: 0 })
        tl.current = null
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(sheet.current, { height: 0, autoAlpha: 0, overflow: 'hidden' })
        tl.current = gsap
          .timeline({ paused: true, defaults: { ease: 'expo.out' } })
          .to(sheet.current, { height: 'auto', autoAlpha: 1, duration: 0.38 })
          .from(
            '[data-section-item]',
            { y: 12, opacity: 0, duration: 0.32, stagger: 0.045, clearProps: 'opacity' },
            '-=0.22',
          )
      })

      return () => mm.revert()
    },
    { scope },
  )

  useEffect(() => {
    // Reduced motion builds no timeline, so toggle the sheet directly there.
    if (tl.current) {
      if (open) tl.current.play()
      else tl.current.reverse()
    } else {
      gsap.set(sheet.current, open ? { height: 'auto', autoAlpha: 1 } : { height: 0, autoAlpha: 0 })
    }
  }, [open])

  return (
    <div ref={scope} className="border-t border-line">
      {/* Desktop tabs */}
      <nav aria-label="Dashboard sections" className="hidden md:block">
        <div className="shell -mb-px flex gap-7">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                cn(
                  'shrink-0 border-b-2 py-3.5 text-[0.875rem] whitespace-nowrap transition-colors duration-200',
                  isActive
                    ? 'border-olive text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink',
                )
              }
            >
              {s.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile toggle */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="section-menu"
          className="shell flex h-12 w-full items-center justify-between gap-4"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="label-mono shrink-0">Section</span>
            <span className="truncate text-[0.9375rem] text-ink">{current}</span>
          </span>
          <ChevronDown
            aria-hidden
            strokeWidth={1.6}
            className={cn(
              'size-4 shrink-0 text-ink-muted transition-transform duration-300 ease-[var(--ease-editorial)]',
              open && 'rotate-180',
            )}
          />
        </button>

        <div ref={sheet} id="section-menu" inert={!open} className="border-t border-line">
          <nav aria-label="Dashboard sections" className="shell py-1">
            <ul>
              {SECTIONS.map((s, i) => (
                <li key={s.to} data-section-item className={cn(i > 0 && 'border-t border-line')}>
                  <NavLink
                    to={s.to}
                    end={s.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between py-3.5 text-[1rem] transition-colors',
                        isActive ? 'text-olive' : 'text-ink-soft',
                      )
                    }
                  >
                    {s.label}
                    <span className="label-mono">{String(i + 1).padStart(2, '0')}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}

/** App shell: its own header and section nav, with no marketing chrome. */
function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain min-h-dvh bg-canvas">
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className="shell flex h-[4.5rem] items-center justify-between gap-4">
          <AppLink
            href="/"
            className="group flex min-w-0 items-center gap-2.5"
            aria-label={brand.name}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-olive text-canvas transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:rotate-[60deg]">
              <VeylMark className="size-[1.15rem]" />
            </span>
            <span className="font-display text-[1.35rem] leading-none tracking-[-0.02em] text-ink">
              {brand.name}
            </span>
          </AppLink>

          {/* Without a project id AppKit is not initialised, so the button that
              depends on it is simply absent. The reason is logged, not shown. */}
          {isWalletConfigured && <WalletButton />}
        </div>

        <SectionNav />
      </header>

      {isWalletConfigured && <NetworkGuard />}

      <main id="main" className="shell py-10 md:py-14">
        {children}
      </main>
    </div>
  )
}

export default function AppLayout() {
  useEffect(() => {
    document.title = `Dashboard | ${brand.name} ${brand.suffix}`
  }, [])

  useEffect(() => {
    // Setup detail belongs in the console, not on the page.
    if (!isWalletConfigured) {
      console.warn(
        'Wallet connection disabled: set VITE_REOWN_PROJECT_ID from dashboard.reown.com and restart the dev server.',
      )
    }
  }, [])

  return (
    <WalletProvider>
      <Chrome>
        <Suspense fallback={<p className="label-mono py-16 text-center">Loading</p>}>
          <Outlet />
        </Suspense>
      </Chrome>
    </WalletProvider>
  )
}
