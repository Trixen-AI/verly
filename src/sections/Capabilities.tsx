import { Icon, Section, SectionLabel } from '@/components/site/primitives'
import { capabilities } from '@/config/content'
import { useReveal } from '@/hooks/useReveal'

export function Capabilities() {
  const scope = useReveal<HTMLDivElement>()

  return (
    <Section id="capabilities" tone="alt" className="overflow-hidden">
      <div ref={scope} className="shell relative py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <SectionLabel>{capabilities.label}</SectionLabel>
            <p data-reveal className="label-mono mt-10 hidden md:block">
              04 / 04
            </p>
          </div>

          <div className="md:col-span-8">
            <h2 data-reveal className="display max-w-[16ch] text-[2rem] sm:text-[2.5rem] md:text-[3rem]">
              {capabilities.heading}
            </h2>
            <p data-reveal className="prose-measure mt-7 text-[1.0625rem] leading-[1.75] text-ink-soft">
              {capabilities.body}
            </p>
          </div>
        </div>

        {/* Swiss 2×3 / 3×2 matrix, hairline-separated rather than boxed */}
        <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.items.map((item, i) => (
            <li
              key={item.title}
              data-reveal
              className="group relative bg-canvas-alt p-7 transition-colors duration-300 hover:bg-surface md:p-8"
            >
              <span className="label-mono absolute top-7 right-7 text-ink-faint transition-colors group-hover:text-olive">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-olive transition-all duration-300 ease-[var(--ease-editorial)] group-hover:border-olive/30 group-hover:bg-olive-wash">
                <Icon name={item.icon} className="size-5" />
              </span>

              <h3 className="mt-6 max-w-[20ch] font-display text-[1.25rem] leading-snug text-ink">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[36ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
