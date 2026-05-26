'use client';
// components/reviews/ReviewForm.tsx
// Buyer submits a review for a completed order

import React, { useState } from 'react';
import StarRating from './StarRating';
import { submitReview, type SubmitReviewPayload } from '@/lib/reviews';

interface ReviewFormProps {
  orderId: string;
  vendorId: string;
  buyerId: string;
  listingId?: string;
  listingTitle?: string;
  vendorName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export default function ReviewForm({
  orderId,
  vendorId,
  buyerId,
  listingId,
  listingTitle,
  vendorName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload: SubmitReviewPayload = {
      order_id: orderId,
      vendor_id: vendorId,
      buyer_id: buyerId,
      listing_id: listingId,
      listing_title: listingTitle,
      rating,
      comment: comment.trim() || undefined,
    };

    try {
      await submitReview(payload);
      setSubmitted(true);
      setTimeout(() => onSuccess?.(), 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Review submitted!</h3>
        <p className="text-sm text-gray-500">Thank you for helping the Zolarux community.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-base font-bold text-gray-900">
          Rate your experience
        </h3>
        {(vendorName || listingTitle) && (
          <p className="text-sm text-gray-500 mt-0.5">
            {vendorName && <span className="font-medium text-[#4064D7]">{vendorName}</span>}
            {vendorName && listingTitle && ' · '}
            {listingTitle && <span>{listingTitle}</span>}
          </p>
        )}
      </div>

      {/* Star selector */}
      <div className="flex flex-col items-center py-4 mb-5 bg-gray-50 rounded-xl">
        <StarRating
          rating={rating}
          size={40}
          interactive
          onChange={setRating}
        />
        <p className="mt-2 text-sm font-medium text-gray-600 h-5 transition-all">
          {rating > 0 ? RATING_LABELS[rating] : 'Tap to rate'}
        </p>
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
          Your review <span className="text-gray-400 font-normal normal-case">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about product quality, delivery, communication..."
          rows={4}
          maxLength={1000}
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4064D7] focus:border-transparent resize-none transition"
        />
        <p className="text-xs text-gray-400 text-right mt-1">
          {comment.length}/1000
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="px-6 py-2 bg-[#4064D7] text-white text-sm font-semibold rounded-xl hover:bg-[#2e4fb5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/>
                <path d="M21 12a9 9 0 00-9-9"/>
              </svg>
              Submitting…
            </span>
          ) : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}