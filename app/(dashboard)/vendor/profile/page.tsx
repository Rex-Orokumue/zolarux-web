import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Shield, CheckCircle, AlertTriangle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function VendorProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('phone_number', user.phone ?? '')
    .single()

  if (!vendor) redirect('/vendor')

  const statusConfig = {
    verified:  { label: 'Verified',  color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle },
    pending:   { label: 'Pending',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: AlertTriangle },
    suspended: { label: 'Suspended', color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      icon: AlertTriangle },
  }[vendor.status as string] || { label: vendor.status, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: AlertTriangle }

  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <h1 className="font-display text-2xl font-800 text-gray-900">Vendor Profile</h1>

      {/* Status card */}
      <div className={`rounded-2xl border p-5 ${statusConfig.bg}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
            <span className="font-display font-800 text-gray-900 text-xl">{vendor.business_name?.[0]}</span>
          </div>
          <div>
            <h2 className="font-display font-700 text-gray-900">{vendor.business_name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusIcon size={13} className={statusConfig.color} />
              <span className={`text-xs font-700 ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-50">
        {[
          { label: 'Vendor ID',      value: vendor.vendor_id,      mono: true },
          { label: 'Category',       value: vendor.category },
          { label: 'Phone',          value: vendor.phone_number },
          { label: 'Email',          value: vendor.email || '—' },
          { label: 'Address',        value: vendor.business_address || '—' },
          { label: 'Trust Score',    value: vendor.risk_score ? `${vendor.risk_score}/100` : '—' },
          { label: 'Member Since',   value: vendor.created_at ? formatDate(vendor.created_at) : '—' },
        ].map(({ label, value, mono }) => (
          <div key={label} className="flex items-start justify-between gap-4 px-5 py-3.5">
            <p className="text-sm text-gray-400 shrink-0">{label}</p>
            <p className={`text-sm font-600 text-gray-900 text-right ${mono ? 'font-mono' : ''}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Trust score bar */}
      {vendor.risk_score && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-700 text-gray-900 text-sm">Trust Score</p>
            <span className="font-display font-800 text-primary">{vendor.risk_score}/100</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${vendor.risk_score}%` }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Score is reviewed after each transaction and verification cycle.
          </p>
        </div>
      )}

      {/* Contact support */}
      <div className="bg-surface rounded-2xl border border-gray-100 p-5 text-center">
        <Shield size={20} className="text-primary mx-auto mb-2" />
        <p className="font-700 text-gray-900 text-sm mb-1">Need to update your profile?</p>
        <p className="text-gray-400 text-xs mb-4">
          Contact Zolarux support to update your business information or request re-verification.
        </p>
        <Link
          href={`https://wa.me/2347063107314?text=Hi, I need to update my vendor profile. My Vendor ID is: ${vendor.vendor_id}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-all"
        >
          <MessageCircle size={14} /> Contact Support
        </Link>
      </div>
    </div>
  )
}