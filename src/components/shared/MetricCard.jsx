/**
 * MetricCard — reusable stat/metric tile.
 * Props:
 *   label      string  — top eyebrow label
 *   value      string  — main large value
 *   subtitle   string  — bottom hint
 *   accent     string  — CSS color for value (default: var(--text))
 *   center     bool    — center align everything (for hero numbers)
 *   size       'sm'|'md'|'lg'  — value font size
 */
export function MetricCard({ label, value, subtitle, accent, center = false, size = 'md' }) {
  const SIZE = { sm: '14px', md: '17px', lg: '22px' }
  const align = center ? 'items-center text-center' : 'items-start'

  return (
    <div
      className={`rounded-[12px] p-3.5 flex flex-col gap-1 ${align}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {label && <span className="label-xs">{label}</span>}
      <span
        className="font-mono font-bold leading-tight"
        style={{
          fontSize: SIZE[size] || SIZE.md,
          letterSpacing: '-0.03em',
          color: accent || 'var(--text)',
        }}
      >
        {value}
      </span>
      {subtitle && (
        <span
          className="text-[11px]"
          style={{ color: 'var(--muted)' }}
        >
          {subtitle}
        </span>
      )}
    </div>
  )
}
