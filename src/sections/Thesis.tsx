import { GridLines, Icon, Section, SectionLabel } from '@/components/site/primitives'
import { thesis } from '@/config/content'
import { useReveal } from '@/hooks/useReveal'

export function Thesis() {
  const scope = useReveal<HTMLDivElement>()

  return (
    <Section id="thesis" className="overflow-hidden">
      <GridLines className="opacity-70" />

      <div ref={scope} className="shell relative py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <SectionLabel>{thesis.label}</SectionLabel>
            <p data-reveal className="label-mono mt-10 hidden md:block">
              01 / 04
            </p>
          </div>

          <div className="md:col-span-8">
            <h2 data-reveal className="display max-w-[18ch] text-[2rem] sm:text-[2.5rem] md:text-[3rem]">
              {thesis.heading}
            </h2>
            <p
              data-reveal
              className="prose-measure mt-7 text-[1.0625rem] leading-[1.75] text-ink-soft"
            >
              {thesis.body}
            </p>
          </div>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:mt-20 md:grid-cols-3">
          {thesis.points.map((point, i) => (
            <li
              key={point.title}
              data-reveal
              className="group relative bg-canvas p-7 transition-colors duration-300 hover:bg-surface md:p-8"
            >
              <span className="label-mono absolute top-7 right-7 text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-olive transition-all duration-300 ease-[var(--ease-editorial)] group-hover:border-olive/30 group-hover:bg-olive-wash">
                <Icon name={point.icon} className="size-5" />
              </span>

              <h3 className="mt-6 font-display text-[1.25rem] leading-snug text-ink">
                {point.title}
              </h3>
              <p className="mt-3 max-w-[34ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
                {point.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
