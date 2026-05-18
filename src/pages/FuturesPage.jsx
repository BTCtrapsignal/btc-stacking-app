/**
 * FuturesPage — futures journal, theme-aware.
 */
import { useMemo } from 'react'
import { Card, CardHead } from '../components/shared/Card'
import { StatCard }       from '../components/shared/StatCard'
import { EntryRow }       from '../components/shared/EntryRow'
import { MiniChart }      from '../components/shared/MiniChart'
import { computeMetrics } from '../utils/metrics'
import { fmtPct, fmtDate, sortDesc } from '../utils/format'

const $$ = (v, d = 2) => {
  const n = Math.abs(Number(v) || 0), s = Number(v) < 0 ? '-' : ''
  return `${s}$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

export function FuturesPage({ state }) {
  const m = useMemo(() => computeMetrics(state), [state])

  const chartPts = useMemo(() => {
    let acc = 0
    return [...state.futures]
      .sort((a, b) => sortDesc(b, a, 'dateClose'))
      .map((x, i) => { acc += +x.pnlUsdt || 0; return { x: i + 1, y: acc, label: String(i + 1) } })
  }, [state.futures])

  const cumPnl = chartPts.at(-1)?.y ?? 0

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Total PnL" value={$$(m.futPnl)}
                  valueColor={m.futPnl >= 0 ? '#22c55e' : '#ef4444'} hint="cumulative" />
        <StatCard label="Win Rate"  value={fmtPct(m.winRate, 0)}
                  valueColor={m.winRate >= 50 ? '#22c55e' : '#ef4444'}
                  hint={`${m.wins}/${state.futures.length} wins`} />
        <StatCard label="Trades"    value={String(state.futures.length)} hint="all time" />
      </div>

      <Card>
        <CardHead title="Cumulative PnL" />
        {chartPts.length > 0
          ? <MiniChart points={chartPts} currency pillText={$$(cumPnl)} />
          : <p className="text-[13px] py-6 text-center" style={{ color: 'var(--muted)' }}>No trades yet.</p>
        }
      </Card>

      <Card>
        <CardHead
          title="Trade Log"
          right={<span className="label-xs">{state.futures.length} trades</span>}
        />
        <div className="[&>*:last-child]:border-b-0">
          {[...state.futures]
            .sort((a, b) => sortDesc(a, b, 'dateClose'))
            .slice(0, 20)
            .map((x, i) => (
              <EntryRow
                key={i} kind="futures" badge="FUT"
                title={fmtDate(x.dateClose)}
                sub={`${x.side} ${x.leverage || ''} · ${x.mode}${x.mistakeTag ? ' · ' + x.mistakeTag : ''}`}
                val={$$(x.pnlUsdt)}
                subVal={x.roi != null ? fmtPct(x.roi, 2) : ''}
                valClass={x.pnlUsdt >= 0 ? 'positive' : 'negative'}
              />
            ))}
          {!state.futures.length && (
            <p className="text-[13px] py-4 text-center" style={{ color: 'var(--muted)' }}>No trades yet.</p>
          )}
        </div>
      </Card>
    </>
  )
}
