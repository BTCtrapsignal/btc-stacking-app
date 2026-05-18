/**
 * useAppState — central state hook.
 * Persists to localStorage with version migration.
 * Protects real user data from being overwritten by seed defaults.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_SETTINGS, DCA_ENTRIES, DIP_ENTRIES,
  FUTURES_ENTRIES, GRID_ENTRIES, TRIGGERS,
} from '../data/seed'
import { sanitizeDcaEntry, sanitizeDipEntry, sanitizeFuturesEntry, sanitizeGridEntry, sanitizeEntries } from '../utils/validators'

/** Map entry type key → per-entry sanitizer */
const ENTRY_SANITIZERS = {
  dca:     sanitizeDcaEntry,
  dip:     sanitizeDipEntry,
  futures: sanitizeFuturesEntry,
  grid:    sanitizeGridEntry,
}

const STORAGE_KEY     = 'btc-stack-v5'
const STORAGE_VERSION = 2

/* ── Helpers ─────────────────────────────────────────── */

const isArr = v => Array.isArray(v)

/**
 * Determine whether saved data contains real user entries
 * (i.e. user has actually added/changed data, not just the seed).
 * We check if any array differs in length from seed or settings differ.
 */
function hasRealUserData(saved) {
  if (!saved) return false
  // If any array has content (even 0 items the user deliberately cleared), keep it.
  // We trust saved data as long as arrays are present as arrays.
  return (
    isArr(saved.dca)      ||
    isArr(saved.dip)      ||
    isArr(saved.futures)  ||
    isArr(saved.grid)
  )
}

/* ── Load & migrate ──────────────────────────────────── */

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('[useAppState] Corrupt localStorage — resetting to default.')
      return null
    }
    return parsed
  } catch (e) {
    console.warn('[useAppState] Failed to parse localStorage — resetting to default.', e)
    return null
  }
}

function buildInitialState() {
  const saved = loadSaved()

  // ── Version migration ──
  if (saved && saved._version !== STORAGE_VERSION) {
    console.warn(
      `[useAppState] Migrating state from version ${saved._version ?? 'unknown'} → ${STORAGE_VERSION}`
    )
    // Merge: keep user arrays, fill any missing settings keys from defaults
    saved._version = STORAGE_VERSION
  }

  // ── No saved data: use seed defaults ──
  if (!hasRealUserData(saved)) {
    return {
      _version: STORAGE_VERSION,
      settings: { ...DEFAULT_SETTINGS },
      dca:      DCA_ENTRIES,
      dip:      DIP_ENTRIES,
      futures:  FUTURES_ENTRIES,
      grid:     GRID_ENTRIES,
      triggers: TRIGGERS,
    }
  }

  // ── Real user data exists: merge carefully ──
  // settings: default first, then user overrides (so new fields get default values)
  const mergedSettings = {
    ...DEFAULT_SETTINGS,
    ...(typeof saved.settings === 'object' && !Array.isArray(saved.settings)
      ? saved.settings
      : {}),
  }

  return {
    _version: STORAGE_VERSION,
    settings: mergedSettings,
    // Preserve user arrays; fall back to empty (not seed) to avoid duplicating seed data
    dca:      isArr(saved.dca)      ? saved.dca      : [],
    dip:      isArr(saved.dip)      ? saved.dip      : [],
    futures:  isArr(saved.futures)  ? saved.futures  : [],
    grid:     isArr(saved.grid)     ? saved.grid     : [],
    triggers: isArr(saved.triggers) ? saved.triggers : TRIGGERS,
  }
}

/* ── Hook ────────────────────────────────────────────── */

export function useAppState() {
  const [state, setState] = useState(buildInitialState)

  // Persist on every change (include version)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        _version: STORAGE_VERSION,
      }))
    } catch (e) {
      console.warn('[useAppState] Failed to persist state.', e)
    }
  }, [state])

  const updateSettings = useCallback((patch) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const addEntry = useCallback((type, entry) => {
    const sanitize = ENTRY_SANITIZERS[type]
    if (sanitize) {
      const clean = sanitize(entry)
      if (!clean) {
        console.warn(`[useAppState] addEntry(${type}): entry rejected by validator`, entry)
        return
      }
      setState(s => ({ ...s, [type]: [clean, ...s[type]] }))
    } else {
      // Unknown type (e.g. future extension) — pass through unchanged
      setState(s => ({ ...s, [type]: [entry, ...s[type]] }))
    }
  }, [])

  const updateTriggers = useCallback((triggers) => {
    setState(s => ({ ...s, triggers }))
  }, [])

  // Restore from JSON backup — replaces full state, preserves version
  const restoreState = useCallback((backup) => {
    setState({
      _version: STORAGE_VERSION,
      settings: { ...DEFAULT_SETTINGS, ...(backup.settings || {}) },
      dca:      sanitizeEntries('dca',     isArr(backup.dca)     ? backup.dca     : []),
      dip:      sanitizeEntries('dip',     isArr(backup.dip)     ? backup.dip     : []),
      futures:  sanitizeEntries('futures', isArr(backup.futures) ? backup.futures : []),
      grid:     sanitizeEntries('grid',    isArr(backup.grid)    ? backup.grid    : []),
      triggers: isArr(backup.triggers) ? backup.triggers : TRIGGERS,
    })
  }, [])

  return { state, updateSettings, addEntry, updateTriggers, restoreState }
}
