'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, Mail, CheckCircle, ArrowRight, AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react'

type Step = 'email' | 'otp' | 'password' | 'success'

export default function VendorActivatePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vendorName, setVendorName] = useState('')

  const handleSendOTP = async () => {
    setError('')
    if (!email.trim()) { setError('Enter your email address'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/vendor-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      setVendorName(data.business_name)
      setStep('otp')
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError('')
    if (otp.length < 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: 'email',
      })

      if (verifyError) {
        setError(verifyError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Look up the application reference by email
        const { data: app } = await supabase
          .from('vendor_applications')
          .select('reference, business_name')
          .eq('email', email.trim().toLowerCase())
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (app) {
          // Set vendor metadata on the auth user
          await supabase.auth.updateUser({
            data: {
              role: 'vendor',
              vendor_id: app.reference,
              business_name: app.business_name,
            },
          })

          // Link vendor record to auth user
          await supabase
            .from('vendors')
            .update({
              auth_user_id: data.user.id,
              email: email.trim().toLowerCase(),
              activated_at: new Date().toISOString(),
            })
            .eq('vendor_id', app.reference)
        }
      }

      // Move to password step
      setStep('password')
    } catch (e) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async () => {
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      })

      if (updateErr) {
        setError(updateErr.message)
        setLoading(false)
        return
      }

      setStep('success')
      setTimeout(() => router.push('/vendor'), 2500)
    } catch (e) {
      setError('Failed to set password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-3">
            Account Activated!
          </h2>
          <p className="text-gray-500 mb-2">
            Welcome to Zolarux, <strong>{vendorName}</strong>.
          </p>
          <p className="text-gray-400 text-sm">
            Taking you to your vendor dashboard...
          </p>
          <div className="mt-4 w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-950 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="font-display text-xl font-800 text-white">Activate Your Account</h1>
              <p className="text-gray-400 text-xs">First-time vendor setup</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mt-4">
            {['Verify Email', 'Enter Code', 'Set Password', 'Done'].map((label, i) => {
              const stepOrder: Step[] = ['email', 'otp', 'password', 'success']
              const currentIndex = stepOrder.indexOf(step)
              const isDone = i < currentIndex
              const isActive = i === currentIndex
              return (
                <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-800 ${
                      isDone ? 'bg-green-500 text-white' :
                      isActive ? 'bg-white text-gray-900' :
                      'bg-white/20 text-white/40'
                    }`}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:block ${
                      isActive ? 'text-white font-700' : isDone ? 'text-green-400' : 'text-white/30'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-px ${isDone ? 'bg-green-500' : 'bg-white/10'}`} />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-6">
          {step === 'email' && (
            <div className="space-y-4">
              <div className="bg-primary-light rounded-xl p-3.5">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Enter the email address you used in your vendor application.
                  We'll send a one-time code to verify it.
                </p>
              </div>

              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || !email.trim()}
                className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Verification Code <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail size={18} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Code sent to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-400 mt-1">Check your inbox (and spam folder)</p>
              </div>

              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">
                  6-Digit Code
                </label>
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length < 6}
                className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify Code'
                )}
              </button>

              <button
                onClick={() => { setStep('email'); setOtp(''); setError('') }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Change email
              </button>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock size={18} className="text-primary" />
                </div>
                <p className="text-sm text-gray-600">
                  Email verified! Now set a password for <strong>{vendorName}</strong>
                </p>
                <p className="text-xs text-gray-400 mt-1">You'll use this to sign in going forward</p>
              </div>

              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetPassword()}
                    placeholder="Re-enter your password"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                {password && confirmPassword && password === confirmPassword && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-green-600 text-xs font-600">Passwords match</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSetPassword}
                disabled={loading || password.length < 6 || password !== confirmPassword}
                className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Activate Account <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Already activated?{' '}
              <Link href="/login" className="text-primary font-700 hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Not applied yet?{' '}
              <Link href="/register/vendor" className="text-primary font-700 hover:underline">
                Apply as a vendor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}