'use client'

import { useState } from 'react'
import { Search, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Result = 'verified' | 'flagged' | 'not_found' | 'error' | null

interface Props {
  compact?: boolean
}

export default function VendorCheckerInline({ compact = false }: Props) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [businessName, setBusinessName] = useState('')

  const handleCheck = async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setResult(null)
    setBusinessName('')

    try {
      const supabase = createClient()

      const { data: vendor } = await supabase
        .from('vendors')
        .select('business_name, status, is_verified')
        .or(`vendor_id.ilike.%${q}%,phone_number.ilike.%${q}%,business_name.ilike.%${q}%`)
        .single()

      if (vendor) {
        setBusinessName(vendor.business_name || '')
        setResult(vendor.status === 'verified' || vendor.is_verified ? 'verified' : 'not_found')
        setLoading(false)
        return
      }

      const { data: flagged } = await supabase
        .from('flagged_entities')
        .select('id')
        .ilike('phone_number', `%${q}%`)
        .single()

      setResult(flagged ? 'flagged' : 'not_found')
    } catch {
      setResult('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Phone number or vendor ID"
          className={`flex-1 bg-white/15 border border-white/25 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-all ${compact ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'}`}
        />
        <button
          onClick={handleCheck}
          disabled={loading || !query.trim()}
          className={`bg-accent text-white font-700 rounded-xl hover:bg-accent-dark transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 ${compact ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'}`}
        >
          {loading
            ? <Loader2 size={compact ? 12 : 15} className="animate-spin" />
            : <Search size={compact ? 12 : 15} />}
          {!compact && 'Check'}
        </button>
      </div>

      {result === 'verified' && (
        <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl px-3 py-2.5">
          <CheckCircle size={14} className="text-green-400 shrink-0" />
          <div>
            <p className="text-green-300 text-xs font-700">✓ Verified Vendor</p>
            {businessName && <p className="text-green-200/70 text-xs">{businessName}</p>}
          </div>
        </div>
      )}

      {result === 'flagged' && (
        <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-2.5">
          <XCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-red-300 text-xs font-700">⚠ Flagged — Do not transact</p>
        </div>
      )}

      {result === 'not_found' && (
        <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-xl px-3 py-2.5">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <p className="text-amber-300 text-xs">Not in our registry — unverified</p>
        </div>
      )}

      {result === 'error' && (
        <p className="text-red-300 text-xs px-1">Check failed. Try again.</p>
      )}
    </div>
  )
}