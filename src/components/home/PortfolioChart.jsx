import { useState, useMemo } from 'react'

const FILTERS = ['1W', '1M', '6M', '1Y', 'ALL']

function generateMockPoints(entries, price, usdthb, range) {
  const now = Date.now()
  const MS = { '1W': 7, '1M': 30, '6M': 180, '1Y': 365, 'ALL': 730 }
  const days = MS[range] || 30
  const cutoff = now - days * 86400000

  const allEntries = [...entries]
    .filter(e => e.date && new Date(e.date).getTime() >= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  if (allEntries.length < 2) {
    const pts = []
    for (let i = 0; i <= 12; i++) {
      const t = cutoff + (i / 12) * (now - cutoff)
      const priceFactor = 1 + (i / 12) * 0.08 * (Math.random() > 0.4 ? 1 : -0.3)
      const btcAccum = allEntries.reduce((s, e) => s + (+e.btcQty || 0), 0) * (i / 12 + 0.1)
      pts.push({ x: i, y: btcAccum * price * priceFactor * usdthb, label: '' })
    }
    return pts
  }

  let cumBtc = 0
  const pts = allEntries.map((e, i) => {
    cumBtc += +e.btcQty || 0
    return { x: i, y: Math.max(0, cumBtc * price * usdthb), label: '' }
  })

  if (pts.length > 0) {
    const first = pts[0]
    const last = pts[pts.length - 1]
    const labelDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    first.label = labelDate(new Date(allEntries[0].date))
    last.label = 'Now'
    if (pts.length > 2) pts[Math.floor(pts.length / 2)].label = labelDate(new Date(allEntries[Math.floor(allEntries.length / 2)].date))
  }

  return pts
}

export function PortfolioChart({ dca, dip, price, usdthb, totalBtc }) {
  const [active, setActive] = useState('1M')

  const allEntries = useMemo(() => [...dca, ...dip].filter(e => e.btcQty > 0), [dca, dip])

  const points = useMemo(
    () => generateMockPoints(allEntries, price, usdthb, active),
    [allEntries, price, usdthb, active]
  )

  const currentVal = totalBtc * price * usdthb
  const startVal   = points.length > 0 ? points[0].y : currentVal
  const pnlAbs     = currentVal - startVal
  const pnlPct     = startVal > 0 ? (pnlAbs / startVal) * 100 : 0
  const isPositive = pnlAbs >= 0

  const W = 320, H = 120
  const P = { l: 4, r: 4, t: 10, b: 8 }

  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const maxX = Math.max(...xs, 1)
  const minY = Math.min(...ys, 0)
  const maxY = Math.max(...ys, 1)
  const rY   = maxY === minY ? 1 : maxY - minY
  const cx   = v => P.l + (v / maxX) * (W - P.l - P.r)
  const cy   = v => H - P.b - ((v - minY) / rY) * (H - P.t - P.b)

  const lineColor = isPositive ? '#22c55e' : '#ef4444'
  const areaColor = isPositive ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)'

  const linePath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${cx(p.x).toFixed(1)},${cy(p.y).toFixed(1)}`
  ).join(' ')

  const baseY = cy(Math.max(0, minY))
  const areaPath = points.length
    ? `M${cx(points[0].x)},${baseY} ` +
      points.map(p => `L${cx(p.x).toFixed(1)},${cy(p.y).toFixed(1)}`).join(' ') +
      ` L${cx(points[points.length - 1].x)},${baseY}Z`
    : ''

  const fmtThb = v => {
    const n = Math.abs(v)
    if (n >= 1e6) return `฿${(n / 1e6).toFixed(2)}M`
    if (n >= 1e3) return `฿${(n / 1e3).toFixed(1)}k`
    return `฿${n.toFixed(0)}`
  }

  return (
    <div
      className="rounded-[16px] p-[18px]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="label-xs">PORTFOLIO VALUE (THB)</span>
          <p
            className="font-mono text-[22px] font-bold mt-1 leading-none"
            style={{ letterSpacing: '-0.04em', color: 'var(--text)' }}
          >
            {fmtThb(currentVal)}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="font-mono text-[12px] font-bold"
              style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
            >
              {isPositive ? '+' : ''}{fmtThb(pnlAbs)}
            </span>
            <span
              className="text-[11px] font-semibold px-1.5 py-0.5 rounded-[4px]"
              style={{
                background: isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: isPositive ? '#22c55e' : '#ef4444',
              }}
            >
              {isPositive ? '+' : ''}{pnlPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Time filters */}
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="text-[10px] font-bold px-2 py-1 rounded-[6px] transition-colors"
              style={{
                background: active === f ? 'var(--text)' : 'transparent',
                color: active === f ? 'var(--card)' : 'var(--muted)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ display: 'block', height: 120 }}
        preserveAspectRatio="none"
      >
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((t, i) => {
          const yv = minY + t * rY
          return (
            <line
              key={i}
              x1={P.l} y1={cy(yv).toFixed(1)}
              x2={W - P.r} y2={cy(yv).toFixed(1)}
              stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3"
            />
          )
        })}

        {/* Area */}
        {areaPath && <path d={areaPath} fill={areaColor} />}

        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* End dot */}
        {points.length > 0 && (
          <circle
            cx={cx(points[points.length - 1].x)}
            cy={cy(points[points.length - 1].y)}
            r="3.5"
            fill={lineColor}
          />
        )}
      </svg>
    </div>
  )
}
