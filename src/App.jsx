/**
 * App.jsx — Root shell.
 * - Owns tab state, theme, dialogs, price refresh
 * - Passes pageTitle + theme props down to AppHeader
 */
import { useState, useCallback } from 'react'
import { useAppState }           from './hooks/useAppState'
import { usePrice }              from './hooks/usePrice'
import { useTheme }              from './hooks/useTheme'
import { AppHeader }             from './components/layout/AppHeader'
import { BottomNav }             from './components/layout/BottomNav'
import { PageContainer }         from './components/layout/PageContainer'
import { AddEntrySheet }         from './components/layout/AddEntrySheet'
import { HomePage }              from './pages/HomePage'
import { DcaPage }               from './pages/DcaPage'
import { FuturesPage }           from './pages/FuturesPage'
import { TriggersPage }          from './pages/TriggersPage'
import { MorePage }              from './pages/MorePage'

const PAGE_TITLES = {
  home:     'Stacking',
  dca:      'DCA',
  futures:  'Futures',
  triggers: 'Triggers',
  more:     'More',
}

export default function App() {
  const { state, updateSettings, addEntry, deleteEntry, restoreState } = useAppState()
  const { isDark, toggle: toggleTheme }     = useTheme()

  const VALID_TABS = ['home', 'dca', 'futures', 'triggers', 'more']
  const [tab, setTab] = useState(() => {
    const saved = sessionStorage.getItem('btc-stack-tab')
    return VALID_TABS.includes(saved) ? saved : 'home'
  })
  const handleTabChange = useCallback((t) => {
    sessionStorage.setItem('btc-stack-tab', t)
    setTab(t)
  })
  const [addOpen, setAddOpen]     = useState(false)
  const [goalOpen, setGoalOpen]   = useState(false)
  const [planOpen, setPlanOpen]   = useState(false)
  const [goalForm, setGoalForm]   = useState({})
  const [planForm, setPlanForm]   = useState({})

  /* price */
  const onPriceUpdate = useCallback(({ btcUsd, usdthb }) => {
    const patch = {}
    if (btcUsd > 0) patch.currentPrice = btcUsd
    if (usdthb > 0) patch.usdthb       = usdthb
    if (Object.keys(patch).length > 0) updateSettings(patch)
  }, [updateSettings])
  const { loading: priceLoading, updatedAt, refresh: refreshPrice } = usePrice(onPriceUpdate)

  /* entry save */
  const handleSave = useCallback((type, entry) => addEntry(type, entry), [addEntry])

  /* goal sheet */
  function openGoal() {
    setGoalForm({ goalBtc: state.settings.goalBtc, usdthb: state.settings.usdthb })
    setGoalOpen(true)
  }
  function saveGoal(e) {
    e.preventDefault()
    const g = parseFloat(goalForm.goalBtc), r = parseFloat(goalForm.usdthb)
    if (g > 0) updateSettings({ goalBtc: g })
    if (r > 0) updateSettings({ usdthb: r })
    setGoalOpen(false)
  }

  /* plan sheet */
  function openPlan() {
    setPlanForm({
      currentAge: state.settings.currentAge,
      targetAge:  state.settings.targetAge,
      monthlyDcaUsd:    state.settings.monthlyDcaUsd,
      annualGrowthRate: state.settings.annualGrowthRate,
    })
    setPlanOpen(true)
  }
  function savePlan(e) {
    e.preventDefault()
    updateSettings({
      currentAge:       +planForm.currentAge       || 29,
      targetAge:        +planForm.targetAge        || 40,
      monthlyDcaUsd:    +planForm.monthlyDcaUsd    || 300,
      annualGrowthRate: +planForm.annualGrowthRate || 10,
    })
    setPlanOpen(false)
  }

  return (
    <div
      className="max-w-[430px] mx-auto min-h-svh flex flex-col"
      style={{ background: 'var(--bg)' }}
    >
      {/* ── Header ── */}
      <AppHeader
        settings={state.settings}
        pageTitle={PAGE_TITLES[tab]}
        onAdd={() => setAddOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* ── Page content ── */}
      <PageContainer>
        {tab === 'home'     && <HomePage     state={state} onEditGoal={openGoal} onRefresh={refreshPrice} />}
        {tab === 'dca'      && <DcaPage      state={state} onEditPlan={openPlan} onDeleteEntry={deleteEntry} />}
        {tab === 'futures'  && <FuturesPage  state={state} onDeleteEntry={deleteEntry} />}
        {tab === 'triggers' && <TriggersPage state={state} />}
        {tab === 'more'     && (
          <MorePage
            onDeleteEntry={deleteEntry}
            state={state}
            priceLoading={priceLoading}
            updatedAt={updatedAt}
            onRefresh={refreshPrice}
            onRestoreState={restoreState}
          />
        )}
      </PageContainer>

      {/* ── Bottom nav ── */}
      <BottomNav active={tab} onChange={handleTabChange} />

      {/* ── Sheets ── */}
      <AddEntrySheet open={addOpen} onClose={() => setAddOpen(false)} onSave={handleSave} settings={state.settings} />

      <Sheet open={goalOpen} title="Edit Goal" onClose={() => setGoalOpen(false)}>
        <form onSubmit={saveGoal} className="flex flex-col gap-3">
          <Field label="Target BTC"    type="number" step="0.0001"
                 value={goalForm.goalBtc} onChange={v => setGoalForm(f => ({ ...f, goalBtc: v }))} />
          <Field label="USD / THB Rate" type="number" step="0.01"
                 value={goalForm.usdthb}  onChange={v => setGoalForm(f => ({ ...f, usdthb: v }))} />
          <SheetActions onCancel={() => setGoalOpen(false)} />
        </form>
      </Sheet>

      <Sheet open={planOpen} title="Edit DCA Plan" onClose={() => setPlanOpen(false)}>
        <form onSubmit={savePlan} className="flex flex-col gap-3">
          <Field label="Current Age"      type="number" step="1"
                 value={planForm.currentAge} onChange={v => setPlanForm(f => ({ ...f, currentAge: v }))} />
          <Field label="Target Age"       type="number" step="1"
                 value={planForm.targetAge}  onChange={v => setPlanForm(f => ({ ...f, targetAge: v }))} />
          <Field label="Monthly DCA (USD)" type="number" step="10"
                 value={planForm.monthlyDcaUsd} onChange={v => setPlanForm(f => ({ ...f, monthlyDcaUsd: v }))} />
          <Field label="Annual Growth (%)" type="number" step="1"
                 value={planForm.annualGrowthRate} onChange={v => setPlanForm(f => ({ ...f, annualGrowthRate: v }))} />
          <SheetActions onCancel={() => setPlanOpen(false)} />
        </form>
      </Sheet>
    </div>
  )
}

/* ─── Shared sheet primitives ─── */

function Sheet({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] max-w-[430px] mx-auto
                   rounded-t-[24px] p-5 max-h-[85svh] overflow-y-auto"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full grid place-items-center text-[14px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >✕</button>
        </div>
        {children}
      </div>
    </>
  )
}

function Field({ label, type, value, step, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-xs">{label}</span>
      <input
        type={type} step={step} value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-3 rounded-[10px] text-[15px] font-medium outline-none transition"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      />
    </label>
  )
}

function SheetActions({ onCancel }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mt-2">
      <button
        type="button" onClick={onCancel}
        className="py-3 rounded-[12px] text-[14px] font-semibold"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
      >Cancel</button>
      <button
        type="submit"
        className="py-3 rounded-[12px] text-[14px] font-bold hover:opacity-90 transition-opacity"
        style={{ background: 'var(--text)', color: 'var(--card)' }}
      >Save</button>
    </div>
  )
}
