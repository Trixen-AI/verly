import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon, Section, SectionLabel } from '@/components/site/primitives'
import { links } from '@/config/brand'
import { protocol } from '@/config/content'
import { useReveal } from '@/hooks/useReveal'

/** Continuous instrument rail.
 *
 *  Logos are rendered desaturated so twelve competing corporate palettes do
 *  not overrun a one-accent design, and return to full colour on hover. The
 *  list is duplicated so the -50% keyframe loops seamlessly; the copy is
 *  aria-hidden so a screen reader hears the set once. */
function TickerRail() {
  return (
    <div className="hairline-t hairline-b relative overflow-hidden bg-canvas-alt py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas-alt to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas-alt to-transparent"
      />

      <div
        className="animate-ticker flex w-max items-center gap-3"
        style={{ ['--ticker-duration' as string]: '68s' }}
      >
        {[0, 1].map((pass) => (
          <ul key={pass} aria-hidden={pass === 1 || undefined} className="flex items-center gap-3">
            {protocol.instruments.map((inst) => (
              <li
                key={`${pass}-${inst.symbol}`}
                className="group flex items-center gap-2.5 rounded-full border border-line bg-surface py-2 pr-4 pl-2 transition-colors duration-300 hover:border-line-strong"
              >
                <img
                  src={inst.logo}
                  alt=""
                  width={22}
                  height={22}
                  loading="lazy"
                  decoding="async"
                  className="size-[22px] shrink-0 rounded-full object-contain grayscale opacity-70 transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
                <span className="font-mono text-[0.75rem] tracking-wide text-ink-soft">
                  {inst.symbol}
                </span>
                <span className="sr-only">{inst.name}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

export function Protocol() {
  const scope = useReveal<HTMLDivElement>()

  return (
    <Section id="protocol" tone="alt" className="overflow-hidden">
      <div ref={scope}>
        <div className="shell py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <SectionLabel>{protocol.label}</SectionLabel>
              <p data-reveal className="label-mono mt-10 hidden md:block">
                02 / 04
              </p>
            </div>

            <div className="md:col-span-8">
              <h2
                data-reveal
                className="display max-w-[18ch] text-[2rem] sm:text-[2.5rem] md:text-[3rem]"
              >
                {protocol.heading}
              </h2>
              <p
                data-reveal
                className="prose-measure mt-7 text-[1.0625rem] leading-[1.75] text-ink-soft"
              >
                {protocol.body}
              </p>
              <div data-reveal className="mt-8">
                <Button asChild variant="outline">
                  <a href={links.docs}>
                    {protocol.cta}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Three pillars, floating cards on the alt band */}
          <ul className="mt-16 grid gap-5 md:mt-20 md:grid-cols-3">
            {protocol.pillars.map((pillar) => (
              <li key={pillar.title} data-reveal className="card-float group relative p-7 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-olive-wash text-olive transition-transform duration-300 ease-[var(--ease-editorial)] group-hover:-translate-y-0.5">
                    <Icon name={pillar.icon} className="size-5" />
                  </span>
                  <span className="font-display text-[1.75rem] leading-none text-line-strong">
                    {pillar.index}
                  </span>
                </div>

                <h3 className="mt-7 font-display text-[1.3125rem] leading-snug text-ink">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.7] text-ink-soft">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <TickerRail />

        {/* Two-column technical note under the rail */}
        <div className="shell grid gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-20">
          {protocol.split.map((item) => (
            <div key={item.label} data-reveal className="border-t border-line-strong pt-6">
              <h3 className="font-display text-[1.375rem] leading-snug text-ink">{item.label}</h3>
              <p className="prose-measure mt-4 text-[0.9375rem] leading-[1.75] text-ink-soft">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
