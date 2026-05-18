/**
 * Formatting utilities — compact numbers, BTC, THB, dates.
 */

/** 71000 → $71k | 2500000 → $2.50M | small → $XXX */
export function fmtUsdCompact(v) {
  const n    = Math.abs(Number(v) || 0)
  const sign = Number(v) < 0 ? '-' : ''
  if (n >= 1_000_000) return `${sign}$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000)    return `${sign}$${(n / 1_000).toFixed(1)}k`
  if (n >= 1_000)     return `${sign}$${(n / 1_000).toFixed(2)}k`
  return `${sign}$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

/** 2474000 → ฿2.47M | 75000 → ฿75k */
export function fmtThbCompact(v) {
  const n = Math.abs(Number(v) || 0)
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000)    return `฿${(n / 1_000).toFixed(1)}k`
  if (n >= 1_000)     return `฿${(n / 1_000).toFixed(2)}k`
  return `฿${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

/** Full USD, no compact (for prices) */
export function fmtUsd(v, decimals = 0) {
  const n    = Math.abs(Number(v) || 0)
  const sign = Number(v) < 0 ? '-' : ''
  return `${sign}$${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

/** Full THB */
export function fmtThb(v, decimals = 0) {
  const n = Math.abs(Number(v) || 0)
  return `฿${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

/** BTC to 4 or 6 decimal places */
export function fmtBtc(v, d = 4) {
  return Number(v || 0).toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
}

/** Percentage */
export function fmtPct(v, d = 1) {
  return `${Number(v || 0).toFixed(d)}%`
}

/** Short date: "Apr 7, 2026" */
export function fmtDate(v) {
  try {
    return new Date(v).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return String(v)
  }
}

/** Today as "Apr 21, 2026" */
export function todayStr() {
  return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Sort descending by date key */
export function sortDesc(a, b, key = 'date') {
  return new Date(b[key] || 0) - new Date(a[key] || 0)
}

/** Clamp value between min and max */
export function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}
