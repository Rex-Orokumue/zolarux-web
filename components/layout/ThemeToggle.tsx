'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getStoredTheme, resolveIsDark, setTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => { setIsDark(resolveIsDark(getStoredTheme())) }, [])
  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
    setIsDark(next === 'dark')
  }
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
