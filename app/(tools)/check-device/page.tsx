'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Smartphone, Search, CheckCircle, AlertTriangle, Shield, ArrowRight, XCircle, Play, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type ResultType = 'clean' | 'stolen' | 'error' | null

interface StolenRecord {
  id: string
  imei?: string
  serial_number?: string
  device_name: string
  reported_at: string
  status: string
}

const RED_FLAGS = [
  { flag: 'Price is too low', desc: 'A brand new iPhone 15 for ₦150k is not a deal — it is a trap. Always check current market prices.' },
  { flag: 'Vendor refuses to provide IMEI', desc: 'Any legitimate seller can give you the IMEI on request. Refusal is a red flag.' },
  { flag: 'No original box or accessories', desc: 'Missing box does not always mean stolen, but combined with other signs it raises the risk.' },
  { flag: '"UK Used" or "Tokunbo" with 0% battery cycles', desc: 'A used phone cannot have zero battery cycles. If they claim it is unused, verify the cycles yourself.' },
  { flag: 'Seller wants to meet in a hurry or unusual location', desc: 'Scammers avoid traceable locations. Insist on a verifiable delivery through Zolarux.' },
  { flag: 'Scratched IMEI sticker on the device', desc: 'Deliberately scratched IMEI labels often indicate the device has been reported stolen and the thief is trying to hide it.' },
]

