import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { GridLines, Section, SectionLabel } from '@/components/site/primitives'
import { faq } from '@/config/content'
import { useReveal } from '@/hooks/useReveal'

export function Faq() {
  const scope = useReveal<HTMLDivElement>()

  return (
    <Section id="faq" className="overflow-hidden">
      <GridLines className="opacity-70" />

      <div ref={scope} className="shell relative py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <SectionLabel>{faq.label}</SectionLabel>
            <h2
              data-reveal
              className="display mt-7 max-w-[12ch] text-[2rem] sm:text-[2.5rem] md:text-[2.75rem]"
            >
              {faq.heading}
            </h2>
            <p data-reveal className="mt-5 max-w-[34ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
              {faq.body}
            </p>
          </div>

          <div data-reveal className="md:col-span-8">
            <Accordion type="single" collapsible defaultValue="item-0" className="border-t border-line">
              {faq.items.map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </Section>
  )
}
