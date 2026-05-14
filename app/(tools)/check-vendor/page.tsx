'use client'

import { useState } from 'react'
import { Shield, Search, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Vendor, FlaggedEntity } from '@/types/vendor'
import { VENDOR_STATUS_MAP } from '@/lib/constants'

type SearchResult =
  | { type: 'verified'; vendor: Vendor }
  | { type: 'flagged'; entity: FlaggedEntity }
  | { type: 'not_found' }
  | { type: 'error' }

export default function CheckVendorPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)

  const handleSearch = async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setResult(null)

    try {
      const supabase = createClient()

      // 1. Check vendors table
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .or(`vendor_id.ilike.%${q}%,phone_number.ilike.%${q}%,business_name.ilike.%${q}%`)
        .single()

      if (vendorData) {
        setResult({ type: 'verified', vendor: vendorData as Vendor })
        setLoading(false)
        return
      }

      // 2. Check flagged entities
      const { data: flaggedData } = await supabase
        .from('flagged_entities')
        .select('*')
        .or(`phone_number.ilike.%${q}%`)
        .single()

      if (flaggedData) {
        setResult({ type: 'flagged', entity: flaggedData as FlaggedEntity })
        setLoading(false)
        return
      }

      setResult({ type: 'not_found' })
    } catch {
      setResult({ type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-4">Check a Vendor</h1>
          <p className="text-white/70 text-lg">
            Enter a vendor ID, phone number, or business name to instantly verify if they are Zolarux-certified.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-12 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100">
            <label className="block text-sm font-700 text-gray-700 mb-2">
              Vendor ID, Phone Number, or Business Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. ZLX-00012 or 08012345678"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="bg-primary text-white px-6 py-3 rounded-xl font-700 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                {loading ? 'Checking...' : 'Verify'}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-6">
                {result.type === 'verified' && <VendorResult vendor={result.vendor} />}
                {result.type === 'flagged' && <FlaggedResult entity={result.entity} />}
                {result.type === 'not_found' && <NotFoundResult query={query} />}
                {result.type === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                    <p className="text-red-700 text-sm">Something went wrong. Please try again.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info boxes */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Verified', desc: 'Passed all checks. Safe to transact.' },
              { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Pending', desc: 'Under review. Proceed with caution.' },
              { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Flagged', desc: 'Reported for fraud. Do not transact.' },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${color.split(' ')[1]}`}>
                  <Icon size={16} className={color.split(' ')[0]} />
                </div>
                <p className="font-700 text-gray-900 text-sm">{label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function VendorResult({ vendor }: { vendor: Vendor }) {
  const statusConfig = VENDOR_STATUS_MAP[vendor.status] || VENDOR_STATUS_MAP.pending

  return (
    <div className={`rounded-2xl border ${statusConfig.border} ${statusConfig.bg} overflow-hidden`}>
      <div className="p-4" style={{ backgroundColor: statusConfig.headerBg }}>
        <div className="flex items-center gap-2">
          <CheckCircle size={18} className="text-white" />
          <span className="font-display font-700 text-white">{statusConfig.label}</span>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Business Name</p>
          <p className="font-700 text-gray-900">{vendor.business_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Vendor ID</p>
          <p className="font-600 text-gray-700 font-mono text-sm">{vendor.vendor_id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Category</p>
          <p className="text-gray-700 text-sm">{vendor.category}</p>
        </div>
        {vendor.risk_score && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Trust Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${vendor.risk_score}%` }}
                />
              </div>
              <span className="text-sm font-700 text-green-600">{vendor.risk_score}/100</span>
            </div>
          </div>
        )}
        {statusConfig.safe && (
          <div className="bg-green-100 rounded-xl p-3 text-sm text-green-700 font-500">
            ✓ This vendor is safe to transact with through Zolarux escrow.
          </div>
        )}
      </div>
    </div>
  )
}

function FlaggedResult({ entity }: { entity: FlaggedEntity }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 overflow-hidden">
      <div className="bg-red-600 p-4 flex items-center gap-2">
        <XCircle size={18} className="text-white" />
        <span className="font-display font-700 text-white">Flagged — Do Not Transact</span>
      </div>
      <div className="p-5">
        <p className="text-red-700 text-sm leading-relaxed mb-3">
          This vendor has been flagged in the Zolarux system. Reason: <strong>{entity.reason}</strong>
        </p>
        <p className="text-red-600 text-xs">
          Do not send any money to this vendor. If you have already transacted with them,
          contact Zolarux immediately on WhatsApp.
        </p>
      </div>
    </div>
  )
}

function NotFoundResult({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-amber-600" />
        <span className="font-display font-700 text-amber-700">Not Found in Our System</span>
      </div>
      <p className="text-amber-700 text-sm leading-relaxed mb-3">
        <strong>&ldquo;{query}&rdquo;</strong> does not appear in our vendor registry.
        This does not mean they are a scammer — but it does mean they are unverified by Zolarux.
      </p>
      <p className="text-amber-600 text-xs">
        We strongly recommend only transacting with Zolarux-verified vendors to ensure
        your money is fully protected.
      </p>
    </div>
  )
}