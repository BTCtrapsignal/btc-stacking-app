/**
 * AppHeader — matches screenshot exactly:
 * LEFT:  small date label  +  large page title
 * RIGHT: [BTC MARKET pill]  [+ button]  [theme toggle]
 *
 * The pill shows "BTC MARKET" eyebrow + "$75.7k · ฿2.49M"
 */
import { Plus } from 'lucide-react'
import { ThemeToggle }            from '../shared/ThemeToggle'
import { fmtUsdCompact, fmtThbCompact, todayStr } from '../../utils/format'

export function AppHeader({ settings, pageTitle, onAdd, isDark, onToggleTheme }) {
  const { currentPrice = 0, usdthb = 33 } = settings
  const thb = currentPrice * usdthb

  return (
    <header
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
      }}
      className="sticky top-0 z-50 px-4 pb-3 flex items-center justify-between gap-3"
    >
      {/* ── LEFT: date + title ── */}
      <div className="flex flex-col min-w-0">
        <span className="label-xs">{todayStr()}</span>
        <h1
          className="text-[28px] font-bold leading-none mt-0.5"
          style={{ letterSpacing: '-0.04em', color: 'var(--text)' }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* ── RIGHT: market pill + add + theme ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* BTC MARKET pill — matches screenshot: dark pill with price inside */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
          className="flex flex-col items-center rounded-[12px] px-3 py-1.5"
        >
          <span
            className="text-[8px] font-bold tracking-[0.1em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            BTC MARKET
          </span>
          <span
            className="font-mono text-[11px] font-bold whitespace-nowrap"
            style={{ color: '#f7931a' }}
          >
            {fmtUsdCompact(currentPrice)}
            <span style={{ opacity: 0.5 }}> · </span>
            <span style={{ opacity: 0.75 }}>{fmtThbCompact(thb)}</span>
          </span>
        </div>

        {/* Add entry button */}
        <button
          onClick={onAdd}
          aria-label="Add entry"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          className="w-9 h-9 rounded-full grid place-items-center
                     text-theme-secondary hover:text-theme-primary transition-colors shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>

        {/* Theme toggle */}
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
