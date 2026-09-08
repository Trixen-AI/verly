import { NavLink } from 'react-router'

import { Button } from '@/components/ui/button'
import { AppLink } from '@/components/site/AppLink'
import { VeylMark } from '@/components/site/VeylMark'
import { brand, links } from '@/config/brand'
import { cn } from '@/lib/utils'

/**
 * Header for the docs and dashboard routes.
 *
 * The marketing Navbar is built around in-page anchors, which do not exist off
 * the landing page. This is the sibling for routes that navigate rather than
 * scroll.
 */
export function SlimHeader({ cta }: { cta?: React.ReactNode }) {
  const tab = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative py-2 text-[0.875rem] transition-colors duration-200',
      isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
      isActive &&
        'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-olive',
    )

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <AppLink href="/" className="group flex items-center gap-2.5" aria-label={brand.name}>
            <span className="grid size-8 place-items-center rounded-[9px] bg-olive text-canvas transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:rotate-[60deg]">
              <VeylMark className="size-[1.15rem]" />
            </span>
            <span className="font-display text-[1.35rem] leading-none tracking-[-0.02em] text-ink">
              {brand.name}
            </span>
          </AppLink>

          <nav aria-label="Sections" className="hidden items-center gap-7 sm:flex">
            <NavLink to="/docs" className={tab}>
              Docs
            </NavLink>
            <NavLink to="/app" className={tab}>
              App
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {cta ?? (
            <Button asChild size="sm">
              <AppLink href={links.app}>Launch App</AppLink>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
