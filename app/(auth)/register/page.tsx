'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, ArrowRight, Mail, User, CheckCircle } from 'lucide-react'

type Step = 'email' | 'otp' | 'profile'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async () => {
    setError('')
    if (!email.trim()) { setError('Enter your email address'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) { setError('Enter a valid email address'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    })
    if (err) setError(err.message)
    else setStep('otp')
    setLoading(false)
  }

  const handleVerifyOTP = async () => {
    setError('')
    if (otp.length < 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: 'email',
    })
    if (err) setError(err.message)
    else setStep('profile')
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    setError('')
    if (!name.trim()) { setError('Enter your full name'); return }
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expired. Please start again.'); setLoading(false); return }

    const { error: profileErr } = await supabase
      .from('buyers')
      .upsert({
        id: user.id,
        full_name: name.trim(),
        email: email.trim(),
        created_at: new Date().toISOString(),
      })

    if (profileErr) {
      console.warn('Profile save warning:', profileErr.message)
    }

    router.push('/buyer')
    setLoading(false)
  }

  const STEPS = [
    { id: 'email',   label: 'Email' },
    { id: 'otp',     label: 'Verify' },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-800 text-white">Create Your Account</h1>
          <p className="text-white/70 text-sm mt-1">Buy gadgets safely on Zolarux</p>
        </div>

        <div className="flex border-b border-gray-100">
          {STEPS.map(({ id, label }) => {
            const stepOrder = ['email', 'otp', 'profile']
            const currentIndex = stepOrder.indexOf(step)
            const thisIndex = stepOrder.indexOf(id)
            const isDone = thisIndex < currentIndex
            const isActive = id === step
            return (
              <div
                key={id}
                className={`flex-1 py-3 text-center text-xs font-700 transition-colors ${
                  isActive ? 'text-primary border-b-2 border-primary' :
                  isDone ? 'text-green-600' : 'text-gray-300'
                }`}
              >
                {isDone ? <CheckCircle size={14} className="mx-auto" /> : label}
              </div>
            )
          })}
        </div>

        <div className="p-6">
          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleSendOTP}
                disabled={loading || !email.trim()}
                className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Send Verification Code <ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail size={18} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Code sent to <strong>{email}</strong></p>
                <p className="text-xs text-gray-400 mt-1">Check your inbox (and spam folder)</p>
              </div>
              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">6-Digit Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                  placeholder="000000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-display font-700 tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length < 6}
                className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Verify Email'}
              </button>
              <button
                onClick={() => { setStep('email'); setOtp(''); setError('') }}
                className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Change email
              </button>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-2">
                  <User size={18} className="text-primary" />
                </div>
                <p className="text-sm text-gray-600">Almost done — just your name</p>
              </div>
              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                  placeholder="e.g. Adebayo Okafor"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleSaveProfile}
                disabled={loading || !name.trim()}
                className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Complete Registration <ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-700 hover:underline">Sign in</Link>
            </p>
            <p className="text-sm text-gray-500">
              Are you a vendor?{' '}
              <Link href="/register/vendor" className="text-primary font-700 hover:underline">
                Register your business
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}