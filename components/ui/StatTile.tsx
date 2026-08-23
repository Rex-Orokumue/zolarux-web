import { cn } from '@/lib/utils'

interface StatTileProps {
  value: string
  label: string
  variant?: 'light' | 'dark'
}

export function StatTile({ value, label, variant = 'light' }: StatTileProps) {
  return (
    <div className="text-center px-6 py-2">
      <p className={cn(
        'font-display text-3xl sm:text-4xl font-800',
        variant === 'dark' ? 'text-white' : 'text-primary'
      )}>
        {value}
      </p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  )
}
