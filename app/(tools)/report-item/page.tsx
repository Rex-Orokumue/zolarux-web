'use client'

import { useState } from 'react'
import { Flag, CheckCircle, AlertTriangle, Shield, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Step = 'form' | 'success'

interface FormData {
  device_name: string
  imei: string
  serial_number: string
  date_stolen: string
  location_stolen: string
  reporter_phone: string
  reporter_name: string
  additional_info: string
}

const INITIAL_FORM: FormData = {
  device_name: '', imei: '', serial_number: '', date_stolen: '',
  location_stolen: '', reporter_phone: '', reporter_name: '', additional_info: '',
}

const IMMEDIATE_STEPS = [
  { step: '1', title: 'Lock your SIM card',     desc: 'Call your network provider (MTN, Airtel, Glo, 9mobile) immediately to suspend the SIM so the thief cannot use it.' },
  { step: '2', title: 'Remote wipe if possible', desc: 'Use Find My iPhone (iOS) or Google Find My Device (Android) to remotely erase all personal data before someone accesses it.' },
  { step: '3', title: 'Change your passwords',   desc: 'Change email, banking apps, and social media passwords from another device right now. Do not wait.' },
  { step: '4', title: 'Report to police',         desc: 'File a police report. You will need this for insurance claims and to blacklist the IMEI with network providers.' },
  { step: '5', title: 'Contact your bank',        desc: 'If you have banking apps on the device, call your bank immediately to flag the account and disable mobile banking access.' },
]

const WHAT_HAPPENS_NEXT = [
  { step: '1', title: 'Report received',          desc: 'Your report is saved to the Zolarux stolen device registry immediately upon submission.' },
  { step: '2', title: 'Verification',             desc: 'Our team reviews the report within 24 hours to confirm accuracy and prevent false reports.' },
  { step: '3', title: 'Registry updated',         desc: 'Your device IMEI or serial number becomes searchable. Anyone who checks it will see a stolen alert immediately.' },
  { step: '4', title: 'Ongoing monitoring',       desc: 'If any Zolarux buyer or vendor checks this device before purchase, they will be warned and we will alert you.' },
]

const FAQ_ITEMS = [
  {
    q: 'Does reporting to Zolarux mean you will help track my device?',
    a: 'No. Zolarux is not a device tracking service and we do not have access to your device location. Reporting to us adds your device to our stolen registry so other buyers are warned before purchasing it. For device tracking, use Google Find My Device or Apple Find My before the device is wiped.',
  },
  {
    q: 'Will Zolarux contact the police on my behalf?',
    a: 'No. You need to file your own police report. However, if a suspected buyer contacts us about a device we have flagged, we will advise them not to purchase it and may refer relevant information to authorities if legally required.',
  },
  {
    q: 'Can I remove my report if I find my device?',
    a: 'Yes. Contact us on WhatsApp with your report reference number and proof of recovery (such as your police report showing the device was found). We will update the status to recovered.',
  },
  {
    q: 'What if someone already bought my stolen phone?',
    a: 'If someone bought your device through Zolarux escrow, we can flag the transaction and investigate. If it was bought outside our platform, we cannot intervene directly — but we can add it to the registry so no further sale through Zolarux is possible.',
  },
  {
    q: 'Is it a crime to submit a false stolen report?',
    a: 'Yes. Falsely reporting a device as stolen to prevent a legitimate sale or to harass someone is a criminal offence in Nigeria. Zolarux verifies all reports and false ones are removed and reported to authorities.',
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

export default function ReportItemPage() {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async () => {
    setError('')

    // Required fields
    if (!form.device_name.trim() || !form.reporter_phone.trim() || !form.reporter_name.trim()) {
      setError('Please fill in your name, phone number, and device name.')
      return
    }
    if (!form.imei.trim() && !form.serial_number.trim()) {
      setError('Please provide at least one identifier — IMEI or Serial Number.')
      return
    }

    // IMEI validation: must be exactly 15 digits
    if (form.imei.trim() && !/^\d{15}$/.test(form.imei.trim())) {
      setError('IMEI must be exactly 15 digits. Dial *#06# on the phone to find it.')
      return
    }

    // Serial number: alphanumeric, 5-30 chars
    if (form.serial_number.trim() && !/^[a-zA-Z0-9]{5,30}$/.test(form.serial_number.trim())) {
      setError('Serial number should be 5–30 alphanumeric characters.')
      return
    }

    // Phone validation: Nigerian format
    const cleanPhone = form.reporter_phone.trim().replace(/[\s-]/g, '')
    if (!/^(\+?234|0)[0-9]{10}$/.test(cleanPhone)) {
      setError('Enter a valid Nigerian phone number (e.g. 08012345678).')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const ref = `ZLX-RPT-${Date.now().toString(36).toUpperCase()}`

      const { error: dbError } = await supabase
        .from('stolen_registry')
        .insert({
          device_name: form.device_name,
          imei: form.imei || null,
          serial_number: form.serial_number || null,
          date_stolen: form.date_stolen || null,
          location_stolen: form.location_stolen || null,
          reporter_phone: form.reporter_phone,
          reporter_name: form.reporter_name,
          additional_info: form.additional_info || null,
          status: 'reported',
          report_reference: ref,
          reported_at: new Date().toISOString(),
        })

      if (dbError) {
        setError('Failed to submit report. Please try again or contact us on WhatsApp.')
        return
      }

      setReference(ref)
      setStep('success')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center py-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">Report Submitted</h2>
          <p className="text-gray-500 mb-4">
            Your device has been added to the Zolarux stolen registry. Anyone who checks this IMEI or serial number will be warned immediately.
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Report Reference</p>
            <p className="font-mono font-700 text-primary text-lg">{reference}</p>
            <p className="text-xs text-gray-400 mt-1">Save this for your records and follow-up</p>
          </div>

          {/* What happens next */}
          <div className="bg-primary-light rounded-2xl p-5 text-left mb-6">
            <p className="font-700 text-primary text-sm mb-3">What happens next</p>
            <div className="space-y-2">
              {WHAT_HAPPENS_NEXT.map(({ step: s, title, desc }) => (
                <div key={s} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-xs font-800 flex items-center justify-center shrink-0 mt-0.5">{s}</span>
                  <div>
                    <span className="font-700 text-primary text-xs">{title}:</span>
                    <span className="text-primary/70 text-xs ml-1">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500">
            For urgent follow-up, contact us on WhatsApp with your reference number.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Flag size={26} className="text-red-400" />
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-4">Report a Stolen Device</h1>
          <p className="text-gray-400 text-lg">
            Register your stolen gadget in our database so no one can unknowingly buy it from a thief.
            Free, takes 2 minutes, protects the entire community.
          </p>
        </div>
      </section>

      {/* Immediate action steps — always visible, including mobile */}
      <div className="bg-red-600 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-white font-700 text-sm mb-5 flex items-center gap-2">
            <AlertTriangle size={15} />
            Do these things RIGHT NOW before filling out this form:
          </p>
          <div className="space-y-3 sm:grid sm:grid-cols-5 sm:gap-3 sm:space-y-0">
            {IMMEDIATE_STEPS.map(({ step: s, title, desc }) => (
              <div key={s} className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs font-800 flex items-center justify-center shrink-0">{s}</span>
                  <p className="text-white font-700 text-xs">{title}</p>
                </div>
                {/* Always show description — not hidden on mobile */}
                <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <section className="py-12 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8">
            <h2 className="font-display text-xl font-800 text-gray-900 mb-6">Stolen Device Report Form</h2>

            <div className="space-y-5">
              {/* Reporter info */}
              <div className="pb-4 border-b border-gray-100">
                <p className="text-xs font-700 text-gray-400 uppercase tracking-wider mb-4">Your Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-700 text-gray-700 mb-1.5">Full Name *</label>
                    <input type="text" value={form.reporter_name} onChange={update('reporter_name')}
                      placeholder="Your full name" required maxLength={100}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-700 text-gray-700 mb-1.5">Phone Number *</label>
                    <input type="tel" value={form.reporter_phone} onChange={update('reporter_phone')}
                      placeholder="08012345678" required maxLength={15}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>
              </div>

              {/* Device info */}
              <div>
                <p className="text-xs font-700 text-gray-400 uppercase tracking-wider mb-4">Device Information</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-700 text-gray-700 mb-1.5">Device Name *</label>
                    <input type="text" value={form.device_name} onChange={update('device_name')}
                      placeholder="e.g. iPhone 14 Pro Max 256GB Space Black" required maxLength={200}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">IMEI Number</label>
                      <input type="text" value={form.imei} onChange={update('imei')}
                        placeholder="15-digit IMEI (*#06#)" maxLength={15} inputMode="numeric" pattern="\d{15}"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">Serial Number</label>
                      <input type="text" value={form.serial_number} onChange={update('serial_number')}
                        placeholder="Found in Settings → About" maxLength={30}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <AlertTriangle size={11} />
                    At least one identifier (IMEI or Serial Number) is required
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">Date Stolen</label>
                      <input type="date" value={form.date_stolen} onChange={update('date_stolen')}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">Location Stolen</label>
                      <input type="text" value={form.location_stolen} onChange={update('location_stolen')}
                        placeholder="e.g. Ikeja, Lagos" maxLength={200}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-700 text-gray-700 mb-1.5">Additional Information</label>
                    <textarea value={form.additional_info} onChange={update('additional_info')}
                      placeholder="Any other details (case colour, scratches, accessories, etc.)"
                      rows={3} maxLength={1000}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-primary-light rounded-xl p-4 flex items-start gap-2">
                <Shield size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-primary text-xs leading-relaxed">
                  By submitting, you confirm this device was genuinely stolen and the information provided is accurate. False reports are a criminal offence.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !form.reporter_name.trim() || !form.reporter_phone.trim() || !form.device_name.trim() || (!form.imei.trim() && !form.serial_number.trim())}
                className="w-full bg-red-600 text-white font-display font-700 py-4 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                  : <><Flag size={16} /> Submit Report</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What happens next */}
      <section className="py-12 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-6">What Happens After You Report</h2>
          <div className="space-y-3">
            {WHAT_HAPPENS_NEXT.map(({ step: s, title, desc }) => (
              <div key={s} className="flex items-start gap-4 bg-surface rounded-2xl p-5 border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="font-display font-800 text-white text-sm">{s}</span>
                </div>
                <div>
                  <p className="font-display font-700 text-gray-900 mb-1">{title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-700 text-amber-800 text-sm mb-2">Important — What we cannot do</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              Zolarux is a stolen device registry, not a tracking service. We cannot locate your device,
              contact the thief, or recover your phone. Our role is to prevent the device from being sold
              to an unsuspecting buyer through our platform. For tracking and recovery, use your device&apos;s
              built-in Find My feature and file a police report.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl border border-gray-100 px-6">
            {FAQ_ITEMS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>
    </div>
  )
}