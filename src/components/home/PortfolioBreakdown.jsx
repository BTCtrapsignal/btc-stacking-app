import { fmtBtc, fmtUsdCompact, fmtThbCompact, fmtPct } from '../../utils/format'

function RingProgress({ pct, color, size = 40 }) {
  const r = 14
  const circ = 2 * Math.PI * r
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * circ

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx="18" cy="18" r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth="4"
      />
      <circle
        cx="18" cy="18" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

function BreakdownCard({ title, btc, price, usdthb, totalBtc, color, badgeColor }) {
  const usdVal  = btc * price
  const thbVal  = usdVal * usdthb
  const sharePct = totalBtc > 0 ? (btc / totalBtc) * 100 : 0

  return (
    <div
      className="flex-1 rounded-[14px] p-4"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <span className="label-xs">{title}</span>
        <RingProgress pct={sharePct} color={color} size={36} />
      </div>

      {/* BTC amount */}
      <p
        className="font-mono font-bold leading-none"
        style={{ fontSize: 20, letterSpacing: '-0.04em', color: 'var(--text)' }}
      >
        {fmtBtc(btc, 4)}
      </p>
      <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>BTC</p>

      {/* Fiat values */}
      <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="font-mono text-[12px] font-semibold" style={{ color: 'var(--text2)' }}>
          {fmtUsdCompact(usdVal)}
        </p>
        <p className="font-mono text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
          {fmtThbCompact(thbVal)}
        </p>
      </div>

      {/* Share badge */}
      <div className="mt-2">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-chip"
          style={{ background: `${color}18`, color }}
        >
          {fmtPct(sharePct, 1)} of total
        </span>
      </div>
    </div>
  )
}

export function PortfolioBreakdown({ dcaBtc, dipBtc, price, usdthb }) {
  const totalBtc = dcaBtc + dipBtc

  return (
    <div className="flex gap-2.5">
      <BreakdownCard
        title="DCA PORTFOLIO"
        btc={dcaBtc}
        price={price}
        usdthb={usdthb}
        totalBtc={totalBtc}
        color="#f7931a"
      />
      <BreakdownCard
        title="DIP RESERVE"
        btc={dipBtc}
        price={price}
        usdthb={usdthb}
        totalBtc={totalBtc}
        color="#60a5fa"
      />
    </div>
  )
}
