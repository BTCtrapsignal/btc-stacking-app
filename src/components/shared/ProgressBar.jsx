/**
 * ProgressBar — animated fill, theme-aware track.
 * color: 'default' | 'orange' | 'green' | 'red'
 */
const FILLS = {
  default: 'var(--text)',
  orange:  '#f7931a',
  green:   '#22c55e',
  red:     '#ef4444',
}

export function ProgressBar({ pct = 0, color = 'default', className = '' }) {
  const width = Math.min(100, Math.max(0, pct))
  return (
    <div
      className={`h-1.5 rounded-full overflow-hidden ${className}`}
      style={{ background: 'var(--border)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, minWidth: width > 0 ? '6px' : '0', background: FILLS[color] || FILLS.default }}
      />
    </div>
  )
}
