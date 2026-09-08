import { useEffect, useMemo, useRef } from 'react'

import { cn } from '@/lib/utils'

/** Base64-ish alphabet. Reads as ciphertext rather than as "matrix rain". */
const GLYPHS = 'ABCDEFabcdef0123456789+/='

/** Deterministic PRNG (mulberry32) so the initial field is identical on every
 *  load. Without this the first paint differs from run to run, which shows up
 *  as flicker during hot reload and makes visual diffs useless. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Decorative field of scrambling ciphertext glyphs.
 *
 * The point is narrative, not ornamental: values are visibly sealed rather than
 * readable. Every so often one cell flashes olive and settles: a figure being
 * encrypted.
 *
 * Cost control:
 *  - The grid is built once. Updates mutate `textContent` on a handful of
 *    existing nodes, so React never re-renders and layout never reflows.
 *  - Driven by rAF (auto-pauses on a hidden tab) and throttled to ~9fps, which
 *    is what makes it read as discrete flips instead of noise.
 *  - An IntersectionObserver stops the loop once the hero scrolls away.
 *  - Skipped entirely under `prefers-reduced-motion`; the static field remains.
 */
export function CipherField({
  className,
  cols = 30,
  rows = 16,
}: {
  className?: string
  cols?: number
  rows?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const cells = useMemo(() => {
    const rand = mulberry32(0x5e41ed)
    return Array.from({ length: cols * rows }, () => GLYPHS[(rand() * GLYPHS.length) | 0])
  }, [cols, rows])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const nodes = Array.from(el.children) as HTMLElement[]
    if (!nodes.length) return

    const pending = new Set<ReturnType<typeof setTimeout>>()
    let raf = 0
    let last = 0
    let visible = true

    const pick = () => nodes[(Math.random() * nodes.length) | 0]
    const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || t - last < 110) return
      last = t

      // Routine scramble.
      for (let i = 0; i < 9; i++) pick().textContent = glyph()

      // Occasionally: a value gets sealed. Flash olive, then settle back.
      if (Math.random() < 0.32) {
        const node = pick()
        node.dataset.sealing = 'true'
        const id = setTimeout(() => {
          node.textContent = glyph()
          delete node.dataset.sealing
          pending.delete(id)
        }, 520)
        pending.add(id)
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(el)

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      pending.forEach(clearTimeout)
    }
  }, [cells.length])

  return (
    <div
      aria-hidden
      className={cn('cipher-field pointer-events-none absolute select-none', className)}
      style={{ ['--cipher-cols' as string]: cols }}
    >
      <div ref={ref} className="cipher-grid">
        {cells.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
    </div>
  )
}
