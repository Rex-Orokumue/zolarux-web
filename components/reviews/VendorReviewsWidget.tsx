'use client';
// components/reviews/VendorReviewsWidget.tsx
// Vendor dashboard: avg rating, distribution, recent reviews with reply

import React, { useEffect, useState } from 'react';
import StarRating, { StarBadge } from './StarRating';
import ReviewCard from './ReviewCard';
import {
  fetchVendorDashboardReviews,
  fetchVendorRatingStats,
  getRatingLabel,
  type Review,
  type ReviewStats,
} from '@/lib/reviews';

interface VendorReviewsWidgetProps {
  vendorId: string;
}

export default function VendorReviewsWidget({ vendorId }: VendorReviewsWidgetProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([
          fetchVendorRatingStats(vendorId),
          fetchVendorDashboardReviews(vendorId, 5),
        ]);
        setStats(s);
        setReviews(r);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-40 mb-4" />
        <div className="h-16 bg-gray-100 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasReviews = stats && stats.review_count > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4064D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h2 className="text-sm font-bold text-gray-800">Reviews & Ratings</h2>
        </div>
        {hasReviews && (
          <StarBadge rating={stats.avg_rating} count={stats.review_count} />
        )}
      </div>

      <div className="p-6">
        {!hasReviews ? (
          /* Empty state */
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFA600" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Reviews appear here after buyers complete their first order.
            </p>
          </div>
        ) : (
          <>
            {/* Stats panel */}
            <div className="flex gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
              {/* Big number */}
              <div className="flex flex-col items-center justify-center min-w-[80px]">
                <span className="text-4xl font-black text-gray-900">
                  {stats.avg_rating.toFixed(1)}
                </span>
                <StarRating rating={stats.avg_rating} size={14} className="mt-1" />
                <span className="text-xs text-gray-500 mt-1">
                  {getRatingLabel(stats.avg_rating)}
                </span>
              </div>

              {/* Distribution bars */}
              <div className="flex-1 space-y-1.5">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = stats.distribution[star] ?? 0;
                  const pct = stats.review_count > 0
                    ? (count / stats.review_count) * 100
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFA600">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total count summary */}
            <p className="text-xs text-gray-400 mb-4">
              Showing {Math.min(reviews.length, 5)} of {stats.review_count.toLocaleString()} review{stats.review_count !== 1 ? 's' : ''}
            </p>

            {/* Review cards */}
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isVendorView={true}
                  vendorId={vendorId}
                  onReplySubmitted={(id, reply) => {
                    setReviews((prev) =>
                      prev.map((r) =>
                        r.id === id
                          ? { ...r, vendor_reply: reply, vendor_replied_at: new Date().toISOString() }
                          : r,
                      ),
                    );
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}