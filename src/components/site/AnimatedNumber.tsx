import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * A number that counts to its value instead of snapping to it.
 *
 * First paint runs 0 to the seed value; when live data lands it tweens from
 * whatever is currently on screen to the new figure, so a quote refresh reads
 * as movement rather than as a jump.
 *
 * Notes:
 *  - useLayoutEffect, not useEffect: the starting value is written before the
 *    browser paints, so the final figure never flashes first.
 *  - The element renders the resolved value as its JSX children, which is what
 *    a crawler or a no-JS visitor sees.
 *  - Callers should pair this with `tabular-nums` so digits do not reflow
 *    while counting.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  duration,
}: {
  /** Target as a string, so callers can pass API values straight through. */
  value: string
  /** Renders a tweened number into display text. */
  format: (n: number) => string
  className?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  /** Last value actually shown, so updates tween from screen state. */
  const shown = useRef(0)
  const first = useRef(true)

  useLayoutEffect(() => {
    const el = ref.current
    const target = Number.parseFloat(value)
    if (!el || !Number.isFinite(target)) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.textContent = format(target)
      shown.current = target
      first.current = false
      return
    }

    const from = first.current ? 0 : shown.current
    // A first count-in earns a longer run; a refresh is a small delta and
    // should settle quickly.
    const dur = duration ?? (first.current ? 1.1 : 0.5)

    const proxy = { n: from }
    el.textContent = format(from)

    const tween = gsap.to(proxy, {
      n: target,
      duration: dur,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = format(proxy.n)
      },
      onComplete: () => {
        el.textContent = format(target)
        shown.current = target
      },
    })

    first.current = false
    return () => {
      tween.kill()
    }
  }, [value, format, duration])

  return (
    <span ref={ref} className={className}>
      {format(Number.parseFloat(value) || 0)}
    </span>
  )
}

/* ----------------------------------------------------------- formatters -- */

/** 103.62 -> "103.62". Grouped so large caps stay readable. */
export const asPrice = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 11.54 -> "+11.54%", -1.68 -> "-1.68%". */
export const asPercent = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
