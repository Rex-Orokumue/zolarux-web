'use client'

import { useState } from 'react'
import { Flag, CheckCircle, AlertTriangle, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
  device_name: '',
  imei: '',
  serial_number: '',
  date_stolen: '',
  location_stolen: '',
  reporter_phone: '',
  reporter_name: '',
  additional_info: '',
}

const IMMEDIATE_STEPS = [
  { step: '1', title: 'Lock your SIM card', desc: 'Call your network provider (MTN, Airtel, Glo, 9mobile) immediately to suspend the SIM.' },
  { step: '2', title: 'Remote wipe if possible', desc: 'Use Find My iPhone or Google Find My Device to remotely erase all data before someone accesses it.' },
  { step: '3', title: 'Change your passwords', desc: 'Change email, banking apps, and social media passwords from another device right now.' },
  { step: '4', title: 'Report to police', desc: 'File a police report. You will need this for insurance claims and to blacklist the IMEI with networks.' },
  { step: '5', title: 'Contact your bank', desc: 'If you have banking apps on the device, call your bank immediately to flag the account.' },
]

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
    if (!form.device_name || !form.reporter_phone || !form.reporter_name) {
      setError('Please fill in your name, phone number, and device name.')
      return
    }
    if (!form.imei && !form.serial_number) {
      setError('Please provide at least one identifier — IMEI or Serial Number.')
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
            Your device has been added to the Zolarux stolen registry.
            Anyone who checks this IMEI or serial number will be warned immediately.
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Report Reference</p>
            <p className="font-mono font-700 text-primary text-lg">{reference}</p>
            <p className="text-xs text-gray-400 mt-1">Save this for your records</p>
          </div>
          <p className="text-sm text-gray-500">
            Our team will review and verify your report within 24 hours.
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
          <h1 className="font-display text-4xl font-800 text-white mb-4">
            Report a Stolen Device
          </h1>
          <p className="text-gray-400 text-lg">
            Register your stolen gadget in our database so no one can unknowingly
            buy it from a thief. Free, takes 2 minutes, protects the whole community.
          </p>
        </div>
      </section>

      {/* Immediate action steps */}
      <div className="bg-red-600 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-white font-700 text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={15} />
            Do these things RIGHT NOW before filing this report:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {IMMEDIATE_STEPS.map(({ step: s, title, desc }) => (
              <div key={s} className="bg-white/10 rounded-xl p-3">
                <span className="text-white/50 text-xs font-800">{s}.</span>
                <p className="text-white font-700 text-xs mt-0.5">{title}</p>
                <p className="text-white/60 text-xs mt-1 leading-relaxed hidden sm:block">{desc}</p>
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
                    <input
                      type="text"
                      value={form.reporter_name}
                      onChange={update('reporter_name')}
                      placeholder="Your full name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-700 text-gray-700 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      value={form.reporter_phone}
                      onChange={update('reporter_phone')}
                      placeholder="08012345678"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Device info */}
              <div>
                <p className="text-xs font-700 text-gray-400 uppercase tracking-wider mb-4">Device Information</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-700 text-gray-700 mb-1.5">Device Name *</label>
                    <input
                      type="text"
                      value={form.device_name}
                      onChange={update('device_name')}
                      placeholder="e.g. iPhone 14 Pro Max 256GB Space Black"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">IMEI Number</label>
                      <input
                        type="text"
                        value={form.imei}
                        onChange={update('imei')}
                        placeholder="15-digit IMEI (*#06#)"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">Serial Number</label>
                      <input
                        type="text"
                        value={form.serial_number}
                        onChange={update('serial_number')}
                        placeholder="Found in Settings → About"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <AlertTriangle size={11} />
                    At least one identifier (IMEI or Serial Number) is required
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">Date Stolen</label>
                      <input
                        type="date"
                        value={form.date_stolen}
                        onChange={update('date_stolen')}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">Location Stolen</label>
                      <input
                        type="text"
                        value={form.location_stolen}
                        onChange={update('location_stolen')}
                        placeholder="e.g. Ikeja, Lagos"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-700 text-gray-700 mb-1.5">Additional Information</label>
                    <textarea
                      value={form.additional_info}
                      onChange={update('additional_info')}
                      placeholder="Any other details that might help identify the device (case colour, scratches, accessories, etc.)"
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
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
                  By submitting, you confirm this device was genuinely stolen and the information
                  provided is accurate. False reports are a criminal offence.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-red-600 text-white font-display font-700 py-4 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                  : <><Flag size={16} /> Submit Report</>}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}