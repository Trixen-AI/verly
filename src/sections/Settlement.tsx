import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowRight, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { GridLines, Icon, Section, SectionLabel } from '@/components/site/primitives'
import { links } from '@/config/brand'
import { settlement } from '@/config/content'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

/**
 * Connector between two nodes. Carries the travelling packet the diagram
 * timeline animates. Horizontal from `md` up, vertical below it, which is why
 * the packet is positioned in percentages on both axes.
 */
function Connector({ label, index }: { label: string; index: 1 | 2 }) {
  return (
    <div className="relative flex shrink-0 flex-col items-center gap-2 py-5 md:min-w-[7rem] md:flex-1 md:flex-row md:py-0">
      <span className="label-mono order-2 whitespace-nowrap md:order-1 md:absolute md:-top-7 md:left-1/2 md:-translate-x-1/2">
        {label}
      </span>

      <span className="relative order-1 flex h-10 w-px items-center justify-center md:order-2 md:h-px md:w-full">
        <span data-flow className="flow-line-v md:flow-line-h" />
        <span
          data-packet={index}
          className={cn(
            'absolute size-2 rounded-full opacity-0',
            index === 1
              ? 'border border-olive bg-canvas'
              : 'bg-olive shadow-[0_0_0_3px_var(--color-olive-wash)]',
          )}
        />
      </span>

      <ArrowRight
        aria-hidden
        className="order-3 size-3.5 shrink-0 rotate-90 text-line-strong md:rotate-0"
        strokeWidth={1.5}
      />
    </div>
  )
}

function Node({ title, active }: { title: string; active?: boolean }) {
  return (
    <div
      data-node={active ? 'core' : 'edge'}
      className={cn(
        'relative flex min-w-0 flex-1 items-center justify-center rounded-xl border px-5 py-5 text-center',
        active
          ? 'border-olive/30 bg-olive text-canvas shadow-[var(--shadow-lift)]'
          : 'border-line bg-surface text-ink shadow-[var(--shadow-float)]',
      )}
    >
      {active && (
        <>
          {/* Seal pulse, expanding out of the core node on each cycle. */}
          <span
            data-ring
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl border border-olive opacity-0"
          />
          <Lock data-lock aria-hidden className="mr-2 size-4 shrink-0" strokeWidth={1.5} />
        </>
      )}
      <span className="truncate font-display text-[1rem] md:text-[1.0625rem]">{title}</span>
    </div>
  )
}

export function Settlement() {
  const scope = useReveal<HTMLDivElement>()
  const figure = useRef<HTMLElement>(null)
  const [origin, middle, back] = settlement.flow

  /* ---------------------------------------------------------------------
     The diagram loop. A packet leaves the origin chain, is sealed at the
     protocol node, then continues as a filled marker: the story the copy
     tells, in motion. Runs only while the figure is actually on screen.
     --------------------------------------------------------------------- */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const horizontal = window.matchMedia('(min-width: 768px)').matches
        const start = horizontal ? { left: '0%', top: '50%' } : { top: '0%', left: '50%' }
        const end = horizontal ? { left: '100%' } : { top: '100%' }

        // Dashes drift continuously so the route reads as open, not static.
        gsap.to('[data-flow]', {
          backgroundPosition: horizontal ? '9px 0px' : '0px 9px',
          duration: 0.75,
          ease: 'none',
          repeat: -1,
        })

        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 1.2,
          defaults: { ease: 'power1.inOut' },
          scrollTrigger: {
            trigger: figure.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play pause resume pause',
          },
        })

        tl
          // 1. A cleartext value leaves the origin chain.
          .fromTo(
            '[data-packet="1"]',
            { ...start, xPercent: -50, yPercent: -50, opacity: 0 },
            { opacity: 1, duration: 0.22 },
          )
          .to('[data-packet="1"]', { ...end, duration: 1.15 }, '<')
          .to('[data-packet="1"]', { opacity: 0, duration: 0.2 }, '-=0.18')

          // 2. It is sealed.
          .to('[data-node="core"]', { scale: 1.035, duration: 0.26 }, '-=0.12')
          .fromTo(
            '[data-ring]',
            { scale: 0.9, opacity: 0.6 },
            { scale: 1.22, opacity: 0, duration: 0.85, ease: 'power2.out' },
            '<',
          )
          .to('[data-lock]', { rotate: -14, duration: 0.16, yoyo: true, repeat: 1 }, '<')
          .to('[data-node="core"]', {
            scale: 1,
            duration: 0.45,
            ease: 'elastic.out(1, 0.65)',
          })

          // 3. It continues as ciphertext: same value, now filled and opaque.
          .fromTo(
            '[data-packet="2"]',
            { ...start, xPercent: -50, yPercent: -50, opacity: 0 },
            { opacity: 1, duration: 0.22 },
            '-=0.25',
          )
          .to('[data-packet="2"]', { ...end, duration: 1.15 }, '<')
          .to('[data-packet="2"]', { opacity: 0, duration: 0.2 }, '-=0.18')
      })

      return () => mm.revert()
    },
    { scope: figure },
  )

  return (
    <Section id="settlement" className="overflow-hidden">
      <GridLines className="opacity-70" />

      <div ref={scope} className="shell relative py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <SectionLabel>{settlement.label}</SectionLabel>
            <p data-reveal className="label-mono mt-10 hidden md:block">
              03 / 04
            </p>
          </div>

          <div className="md:col-span-8">
            <h2 data-reveal className="display max-w-[16ch] text-[2rem] sm:text-[2.5rem] md:text-[3rem]">
              {settlement.heading}
            </h2>
            <p data-reveal className="prose-measure mt-7 text-[1.0625rem] leading-[1.75] text-ink-soft">
              {settlement.body}
            </p>
            <div data-reveal className="mt-8">
              <Button asChild variant="outline">
                <a href={links.docs}>
                  {settlement.cta}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Flow diagram */}
        <figure
          ref={figure}
          data-reveal
          className="pattern-dots-fine relative mt-16 rounded-2xl border border-line bg-canvas-alt/60 p-6 md:mt-20 md:p-12"
        >
          <figcaption className="label-mono mb-8 text-center">{settlement.caption}</figcaption>

          <div className="relative flex flex-col items-stretch md:flex-row md:items-center md:gap-4">
            <Node title={origin} />
            <Connector label="deposit" index={1} />
            <Node title={middle} active />
            <Connector label="redeem" index={2} />
            <Node title={back} />
          </div>

          <p className="mt-8 text-center text-[0.8125rem] text-ink-muted">{settlement.note}</p>
        </figure>

        {/* Steps */}
        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {settlement.steps.map((step) => (
            <li key={step.step} data-reveal className="group bg-canvas p-7 md:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg border border-line bg-surface text-olive">
                  <Icon name={step.icon} className="size-4" />
                </span>
                <span className="label-mono">{step.step}</span>
              </div>
              <h3 className="mt-6 font-display text-[1.25rem] text-ink">{step.title}</h3>
              <p className="mt-2.5 max-w-[34ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
