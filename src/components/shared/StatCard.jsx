/**
 * StatCard — small metric tile, theme-aware.
 */
export function StatCard({ label, value, hint, valueColor }) {
  return (
    <div
      className="rounded-[12px] p-3.5 flex flex-col gap-1.5 min-h-[84px] justify-center"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <span className="label-xs">{label}</span>
      <span
        className="font-mono text-[17px] font-bold tracking-tight leading-none"
        style={{ color: valueColor || 'var(--text)' }}
      >
        {value}
      </span>
      {hint && (
        <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{hint}</span>
      )}
    </div>
  )
}
