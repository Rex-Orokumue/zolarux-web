'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const

const emptySubscribe = () => () => {}

/** false during SSR and the first client render, true thereafter — no setState-in-effect. */
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const active = mounted ? theme ?? 'system' : 'system'

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex rounded-pill border border-line bg-surface p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={active === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-pill transition-micro',
            active === value ? 'bg-primary text-on-primary' : 'text-ink-soft hover:text-ink'
          )}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  )
}
