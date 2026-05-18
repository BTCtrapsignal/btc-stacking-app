/**
 * SectionCard — themed wrapper card with optional title + action.
 * Props: title, action (ReactNode), children, className
 */
export function SectionCard({ title, action, children, className = '' }) {
  return (
    <div
      className={`rounded-[16px] p-[18px] ${className}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3
              className="text-[15px] font-bold tracking-tight"
              style={{ color: 'var(--text)' }}
            >
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
