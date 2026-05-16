'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, ArrowRight, Mail, User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    setError('')
    if (!name.trim()) { setError('Enter your full name'); return }
    if (!email.trim()) { setError('Enter your email address'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) { setError('Enter a valid email address'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)

    try {
      const supabase = createClient()

      // Sign up with email and password
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            role: 'buyer',
            full_name: name.trim(),
          },
        },
      })

      if (signUpErr) {
        if (signUpErr.message.includes('already registered')) {
          setError('An account with this email already exists. Try signing in.')
        } else {
          setError(signUpErr.message)
        }
        setLoading(false)
        return
      }

      // Create buyer profile
      if (data.user) {
        await supabase.from('buyers').upsert({
          id: data.user.id,
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          created_at: new Date().toISOString(),
        })
      }

      // If email confirmation is required, Supabase won't auto-sign in.
      // If it IS auto-confirmed, redirect to dashboard.
      if (data.session) {
        router.push('/buyer')
      } else {
        // Email confirmation required — show success
        setError('')
        router.push('/login?registered=true')
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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