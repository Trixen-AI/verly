import { ArrowUpRight, BookOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Section, SectionLabel } from '@/components/site/primitives'
import { links } from '@/config/brand'
import { closing } from '@/config/content'
import { useReveal } from '@/hooks/useReveal'

export function Closing() {
  const scope = useReveal<HTMLDivElement>()

  return (
    <Section className="overflow-hidden">
      {/* Dotted field plus warm halo: the page's one full-bleed moment */}
      <div aria-hidden className="pattern-dots absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[30rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--color-canvas)_35%,transparent_70%)]"
      />

      <div ref={scope} className="shell relative py-24 text-center md:py-32">
        <div className="flex justify-center">
          <SectionLabel tone="olive">{closing.label}</SectionLabel>
        </div>

        <h2
          data-reveal
          className="display mx-auto mt-8 max-w-[14ch] text-[2.25rem] sm:text-[3rem] md:text-[3.75rem]"
        >
          {closing.heading}
        </h2>

        <p
          data-reveal
          className="mx-auto mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-ink-soft"
        >
          {closing.body}
        </p>

        <div data-reveal className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <a href={links.app}>
              {closing.primaryCta}
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="surface">
            <a href={links.docs}>
              <BookOpen className="size-4" />
              {closing.secondaryCta}
            </a>
          </Button>
        </div>
      </div>
    </Section>
  )
}
