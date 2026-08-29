import { MessageSquare } from 'lucide-react'
import { getProductReviews } from '@/lib/reviews'
import { ReviewCard } from './ReviewCard'
import { ReviewSummary } from './ReviewSummary'

export async function ProductReviews({ productId }: { productId: string }) {
  const { reviews, average, count, distribution } = await getProductReviews(productId)

  return (
    <section id="product-reviews" className="mt-16 scroll-mt-20">
      <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">Reviews</h2>
      {count === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <MessageSquare size={22} className="mx-auto mb-3 text-ink-soft" />
          <p className="font-body text-sm text-ink-soft">
            No reviews yet. Buyers can leave a review after their order is delivered.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <ReviewSummary average={average} count={count} distribution={distribution} />
          <div className="rounded-lg border border-line bg-surface px-6">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
