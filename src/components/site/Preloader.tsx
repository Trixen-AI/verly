import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { VeylMark } from '@/components/site/VeylMark'
import { brand } from '@/config/brand'

const GLYPHS = 'ABCDEFabcdef0123456789+/='

/**
 * The line that gets encrypted on screen. Deliberately a real-looking holding
 * and price: the point of the sequence is watching a readable position become
 * unreadable, which is the whole product in three seconds.
 */
const PLAINTEXT = '1,240 AMZN · $262.07'

const SESSION_KEY = 'veyl:intro-seen'

/** Once per tab. A preloader on every navigation is an obstacle, not a brand. */
function alreadySeen() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* private mode. Worst case it plays again. */
  }
}

function prefersReduced() {
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

export function Preloader() {
  // Decided once, synchronously, so the overlay never mounts when it should
  // not: no flash of a preloader on an internal navigation.
  const [active, setActive] = useState(() => !alreadySeen() && !prefersReduced())
  const scope = useRef<HTMLDivElement>(null)
  const cipherRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (!active) return

      const el = cipherRef.current
      if (!el) return

      const chars = PLAINTEXT.split('')
      // Spaces and separators stay put; encrypting them adds noise without
      // reading as encryption.
      const encryptable = chars
        .map((c, i) => (/[A-Za-z0-9.,$]/.test(c) ? i : -1))
        .filter((i) => i >= 0)

      const order = gsap.utils.shuffle([...encryptable])
      const state = [...chars]
      const write = () => {
        el.textContent = state.join('')
      }
      write()

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          markSeen()
          setActive(false)
        },
      })

      tl
        // Aperture opens.
        .from('[data-intro-mark]', { scale: 0.7, rotate: -50, opacity: 0, duration: 0.7 })
        .from('[data-intro-plain]', { y: 10, opacity: 0, duration: 0.4 }, '-=0.3')

        // Each character is sealed, one at a time, then keeps churning.
        .to(
          {},
          {
            duration: 1.0,
            ease: 'none',
            onUpdate() {
              const done = Math.floor(this.ratio() * order.length)
              for (let i = 0; i < done; i++) {
                state[order[i]] = GLYPHS[(Math.random() * GLYPHS.length) | 0]
              }
              write()
            },
          },
          '-=0.1',
        )

        // Aperture closes over the sealed value.
        .to('[data-intro-mark]', { rotate: 60, scale: 0.94, duration: 0.55 }, '-=0.35')
        .to('[data-intro-bar]', { scaleX: 1, duration: 1.5, ease: 'power1.inOut' }, 0.3)
        .from('[data-intro-word]', { y: 8, opacity: 0, duration: 0.4 }, '-=0.5')

        // Lift away.
        .to('[data-intro-inner]', { y: -12, opacity: 0, duration: 0.4 }, '+=0.25')
        .to(scope.current, { opacity: 0, duration: 0.4 }, '-=0.25')

      return () => {
        tl.kill()
      }
    },
    { scope, dependencies: [active] },
  )

  if (!active) return null

  return (
    <div
      ref={scope}
      // Decorative: the real page is already rendered underneath and is what
      // assistive tech and crawlers read.
      aria-hidden
      className="pattern-dots-fine fixed inset-0 z-[100] grid place-items-center bg-canvas"
    >
      <div data-intro-inner className="flex flex-col items-center px-6">
        <span
          data-intro-mark
          className="grid size-16 place-items-center rounded-2xl bg-olive text-canvas"
        >
          <VeylMark className="size-8" />
        </span>

        <p data-intro-plain className="mt-9 text-center">
          <span
            ref={cipherRef}
            className="font-mono text-[0.9375rem] tracking-[0.06em] text-ink sm:text-base"
          >
            {PLAINTEXT}
          </span>
        </p>

        <span
          aria-hidden
          className="mt-7 h-px w-40 overflow-hidden bg-line"
        >
          <span data-intro-bar className="block h-full w-full origin-left scale-x-0 bg-olive" />
        </span>

        <p data-intro-word className="label-mono mt-5">
          {brand.name} · sealing
        </p>
      </div>
    </div>
  )
}
