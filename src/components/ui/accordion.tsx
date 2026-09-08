import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

const Accordion = AccordionPrimitive.Root

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-line last:border-b-0', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group flex flex-1 items-start justify-between gap-6 py-6 text-left',
          'font-display text-[1.0625rem] leading-snug text-ink md:text-[1.1875rem]',
          'transition-colors duration-200 hover:text-olive',
          className,
        )}
        {...props}
      >
        <span className="max-w-[52ch]">{children}</span>
        <span
          aria-hidden
          className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition-all duration-300 ease-[var(--ease-editorial)] group-hover:border-olive/40 group-hover:text-olive group-data-[state=open]:rotate-45 group-data-[state=open]:border-olive/40 group-data-[state=open]:bg-olive-wash group-data-[state=open]:text-olive"
        >
          <Plus className="size-3.5" strokeWidth={1.5} />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-[state=closed]:animate-acc-up data-[state=open]:animate-acc-down"
      {...props}
    >
      <div className={cn('max-w-[62ch] pr-10 pb-7 text-[0.9375rem] leading-[1.75] text-ink-soft', className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
