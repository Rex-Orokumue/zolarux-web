// Replace the existing VendorCard function in app/(marketing)/verified-vendors/page.tsx
// Also add VendorReviewsDrawer below it

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, X } from 'lucide-react'
import { StarBadge } from '@/components/reviews/StarRating'
import VendorPublicReviews from '@/components/reviews/VendorPublicReviews'
import type { Vendor } from '@/types/vendor'

// ── Vendor Card ───────────────────────────────────────────────────────────────

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const [showReviews, setShowReviews] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="font-display font-800 text-white">
                {vendor.business_name?.[0]?.toUpperCase() || 'V'}
              </span>
            </div>
            <div>
              <p className="font-display font-700 text-white text-sm leading-tight">
                {vendor.business_name}
              </p>
              <p className="text-white/60 text-xs font-mono">{vendor.vendor_id}</p>
            </div>
          </div>
          <div className="bg-green-500 rounded-full p-1">
            <CheckCircle size={14} className="text-white" />
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="bg-primary-light text-primary text-xs font-700 px-2.5 py-1 rounded-full">
              {vendor.business_category}
            </span>
            <span className="bg-green-50 text-green-700 text-xs font-700 px-2.5 py-1 rounded-full">
              Verified
            </span>
            {/* Star badge — only shows if vendor has reviews */}
            {(vendor.avg_rating ?? 0) > 0 && (
              <StarBadge rating={vendor.avg_rating ?? 0} count={vendor.review_count} />
            )}
          </div>

          {vendor.risk_score != null && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Trust Score</span>
                <span className="font-700 text-green-600">{vendor.risk_score}/100</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${vendor.risk_score}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link
              href={`/listings?vendor=${vendor.vendor_id}`}
              className="w-full flex items-center justify-center gap-2 border border-primary-100 text-primary text-sm font-700 py-2.5 rounded-xl hover:bg-primary-light transition-all"
            >
              View Their Listings <ArrowRight size={13} />
            </Link>

            {/* Reviews button — only if they have reviews */}
            {(vendor.review_count ?? 0) > 0 && (
              <button
                onClick={() => setShowReviews(true)}
                className="w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-sm font-700 py-2.5 rounded-xl hover:bg-amber-100 transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFA600">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Read {vendor.review_count} Review{vendor.review_count !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews drawer/modal */}
      {showReviews && (
        <VendorReviewsDrawer
          vendor={vendor}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  )
}

// ── Reviews Drawer ────────────────────────────────────────────────────────────

function VendorReviewsDrawer({
  vendor,
  onClose,
}: {
  vendor: Vendor
  onClose: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-800 text-gray-900">{vendor.business_name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Customer Reviews</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable review content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <VendorPublicReviews vendorId={vendor.vendor_id} />
        </div>
      </div>
    </>
  )
}