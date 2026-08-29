import { createClient } from '@/lib/supabase/server'
import type { Review, ReviewRating } from '@/types/review'

export interface ReviewBundle {
  reviews: Review[]
  average: number
  count: number
  distribution: Record<ReviewRating, number>
}

const EMPTY_DISTRIBUTION: Record<ReviewRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

interface RawReviewRow {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

function toReview(row: RawReviewRow): Review {
  const rating = Math.min(5, Math.max(1, Math.round(row.rating))) as ReviewRating
  return { id: row.id, rating, body: row.comment, created_at: row.created_at }
}

/** Published reviews for one product (listing_id === productId). Empty on any error. */
export async function getProductReviews(productId: string): Promise<ReviewBundle> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at')
    .eq('listing_id', productId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error || !data) {
    if (error) console.error('Product reviews fetch error:', error)
    return { reviews: [], average: 0, count: 0, distribution: { ...EMPTY_DISTRIBUTION } }
  }

  const reviews = (data as RawReviewRow[]).map(toReview)
  const distribution = { ...EMPTY_DISTRIBUTION }
  let sum = 0
  for (const r of reviews) {
    distribution[r.rating] += 1
    sum += r.rating
  }
  const count = reviews.length
  const average = count > 0 ? sum / count : 0
  return { reviews, average, count, distribution }
}

/** Site-wide published-review summary for the Home proof section. */
export async function getReviewSummary(): Promise<{ average: number; count: number }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('status', 'published')

  if (error || !data) {
    if (error) console.error('Review summary fetch error:', error)
    return { average: 0, count: 0 }
  }
  const rows = data as { rating: number }[]
  const count = rows.length
  if (count === 0) return { average: 0, count: 0 }
  const average = rows.reduce((a, r) => a + r.rating, 0) / count
  return { average, count }
}
