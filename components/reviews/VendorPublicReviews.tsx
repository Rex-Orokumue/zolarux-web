'use client';
// components/reviews/VendorPublicReviews.tsx
// Public-facing reviews section on vendor profile/store pages

import React, { useEffect, useState, useCallback } from 'react';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import {
  fetchVendorReviews,
  fetchVendorRatingStats,
  getRatingLabel,
  type Review,
  type ReviewStats,
} from '@/lib/reviews';

interface VendorPublicReviewsProps {
  vendorId: string;
  pageSize?: number;
}

type FilterRating = 0 | 1 | 2 | 3 | 4 | 5; // 0 = all

export default function VendorPublicReviews({
  vendorId,
  pageSize = 10,
}: VendorPublicReviewsProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filterRating, setFilterRating] = useState<FilterRating>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchVendorRatingStats(vendorId).then(setStats).catch(console.error);
  }, [vendorId]);

  const loadReviews = useCallback(
    async (pg: number, append: boolean) => {
      if (pg === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const { reviews: r, total: t } = await fetchVendorReviews(vendorId, pg, pageSize);
        setTotal(t);
        setReviews((prev) => (append ? [...prev, ...r] : r));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [vendorId, pageSize],
  );

  useEffect(() => {
    setPage(0);
    loadReviews(0, false);
  }, [loadReviews]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage, true);
  }

  // Client-side filter by star (until backend filter is added)
  const filtered = filterRating === 0
    ? reviews
    : reviews.filter((r) => r.rating === filterRating);

  const hasMore = reviews.length < total;

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats || stats.review_count === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <div className="text-3xl mb-2">⭐</div>
        <p className="text-sm font-medium text-gray-700">No reviews yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Be the first to review this vendor after your purchase.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-5 bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl border border-gray-100">
        {/* Score */}
        <div className="flex flex-col items-center justify-center min-w-[100px] text-center">
          <span className="text-5xl font-black text-gray-900 leading-none">
            {stats.avg_rating.toFixed(1)}
          </span>
          <StarRating rating={stats.avg_rating} size={18} className="mt-2" />
          <span className="text-sm font-medium text-gray-600 mt-1">
            {getRatingLabel(stats.avg_rating)}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">
            {stats.review_count.toLocaleString()} review{stats.review_count !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Distribution */}
        <div className="flex-1 flex flex-col justify-center space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = stats.distribution[star] ?? 0;
            const pct = stats.review_count > 0
              ? (count / stats.review_count) * 100
              : 0;
            return (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                className={`flex items-center gap-2 group rounded-lg px-2 py-0.5 transition-colors ${
                  filterRating === star
                    ? 'bg-amber-100'
                    : 'hover:bg-white/60'
                }`}
              >
                <span className="text-xs text-gray-600 w-3 text-right">{star}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFA600">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter chip */}
      {filterRating !== 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Filtering:</span>
          <button
            onClick={() => setFilterRating(0)}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 hover:bg-amber-200 transition-colors"
          >
            {filterRating} stars only
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No {filterRating}-star reviews yet.
          </p>
        ) : (
          filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && filterRating === 0 && (
        <div className="mt-5 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 border border-[#4064D7] text-[#4064D7] text-sm font-medium rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {loadingMore ? 'Loading…' : `Show more reviews (${total - reviews.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}