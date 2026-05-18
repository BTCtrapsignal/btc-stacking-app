/**
 * EntryRow — single row in an activity/entry list.
 * Theme-aware via CSS variables.
 */
const BADGE = {
  dca:     { bg: 'rgba(247,147,26,0.12)', color: '#f7931a', border: 'rgba(247,147,26,0.2)' },
  futures: { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: 'rgba(34,197,94,0.2)' },
  dip:     { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  grid:    { bg: 'rgba(167,139,250,0.12)',color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
  default: { bg: 'var(--surface)',         color: 'var(--muted)', border: 'var(--border)' },
}

export function EntryRow({ kind = 'default', badge, title, sub, val, subVal, valClass = '' }) {
  const bs = BADGE[kind] || BADGE.default
  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className="shrink-0 w-8 h-8 rounded-[8px] grid place-items-center
                     text-[9px] font-bold tracking-wide"
          style={{ background: bs.bg, color: bs.color, border: `1px solid ${bs.border}` }}
        >
          {badge}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>{title}</p>
          <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>{sub}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className={`block font-mono text-[13px] font-bold tracking-tight ${valClass}`}>{val}</span>
        {subVal && (
          <span className="block font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{subVal}</span>
        )}
      </div>
    </div>
  )
}
