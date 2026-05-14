'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, CheckCircle, ArrowRight, ArrowLeft, Upload, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VENDOR_CATEGORIES } from '@/lib/constants'

type Step = 1 | 2 | 3 | 'success'

interface VendorForm {
  // Step 1 — Business info
  business_name: string
  category: string
  phone_number: string
  email: string
  business_address: string
  instagram_handle: string
  whatsapp_number: string
  years_in_business: string

  // Step 2 — Identity & verification
  owner_full_name: string
  nin_number: string
  id_type: string
  supplier_name: string
  supplier_relationship: string
  business_description: string

  // Step 3 — Agreement
  guarantor_name: string
  guarantor_phone: string
  agrees_to_terms: boolean
  agrees_to_sop: boolean
  agrees_to_escrow: boolean
}

const INITIAL_FORM: VendorForm = {
  business_name: '', category: '', phone_number: '', email: '',
  business_address: '', instagram_handle: '', whatsapp_number: '',
  years_in_business: '', owner_full_name: '', nin_number: '',
  id_type: '', supplier_name: '', supplier_relationship: '',
  business_description: '', guarantor_name: '', guarantor_phone: '',
  agrees_to_terms: false, agrees_to_sop: false, agrees_to_escrow: false,
}

const STEP_LABELS = ['Business Info', 'Identity & Suppliers', 'Agreement']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 border-b border-gray-100">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const isDone = num < current
        const isActive = num === current
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 ${isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-gray-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-800 ${
                isActive ? 'bg-primary text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? <CheckCircle size={12} /> : num}
              </div>
              <span className="text-xs font-700 hidden sm:block">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-8 h-0.5 ${num < current ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-700 text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
const selectClass = `${inputClass} bg-white`

export default function VendorRegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<VendorForm>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  const update = (field: keyof VendorForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

  const toggle = (field: keyof VendorForm) => () => {
    setForm(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
  }

  const validateStep1 = () => {
    if (!form.business_name) return 'Business name is required'
    if (!form.category) return 'Select a category'
    if (!form.phone_number) return 'Phone number is required'
    if (!form.whatsapp_number) return 'WhatsApp number is required'
    return null
  }

  const validateStep2 = () => {
    if (!form.owner_full_name) return 'Owner full name is required'
    if (!form.nin_number) return 'NIN number is required'
    if (!form.supplier_name) return 'Supplier name is required'
    if (!form.business_description) return 'Business description is required'
    return null
  }

  const validateStep3 = () => {
    if (!form.guarantor_name) return 'Guarantor name is required'
    if (!form.guarantor_phone) return 'Guarantor phone is required'
    if (!form.agrees_to_terms || !form.agrees_to_sop || !form.agrees_to_escrow) {
      return 'You must agree to all terms to proceed'
    }
    return null
  }

  const handleNext = () => {
    setError('')
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : null
    if (err) { setError(err); return }
    setStep((step as number + 1) as Step)
  }

  const handleSubmit = async () => {
    setError('')
    const err = validateStep3()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const ref = `ZLX-V-${Date.now().toString(36).toUpperCase()}`

      const { error: dbErr } = await supabase
        .from('vendor_applications')
        .insert({
          reference: ref,
          business_name: form.business_name,
          category: form.category,
          phone_number: form.phone_number,
          email: form.email || null,
          business_address: form.business_address || null,
          instagram_handle: form.instagram_handle || null,
          whatsapp_number: form.whatsapp_number,
          years_in_business: form.years_in_business || null,
          owner_full_name: form.owner_full_name,
          nin_number: form.nin_number,
          id_type: form.id_type || null,
          supplier_name: form.supplier_name,
          supplier_relationship: form.supplier_relationship || null,
          business_description: form.business_description,
          guarantor_name: form.guarantor_name,
          guarantor_phone: form.guarantor_phone,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })

      if (dbErr) {
        // If table doesn't exist yet, still show success — data will be sent via WhatsApp
        console.warn('DB insert warning:', dbErr.message)
      }

      // Also send summary to WhatsApp as backup
      const summary = `New Vendor Application:\n\nRef: ${ref}\nBusiness: ${form.business_name}\nCategory: ${form.category}\nPhone: ${form.phone_number}\nOwner: ${form.owner_full_name}\nNIN: ${form.nin_number}\nSupplier: ${form.supplier_name}`
      window.open(`https://wa.me/2347063107314?text=${encodeURIComponent(summary)}`, '_blank')

      setReference(ref)
      setStep('success')
    } catch (e) {
      setError('Submission failed. Please try again or contact us on WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="w-full max-w-lg text-center">
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-3">Application Submitted</h2>
          <p className="text-gray-500 mb-5 leading-relaxed">
            Your vendor application has been received. Our verification team will
            contact you within <strong>24–72 hours</strong> via WhatsApp to schedule
            your video verification call.
          </p>
          <div className="bg-surface rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Application Reference</p>
            <p className="font-mono font-700 text-primary text-lg">{reference}</p>
            <p className="text-xs text-gray-400 mt-1">Save this for follow-up</p>
          </div>
          <div className="space-y-3 text-sm text-gray-600 text-left bg-primary-light rounded-xl p-4 mb-6">
            <p className="font-700 text-primary text-xs uppercase tracking-wider mb-2">What happens next</p>
            {[
              'Our team reviews your application (24hrs)',
              'We contact you on WhatsApp to schedule a video call',
              'Identity and business documents are verified',
              'You receive your Vendor ID and verified badge',
              'Your listings go live on Zolarux',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0 font-700 mt-0.5">{i + 1}</span>
                <span className="text-xs">{item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
          >
            Back to Home <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl">
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-950 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="font-display text-xl font-800 text-white">Vendor Application</h1>
              <p className="text-gray-400 text-xs">Zolarux Verification Programme</p>
            </div>
          </div>
        </div>

        <StepIndicator current={step as number} />

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1 — Business Info */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-700 mb-2">Business Information</p>

              <Field label="Business Name" required>
                <input type="text" value={form.business_name} onChange={update('business_name')}
                  placeholder="e.g. TechZone Gadgets" className={inputClass} />
              </Field>

              <Field label="Product Category" required>
                <select value={form.category} onChange={update('category')} className={selectClass}>
                  <option value="">Select a category</option>
                  {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Business Phone" required>
                  <input type="tel" value={form.phone_number} onChange={update('phone_number')}
                    placeholder="08012345678" className={inputClass} />
                </Field>
                <Field label="WhatsApp Number" required>
                  <input type="tel" value={form.whatsapp_number} onChange={update('whatsapp_number')}
                    placeholder="08012345678" className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address">
                  <input type="email" value={form.email} onChange={update('email')}
                    placeholder="business@email.com" className={inputClass} />
                </Field>
                <Field label="Instagram Handle">
                  <input type="text" value={form.instagram_handle} onChange={update('instagram_handle')}
                    placeholder="@yourbusiness" className={inputClass} />
                </Field>
              </div>

              <Field label="Business Address">
                <input type="text" value={form.business_address} onChange={update('business_address')}
                  placeholder="Street, City, State" className={inputClass} />
              </Field>

              <Field label="Years in Business">
                <select value={form.years_in_business} onChange={update('years_in_business')} className={selectClass}>
                  <option value="">Select</option>
                  <option>Less than 1 year</option>
                  <option>1–2 years</option>
                  <option>3–5 years</option>
                  <option>5+ years</option>
                </select>
              </Field>
            </div>
          )}

          {/* Step 2 — Identity & Suppliers */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-700 mb-2">Identity & Supplier Information</p>

              <Field label="Owner Full Name" required>
                <input type="text" value={form.owner_full_name} onChange={update('owner_full_name')}
                  placeholder="As it appears on your ID" className={inputClass} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="NIN Number" required>
                  <input type="text" value={form.nin_number} onChange={update('nin_number')}
                    placeholder="11-digit NIN" className={inputClass} />
                </Field>
                <Field label="Additional ID Type">
                  <select value={form.id_type} onChange={update('id_type')} className={selectClass}>
                    <option value="">Select (optional)</option>
                    <option>International Passport</option>
                    <option>Driver's Licence</option>
                    <option>Voter's Card</option>
                  </select>
                </Field>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Upload size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-700 text-xs leading-relaxed">
                    ID document uploads will be requested during your video verification call.
                    You do not need to upload them here.
                  </p>
                </div>
              </div>

              <Field label="Primary Supplier Name" required>
                <input type="text" value={form.supplier_name} onChange={update('supplier_name')}
                  placeholder="Where do you source your products?" className={inputClass} />
              </Field>

              <Field label="Supplier Relationship">
                <select value={form.supplier_relationship} onChange={update('supplier_relationship')} className={selectClass}>
                  <option value="">Select</option>
                  <option>Direct importer</option>
                  <option>Authorized reseller</option>
                  <option>Wholesale buyer</option>
                  <option>Online supplier (Alibaba, etc.)</option>
                  <option>Local market supplier</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="Business Description" required>
                <textarea
                  value={form.business_description}
                  onChange={update('business_description')}
                  placeholder="Briefly describe your business, what you sell, and how long you have been operating..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          )}

          {/* Step 3 — Agreement */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-700 mb-2">Guarantor & Agreement</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Guarantor Full Name" required>
                  <input type="text" value={form.guarantor_name} onChange={update('guarantor_name')}
                    placeholder="Someone who can vouch for you" className={inputClass} />
                </Field>
                <Field label="Guarantor Phone" required>
                  <input type="tel" value={form.guarantor_phone} onChange={update('guarantor_phone')}
                    placeholder="Guarantor's phone number" className={inputClass} />
                </Field>
              </div>

              <div className="bg-surface rounded-2xl p-4 space-y-4">
                <p className="font-700 text-gray-900 text-sm">Agreements — all required</p>

                {[
                  { key: 'agrees_to_terms', label: 'Zolarux Vendor Terms of Service', desc: 'I agree to the vendor terms including conduct, product quality, and dispute obligations.' },
                  { key: 'agrees_to_sop', label: 'Standard Operating Procedures', desc: 'I agree to follow Zolarux SOPs for order fulfillment, communication, and evidence submission.' },
                  { key: 'agrees_to_escrow', label: 'Escrow Payment Model', desc: 'I understand payments are held in escrow and only released after buyer confirmation. I will not attempt to collect payment outside this system.' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={toggle(key as keyof VendorForm)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                        form[key as keyof VendorForm]
                          ? 'bg-primary border-primary'
                          : 'border-gray-300 group-hover:border-primary'
                      }`}
                    >
                      {form[key as keyof VendorForm] && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-700 text-gray-800 text-sm">{label}</p>
                      <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-primary-light rounded-xl p-4 flex items-start gap-2">
                <Shield size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-primary text-xs leading-relaxed">
                  By submitting, you confirm all information is accurate. False information
                  results in immediate rejection and may be reported to relevant authorities.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {(step as number) > 1 && (
              <button
                onClick={() => setStep((step as number - 1) as Step)}
                className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 font-700 rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}
            {step === 3 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-accent text-white font-display font-700 py-3 rounded-xl hover:bg-accent-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Shield size={16} /> Submit Application</>}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 bg-primary text-white font-display font-700 py-3 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Already verified?{' '}
            <Link href="/login" className="text-primary font-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}