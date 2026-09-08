import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { VeylMark } from '@/components/site/VeylMark'
import { brand, links } from '@/config/brand'
import { nav } from '@/config/content'
import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <a
      href="#top"
      className={cn('group flex items-center gap-2.5', className)}
      aria-label={`${brand.name}, home`}
    >
      <span className="grid size-8 place-items-center rounded-[9px] bg-olive text-canvas transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:rotate-[60deg]">
        <VeylMark className="size-[1.15rem]" />
      </span>
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.02em] text-ink">
        {brand.name}
      </span>
      <span className="label-mono hidden pt-px sm:inline">{brand.suffix}</span>
    </a>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const scope = useRef<HTMLElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const iconTl = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock the page behind the open sheet.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  /* ---------------------------------------------------------------------
     Mobile sheet. Built once as a paused timeline, then played and reversed,
     so open and close are exact inverses and an interrupted gesture picks up
     from wherever the animation currently is instead of jumping.
     --------------------------------------------------------------------- */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // No motion: the sheet just exists or does not.
        gsap.set(sheet.current, { height: 'auto', autoAlpha: 1 })
        tl.current = null
        iconTl.current = null
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(sheet.current, { height: 0, autoAlpha: 0, overflow: 'hidden' })

        tl.current = gsap
          .timeline({ paused: true, defaults: { ease: 'expo.out' } })
          .to(sheet.current, { height: 'auto', autoAlpha: 1, duration: 0.45 })
          .from(
            '[data-nav-item]',
            { y: 16, opacity: 0, duration: 0.4, stagger: 0.055, clearProps: 'opacity' },
            '-=0.26',
          )
          .from('[data-nav-cta]', { y: 12, opacity: 0, duration: 0.35 }, '-=0.2')

        // Burger to close: the two glyphs rotate through each other.
        iconTl.current = gsap
          .timeline({ paused: true, defaults: { duration: 0.3, ease: 'power2.inOut' } })
          .to('[data-icon-menu]', { rotate: 90, autoAlpha: 0 }, 0)
          .fromTo('[data-icon-close]', { rotate: -90, autoAlpha: 0 }, { rotate: 0, autoAlpha: 1 }, 0)
      })

      return () => mm.revert()
    },
    { scope },
  )

  useEffect(() => {
    if (open) {
      tl.current?.play()
      iconTl.current?.play()
    } else {
      tl.current?.reverse()
      iconTl.current?.reverse()
    }
  }, [open])

  // Escape closes the sheet.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      ref={scope}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled || open
          ? 'border-b border-line bg-canvas/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="shell flex h-[4.5rem] items-center justify-between gap-8">
        <Wordmark />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.links.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="relative py-2 text-[0.875rem] text-ink-soft transition-colors duration-200 hover:text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-olive after:transition-transform after:duration-300 after:ease-[var(--ease-editorial)] hover:after:scale-x-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={links.app}>
              {nav.cta}
              <ArrowUpRight className="size-3.5" />
            </a>
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="relative grid size-10 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-olive-wash lg:hidden"
          >
            <Menu data-icon-menu className="absolute size-4" />
            <X data-icon-close className="absolute size-4 opacity-0" />
          </button>
        </div>
      </div>

      {/* Mobile sheet. Kept mounted so GSAP can measure it; `inert` keeps its
          contents out of the tab order and the a11y tree while closed. */}
      <div ref={sheet} id="mobile-nav" inert={!open} className="hairline-t bg-canvas lg:hidden">
        <nav aria-label="Mobile" className="shell py-6">
          <ul className="flex flex-col">
            {nav.links.map((item, i) => (
              <li key={item.href} data-nav-item className={cn(i > 0 && 'border-t border-line')}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-4 font-display text-xl text-ink"
                >
                  {item.label}
                  <span className="label-mono">{String(i + 1).padStart(2, '0')}</span>
                </a>
              </li>
            ))}
          </ul>
          <div data-nav-cta>
            <Button asChild size="lg" className="mt-6 w-full">
              <a href={links.app} onClick={() => setOpen(false)}>
                {nav.cta}
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