const FAQ_ITEMS = [
  {
    q: 'Does a clean result mean the device is definitely not stolen?',
    a: 'No. A clean result only means this device has not been reported to Zolarux. It may have been reported to the police or another registry but not to us yet. Always combine this check with the originality verification and buy through Zolarux escrow for full protection.',
  },
  {
    q: 'How quickly does a stolen report appear in the registry?',
    a: 'Reports submitted through our website appear immediately. Reports we receive via WhatsApp are added within 2 hours. There is no delay after submission.',
  },
  {
    q: 'Can I check a device I already bought?',
    a: 'Yes. If you have already bought a device and want to verify it was not stolen, check it now. If it comes back as stolen, contact us on WhatsApp immediately — do not use the device and do not confront the seller yourself.',
  },
  {
    q: 'Is this a police database?',
    a: 'No. This is Zolarux own registry built from reports submitted by theft victims in Nigeria. We share flagged device information with buyers and relevant parties but we are not a law enforcement agency.',
  },
  {
    q: 'What should I do if the check shows the device is stolen?',
    a: 'Do not buy the device. Do not pay any money. If you have already bought it, contact the Zolarux team on WhatsApp and file a police report. Keep all evidence of the transaction.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-4 text-left hover:text-primary transition-colors">
        <span className="font-display font-700 text-gray-900 text-sm leading-snug">{q}</span>
        <ChevronDown size={16} className={cn('text-gray-400 shrink-0 mt-0.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-4"><p className="text-gray-600 text-sm leading-relaxed">{a}</p></div>}
    </div>
  )
}

export default function CheckDevicePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultType, setResultType] = useState<ResultType>(null)
  const [record, setRecord] = useState<StolenRecord | null>(null)

  const handleCheck = async () => {
    // Sanitize: trim, strip non-alphanumeric (IMEI/serial are alphanumeric only)
    const q = query.trim().replace(/[^a-zA-Z0-9]/g, '')
    if (!q || q.length < 5 || q.length > 20) return
    setLoading(true)
    setResultType(null)
    setRecord(null)

    try {
      const supabase = createClient()

      // Use exact .eq() matches — IMEI/serial lookups should be precise
      const { data: imeiData } = await supabase
        .from('stolen_registry')
        .select('*')
        .eq('imei', q)
        .limit(1)

      if (imeiData && imeiData.length > 0) {
        setResultType('stolen')
        setRecord(imeiData[0] as StolenRecord)
        return
      }

      // Try serial number match
      const { data: serialData, error } = await supabase
        .from('stolen_registry')
        .select('*')
        .eq('serial_number', q)
        .limit(1)

      if (error) { setResultType('error'); return }
      if (serialData && serialData.length > 0) {
        setResultType('stolen')
        setRecord(serialData[0] as StolenRecord)
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
          <h1 className="font-display text-4xl font-800 text-white mb-4">Check Stolen Device Status</h1>
          <p className="text-white/75 text-lg">
            Buying a used phone or laptop? Check the IMEI or serial number against our national stolen device registry before you pay a single naira.
          </p>
        </div>
      </section>

      {/* Why check */}
      <div className="bg-amber-50 border-b border-amber-200 py-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Why check before buying?</strong> Buying a stolen device — even unknowingly — can make you criminally liable. The original owner can report you to police and you will have no legal protection. Checking takes 10 seconds and could save you from a police case.
            </p>
          </div>
        </div>
      </div>

      {/* Checker */}
      <section className="py-12 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100">
            <label className="block text-sm font-700 text-gray-700 mb-1.5">IMEI Number or Serial Number</label>
            <p className="text-xs text-gray-400 mb-3">For phones: dial *#06# to get the IMEI. For laptops: check the sticker on the bottom or Settings → About.</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                placeholder="e.g. 356938035643809"
                maxLength={20}
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

            {resultType === 'clean' && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="font-display font-700 text-green-800">Clean Record</span>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">This device has not been reported stolen in our registry.</p>
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-amber-700 text-xs leading-relaxed">
                    <strong>Important:</strong> A clean result only means this device has not been reported to Zolarux. It may still be unreported elsewhere. Always buy through our escrow system for full protection.
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
                  <div className="bg-red-100 rounded-xl p-3">
                    <p className="text-red-800 text-sm font-500">Do not purchase this device. Buying stolen property is a criminal offence. If a vendor is selling this, report them immediately.</p>
                  </div>
                  <Link
                    href="https://wa.me/2347063107314?text=I found a stolen device being sold. IMEI/Serial: "
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-red-700 transition-all"
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
                { device: 'Android Phone', method: 'Dial *#06# — the IMEI appears on screen immediately.' },
                { device: 'iPhone',         method: 'Settings → General → About → IMEI. Also printed on the SIM tray.' },
                { device: 'Laptop',         method: 'Check the sticker on the bottom. Also in Settings → System → About.' },
                { device: 'Any Device',     method: 'Check the original box — IMEI or serial is on the barcode sticker.' },
              ].map(({ device, method }) => (
                <div key={device} className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 bg-primary-light text-primary font-700 text-xs px-2 py-0.5 rounded-md mt-0.5">{device}</span>
                  <p className="text-gray-600">{method}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report CTA */}
          <div className="mt-4 bg-gray-950 rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-700 text-white mb-1">Device stolen?</p>
              <p className="text-gray-400 text-sm">Report it now so others don&apos;t buy it unknowingly.</p>
            </div>
            <Link href="/report-item" className="shrink-0 inline-flex items-center gap-2 bg-accent text-white font-700 text-sm px-4 py-2.5 rounded-xl hover:bg-accent-dark transition-all">
              Report <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Red flags */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-2">Red Flags When Buying a Used Gadget</h2>
          <p className="text-gray-500 text-sm mb-8">Watch out for these warning signs — each one alone may not mean much, but combined they signal serious risk.</p>
          <div className="space-y-4">
            {RED_FLAGS.map(({ flag, desc }) => (
              <div key={flag} className="flex items-start gap-4 bg-surface rounded-2xl p-5 border border-gray-100">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="font-display font-700 text-gray-900 text-sm mb-1">{flag}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video placeholder */}
      <section className="py-12 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-800 text-gray-900 mb-2">How to Check Any Device Before Buying</h2>
            <p className="text-gray-500 text-sm">A step-by-step video guide to device verification.</p>
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-card-hover" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                <Play size={20} className="text-white ml-1" fill="white" />
              </div>
              <p className="text-gray-400 text-sm">Device check tutorial — coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="bg-surface rounded-2xl border border-gray-100 px-6">
            {FAQ_ITEMS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* Safe buy CTA */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <Shield size={24} className="text-primary mx-auto mb-3" />
          <h3 className="font-display text-xl font-800 text-gray-900 mb-2">Buy Verified Gadgets Through Zolarux</h3>
          <p className="text-gray-500 text-sm mb-5">Every device sold on Zolarux is checked before listing. Stolen device registry, originality check, and escrow protection — all in one transaction.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/listings" className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all text-sm">
              Browse Verified Listings <ArrowRight size={14} />
            </Link>
            <Link href="/check-original" className="inline-flex items-center gap-2 border border-primary text-primary font-700 px-5 py-3 rounded-xl hover:bg-primary-light transition-all text-sm">
              Verify Originality Too
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}