import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Shield, CheckCircle, Search, ArrowRight, AlertTriangle } from 'lucide-react'
import type { Vendor } from '@/types/vendor'

export const metadata: Metadata = {
  title: 'Verified Vendors',
  description: 'Browse all Zolarux-verified gadget vendors in Nigeria. Every vendor has passed our identity, business, and supplier verification process.',
}

async function getVerifiedVendors(): Promise<Vendor[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('status', 'verified')
    .order('risk_score', { ascending: false })

  if (error) {
    console.error('Vendors fetch error:', error)
    return []
  }
  return (data as Vendor[]) || []
}

export default async function VerifiedVendorsPage() {
  const vendors = await getVerifiedVendors()

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              Vendor Registry
            </span>
            <h1 className="font-display text-4xl font-800 text-white mb-4">
              Verified Vendors
            </h1>
            <p className="text-white/75 text-lg">
              Every vendor listed here has passed Zolarux&apos;s full verification process —
              identity check, business verification, supplier confirmation, and video call.
              These are real, accountable sellers.
            </p>
          </div>
        </div>
      </section>

      {/* Verification standard explainer */}
      <div className="bg-green-50 border-b border-green-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            {[
              'Identity Verified',
              'Business Confirmed',
              'Supplier Checked',
              'Video Call Completed',
              'Trust Score 60+',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle size={14} className="text-green-500" />
                <span className="font-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor grid */}
      <section className="py-12 bg-surface min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {vendors.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-xl font-700 text-gray-900 mb-2">
                Vendor onboarding in progress
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                We are actively verifying gadget vendors. Check back soon — or apply to become one.
              </p>
              <Link
                href="/vendor-registration"
                className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
              >
                Apply as a Vendor <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 text-sm">
                  <strong className="text-gray-900">{vendors.length}</strong> verified vendor{vendors.length !== 1 ? 's' : ''}
                </p>
                <Link
                  href="/check-vendor"
                  className="inline-flex items-center gap-2 text-sm text-primary font-700 hover:underline"
                >
                  <Search size={14} />
                  Check a specific vendor
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {vendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Not listed warning */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-700 text-amber-800 mb-1">Vendor not listed here?</p>
              <p className="text-amber-700 text-sm leading-relaxed">
                If a vendor claims to be Zolarux-verified but does not appear on this page,
                they are not verified. Use our{' '}
                <Link href="/check-vendor" className="font-700 underline">vendor checker</Link>{' '}
                to confirm status before any transaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="py-12 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="font-display text-2xl font-800 text-white mb-3">
            Want to be listed here?
          </h3>
          <p className="text-white/70 mb-6">
            Apply for Zolarux vendor verification. Approved vendors get listed publicly
            and gain immediate buyer trust.
          </p>
          <Link
            href="/vendor-registration"
            className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-6 py-3.5 rounded-xl hover:bg-gray-50 transition-all"
          >
            Apply Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
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
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-primary-light text-primary text-xs font-700 px-2.5 py-1 rounded-full">
            {vendor.category}
          </span>
          <span className="bg-green-50 text-green-700 text-xs font-700 px-2.5 py-1 rounded-full">
            Verified
          </span>
        </div>

        {vendor.risk_score && (
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

        <Link
          href={`/listings?vendor=${vendor.vendor_id}`}
          className="w-full flex items-center justify-center gap-2 border border-primary-100 text-primary text-sm font-700 py-2.5 rounded-xl hover:bg-primary-light transition-all"
        >
          View Listings <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}