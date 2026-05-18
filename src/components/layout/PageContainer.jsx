/**
 * PageContainer — shared mobile page wrapper.
 * Provides correct scrollable area with no dead bottom space.
 * pb accounts for bottom nav height (~68px) + safe area.
 */
export function PageContainer({ children }) {
  return (
    <main
      className="flex-1 overflow-y-auto px-3.5 pt-3"
      style={{ paddingBottom: 'calc(68px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex flex-col gap-3 pb-3">
        {children}
      </div>
    </main>
  )
}
