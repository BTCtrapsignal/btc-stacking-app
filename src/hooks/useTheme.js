/**
 * useTheme — manages light/dark theme.
 * - Default: light
 * - Persists to localStorage (key: 'theme')
 * - Applies via document.documentElement.classList (Tailwind darkMode: 'class')
 */
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'theme'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {}
  return 'light' // default
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  // Sync to <html> class whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle, isDark: theme === 'dark' }
}
