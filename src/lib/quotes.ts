/* ============================================================================
 * Live market data.
 *
 * Provider is Twelve Data, chosen because its free tier serves both `/quote`
 * and `/time_series` (Finnhub moved candles behind a paid plan), and because it
 * sends permissive CORS headers so the browser can call it directly.
 *
 * ---------------------------------------------------------------------------
 * SECURITY: a key in `VITE_*` is compiled into the client bundle and is public.
 * That is acceptable for a rate-limited, read-only market-data key on a
 * marketing page, and it is NOT acceptable for anything else. For production,
 * put a one-line serverless function in front of this and point
 * VITE_QUOTES_ENDPOINT at it so the key stays server-side.
 * ---------------------------------------------------------------------------
 *
 * Failure policy: every path degrades to the seed values in content.ts. A
 * marketing page must never render an error state or an empty price.
 * ========================================================================= */

export type Quote = {
  symbol: string
  /** Formatted to 2dp, no currency symbol. */
  price: string
  /** Signed percent change, e.g. "+1.24%". */
  change: string
  direction: 'up' | 'down'
}

export type Series = {
  symbol: string
  /** Oldest to newest close prices. */
  values: number[]
  /** Month labels sampled across the range. */
  axis: string[]
}

const KEY = import.meta.env.VITE_TWELVEDATA_KEY as string | undefined
/** Optional proxy. When set, the key is never shipped to the browser. */
const PROXY = import.meta.env.VITE_QUOTES_ENDPOINT as string | undefined

const BASE = PROXY || 'https://api.twelvedata.com'
const CACHE_TTL_MS = 60_000
const CACHE_PREFIX = 'veyl:quotes:'

export const isConfigured = Boolean(KEY || PROXY)

/* ------------------------------------------------------------------ cache -- */

function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { t, v } = JSON.parse(raw) as { t: number; v: T }
    if (Date.now() - t > CACHE_TTL_MS) return null
    return v
  } catch {
    return null
  }
}

function writeCache(key: string, value: unknown) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v: value }))
  } catch {
    /* private mode, quota, disabled storage. Not worth surfacing. */
  }
}

/* ----------------------------------------------------------------- helpers -- */

function url(path: string, params: Record<string, string>) {
  const u = new URL(`${BASE}/${path}`)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  if (KEY && !PROXY) u.searchParams.set('apikey', KEY)
  return u.toString()
}

async function getJson(target: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(target, { signal })
  if (!res.ok) throw new Error(`quotes: HTTP ${res.status}`)
  return res.json()
}

function pct(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00%'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function money(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

/** Twelve Data returns a bare object for one symbol and a keyed map for many. */
function normaliseQuote(raw: Record<string, unknown>, symbol: string): Quote | null {
  if (!raw || raw.status === 'error' || raw.close == null) return null
  const changePct = Number(raw.percent_change)
  return {
    symbol,
    price: money(raw.close),
    change: pct(raw.percent_change),
    direction: Number.isFinite(changePct) && changePct < 0 ? 'down' : 'up',
  }
}

/* -------------------------------------------------------------------- api -- */

/**
 * Batched quote lookup. One request covers every symbol, which keeps the free
 * tier's daily budget intact. Resolves to a partial map: callers merge over
 * their seed values rather than expecting every symbol back.
 */
export async function fetchQuotes(
  symbols: string[],
  signal?: AbortSignal,
): Promise<Record<string, Quote>> {
  if (!isConfigured || symbols.length === 0) return {}

  const cacheKey = `q:${symbols.join(',')}`
  const cached = readCache<Record<string, Quote>>(cacheKey)
  if (cached) return cached

  const data = (await getJson(url('quote', { symbol: symbols.join(',') }), signal)) as Record<
    string,
    Record<string, unknown>
  >

  const out: Record<string, Quote> = {}
  if (symbols.length === 1) {
    const q = normaliseQuote(data as Record<string, unknown>, symbols[0])
    if (q) out[symbols[0]] = q
  } else {
    for (const symbol of symbols) {
      const q = normaliseQuote(data?.[symbol], symbol)
      if (q) out[symbol] = q
    }
  }

  if (Object.keys(out).length) writeCache(cacheKey, out)
  return out
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Daily closes for the hero sparkline, oldest first. */
export async function fetchSeries(
  symbol: string,
  points = 30,
  signal?: AbortSignal,
): Promise<Series | null> {
  if (!isConfigured) return null

  const cacheKey = `s:${symbol}:${points}`
  const cached = readCache<Series>(cacheKey)
  if (cached) return cached

  const data = (await getJson(
    url('time_series', { symbol, interval: '1day', outputsize: String(points) }),
    signal,
  )) as { status?: string; values?: Array<{ datetime: string; close: string }> }

  if (data?.status === 'error' || !Array.isArray(data?.values) || data.values.length < 2) {
    return null
  }

  // Twelve Data returns newest first.
  const rows = [...data.values].reverse()
  const values = rows.map((r) => Number(r.close)).filter(Number.isFinite)
  if (values.length < 2) return null

  // Sample five evenly spaced month labels across the window.
  const axis: string[] = []
  for (let i = 0; i < 5; i++) {
    const row = rows[Math.round((i / 4) * (rows.length - 1))]
    const month = MONTHS[new Date(row.datetime).getMonth()]
    if (month && axis[axis.length - 1] !== month) axis.push(month)
  }

  const series: Series = { symbol, values, axis: axis.length ? axis : MONTHS.slice(0, 5) }
  writeCache(cacheKey, series)
  return series
}
