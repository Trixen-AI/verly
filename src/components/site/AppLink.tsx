import { forwardRef } from 'react'
import { Link } from 'react-router'

/**
 * Renders a router `Link` for internal paths and a plain anchor for everything
 * else, so `links` in brand.ts can hold both without every call site branching.
 *
 * External targets get `rel="noreferrer"`: a marketing page should not leak its
 * URL to third-party sites through the referer header.
 */
export const AppLink = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function AppLink({ href, children, ...props }, ref) {
  const internal = href.startsWith('/') && !href.startsWith('//')

  if (internal) {
    return (
      <Link ref={ref} to={href} {...props}>
        {children}
      </Link>
    )
  }

  const external = href.startsWith('http')
  return (
    <a
      ref={ref}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  )
})
