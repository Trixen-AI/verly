import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-ink/25 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />

      {/* Centring is done by the grid wrapper, not by a transform on the panel.
          Sharing `transform` between a Tailwind translate utility and an
          animation keyframe is what made the dialog start at the top left and
          slide into place on open. The wrapper is click-through so Radix still
          sees outside clicks on the overlay. */}
      <div className="pointer-events-none fixed inset-0 z-[95] grid place-items-center p-4">
        <DialogPrimitive.Content
          className={cn(
            'pointer-events-auto relative w-full max-w-md',
            'rounded-2xl border border-line bg-canvas p-6 shadow-[var(--shadow-lift)]',
            'data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in',
            className,
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close
            className="absolute top-5 right-5 grid size-8 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:bg-olive-wash hover:text-olive"
            aria-label="Close"
          >
            <X className="size-3.5" strokeWidth={1.5} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('pr-10', className)} {...props} />
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-[1.5rem] leading-tight text-ink', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('mt-2 text-[0.9375rem] leading-[1.65] text-ink-soft', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
