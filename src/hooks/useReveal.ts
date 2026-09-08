import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Marks the document as motion-capable so `[data-reveal]` elements can start
 * hidden. Without JS (or with reduced motion) the CSS keeps them visible, so
 * content is never invisible-by-default for crawlers or assistive tech.
 */
function armMotion() {
  if (typeof document === 'undefined') return false
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return false
  document.documentElement.classList.add('js-motion')
  return true
}

/**
 * Scroll reveal. Standard tier from the motion library:
 * opacity 0 → 1, y 24 → 0, 0.5s power2.out, stagger 0.08, ScrollTrigger at
 * `top 85%`, scoped to the section container so it never re-scans the page.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: { y?: number; stagger?: number; start?: string; delay?: number } = {},
) {
  const scope = useRef<T>(null)

  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      if (!targets.length) return

      const mm = gsap.matchMedia()

      // Reduced motion: render the final readable state immediately.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: 'all' })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        armMotion()
        gsap.fromTo(
          targets,
          { opacity: 0, y: options.y ?? 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            delay: options.delay ?? 0,
            ease: 'power2.out',
            stagger: options.stagger ?? 0.08,
            scrollTrigger: {
              trigger: scope.current,
              start: options.start ?? 'top 85%',
              once: true,
            },
          },
        )
      })

      return () => mm.revert()
    },
    { scope },
  )

  return scope
}

/**
 * Hero variant. Fires on load rather than scroll, with a slightly longer
 * throw. Word-level stagger is done with plain spans (no SplitText license
 * needed) by the Hero component itself.
 */
export function useHeroIntro<T extends HTMLElement = HTMLDivElement>() {
  const scope = useRef<T>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-reveal], [data-word]', { opacity: 1, y: 0, clearProps: 'all' })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        armMotion()
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

        tl.fromTo(
          '[data-word]',
          { opacity: 0, y: '0.5em' },
          { opacity: 1, y: 0, duration: 0.85, stagger: 0.035 },
          0.05,
        ).fromTo(
          '[data-reveal]',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 },
          0.28,
        )
      })

      return () => mm.revert()
    },
    { scope },
  )

  return scope
}
