import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FilterPillProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function FilterPill({ active, onClick, children, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center rounded-pill border px-3.5 py-1.5 font-body text-sm font-500 transition-micro',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active
          ? 'border-primary bg-primary text-on-primary'
          : 'border-line bg-surface text-ink-soft hover:border-primary/40 hover:text-ink',
        className
      )}
    >
      {children}
    </button>
  )
}
