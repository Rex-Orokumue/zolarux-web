'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, ArrowRight, Mail, User, Lock, Eye, EyeOff, CheckCircle, RefreshCw, Gift, Tag } from 'lucide-react'
import { generateReferralCode } from '@/lib/referral'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName]                       = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode]       = useState('')
  const [referralValid, setReferralValid]     = useState<boolean | null>(null) // null=unchecked, true=valid, false=invalid
  const [referralChecking, setReferralChecking] = useState(false)
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [registered, setRegistered]           = useState(false)
  const [resending, setResending]             = useState(false)
  const [otpCode, setOtpCode]                 = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying]             = useState(false)
  const [otpError, setOtpError]               = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Pre-fill referral code from URL: /register?ref=ZLXABC12
  useEffect(() => {
    const refParam = searchParams?.get('ref')
    if (refParam) setReferralCode(refParam.toUpperCase())
  }, [searchParams])

  // Validate referral code when user finishes typing (debounced)
  useEffect(() => {
    if (!referralCode.trim()) {
      setReferralValid(null)
      return
    }
    const timer = setTimeout(async () => {
      setReferralChecking(true)
      try {
        const code = referralCode.trim().toUpperCase()
        const res = await fetch(`/api/referrals/validate?code=${encodeURIComponent(code)}`)
        const valData = await res.json()
        setReferralValid(!!valData.valid)
      } catch {
        setReferralValid(null)
      } finally {
        setReferralChecking(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [referralCode])

  const handleRegister = async () => {
    setError('')
    if (!name.trim())                      { setError('Enter your full name'); return }
    if (!email.trim())                     { setError('Enter your email address'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim()))    { setError('Enter a valid email address'); return }
    if (password.length < 6)               { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword)      { setError('Passwords do not match'); return }
    if (referralCode.trim() && referralValid === false) {
      setError('The referral code you entered is invalid'); return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // 1. Sign up
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { role: 'buyer', full_name: name.trim() },
        },
      })

      if (signUpErr) {
        setError(
          signUpErr.message.includes('already registered')
            ? 'An account with this email already exists. Try signing in.'
            : signUpErr.message
        )
        setLoading(false)
        return
      }

      if (data.user) {
        // 2. Generate a referral code for the new user
        const newUserReferralCode = generateReferralCode()

        // 3. Create buyer profile server-side to bypass RLS for unauthenticated/anonymous users
        await fetch('/api/buyers/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id:             data.user.id,
            full_name:      name.trim(),
            email:          email.trim().toLowerCase(),
            referral_code:  newUserReferralCode,
          })
        })

        // 4. If referral code provided and valid — create referral record server-side to bypass RLS
        if (referralCode.trim() && referralValid === true) {
          const code = referralCode.trim().toUpperCase()
          try {
            const valRes = await fetch(`/api/referrals/validate?code=${encodeURIComponent(code)}`)
            const valData = await valRes.json()

            if (valData.valid && valData.referrer_id && valData.referrer_type) {
              await fetch('/api/referrals/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  referrer_id:      valData.referrer_id,
                  referrer_type:    valData.referrer_type,
                  referred_email:   email.trim().toLowerCase(),
                  referred_user_id: data.user.id,
                })
              })
            }
          } catch (e) {
            console.error('Failed to create referral record:', e)
          }
        }
      }

      // 5. Redirect or verify screen
      if (data.session) {
        router.push('/buyer')
      } else {
        setRegistered(true)
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: oAuthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/buyer${referralCode.trim() ? `&ref=${referralCode.trim().toUpperCase()}` : ''}`,
        },
      })
      if (oAuthErr) {
        setError(oAuthErr.message)
        setLoading(false)
      }
    } catch (e) {
      setError('Failed to initiate Google sign up.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const supabase = createClient()
      await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() })
    } catch {}
    setTimeout(() => setResending(false), 3000)
  }

  // ─── OTP helpers ──────────────────────────────────────────────────────────
  const handleOtpChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return // digits only
    const next = [...otpCode]
    next[idx] = value.slice(-1)
    setOtpCode(next)
    setOtpError('')
    // auto-advance
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus()
    // auto-submit when all 6 filled
    if (next.every((d) => d !== '')) handleVerifyOtp(next.join(''))
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otpCode]
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || ''
    setOtpCode(next)
    setOtpError('')
    const focusIdx = Math.min(pasted.length, 5)
    otpRefs.current[focusIdx]?.focus()
    if (next.every((d) => d !== '')) handleVerifyOtp(next.join(''))
  }

  const handleVerifyOtp = async (token: string) => {
    setVerifying(true)
    setOtpError('')
    try {
      const supabase = createClient()
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: 'signup',
      })
      if (verifyErr) {
        setOtpError(verifyErr.message.includes('expired')
          ? 'Code expired. Click "Resend" to get a new one.'
          : 'Invalid code. Check your email and try again.')
        setOtpCode(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      } else {
        router.push('/buyer')
      }
    } catch {
      setOtpError('Something went wrong. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  // ─── Email verify / OTP screen ────────────────────────────────────────────

  if (registered) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          <div className="bg-green-600 p-6 text-center">
            <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail size={26} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-800 text-white">Verify Your Email</h1>
            <p className="text-white/80 text-sm mt-2">We sent a 6-digit code to</p>
            <p className="text-white font-700 mt-1">{email}</p>
          </div>
          <div className="p-6 space-y-5">
            {/* OTP inputs */}
            <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-12 h-14 text-center text-xl font-800 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    otpError
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : digit
                      ? 'border-primary focus:ring-primary/30 bg-primary/5'
                      : 'border-gray-200 focus:ring-primary/30 focus:border-primary'
                  }`}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {verifying && (
              <div className="flex items-center justify-center gap-2 text-primary text-sm">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Verifying...
              </div>
            )}

            {otpError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                {otpError}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-amber-700 text-xs">
                💡 Don't see it? Check your <strong>spam/junk folder</strong>. The email comes from{' '}
                <strong>noreply@zolarux.com.ng</strong>
              </p>
            </div>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full border border-gray-200 text-gray-600 font-700 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Code resent!' : 'Resend verification code'}
            </button>

            <button
              onClick={() => handleVerifyOtp(otpCode.join(''))}
              disabled={verifying || otpCode.some((d) => !d)}
              className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {verifying ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Verify & Continue <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Registration form ─────────────────────────────────────────────────────

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

        <div className="p-6 space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adebayo Okafor"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Password</label>
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
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

          {/* Referral Code — optional */}
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              Referral Code <span className="text-gray-400 font-500">(optional)</span>
            </label>
            <div className="relative">
              <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. ZLXABC12"
                maxLength={8}
                className={`w-full border rounded-xl pl-10 pr-10 py-3 text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                  referralValid === true
                    ? 'border-green-400 focus:ring-green-200 bg-green-50'
                    : referralValid === false
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-primary/30 focus:border-primary'
                }`}
              />
              {/* Validation indicator */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {referralChecking && (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                )}
                {!referralChecking && referralValid === true && (
                  <CheckCircle size={16} className="text-green-500" />
                )}
                {!referralChecking && referralValid === false && (
                  <span className="text-red-400 text-xs font-700">✕</span>
                )}
              </div>
            </div>
            {referralValid === true && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Gift size={12} className="text-green-500" />
                <span className="text-green-600 text-xs font-600">Valid referral code — your friend earns a reward when you complete your first order!</span>
              </div>
            )}
            {referralValid === false && referralCode.length === 8 && (
              <p className="text-red-500 text-xs mt-1.5">This code doesn't match any account.</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || !name.trim() || !email.trim() || !password}
            className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-600">Or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-200 text-gray-700 bg-white font-600 py-3.5 rounded-xl hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.29c1.92,-1.78 3.02,-4.4 3.02,-7.4C21.65,11.9 21.55,11.5 21.35,11.1z" fill="#4285F4" />
                <path d="M12,20.5c2.43,0 4.47,-0.8 5.96,-2.2l-3.29,-2.6c-0.9,0.6 -2.07,0.98 -3.37,0.98 -2.36,0 -4.36,-1.6 -5.07,-3.7H2.84v2.7C4.33,18.7 7.94,20.5 12,20.5z" fill="#34A853" />
                <path d="M6.93,12.98c-0.18,-0.5 -0.28,-1.1 -0.28,-1.7c0,-0.6 0.1,-1.2 0.28,-1.7V6.88H2.84c-0.62,1.2 -0.98,2.6 -0.98,4.1s0.36,2.9 0.98,4.1L6.93,12.98z" fill="#FBBC05" />
                <path d="M12,6.82c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.6C16.46,4.02 14.42,3.2 12,3.2c-4.06,0 -7.67,1.8 -9.16,4.78l4.09,3.2c0.71,-2.1 2.71,-3.7 5.07,-3.7z" fill="#EA4335" />
              </g>
            </svg>
            Google
          </button>

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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md flex justify-center items-center py-12">
        <RefreshCw size={24} className="animate-spin text-primary" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}