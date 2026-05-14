'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle, Mail, MapPin, Clock,
  Send, CheckCircle, Shield, ArrowRight
} from 'lucide-react'

const CONTACT_OPTIONS = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    desc: 'Fastest response. Most transactions start here.',
    value: '+234 706 310 7314',
    href: 'https://wa.me/2347063107314?text=Hi Zolarux, I need help with:',
    cta: 'Chat on WhatsApp',
    color: 'bg-green-500',
    available: 'Mon–Sat, 8am–8pm',
  },
  {
    icon: Mail,
    title: 'Email',
    desc: 'For formal inquiries, partnership requests, and complaints.',
    value: 'hello@zolarux.com.ng',
    href: 'mailto:hello@zolarux.com.ng',
    cta: 'Send Email',
    color: 'bg-primary',
    available: 'Response within 24 hours',
  },
]

const COMMON_TOPICS = [
  { label: 'Start a protected transaction',    msg: 'Hi, I want to start an escrow transaction for:' },
  { label: 'Check a vendor',                   msg: 'Hi, I want to verify this vendor:' },
  { label: 'Raise a dispute',                  msg: 'Hi, I need to raise a dispute for order:' },
  { label: 'Apply as a vendor',                msg: 'Hi, I want to apply as a Zolarux vendor.' },
  { label: 'Report a scam',                    msg: 'Hi, I want to report a suspected scam.' },
  { label: 'General question',                 msg: 'Hi, I have a question about Zolarux.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.message) return
    setLoading(true)
    // Send via WhatsApp as fallback since no email server yet
    const msg = `New contact form submission:\n\nName: ${form.name}\nPhone: ${form.phone}\nSubject: ${form.subject}\nMessage: ${form.message}`
    window.open(`https://wa.me/2347063107314?text=${encodeURIComponent(msg)}`, '_blank')
    await new Promise(r => setTimeout(r, 1000))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-800 text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-white/70 text-lg">
            Whether you want to buy something, sell something, raise a dispute,
            or just have a question — we are here.
          </p>
        </div>
      </section>

      <section className="py-14 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left — contact options */}
            <div className="space-y-4">
              {CONTACT_OPTIONS.map(({ icon: Icon, title, desc, value, href, cta, color, available }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-display font-700 text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs mb-2 leading-relaxed">{desc}</p>
                  <p className="text-gray-700 text-sm font-600 mb-1">{value}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                    <Clock size={11} />
                    {available}
                  </div>
                  <Link
                    href={href}
                    target="_blank"
                    className={`w-full flex items-center justify-center gap-2 ${color} text-white text-sm font-700 py-2.5 rounded-xl hover:opacity-90 transition-all`}
                  >
                    {cta}
                  </Link>
                </div>
              ))}

              {/* Location */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <MapPin size={18} className="text-gray-600" />
                </div>
                <h3 className="font-display font-700 text-gray-900 mb-1">Location</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Lagos, Nigeria<br />
                  <span className="text-xs text-gray-400">Operations are nationwide</span>
                </p>
              </div>
            </div>

            {/* Right — quick topics + form */}
            <div className="lg:col-span-2 space-y-5">

              {/* Quick topics */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h3 className="font-display font-700 text-gray-900 mb-4">
                  Quick — What do you need help with?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_TOPICS.map(({ label, msg }) => (
                    <Link
                      key={label}
                      href={`https://wa.me/2347063107314?text=${encodeURIComponent(msg)}`}
                      target="_blank"
                      className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-primary-light text-sm text-gray-700 hover:text-primary font-500 transition-all group"
                    >
                      <ArrowRight size={13} className="text-gray-300 group-hover:text-primary transition-colors" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h3 className="font-display font-700 text-gray-900 mb-5">Send a Message</h3>

                {submitted ? (
                  <div className="py-8 text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={26} className="text-green-600" />
                    </div>
                    <p className="font-display font-700 text-gray-900 mb-2">Message Sent</p>
                    <p className="text-gray-500 text-sm">
                      Your message has been forwarded to our WhatsApp. We will respond shortly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-700 text-gray-700 mb-1.5">Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={update('name')}
                          placeholder="Your full name"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-700 text-gray-700 mb-1.5">Phone Number *</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={update('phone')}
                          placeholder="08012345678"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">Subject</label>
                      <select
                        value={form.subject}
                        onChange={update('subject')}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                      >
                        <option value="">Select a subject</option>
                        <option>I want to buy something</option>
                        <option>I want to become a vendor</option>
                        <option>I have a dispute</option>
                        <option>I want to report a scam</option>
                        <option>Partnership / Business Inquiry</option>
                        <option>Technical Issue</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-700 text-gray-700 mb-1.5">Message *</label>
                      <textarea
                        value={form.message}
                        onChange={update('message')}
                        placeholder="Tell us how we can help you..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    </div>

                    <div className="bg-primary-light rounded-xl p-3 flex items-start gap-2">
                      <Shield size={13} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-primary text-xs">
                        This form forwards your message to our WhatsApp for fastest response.
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !form.name || !form.phone || !form.message}
                      className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Send size={16} /> Send Message</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}