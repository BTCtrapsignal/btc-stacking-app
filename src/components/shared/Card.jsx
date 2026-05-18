/**
 * Card + CardHead — theme-aware via CSS variables.
 */
export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[16px] p-[18px] ${className}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {children}
    </div>
  )
}

export function CardHead({ title, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3
        className="text-[15px] font-bold tracking-tight"
        style={{ color: 'var(--text)' }}
      >
        {title}
      </h3>
      {right && <div>{right}</div>}
    </div>
  )
}
