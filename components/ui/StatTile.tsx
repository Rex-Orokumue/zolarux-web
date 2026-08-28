import { cn } from '@/lib/utils'

interface StatTileProps {
  value: string
  label: string
  variant?: 'light' | 'dark'
}

export function StatTile({ value, label, variant = 'light' }: StatTileProps) {
  return (
    <div className="px-6 py-2 text-center">
      <p
        className={cn(
          'font-display text-3xl font-extrabold sm:text-4xl',
          variant === 'dark' ? 'text-on-primary' : 'text-primary'
        )}
      >
        {value}
      </p>
      <p className={cn('mt-1 text-sm', variant === 'dark' ? 'text-on-primary/75' : 'text-ink-soft')}>{label}</p>
    </div>
  )
}
