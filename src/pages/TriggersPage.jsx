/**
 * TriggersPage — Buy the Dip 4-Layer Strategy.
 *
 * Per screenshot (Image 4):
 * - Each layer = its own card block
 * - Shows: Layer badge, description text, BUY PRICE, DROP, DEPLOY (THB), EST. BTC
 * - L3/L4 tagged as "Panic"
 * - Dip Calculator: user enters budget → auto-calc per layer
 */
import { useState, useMemo, useCallback } from 'react'
import { Card } from '../components/shared/Card'
import { computeMetrics, calcDipLayers, validateDipLayers } from '../utils/metrics'
import { fmtBtc, fmtUsdCompact, fmtThbCompact, fmtUsd, fmtThb, fmtPct } from '../utils/format'

/* ── Layer definitions ───────────────────────────────── */
const LAYERS_DEF = [
  { level: 'L1', dropPct: -10, fundSource: 'Dip',   notes: 'First dip entry',             defaultPct: 15 },
  { level: 'L2', dropPct: -20, fundSource: 'Dip',   notes: 'Lower price level',            defaultPct: 25 },
  { level: 'L3', dropPct: -30, fundSource: 'Panic', notes: 'Panic — highest allocation',   defaultPct: 40 },
  { level: 'L4', dropPct: -40, fundSource: 'Panic', notes: 'Extreme panic — reserve',      defaultPct: 20 },
]

/* Badge styles per layer */
const BADGE_STYLE = {
  L1: { bg: 'rgba(247,147,26,0.15)', color: '#f7931a', border: 'rgba(247,147,26,0.3)' },
  L2: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  L3: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)'  },
  L4: { bg: 'rgba(239,68,68,0.10)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
}

/* Card accent per layer */
const CARD_ACCENT = {
  L1: { border: 'rgba(247,147,26,0.25)', bg: 'rgba(247,147,26,0.04)' },
  L2: { border: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.04)' },
  L3: { border: 'rgba(239,68,68,0.3)',   bg: 'rgba(239,68,68,0.06)'  },
  L4: { border: 'rgba(239,68,68,0.2)',   bg: 'rgba(239,68,68,0.04)'  },
}

