import { useEffect, useState } from 'react'

import { fetchQuotes, fetchSeries, isConfigured, type Quote, type Series } from '@/lib/quotes'

/** How often to refresh while the tab is in the foreground. */
const REFRESH_MS = 60_000

/**
 * Live quotes for a fixed symbol list, refreshed while the tab is visible.
 *
 * Returns `{}` until data resolves and, permanently, if the API is
 * unconfigured or failing. Callers merge this over their seed values so the UI
 * always has something to render.
 */
export function useQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [live, setLive] = useState(false)

  // Symbol list is static per call site; joining keeps the effect from
  // re-running on every render because the array identity changed.
  const key = symbols.join(',')

  useEffect(() => {
    if (!isConfigured) return
    const list = key.split(',').filter(Boolean)
    if (!list.length) return

    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    let cancelled = false

    const run = async () => {
      try {
        const next = await fetchQuotes(list, controller.signal)
        if (cancelled || !Object.keys(next).length) return
        setQuotes((prev) => ({ ...prev, ...next }))
        setLive(true)
      } catch {
        // Silent by design: the seed values stay on screen.
      } finally {
        if (!cancelled) timer = setTimeout(run, REFRESH_MS)
      }
    }

    // Pause polling on a hidden tab so a backgrounded page does not burn quota.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer)
        run()
      }
    }

    run()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [key])

  return { quotes, live }
}

/** Daily close series for one symbol, for the hero sparkline. */
export function useSeries(symbol: string) {
  const [series, setSeries] = useState<Series | null>(null)

  useEffect(() => {
    if (!isConfigured || !symbol) return
    const controller = new AbortController()
    let cancelled = false

    fetchSeries(symbol, 30, controller.signal)
      .then((s) => {
        if (!cancelled && s) setSeries(s)
      })
      .catch(() => {
        /* seed series stays */
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [symbol])

  return series
}
