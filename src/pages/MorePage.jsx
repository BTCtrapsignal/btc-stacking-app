/**
 * MorePage — Live Price, Dip Reserve, Grid Bot, Export CSV, Backup/Restore.
 */
import { useMemo, useState, useRef } from 'react'
import { Card, CardHead }  from '../components/shared/Card'
import { StatCard }        from '../components/shared/StatCard'
import { EntryRow }        from '../components/shared/EntryRow'
import { computeMetrics }  from '../utils/metrics'
import { fmtBtc, fmtUsdCompact, fmtThbCompact, fmtPct, fmtDate, sortDesc } from '../utils/format'
import { exportDcaCsv, exportDipCsv, exportFuturesCsv, exportGridCsv, exportAllCsv } from '../utils/exportCsv'
import { exportBackup, parseBackup } from '../hooks/useBackup'

const $$ = (v, d = 2) => {
  const n = Math.abs(Number(v) || 0), s = Number(v) < 0 ? '-' : ''
  return `${s}$${n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

/* ── Confirm Dialog ── */
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = '#ef4444' }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-[190] bg-black/50" onClick={onCancel} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[200] max-w-[430px] mx-auto rounded-t-[20px] p-5"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
        <h3 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="text-[13px] mb-5" style={{ color: 'var(--text2)' }}>{message}</p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onCancel}
            className="py-3 rounded-[12px] text-[14px] font-semibold"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            className="py-3 rounded-[12px] text-[14px] font-bold"
            style={{ background: confirmColor, color: '#fff' }}
          >{confirmLabel}</button>
        </div>
      </div>
    </>
  )
}

/* ── Alert Dialog ── */
function AlertDialog({ open, title, message, onClose }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-[190] bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[200] max-w-[430px] mx-auto rounded-t-[20px] p-5"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
        <h3 className="text-[17px] font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="text-[13px] mb-5" style={{ color: 'var(--text2)' }}>{message}</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-[12px] text-[14px] font-bold"
          style={{ background: 'var(--text)', color: 'var(--card)' }}
        >OK</button>
      </div>
    </>
  )
}


/* ── Support QR Dialog ── */
function SupportQrDialog({ open, onClose }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[190] bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[200] max-w-[430px] mx-auto rounded-t-[20px] p-5"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
        <h3 className="text-[17px] font-bold mb-1" style={{ color: 'var(--text)' }}>
          ☕ Support BTC Stacking
        </h3>
        <p className="text-[12px] mb-4" style={{ color: 'var(--text2)' }}>
          If this app helps your BTC journey, you can support future development.
        </p>

        <div
          className="rounded-[16px] p-3 mb-4"
          style={{ background: '#fff', border: '1px solid var(--border)' }}
        >
          <img
            src="/promptpay-qr.png"
            alt="PromptPay QR"
            className="w-full rounded-[12px] block"
          />
        </div>

        <p className="text-center text-[11px] mb-4" style={{ color: 'var(--muted)' }}>
          100% optional — the app remains free for everyone.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-[12px] text-[14px] font-bold"
          style={{ background: 'var(--text)', color: 'var(--card)' }}
        >
          Close
        </button>
      </div>
    </>
  )
}

/* ── Main Page ── */
export function MorePage({ state, priceLoading, updatedAt, onRefresh, onRestoreState }) {
  const m          = useMemo(() => computeMetrics(state), [state])
  const thb        = m.price * m.usdthb
  const dipCap     = state.dip.reduce((s, x)  => s + Math.abs(+x.usdtAmount  || 0), 0)
  const gridCap    = state.grid.reduce((s, x) => s + Math.abs(+x.capitalUsdt || 0), 0)
  const updatedStr = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  const [exporting,       setExporting]       = useState(null)
  const [importError,     setImportError]      = useState(null)
  const [importSuccess,   setImportSuccess]    = useState(false)
  const [confirmRestore,  setConfirmRestore]   = useState(null) // parsed backup data
  const [supportOpen,     setSupportOpen]      = useState(false)
  const fileInputRef = useRef(null)

  /* ── CSV Export ── */
  function handleExport(type) {
    setExporting(type)
    setTimeout(() => {
      try {
        if (type === 'all')     exportAllCsv(state)
        if (type === 'dca')     exportDcaCsv(state.dca)
        if (type === 'dip')     exportDipCsv(state.dip)
        if (type === 'futures') exportFuturesCsv(state.futures)
        if (type === 'grid')    exportGridCsv(state.grid)
      } finally { setExporting(null) }
    }, 100)
  }

  /* ── JSON Backup Export ── */
  function handleBackupExport() {
    exportBackup(state)
  }

  /* ── JSON Backup Import ── */
  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // reset so same file can be re-selected

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = parseBackup(ev.target.result)
      if (!result.ok) {
        setImportError(result.error)
        return
      }
      // Show confirm before applying
      setConfirmRestore(result.data)
    }
    reader.readAsText(file)
  }

  function applyRestore() {
    if (!confirmRestore || typeof onRestoreState !== 'function') return
    onRestoreState(confirmRestore)
    setConfirmRestore(null)
    setImportSuccess(true)
  }

  const totalEntries = state.dca.length + state.dip.length + state.futures.length + state.grid.length

  return (
    <>
      {/* ── Live Market Price ── */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <span className="label-xs">BTC / USD</span>
            <p className="font-mono text-[28px] font-bold mt-1"
               style={{ letterSpacing: '-0.05em', color: 'var(--text)' }}>
              {fmtUsdCompact(m.price)}
            </p>
          </div>
          <div className="text-right">
            <span className="label-xs">BTC / THB</span>
            <p className="font-mono text-[28px] font-bold mt-1"
               style={{ letterSpacing: '-0.05em', color: 'var(--muted)' }}>
              {fmtThbCompact(thb)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3"
             style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            {updatedStr ? `Updated ${updatedStr}` : 'Using saved price'}
          </span>
          <button
            onClick={onRefresh} disabled={priceLoading}
            className="text-[12px] font-semibold disabled:opacity-40"
            style={{ color: '#60a5fa' }}
          >
            {priceLoading ? '↻ Loading…' : '↻ Refresh'}
          </button>
        </div>
      </Card>

      {/* ── Export CSV ── */}
      <Card>
        <CardHead
          title="Export CSV"
          right={<span className="label-xs">{totalEntries} entries</span>}
        />
        <p className="text-[12px] mb-3" style={{ color: 'var(--muted)' }}>
          Download data as CSV — compatible with Excel, Google Sheets, or any spreadsheet app.
        </p>

        <button
          onClick={() => handleExport('all')}
          disabled={exporting !== null}
          className="w-full py-3 rounded-[12px] text-[14px] font-bold mb-2.5
                     flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          {exporting === 'all' ? '↻ Generating…' : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export All ({totalEntries} entries)
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'dca',     label: 'DCA',         count: state.dca.length },
            { key: 'dip',     label: 'Dip Reserve',  count: state.dip.length },
            { key: 'futures', label: 'Futures',       count: state.futures.length },
            { key: 'grid',    label: 'Grid Bot',      count: state.grid.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => handleExport(key)}
              disabled={exporting !== null || count === 0}
              className="py-2.5 rounded-[10px] text-[12px] font-semibold
                         flex items-center justify-between px-3.5 transition-opacity disabled:opacity-40"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
            >
              <span>{label}</span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
                {exporting === key ? '…' : count}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* ── Dip Reserve ── */}
      <Card>
        <CardHead title="Dip Reserve" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard label="BTC Total" value={fmtBtc(m.dipBtc, 4)}   hint="BTC" />
          <StatCard label="Capital"   value={fmtUsdCompact(dipCap)}  hint="USD" />
          <StatCard label="Entries"   value={String(state.dip.length)} hint="count" />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}
             className="[&>*:last-child]:border-b-0">
          {[...state.dip].sort((a, b) => sortDesc(a, b, 'date')).slice(0, 10).map((x, i) => (
            <EntryRow key={i} kind="dip" badge="DIP"
              title={fmtDate(x.date)} sub={x.note || x.source || ''}
              val={`${x.btcQty >= 0 ? '+' : ''}${fmtBtc(x.btcQty)} BTC`}
              subVal={$$(x.price, 0)}
              valClass={x.btcQty >= 0 ? 'positive' : 'negative'}
            />
          ))}
          {!state.dip.length && (
            <p className="text-[13px] py-4 text-center" style={{ color: 'var(--muted)' }}>No dip entries yet.</p>
          )}
        </div>
      </Card>

      {/* ── Grid Bot ── */}
      <Card>
        <CardHead title="Grid Bot" />
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard label="Net Profit" value={$$(m.gridPnl)}
                    valueColor={m.gridPnl >= 0 ? '#22c55e' : '#ef4444'} hint="USD" />
          <StatCard label="Capital"    value={fmtUsdCompact(gridCap)} hint="USD" />
          <StatCard label="Runs"       value={String(state.grid.length)} hint="bots" />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}
             className="[&>*:last-child]:border-b-0">
          {[...state.grid].sort((a, b) => sortDesc(a, b, 'dateEnd')).slice(0, 8).map((x, i) => (
            <EntryRow key={i} kind="grid" badge="GRD"
              title={fmtDate(x.dateEnd)} sub={`${x.gridType || ''} · ${x.mode || ''}`}
              val={$$(x.netProfitUsdt)}
              subVal={fmtPct(x.roi, 2)}
              valClass={x.netProfitUsdt >= 0 ? 'positive' : 'negative'}
            />
          ))}
          {!state.grid.length && (
            <p className="text-[13px] py-4 text-center" style={{ color: 'var(--muted)' }}>No grid bots yet.</p>
          )}
        </div>
      </Card>

      {/* ── Backup & Restore ── */}
      <Card>
        <CardHead
          title="Backup & Restore"
          right={<span className="label-xs">{totalEntries} entries</span>}
        />
        <p className="text-[12px] mb-3" style={{ color: 'var(--muted)' }}>
          Export a full JSON backup of all your data. Import to restore on any device.
        </p>

        <button
          onClick={handleBackupExport}
          className="w-full py-3 rounded-[12px] text-[14px] font-bold mb-2.5
                     flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: 'var(--text)', color: 'var(--card)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Backup JSON
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-[12px] text-[14px] font-semibold
                     flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Backup JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-[11px] mt-2.5" style={{ color: 'var(--muted)' }}>
          File: <span className="font-mono">btc-stacking-backup-YYYY-MM-DD.json</span>
        </p>
      </Card>


      {/* ── Support Development ── */}
      <Card>
        <CardHead title="☕ Support BTC Stacking" />
        <p className="text-[12px] mb-3" style={{ color: 'var(--muted)' }}>
          If this app helps your BTC journey, you can support future development.
        </p>
        <button
          onClick={() => setSupportOpen(true)}
          className="w-full py-3 rounded-[12px] text-[14px] font-bold
                     flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          Show PromptPay QR
        </button>

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[12px] font-bold mb-1" style={{ color: 'var(--text)' }}>
            • Partners &amp; Contact
          </p>
          <a
            href="https://x.com/btcstackingapp"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-semibold"
            style={{ color: '#60a5fa' }}
          >
            X: @btcstackingapp
          </a>
        </div>
      </Card>


      {/* ── Support PromptPay QR ── */}
      <SupportQrDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />

      {/* ── Confirm Restore Dialog ── */}
      <ConfirmDialog
        open={!!confirmRestore}
        title="Restore Backup?"
        message={`This will replace all current data with the backup (${
          confirmRestore
            ? [confirmRestore.dca?.length, 'DCA', '+', confirmRestore.dip?.length, 'Dip', '+',
               confirmRestore.futures?.length, 'Futures entries'].join(' ')
            : ''
        }). Make sure you have exported the current data first.`}
        confirmLabel="Yes, Restore"
        confirmColor="#f59e0b"
        onConfirm={applyRestore}
        onCancel={() => setConfirmRestore(null)}
      />

      {/* ── Import Error ── */}
      <AlertDialog
        open={!!importError}
        title="Invalid Backup File"
        message={importError || ''}
        onClose={() => setImportError(null)}
      />

      {/* ── Import Success ── */}
      <AlertDialog
        open={importSuccess}
        title="Restore Successful"
        message="Your backup has been restored. All data has been updated."
        onClose={() => setImportSuccess(false)}
      />
    </>
  )
}