export function TriggersPage({ state }) {
  const m        = useMemo(() => computeMetrics(state), [state])
  const refPrice = m.price || state.settings.currentPrice || 0

  /* Calculator state */
  const [budget, setBudget]  = useState('1000')
  const [pcts, setPcts]      = useState(() => Object.fromEntries(LAYERS_DEF.map(l => [l.level, l.defaultPct])))
  const [showCalc, setShowCalc] = useState(true)

  const totalBudgetUsd = parseFloat(budget) || 0
  const layersWithPct  = LAYERS_DEF.map(l => ({ ...l, pct: pcts[l.level] ?? l.defaultPct }))
  const { valid: pctValid, sum: pctSum } = useMemo(() => validateDipLayers(layersWithPct), [pcts])

  const calcResults = useMemo(() => {
    if (!pctValid || totalBudgetUsd <= 0 || refPrice <= 0) return []
    return calcDipLayers({ totalBudgetUsd, usdthb: m.usdthb, refPrice, layers: layersWithPct })
  }, [pctValid, totalBudgetUsd, refPrice, m.usdthb, pcts])

  const setPct = useCallback((level, val) => {
    setPcts(p => ({ ...p, [level]: parseFloat(val) || 0 }))
  }, [])

  /* Avg cost vs market */
  const diff    = refPrice - m.avgCost
  const diffPct = m.avgCost > 0 ? (diff / m.avgCost) * 100 : 0
  const isUp    = diff >= 0

  return (
    <>
      {/* ── Avg Cost vs Market ─────────────────────── */}
      <Card>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <span className="label-xs">YOUR AVG COST</span>
            <p className="font-mono text-[20px] font-bold mt-1.5"
               style={{ color: 'var(--text)', letterSpacing: '-0.04em' }}>
              {fmtUsdCompact(m.avgCost)}
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-mono text-[15px] font-bold"
                  style={{ color: isUp ? '#22c55e' : '#ef4444' }}>
              {isUp ? '+' : ''}{fmtPct(diffPct)}
            </span>
            <span className="label-xs">vs market</span>
          </div>
          <div className="text-right">
            <span className="label-xs">MARKET PRICE</span>
            <p className="font-mono text-[20px] font-bold mt-1.5"
               style={{ color: 'var(--text)', letterSpacing: '-0.04em' }}>
              {fmtUsdCompact(refPrice)}
            </p>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════
          DIP BUDGET CALCULATOR
      ══════════════════════════════════════════════ */}
      <div
        className="rounded-[16px] p-[18px]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Calculator toggle */}
        <button
          onClick={() => setShowCalc(v => !v)}
          className="w-full flex items-center justify-between"
        >
          <div className="text-left">
            <h3 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>Budget Calculator</h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Enter budget → auto-calculate per layer
            </p>
          </div>
          <span className="text-[22px] leading-none ml-3" style={{ color: 'var(--muted)' }}>
            {showCalc ? '−' : '+'}
          </span>
        </button>

        {showCalc && (
          <div className="mt-4 flex flex-col gap-4">

            {/* Budget input */}
            <div>
              <label className="label-xs mb-2">TOTAL BUDGET (USD)</label>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono font-bold text-[16px]" style={{ color: 'var(--muted)' }}>$</span>
                <input
                  type="number" min="1" step="100" value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="flex-1 px-3.5 py-3 rounded-[10px] font-mono text-[18px] font-bold outline-none transition"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  placeholder="1000"
                />
                <div className="text-right shrink-0">
                  <p className="font-mono text-[12px]" style={{ color: 'var(--muted)' }}>
                    ≈ {fmtThbCompact(totalBudgetUsd * m.usdthb)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--muted)' }}>THB equiv.</p>
                </div>
              </div>
            </div>

            {/* % allocation inputs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="label-xs">% ALLOCATION PER LAYER</span>
                <span
                  className="text-[11px] font-bold font-mono"
                  style={{ color: pctValid ? '#22c55e' : '#ef4444' }}
                >
                  {pctSum.toFixed(0)}% {pctValid ? '✓' : '(must = 100%)'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {LAYERS_DEF.map(layer => {
                  const bs = BADGE_STYLE[layer.level]
                  return (
                    <div key={layer.level} className="flex items-center gap-3">
                      <span
                        className="shrink-0 text-[10px] font-bold px-2 py-1.5 rounded-chip w-[64px] text-center"
                        style={{ background: bs.bg, color: bs.color, border: `1px solid ${bs.border}` }}
                      >
                        {layer.level}
                      </span>
                      <span className="text-[12px] flex-1" style={{ color: 'var(--text2)' }}>
                        {layer.notes}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number" min="0" max="100" step="5"
                          value={pcts[layer.level] ?? layer.defaultPct}
                          onChange={e => setPct(layer.level, e.target.value)}
                          className="w-14 px-2 py-2 rounded-[8px] text-center font-mono text-[14px] font-bold outline-none"
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                          }}
                        />
                        <span className="text-[12px]" style={{ color: 'var(--muted)' }}>%</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Visual pct bar */}
              {pctSum > 0 && (
                <div className="flex h-1.5 rounded-full overflow-hidden mt-3 gap-px">
                  {LAYERS_DEF.map((l, i) => {
                    const colors = ['#f7931a', '#f59e0b', '#ef4444', 'rgba(239,68,68,0.55)']
                    const w = Math.max(0, ((pcts[l.level] ?? l.defaultPct) / Math.max(pctSum, 1)) * 100)
                    return (
                      <div key={l.level} className="rounded-full transition-all"
                           style={{ width: `${w}%`, background: colors[i] }} />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Results — only show when valid */}
            {pctValid && calcResults.length > 0 && totalBudgetUsd > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <span className="label-xs mb-3 block">RESULT PER LAYER</span>

                {/* Header row */}
                <div className="grid grid-cols-[52px_1fr_1fr_1fr_1fr] gap-x-2 mb-2 px-1">
                  {['', 'BUY PRICE', 'USD', 'THB', 'EST. BTC'].map((h, i) => (
                    <span key={i} className="label-xs text-right first:text-left">{h}</span>
                  ))}
                </div>

                {/* Data rows */}
                <div className="flex flex-col gap-1.5">
                  {calcResults.map(r => {
                    const bs = BADGE_STYLE[r.level]
                    const ca = CARD_ACCENT[r.level]
                    return (
                      <div
                        key={r.level}
                        className="grid grid-cols-[52px_1fr_1fr_1fr_1fr] items-center gap-x-2 rounded-[8px] px-1 py-2.5"
                        style={{ background: ca.bg, border: `1px solid ${ca.border}` }}
                      >
                        <span className="text-[10px] font-bold" style={{ color: bs.color }}>{r.level}</span>
                        <span className="font-mono text-[11px] font-bold text-right"
                              style={{ color: bs.color }}>
                          {fmtUsdCompact(r.buyPrice)}
                        </span>
                        <span className="font-mono text-[12px] font-semibold text-right"
                              style={{ color: 'var(--text)' }}>
                          {fmtUsdCompact(r.usdAmount)}
                        </span>
                        <span className="font-mono text-[11px] text-right"
                              style={{ color: 'var(--text2)' }}>
                          {fmtThbCompact(r.thbAmount)}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-right"
                              style={{ color: '#22c55e' }}>
                          {fmtBtc(r.btcEst, 5)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Summary */}
                <div
                  className="mt-3 p-3 rounded-[10px] grid grid-cols-3 gap-2 text-center"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div>
                    <span className="label-xs">TOTAL USD</span>
                    <p className="font-mono text-[13px] font-bold mt-1" style={{ color: 'var(--text)' }}>
                      {fmtUsdCompact(totalBudgetUsd)}
                    </p>
                  </div>
                  <div>
                    <span className="label-xs">TOTAL THB</span>
                    <p className="font-mono text-[13px] font-bold mt-1" style={{ color: 'var(--text)' }}>
                      {fmtThbCompact(totalBudgetUsd * m.usdthb)}
                    </p>
                  </div>
                  <div>
                    <span className="label-xs">EST. BTC</span>
                    <p className="font-mono text-[13px] font-bold mt-1" style={{ color: '#22c55e' }}>
                      {fmtBtc(calcResults.reduce((s, r) => s + r.btcEst, 0), 5)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation error */}
            {!pctValid && pctSum > 0 && (
              <div
                className="p-3 rounded-[10px] text-[12px] font-semibold"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                ⚠ Percentages must sum to 100%. Currently: {pctSum.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>


    </>
  )
}

/* ── Local sub-component ── */
function TrigStat({ label, value, color }) {
  return (
    <div>
      <span className="label-xs">{label}</span>
      <p
        className="font-mono text-[14px] font-bold mt-0.5"
        style={{ color: color || 'var(--text)', letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
    </div>
  )
}
