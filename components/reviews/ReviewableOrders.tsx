'use client';
// components/reviews/ReviewableOrders.tsx
// Buyer dashboard section: completed orders awaiting review

import React, { useEffect, useState } from 'react';
import ReviewForm from './ReviewForm';
import { fetchReviewableOrders, fetchBuyerReviews } from '@/lib/reviews';

interface ReviewableOrdersProps {
  buyerId: string;
}

interface OrderItem {
  id: string;
  vendor_id: string;
  amount: number;
  created_at: string;
  listing_title?: string;
  listing_id?: string;
}

export default function ReviewableOrders({ buyerId }: ReviewableOrdersProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const reviewable = await fetchReviewableOrders(buyerId);
      setOrders(reviewable as OrderItem[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [buyerId]);

  function handleReviewSuccess(orderId: string) {
    setActiveOrderId(null);
    // Remove the reviewed order from the list
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-36 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) return null; // nothing to review = don't render section

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFA600">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-800">Leave a Review</h2>
          <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold rounded-full px-2 py-0.5">
            {orders.length}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-7">
          You have {orders.length} completed order{orders.length !== 1 ? 's' : ''} awaiting your review.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {orders.map((order) => (
          <div key={order.id}>
            {/* Order row */}
            {activeOrderId !== order.id && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {order.listing_title ?? 'Order'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ₦{order.amount.toLocaleString()} ·{' '}
                    {new Date(order.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setActiveOrderId(order.id)}
                  className="flex-shrink-0 ml-4 flex items-center gap-1.5 px-4 py-2 bg-[#FFA600] text-white text-xs font-semibold rounded-lg hover:bg-[#e69500] transition-colors shadow-sm"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Review
                </button>
              </div>
            )}

            {/* Inline form */}
            {activeOrderId === order.id && (
              <ReviewForm
                orderId={order.id}
                vendorId={order.vendor_id}
                buyerId={buyerId}
                listingId={order.listing_id}
                listingTitle={order.listing_title}
                onSuccess={() => handleReviewSuccess(order.id)}
                onCancel={() => setActiveOrderId(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}