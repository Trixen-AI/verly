import { ArrowUpRight, BookOpen, Lock, TrendingDown, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AnimatedNumber, asPercent, asPrice } from '@/components/site/AnimatedNumber'
import { CipherField } from '@/components/site/CipherField'
import { GridLines, Tick } from '@/components/site/primitives'
import { Sparkline } from '@/components/site/Sparkline'
import { links } from '@/config/brand'
import { hero } from '@/config/content'
import { useQuotes, useSeries } from '@/hooks/useMarketData'
import { useHeroIntro } from '@/hooks/useReveal'
import type { Quote } from '@/lib/quotes'
import { cn } from '@/lib/utils'

/** Splits the headline into per-word spans and renders {braced} words as
 *  olive italic serif, the one editorial emphasis on the page. */
function Headline({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <h1 className="display text-[2.6rem] sm:text-[3.4rem] md:text-[4rem] lg:text-[4.5rem]">
      {words.map((word, i) => {
        const accent = word.startsWith('{')
        return (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <span data-word className={cn('inline-block', accent && 'italic text-olive')}>
              {word.replace(/[{}]/g, '')}
            </span>
            {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        )
      })}
    </h1>
  )
}

/** Pulsing dot shown only once real quotes have landed. */
function LiveBadge() {
  return (
    <span className="label-mono flex items-center gap-1.5 text-olive">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-olive opacity-60" />
        <span className="relative inline-flex size-1.5 rounded-full bg-olive" />
      </span>
      Live
    </span>
  )
}

function QuoteRow({
  symbol,
  name,
  logo,
  price,
  change,
  direction,
}: {
  symbol: string
  name: string
  logo: string
  price: string
  change: string
  direction: 'up' | 'down'
}) {
  const Trend = direction === 'up' ? TrendingUp : TrendingDown
  return (
    <div className="group flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          className="size-8 shrink-0 rounded-md border border-line bg-surface object-contain p-1 opacity-70 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
        />
        <div className="leading-tight">
          <p className="font-mono text-[0.75rem] font-medium text-ink">{symbol}</p>
          <p className="text-[0.75rem] text-ink-muted">{name}</p>
        </div>
      </div>
      <div className="text-right leading-tight">
        <p className="font-mono text-[0.8125rem] text-ink tabular-nums">
          $<AnimatedNumber value={price} format={asPrice} />
        </p>
        <p
          className={cn(
            'flex items-center justify-end gap-1 font-mono text-[0.6875rem] tabular-nums',
            direction === 'up' ? 'text-up' : 'text-down',
          )}
        >
          <Trend className="size-3" strokeWidth={1.6} />
          <AnimatedNumber value={change} format={asPercent} />
        </p>
      </div>
    </div>
  )
}

export function Hero() {
  const scope = useHeroIntro<HTMLElement>()
  const seed = hero.featured

  // One batched request covers the featured instrument and both side quotes.
  const symbols = [seed.symbol, ...hero.side.map((s) => s.symbol)]
  const { quotes, live } = useQuotes(symbols)
  const series = useSeries(seed.symbol)

  /** Live value when it has arrived, seed value until then. */
  const merge = <T extends { symbol: string; price: string; change: string; direction: 'up' | 'down' }>(
    base: T,
  ): T => {
    const q: Quote | undefined = quotes[base.symbol]
    return q ? { ...base, price: q.price, change: q.change, direction: q.direction } : base
  }

  const f = merge(seed)
  const chartData = series?.values ?? seed.series
  const axis = series?.axis ?? seed.axis

  return (
    <section id="top" ref={scope} className="relative overflow-hidden pt-[4.5rem]">
      <GridLines />
      {/* Warm halo behind the fold */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[68rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--color-olive-wash),transparent_65%)]"
      />
      {/* Sealed values drifting behind the instruments. Desktop only: on a
          stacked mobile layout it sits under the copy and just adds noise. */}
      <CipherField className="inset-y-0 right-0 hidden w-[68%] md:block" />

      <div className="shell relative pt-14 pb-16 md:pt-20 md:pb-24 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          {/* ------------------------------ Copy ------------------------- */}
          <div className="lg:col-span-7">
            <p
              data-reveal
              className="label-mono inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5"
            >
              <Lock className="size-3 text-olive" strokeWidth={1.6} />
              {hero.eyebrow}
            </p>

            <div className="mt-7">
              <Headline text={hero.headline} />
            </div>

            <p
              data-reveal
              className="prose-measure mt-7 text-[1.0625rem] leading-[1.7] text-ink-soft md:text-[1.125rem]"
            >
              {hero.lede}
            </p>

            <div data-reveal className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href={links.app}>
                  {hero.primaryCta}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={links.docs}>
                  <BookOpen className="size-4" />
                  {hero.secondaryCta}
                </a>
              </Button>
            </div>

            <dl
              data-reveal
              className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line"
            >
              {hero.metrics.map((m) => (
                <div key={m.label} className="bg-canvas px-4 py-4">
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="font-display text-[1.375rem] leading-none text-olive">{m.value}</dd>
                  <p className="mt-2 text-[0.6875rem] leading-tight text-ink-muted">{m.label}</p>
                </div>
              ))}
            </dl>
          </div>

          {/* --------------------------- Instruments --------------------- */}
          <div data-reveal className="relative lg:col-span-5">
            <Tick className="-top-1.5 -left-1.5 hidden lg:block" />

            {/* Featured instrument */}
            <article className="card-float group relative overflow-hidden p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={f.logo}
                    alt=""
                    width={36}
                    height={36}
                    loading="eager"
                    className="size-9 rounded-lg border border-line bg-surface object-contain p-1 opacity-70 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                  <div className="leading-tight">
                    <p className="font-display text-[1.0625rem] text-ink">{f.name}</p>
                    <p className="label-mono">{f.symbol}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 font-mono text-[0.6875rem] font-medium tabular-nums',
                    f.direction === 'up'
                      ? 'bg-olive-soft text-olive-deep'
                      : 'bg-down/10 text-down',
                  )}
                >
                  <AnimatedNumber value={f.change} format={asPercent} />
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <p className="font-display text-[2.25rem] leading-none text-ink tabular-nums">
                  $<AnimatedNumber value={f.price} format={asPrice} />
                </p>
                <p className="text-[0.75rem] text-ink-muted">{f.range}</p>
              </div>

              <div className="mt-5 -mx-1">
                <Sparkline data={chartData} direction={f.direction} />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                {axis.map((a, i) => (
                  <span
                    key={`${a}-${i}`}
                    className="font-mono text-[0.625rem] tracking-wide text-ink-faint"
                  >
                    {a}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="label-mono">Market data</p>
                {live ? <LiveBadge /> : <p className="label-mono text-ink-faint">Indicative</p>}
              </div>
            </article>

            {/* Secondary quotes */}
            <div className="card-float mt-4 divide-y divide-line px-5 py-1">
              {hero.side.map((q) => (
                <QuoteRow key={q.symbol} {...merge(q)} />
              ))}
            </div>

            <Tick className="-right-1.5 -bottom-1.5 hidden lg:block" />
          </div>
        </div>

        {/* -------------------------- Chip strip ------------------------- */}
        <ul
          data-reveal
          className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 md:mt-20"
        >
          {hero.chips.map((chip) => (
            <li key={chip.title} className="bg-canvas px-5 py-5">
              <p className="font-display text-[1.0625rem] text-ink">{chip.title}</p>
              <p className="mt-1.5 text-[0.8125rem] text-ink-muted">{chip.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
