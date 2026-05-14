'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Smartphone, Search, CheckCircle, AlertTriangle, Shield, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ResultType = 'clean' | 'stolen' | 'not_found' | 'error' | null

interface StolenRecord {
  id: string
  imei?: string
  serial_number?: string
  device_name: string
  reported_at: string
  status: string
}

export default function CheckDevicePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultType, setResultType] = useState<ResultType>(null)
  const [record, setRecord] = useState<StolenRecord | null>(null)

  const handleCheck = async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setResultType(null)
    setRecord(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('stolen_registry')
        .select('*')
        .or(`imei.ilike.%${q}%,serial_number.ilike.%${q}%`)
        .limit(1)

      if (error) { setResultType('error'); return }

      if (data && data.length > 0) {
        setResultType('stolen')
        setRecord(data[0] as StolenRecord)
      } else {
        setResultType('clean')
      }
    } catch {
      setResultType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-red-600 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Smartphone size={26} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-4">
            Check Stolen Device Status
          </h1>
          <p className="text-white/75 text-lg">
            Buying a used phone or laptop? Check the IMEI or serial number against
            our national stolen device registry before you pay a single naira.
          </p>
        </div>
      </section>

      {/* Checker */}
      <section className="py-12 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100">
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              IMEI Number or Serial Number
            </label>
            <p className="text-xs text-gray-400 mb-3">
              For phones: dial *#06# to get the IMEI. For laptops: check the sticker on the bottom or Settings → About.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                placeholder="e.g. 356938035643809"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
              <button
                onClick={handleCheck}
                disabled={loading || !query.trim()}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-700 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Search size={16} />}
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>

            {/* Results */}
            {resultType === 'clean' && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="font-display font-700 text-green-800">Clean Record</span>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">
                  This device has not been reported stolen in our registry.
                </p>
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-amber-700 text-xs leading-relaxed">
                    <strong>Important:</strong> A clean record only means this device has not been
                    reported to Zolarux. Always buy through our escrow system for full protection.
                  </p>
                </div>
              </div>
            )}

            {resultType === 'stolen' && record && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
                <div className="bg-red-600 px-5 py-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-white" />
                  <span className="font-display font-700 text-white">STOLEN DEVICE ALERT</span>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Device</p>
                    <p className="font-700 text-gray-900">{record.device_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Reported</p>
                    <p className="text-gray-700 text-sm">{new Date(record.reported_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                    <span className="inline-block bg-red-100 text-red-700 text-xs font-700 px-2.5 py-1 rounded-full uppercase">
                      {record.status}
                    </span>
                  </div>
                  <div className="bg-red-100 rounded-xl p-3 mt-2">
                    <p className="text-red-800 text-sm font-500">
                      Do not purchase this device. Buying stolen property is a criminal offence.
                      If a vendor is selling this device, report them immediately.
                    </p>
                  </div>
                  <Link
                    href="https://wa.me/2347063107314?text=I found a stolen device being sold. IMEI/Serial: "
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-red-700 transition-all mt-2"
                  >
                    Report to Zolarux
                  </Link>
                </div>
              </div>
            )}

            {resultType === 'error' && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                <p className="text-gray-500 text-sm">Something went wrong. Please try again.</p>
              </div>
            )}
          </div>

          {/* How to find IMEI */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="font-display font-700 text-gray-900 mb-4">How to Find Your IMEI or Serial Number</h3>
            <div className="space-y-3">
              {[
                { device: 'Android Phone', method: 'Dial *#06# — the IMEI appears on screen. Also in Settings → About Phone → IMEI.' },
                { device: 'iPhone', method: 'Settings → General → About → IMEI. Also printed on the SIM tray.' },
                { device: 'Laptop', method: 'Check the sticker on the bottom of the device. Also in Settings → System → About.' },
                { device: 'Any Device', method: 'Check the original box — the IMEI or serial is printed on the barcode sticker.' },
              ].map(({ device, method }) => (
                <div key={device} className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 bg-primary-light text-primary font-700 text-xs px-2 py-0.5 rounded-md mt-0.5">{device}</span>
                  <p className="text-gray-600">{method}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report stolen CTA */}
          <div className="mt-4 bg-gray-950 rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-700 text-white mb-1">Device stolen?</p>
              <p className="text-gray-400 text-sm">Report it now so others don&apos;t buy it unknowingly.</p>
            </div>
            <Link
              href="/report-item"
              className="shrink-0 inline-flex items-center gap-2 bg-accent text-white font-700 text-sm px-4 py-2.5 rounded-xl hover:bg-accent-dark transition-all"
            >
              Report <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Safe alternative */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <Shield size={24} className="text-primary mx-auto mb-3" />
          <h3 className="font-display text-xl font-800 text-gray-900 mb-2">
            Buy Used Gadgets Safely Through Zolarux
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Every device sold on Zolarux is checked before listing. Stolen device registry,
            originality check, and escrow protection — all in one transaction.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
          >
            Browse Verified Listings <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}