import { brand, links } from '@/config/brand'
import { footer } from '@/config/content'
import { GridLines } from '@/components/site/primitives'
import { Wordmark } from '@/components/site/Navbar'

/** Resolves a content href: `#anchor` stays literal, anything else is a
 *  key into `links` so every external URL lives in brand.ts. */
function resolve(href: string) {
  if (href.startsWith('#')) return href
  return links[href as keyof typeof links] ?? '#'
}

export function Footer() {
  return (
    <footer className="hairline-t relative overflow-hidden bg-canvas-alt">
      <GridLines className="opacity-60" />

      <div className="shell relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Wordmark />
            <p className="prose-measure mt-5 max-w-[38ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
              {footer.blurb}
            </p>
          </div>

          {footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="md:col-span-2">
              <h3 className="label-mono">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={resolve(link.href)}
                      className="text-[0.9375rem] text-ink-soft transition-colors duration-200 hover:text-olive"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-14 max-w-[70ch] border-t border-line pt-6 text-[0.75rem] leading-relaxed text-ink-muted">
          {footer.disclaimer}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-mono normal-case tracking-normal">
            © {brand.year} {brand.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            {footer.legal.map((item) => (
              <li key={item.label}>
                <a
                  href={resolve(item.href)}
                  className="label-mono transition-colors duration-200 hover:text-olive"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
