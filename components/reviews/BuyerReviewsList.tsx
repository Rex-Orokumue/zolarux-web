'use client'

import React, { useEffect, useState } from 'react'
import StarRating from './StarRating'
import { fetchBuyerReviews, type Review } from '@/lib/reviews'

interface BuyerReviewsListProps {
  buyerId: string
}

export default function BuyerReviewsList({ buyerId }: BuyerReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuyerReviews(buyerId)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [buyerId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (reviews.length === 0) return null // nothing to show, don't clutter dashboard

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFA600">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h2 className="font-display font-700 text-gray-900">My Reviews</h2>
        </div>
        <span className="text-xs text-gray-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="divide-y divide-gray-50">
        {reviews.map((review) => (
          <div key={review.id} className="px-5 py-4">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                {review.listing_title && (
                  <p className="text-sm font-700 text-gray-800 truncate">{review.listing_title}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(review.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              <StarRating rating={review.rating} size={14} />
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            )}

            {/* Vendor reply */}
            {review.vendor_reply && (
              <div className="mt-3 ml-3 border-l-2 border-[#4064D7] pl-3">
                <p className="text-xs font-600 text-[#4064D7] mb-0.5">Vendor replied</p>
                <p className="text-xs text-gray-500 leading-relaxed">{review.vendor_reply}</p>
              </div>
            )}

            {/* Status badge */}
            <div className="mt-2">
              <span className={`inline-block text-xs font-600 px-2 py-0.5 rounded-full ${
                review.status === 'published'
                  ? 'bg-green-50 text-green-600'
                  : review.status === 'flagged'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {review.status === 'published' ? '✓ Published' : review.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}