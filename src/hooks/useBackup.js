/**
 * useBackup — JSON backup / restore for app state.
 * Export: full state → btc-stacking-backup-YYYY-MM-DD.json
 * Import: validate structure → restore via onRestore callback
 */

const BACKUP_VERSION = 1
const REQUIRED_KEYS  = ['settings', 'dca', 'dip', 'futures', 'grid']

/** Download current state as JSON backup file */
export function exportBackup(state) {
  const date     = new Date().toISOString().slice(0, 10)
  const payload  = {
    _backup:  { version: BACKUP_VERSION, exportedAt: new Date().toISOString() },
    settings: state.settings,
    dca:      state.dca,
    dip:      state.dip,
    futures:  state.futures,
    grid:     state.grid,
    triggers: state.triggers ?? [],
  }
  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: 'application/json' }
  )
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = `btc-stacking-backup-${date}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/**
 * Parse and validate an imported backup JSON string.
 * Returns { ok: true, data } or { ok: false, error: string }
 */
export function parseBackup(jsonStr) {
  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    return { ok: false, error: 'File is not valid JSON.' }
  }

  // Check backup version compatibility
  const backupVer = parsed?._backup?.version
  if (backupVer != null && Number(backupVer) > BACKUP_VERSION) {
    return {
      ok: false,
      error: 'This backup was created by a newer version of the app. Please update the app before importing it.',
    }
  }
  // Missing _backup or missing _backup.version = legacy (version 0) — allow import

  // Check required keys
  for (const key of REQUIRED_KEYS) {
    if (!(key in parsed)) {
      return { ok: false, error: `Missing required section: "${key}".` }
    }
    if (key !== 'settings' && !Array.isArray(parsed[key])) {
      return { ok: false, error: `Section "${key}" must be an array.` }
    }
  }

  if (typeof parsed.settings !== 'object' || Array.isArray(parsed.settings)) {
    return { ok: false, error: 'Section "settings" must be an object.' }
  }

  return { ok: true, data: parsed }
}
