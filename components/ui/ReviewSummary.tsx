import type { ReviewRating } from '@/types/review'
import { StarRating } from './StarRating'

export function ReviewSummary({
  average,
  count,
  distribution,
  compact = false,
}: {
  average: number
  count: number
  distribution?: Record<ReviewRating, number>
  compact?: boolean
}) {
  if (count === 0) return null

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2 font-body text-sm text-ink">
        <span className="font-semibold">{average.toFixed(1)}</span>
        <StarRating value={average} size={15} />
        <span className="text-ink-soft">
          ({count} review{count === 1 ? '' : 's'})
        </span>
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="text-center sm:text-left">
        <p className="font-display text-5xl font-extrabold text-ink [font-variant-numeric:tabular-nums]">
          {average.toFixed(1)}
        </p>
        <StarRating value={average} size={18} className="mt-1" />
        <p className="mt-1 font-body text-sm text-ink-soft">
          {count} review{count === 1 ? '' : 's'}
        </p>
      </div>
      {distribution && (
        <div className="flex-1 space-y-1.5">
          {([5, 4, 3, 2, 1] as ReviewRating[]).map((star) => {
            const n = distribution[star] ?? 0
            const pct = count > 0 ? (n / count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 font-body text-xs text-ink-soft">
                <span className="w-3 tabular-nums">{star}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-pill bg-line">
                  <span className="block h-full rounded-pill bg-action" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-6 text-right tabular-nums">{n}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
