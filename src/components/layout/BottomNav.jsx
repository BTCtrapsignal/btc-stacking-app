/**
 * BottomNav — exactly 5 tabs, no FAB in middle.
 * Screenshot shows: Home | DCA | Futures | Triggers | More
 * FAB (+) is a separate floating button above nav center.
 */
import { Home, TrendingUp, DollarSign, Zap, MoreHorizontal } from 'lucide-react'

const TABS = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'dca',      label: 'DCA',      Icon: TrendingUp },
  { id: 'futures',  label: 'Futures',  Icon: DollarSign },
  { id: 'triggers', label: 'Triggers', Icon: Zap },
  { id: 'more',     label: 'More',     Icon: MoreHorizontal },
]

export function BottomNav({ active, onChange }) {
  return (
    <nav
      style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
      }}
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl"
    >
      <div className="max-w-[430px] mx-auto flex items-stretch">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-1
                         py-2.5 transition-colors"
              style={{ color: isActive ? 'var(--text)' : 'var(--muted)' }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
              <span
                className="text-[9px] font-semibold tracking-wider uppercase"
                style={{ color: 'inherit' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
