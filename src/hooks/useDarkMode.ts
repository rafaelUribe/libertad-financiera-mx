import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../constants/finance'

function getInitialTheme(): boolean {
  const stored = window.localStorage.getItem(STORAGE_KEYS.theme)
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light')
  }, [isDark])

  return { isDark, toggle: () => setIsDark((prev) => !prev) }
}
