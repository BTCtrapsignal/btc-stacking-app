/**
 * MiniChart — lightweight SVG area/line chart.
 * Theme-aware: reads CSS variables for axis/grid colors.
 */
import { useMemo } from 'react'

export function MiniChart({ points = [], goalY, currency = false, pillText, height = 160 }) {
  const W = 320, H = height
  const P = { l: 44, r: 12, t: 14, b: 24 }

  const d = useMemo(() => {
    if (!points.length) return null
    const xs = points.map(p => p.x), ys = points.map(p => p.y)
    const maxX  = Math.max(...xs, 1)
    const minY  = Math.min(...ys, goalY ?? Infinity, 0)
    const maxY  = Math.max(...ys, goalY ?? 0, 1)
    const rangeY = maxY === minY ? 1 : maxY - minY
    const cx = v => P.l + (v / maxX) * (W - P.l - P.r)
    const cy = v => H - P.b - ((v - minY) / rangeY) * (H - P.t - P.b)
    const isNeg   = points.at(-1).y < 0
    const lineClr = isNeg ? '#ef4444' : '#22c55e'
    const areaClr = isNeg ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'
    const linePts = points.map((p, i) => `${i ? 'L' : 'M'}${cx(p.x).toFixed(1)},${cy(p.y).toFixed(1)}`).join(' ')
    const baseY   = cy(Math.max(0, minY))
    const areaPts = `M${cx(points[0].x)},${baseY} ` +
      points.map(p => `L${cx(p.x).toFixed(1)},${cy(p.y).toFixed(1)}`).join(' ') +
      ` L${cx(points.at(-1).x)},${baseY}Z`
    const ticks  = [minY, (minY + maxY) / 2, maxY]
    const ex = cx(points.at(-1).x), ey = cy(points.at(-1).y)
    const pillW = 68, pillH = 18
    const pillX = Math.min(Math.max(ex - pillW / 2, P.l), W - P.r - pillW)
    const pillY = Math.max(P.t, ey - 24)
    const xLabels = [points[0], points[Math.floor(points.length / 2)], points.at(-1)]
    return { cx, cy, isNeg, lineClr, areaClr, linePts, areaPts,
             ticks, ex, ey, pillW, pillH, pillX, pillY, xLabels, minY, maxY, currency }
  }, [points, goalY, currency, H])

  if (!d) return null

  function fmtTick(v) {
    if (!currency) return v.toFixed(2)
    return (v < 0 ? '-' : '') + '$' + Math.abs(Math.round(v))
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ display: 'block', overflow: 'visible' }}>
      {/* Y grid + labels */}
      {d.ticks.map((v, i) => (
        <g key={i}>
          <line x1={P.l} y1={d.cy(v).toFixed(1)} x2={W - P.r} y2={d.cy(v).toFixed(1)}
                stroke="var(--border)" strokeWidth="1" />
          <text x="2" y={d.cy(v) + 4} fill="var(--muted)" fontSize="9.5"
                fontFamily="'Space Mono', monospace">{fmtTick(v)}</text>
        </g>
      ))}

      {/* Goal line */}
      {goalY != null && (
        <line x1={P.l} y1={d.cy(goalY).toFixed(1)} x2={W - P.r} y2={d.cy(goalY).toFixed(1)}
              stroke="#f7931a" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" />
      )}

      {/* Area */}
      <path d={d.areaPts} fill={d.areaClr} />

      {/* Line */}
      <path d={d.linePts} fill="none" stroke={d.lineClr} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />

      {/* End dot */}
      <circle cx={d.ex} cy={d.ey} r="4" fill={d.lineClr} />

      {/* Pill label */}
      {pillText && (
        <>
          <rect x={d.pillX} y={d.pillY} width={d.pillW} height={d.pillH}
                rx="6" fill={d.lineClr} />
          <text x={d.pillX + d.pillW / 2} y={d.pillY + 12.5}
                fill="white" fontSize="9" fontWeight="700"
                fontFamily="'Space Mono', monospace" textAnchor="middle">
            {pillText}
          </text>
        </>
      )}

      {/* X labels */}
      {d.xLabels.map((p, i) => (
        <text key={i} x={d.cx(p.x).toFixed(1)} y={H - 4}
              fill="var(--muted)" fontSize="9"
              fontFamily="'Space Mono', monospace" textAnchor="middle">
          {p.label}
        </text>
      ))}
    </svg>
  )
}
