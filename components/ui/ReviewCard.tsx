import { BadgeCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { StarRating } from './StarRating'
import type { Review } from '@/types/review'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="border-b border-line py-5 last:border-0">
      <div className="mb-2 flex items-center gap-2">
        <StarRating value={review.rating} size={15} />
        <span className="inline-flex items-center gap-1 font-body text-xs text-verified">
          <BadgeCheck size={13} />
          Verified buyer
        </span>
        <span className="ml-auto font-body text-xs text-ink-soft">{formatDate(review.created_at)}</span>
      </div>
      {review.body && <p className="font-body text-sm leading-relaxed text-ink-soft">{review.body}</p>}
    </article>
  )
}
