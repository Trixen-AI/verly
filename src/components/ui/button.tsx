import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-sans font-medium tracking-[-0.005em]',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[var(--ease-editorial)]',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        /* Olive solid. The single highest-priority action on any screen */
        default:
          'bg-olive text-white shadow-[0_1px_2px_rgb(27_27_22/0.16)] hover:bg-olive-deep active:translate-y-px',
        /* Hairline outline on the warm ground */
        outline:
          'border border-line-strong bg-transparent text-ink hover:bg-olive-wash hover:border-olive/40 active:translate-y-px',
        /* Floating white card button */
        surface:
          'border border-line bg-surface text-ink shadow-[var(--shadow-float)] hover:shadow-[var(--shadow-lift)] hover:border-line-strong active:translate-y-px',
        ghost: 'text-ink-soft hover:bg-olive-wash hover:text-ink',
        link: 'text-olive underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 rounded-full px-4 text-[0.8125rem]',
        default: 'h-11 rounded-full px-6 text-[0.875rem]',
        lg: 'h-[3.25rem] rounded-full px-8 text-[0.9375rem]',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
