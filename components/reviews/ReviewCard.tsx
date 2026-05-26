'use client';
// components/reviews/ReviewCard.tsx

import React, { useState } from 'react';
import StarRating from './StarRating';
import type { Review } from '@/lib/reviews';
import { submitVendorReply } from '@/lib/reviews';

interface ReviewCardProps {
  review: Review;
  isVendorView?: boolean;        // enables reply button
  vendorId?: string;
  onReplySubmitted?: (reviewId: string, reply: string) => void;
}

export default function ReviewCard({
  review,
  isVendorView = false,
  vendorId,
  onReplySubmitted,
}: ReviewCardProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState(review.vendor_reply ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localReply, setLocalReply] = useState(review.vendor_reply ?? '');
  const [localRepliedAt, setLocalRepliedAt] = useState(review.vendor_replied_at ?? '');

  const hasReply = !!localReply;
  const canReply = isVendorView && vendorId;

  async function handleReplySubmit() {
    if (!replyText.trim() || !vendorId) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitVendorReply(review.id, vendorId, replyText);
      setLocalReply(replyText);
      setLocalRepliedAt(new Date().toISOString());
      setReplyOpen(false);
      onReplySubmitted?.(review.id, replyText);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit reply.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4064D7] to-[#5b7ae8] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {(review.buyer_name ?? 'B').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {review.buyer_name ?? 'Verified Buyer'}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <StarRating rating={review.rating} size={16} />
      </div>

      {/* Listing tag */}
      {review.listing_title && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-xs text-[#4064D7] bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            {review.listing_title}
          </span>
        </div>
      )}

      {/* Comment */}
      {review.comment ? (
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">No written review.</p>
      )}

      {/* Vendor reply */}
      {hasReply && (
        <div className="mt-4 ml-4 border-l-2 border-[#4064D7] pl-4">
          <div className="flex items-center gap-1.5 mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4064D7" strokeWidth="2.5">
              <polyline points="9 17 4 12 9 7"/>
              <path d="M20 18v-2a4 4 0 00-4-4H4"/>
            </svg>
            <span className="text-xs font-semibold text-[#4064D7]">Vendor Response</span>
            {localRepliedAt && (
              <span className="text-xs text-gray-400">
                · {new Date(localRepliedAt).toLocaleDateString('en-NG', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{localReply}</p>
          {canReply && (
            <button
              onClick={() => {
                setReplyText(localReply);
                setReplyOpen(true);
              }}
              className="mt-1 text-xs text-gray-400 hover:text-[#4064D7] transition-colors"
            >
              Edit reply
            </button>
          )}
        </div>
      )}

      {/* Reply CTA (vendor, no reply yet) */}
      {canReply && !hasReply && !replyOpen && (
        <button
          onClick={() => setReplyOpen(true)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#4064D7] hover:text-[#2e4fb5] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 17 4 12 9 7"/>
            <path d="M20 18v-2a4 4 0 00-4-4H4"/>
          </svg>
          Reply to this review
        </button>
      )}

      {/* Reply textarea */}
      {replyOpen && (
        <div className="mt-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a professional, helpful response..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4064D7] focus:border-transparent resize-none"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          <div className="flex items-center gap-2 mt-2 justify-end">
            <button
              onClick={() => { setReplyOpen(false); setError(null); }}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReplySubmit}
              disabled={submitting || !replyText.trim()}
              className="px-4 py-1.5 text-xs font-semibold bg-[#4064D7] text-white rounded-lg hover:bg-[#2e4fb5] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}