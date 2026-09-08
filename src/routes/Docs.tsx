import { useEffect } from 'react'
import { NavLink, useParams, Navigate } from 'react-router'
import { ArrowLeft, ArrowRight, Info, TriangleAlert } from 'lucide-react'

import { AppLink } from '@/components/site/AppLink'
import { Footer } from '@/components/site/Footer'
import { SlimHeader } from '@/components/site/SlimHeader'
import { docs, docsMeta, flatDocs, type Block, type DocPage } from '@/config/docs'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------- renderer -- */

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h':
            return (
              <h2
                key={i}
                className="display mt-14 mb-4 text-[1.5rem] first:mt-0 md:text-[1.75rem]"
              >
                {block.text}
              </h2>
            )

          case 'p':
            return (
              <p key={i} className="mt-4 max-w-[68ch] text-[1rem] leading-[1.75] text-ink-soft">
                {block.text}
              </p>
            )

          case 'list':
            return (
              <ul key={i} className="mt-5 max-w-[68ch] space-y-2.5">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3 text-[1rem] leading-[1.7] text-ink-soft">
                    <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-olive" />
                    {item}
                  </li>
                ))}
              </ul>
            )

          case 'ordered':
            return (
              <ol key={i} className="mt-5 max-w-[68ch] space-y-4">
                {block.items.map((item, n) => (
                  <li key={item} className="flex gap-4">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[0.625rem] text-olive">
                      {n + 1}
                    </span>
                    <span className="text-[1rem] leading-[1.7] text-ink-soft">{item}</span>
                  </li>
                ))}
              </ol>
            )

          case 'table':
            return (
              <div key={i} className="mt-6 max-w-[68ch] overflow-x-auto">
                <table className="w-full border-collapse text-left text-[0.9375rem]">
                  {block.head && (
                    <thead>
                      <tr>
                        {block.head.map((h) => (
                          <th
                            key={h}
                            className="label-mono border-b border-line-strong pb-2.5 font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {block.rows.map(([k, v]) => (
                      <tr key={k} className="border-b border-line last:border-b-0">
                        <td className="py-3.5 pr-6 align-top font-medium text-ink">{k}</td>
                        <td className="py-3.5 align-top leading-[1.65] text-ink-soft">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case 'code':
            return (
              <pre
                key={i}
                className="mt-6 max-w-[68ch] overflow-x-auto rounded-xl border border-line bg-surface p-5 font-mono text-[0.8125rem] leading-[1.7] text-ink"
              >
                <code>{block.code}</code>
              </pre>
            )

          case 'note': {
            const warn = block.tone === 'warn'
            const NoteIcon = warn ? TriangleAlert : Info
            return (
              <aside
                key={i}
                className={cn(
                  'mt-6 flex max-w-[68ch] gap-3.5 rounded-xl border p-5',
                  warn ? 'border-down/25 bg-down/[0.04]' : 'border-line bg-olive-wash',
                )}
              >
                <NoteIcon
                  aria-hidden
                  strokeWidth={1.5}
                  className={cn('mt-0.5 size-4 shrink-0', warn ? 'text-down' : 'text-olive')}
                />
                <p className="text-[0.9375rem] leading-[1.7] text-ink-soft">{block.text}</p>
              </aside>
            )
          }
        }
      })}
    </>
  )
}

/* ---------------------------------------------------------------- pages -- */

function Sidebar({ current }: { current: string }) {
  return (
    <nav aria-label="Documentation" className="space-y-8">
      {docs.map((group) => (
        <div key={group.title}>
          <p className="label-mono">{group.title}</p>
          <ul className="mt-3.5 space-y-0.5 border-l border-line">
            {group.pages.map((page) => (
              <li key={page.slug}>
                <NavLink
                  to={`/docs/${page.slug}`}
                  className={cn(
                    '-ml-px block border-l py-1.5 pl-4 text-[0.875rem] transition-colors duration-200',
                    page.slug === current
                      ? 'border-olive font-medium text-olive'
                      : 'border-transparent text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {page.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function PrevNext({ page }: { page: DocPage }) {
  const i = flatDocs.findIndex((p) => p.slug === page.slug)
  const prev = i > 0 ? flatDocs[i - 1] : null
  const next = i < flatDocs.length - 1 ? flatDocs[i + 1] : null

  return (
    <nav
      aria-label="Pagination"
      className="mt-20 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <AppLink
          href={`/docs/${prev.slug}`}
          className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
        >
          <span className="label-mono flex items-center gap-2">
            <ArrowLeft className="size-3" />
            Previous
          </span>
          <span className="mt-2 block font-display text-[1.0625rem] text-ink group-hover:text-olive">
            {prev.title}
          </span>
        </AppLink>
      ) : (
        <span />
      )}

      {next && (
        <AppLink
          href={`/docs/${next.slug}`}
          className="group rounded-xl border border-line bg-surface p-5 text-right transition-colors hover:border-line-strong sm:col-start-2"
        >
          <span className="label-mono flex items-center justify-end gap-2">
            Next
            <ArrowRight className="size-3" />
          </span>
          <span className="mt-2 block font-display text-[1.0625rem] text-ink group-hover:text-olive">
            {next.title}
          </span>
        </AppLink>
      )}
    </nav>
  )
}

export default function Docs() {
  const { slug } = useParams()
  const page = flatDocs.find((p) => p.slug === slug)

  useEffect(() => {
    if (page) document.title = `${page.title} | ${brand.name} Docs`
  }, [page])

  // Bare /docs, or an unknown slug, lands on the first page.
  if (!slug || !page) return <Navigate to={`/docs/${flatDocs[0].slug}`} replace />

  return (
    <div className="grain min-h-dvh bg-canvas">
      <SlimHeader />

      <div className="shell grid gap-12 py-12 md:py-16 lg:grid-cols-[16rem_1fr] lg:gap-16">
        {/* Sidebar. Sticky on desktop, a plain block above the content on
            mobile so it never becomes a hidden drawer people cannot find. */}
        <aside className="lg:sticky lg:top-[6.5rem] lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6 lg:border-0 lg:bg-transparent lg:p-0">
            <Sidebar current={page.slug} />
          </div>
        </aside>

        <main id="main" className="min-w-0">
          <p className="label-mono">{docsMeta.title}</p>
          <h1 className="display mt-4 text-[2.25rem] md:text-[2.75rem]">{page.title}</h1>
          <p className="mt-4 max-w-[62ch] text-[1.0625rem] leading-[1.7] text-ink-muted">
            {page.summary}
          </p>

          <div className="mt-12">
            <Blocks blocks={page.blocks} />
          </div>

          <PrevNext page={page} />
        </main>
      </div>

      <Footer />
    </div>
  )
}
