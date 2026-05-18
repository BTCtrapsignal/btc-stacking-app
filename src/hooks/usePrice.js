/**
 * usePrice — fetches live BTC/USD from CoinGecko
 *            AND live USD/THB from exchangerate-api.com (free tier).
 * Returns { loading, updatedAt, refresh }
 * Calls onPriceUpdate({ btcUsd, usdthb }) on success.
 */
import { useState, useCallback } from 'react'

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'

const EXCHANGERATE_URL =
  'https://api.exchangerate-api.com/v4/latest/USD'

const TS_KEY    = 'btc-stack-price-ts'
const MAX_AGE_MS = 24 * 60 * 60 * 1000  // 24 hours

/** Restore timestamp from sessionStorage. Returns Date or null. */
function loadTimestamp() {
  try {
    const raw = sessionStorage.getItem(TS_KEY)
    if (!raw) return null
    const d = new Date(raw)
    if (isNaN(d.getTime())) return null           // invalid string
    if (Date.now() - d.getTime() > MAX_AGE_MS) return null  // too old
    return d
  } catch {
    return null
  }
}

/** Persist timestamp to sessionStorage. */
function saveTimestamp(date) {
  try {
    sessionStorage.setItem(TS_KEY, date.toISOString())
  } catch {
    // sessionStorage unavailable — silently ignore
  }
}

export function usePrice(onPriceUpdate) {
  const [loading,   setLoading]   = useState(false)
  const [updatedAt, setUpdatedAt] = useState(() => loadTimestamp())

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch BTC/USD and USD/THB in parallel
      const [btcRes, fxRes] = await Promise.allSettled([
        fetch(COINGECKO_URL).then(r => r.json()),
        fetch(EXCHANGERATE_URL).then(r => r.json()),
      ])

      const btcUsd = btcRes.status === 'fulfilled'
        ? +btcRes.value?.bitcoin?.usd || 0
        : 0

      const usdthb = fxRes.status === 'fulfilled'
        ? +fxRes.value?.rates?.THB || 0
        : 0

      // Only update what we successfully fetched — retain existing price if fetch failed
      const update = {}
      if (btcUsd > 0) update.btcUsd = btcUsd
      if (usdthb > 0) update.usdthb = usdthb

      if (Object.keys(update).length > 0) {
        onPriceUpdate(update)
        const now = new Date()
        setUpdatedAt(now)
        saveTimestamp(now)
      } else {
        // Both fetches returned 0 — network likely offline.
        // Do NOT call onPriceUpdate: existing settings.currentPrice is retained as-is.
        console.warn('[usePrice] Both price sources returned 0 — retaining last known price.')
      }
    } catch (e) {
      // Network error — retain last known price silently.
      console.warn('[usePrice] Fetch error — retaining last known price:', e)
    } finally {
      setLoading(false)
    }
  }, [onPriceUpdate])

  return { loading, updatedAt, refresh }
}
