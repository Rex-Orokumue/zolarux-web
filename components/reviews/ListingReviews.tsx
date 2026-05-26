'use client'
// components/reviews/ListingReviews.tsx
// Drop this into any listing/product page.
// Shows reviews filtered to the specific listing, falling back to all vendor reviews.

import React, { useEffect, useState, useCallback } from 'react'
import StarRating, { StarBadge } from './StarRating'
import ReviewCard from './ReviewCard'
import { createClient } from '@/lib/supabase/client'
import { getRatingLabel, type Review } from '@/lib/reviews'

interface ListingReviewsProps {
  vendorId: string
  listingId: string
  listingTitle?: string
}

interface ListingStats {
  avg_rating: number
  review_count: number
  distribution: Record<number, number>
}

export default function ListingReviews({
  vendorId,
  listingId,
  listingTitle,
}: ListingReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ListingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const PAGE_SIZE = 8

  const load = useCallback(async (pg: number, append: boolean) => {
    if (pg === 0) setLoading(true)
    else setLoadingMore(true)

    const supabase = createClient()
    const from = pg * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    // Fetch reviews for this specific listing
    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('listing_id', listingId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error && data) {
      setTotal(count ?? 0)
      setReviews((prev) => (append ? [...prev, ...(data as Review[])] : (data as Review[])))

      // Build stats from all listing reviews (not just current page)
      if (pg === 0) {
        const { data: allForStats } = await supabase
          .from('reviews')
          .select('rating')
          .eq('vendor_id', vendorId)
          .eq('listing_id', listingId)
          .eq('status', 'published')

        if (allForStats) {
          const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          let sum = 0
          allForStats.forEach((r: { rating: number }) => {
            dist[r.rating] = (dist[r.rating] ?? 0) + 1
            sum += r.rating
          })
          setStats({
            avg_rating: allForStats.length > 0 ? sum / allForStats.length : 0,
            review_count: allForStats.length,
            distribution: dist,
          })
        }
      }
    }

    setLoading(false)
    setLoadingMore(false)
  }, [vendorId, listingId])

  useEffect(() => {
    load(0, false)
  }, [load])

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-24 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!stats || stats.review_count === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <div className="text-2xl mb-2">⭐</div>
        <p className="text-sm font-600 text-gray-700">No reviews yet for this listing</p>
        <p className="text-xs text-gray-400 mt-1">
          Reviews appear after buyers complete their order.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Section title */}
      <div className="flex items-center gap-2 mb-5">
        <h2 className="font-display font-700 text-gray-900 text-lg">
          Customer Reviews
        </h2>
        <StarBadge rating={stats.avg_rating} count={stats.review_count} />
      </div>

      {/* Stats summary */}
      <div className="flex flex-col sm:flex-row gap-5 mb-6 p-5 bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl border border-gray-100">
        {/* Score */}
        <div className="flex flex-col items-center justify-center min-w-[90px] text-center">
          <span className="text-4xl font-black text-gray-900 leading-none">
            {stats.avg_rating.toFixed(1)}
          </span>
          <StarRating rating={stats.avg_rating} size={16} className="mt-1.5" />
          <span className="text-xs font-600 text-gray-600 mt-1">
            {getRatingLabel(stats.avg_rating)}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">
            {stats.review_count} review{stats.review_count !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Distribution */}
        <div className="flex-1 flex flex-col justify-center space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = stats.distribution[star] ?? 0
            const pct = stats.review_count > 0 ? (count / stats.review_count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFA600">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load more */}
      {reviews.length < total && (
        <div className="mt-5 text-center">
          <button
            onClick={() => {
              const next = page + 1
              setPage(next)
              load(next, true)
            }}
            disabled={loadingMore}
            className="px-6 py-2.5 border border-[#4064D7] text-[#4064D7] text-sm font-700 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {loadingMore ? 'Loading…' : `Show more (${total - reviews.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}