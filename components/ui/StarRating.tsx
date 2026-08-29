import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({
  value,
  size = 16,
  className,
}: {
  value: number
  size?: number
  className?: string
}) {
  const clamped = Math.min(5, Math.max(0, value))
  const pct = (clamped / 5) * 100
  return (
    <span
      className={cn('relative inline-flex', className)}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
    >
      <span className="inline-flex text-line">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} className="fill-current" aria-hidden />
        ))}
      </span>
      <span
        className="absolute inset-0 inline-flex overflow-hidden text-action"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} className="shrink-0 fill-current" />
        ))}
      </span>
    </span>
  )
}
