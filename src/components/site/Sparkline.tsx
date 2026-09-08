import { useId } from 'react'

import { cn } from '@/lib/utils'

/**
 * Diagrammatic price line. Technical rather than decorative: hairline grid,
 * dotted baseline, a marked last point. Drawn as inline SVG so it inherits the
 * olive token and stays crisp at any size.
 */
export function Sparkline({
  data,
  className,
  height = 132,
  showGrid = true,
  direction = 'up',
}: {
  data: number[]
  className?: string
  height?: number
  showGrid?: boolean
  direction?: 'up' | 'down'
}) {
  const uid = useId().replace(/:/g, '')
  const stroke = direction === 'down' ? 'var(--color-down)' : 'var(--color-olive)'
  const w = 320
  const h = height
  const pad = 6

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / span) * (h - pad * 2)
    return [x, y] as const
  })

  // Catmull-Rom → cubic bezier for a smooth but honest curve.
  const line = pts.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`
    const prev = arr[i - 1]
    const prev2 = arr[i - 2] ?? prev
    const next = arr[i + 1] ?? p
    const c1x = prev[0] + (p[0] - prev2[0]) / 6
    const c1y = prev[1] + (p[1] - prev2[1]) / 6
    const c2x = p[0] - (next[0] - prev[0]) / 6
    const c2y = p[1] - (next[1] - prev[1]) / 6
    return `${acc} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p[0]} ${p[1]}`
  }, '')

  const area = `${line} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`
  const last = pts[pts.length - 1]

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn('w-full', className)}
      preserveAspectRatio="none"
      role="img"
      aria-label="Illustrative price trend"
    >
      <defs>
        <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showGrid &&
        [0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={w}
            y1={h * f}
            y2={h * f}
            stroke="var(--color-line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

      <path d={area} fill={`url(#fill-${uid})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Marked terminal point + dotted drop line */}
      <line
        x1={last[0]}
        x2={last[0]}
        y1={last[1]}
        y2={h}
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="2 3"
        strokeOpacity="0.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--color-canvas)" />
      <circle
        cx={last[0]}
        cy={last[1]}
        r="3.5"
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
