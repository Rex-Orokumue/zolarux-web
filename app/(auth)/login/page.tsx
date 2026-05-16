'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight, Shield, Store, ShoppingBag, AlertTriangle, Eye, EyeOff } from 'lucide-react'

type Role = 'buyer' | 'vendor'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const [role, setRole] = useState<Role>('buyer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Enter your email address'); return }
    if (!password) { setError('Enter your password'); return }
    setLoading(true)

    try {
      const supabase = createClient()

      // If vendor, verify they have an activated account first
      if (role === 'vendor') {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('vendor_id, status, activated_at')
          .eq('email', email.trim().toLowerCase())
          .single()

        if (!vendor) {
          setError('No vendor account found with this email. Have you applied and been activated?')
          setLoading(false)
          return
        }

        if (vendor.status === 'pending') {
          setError('Your application is still under review. We\'ll notify you on WhatsApp once approved.')
          setLoading(false)
          return
        }

        if (vendor.status === 'rejected') {
          setError('Your vendor application was not approved. Contact us on WhatsApp.')
          setLoading(false)
          return
        }

        if (!vendor.activated_at) {
          setError('Your account hasn\'t been activated yet. Please activate first.')
          setLoading(false)
          return
        }
      }

      // Sign in with email and password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInErr) {
        if (signInErr.message.includes('Invalid login credentials')) {
          setError('Wrong email or password. Try again or reset your password.')
        } else {
          setError(signInErr.message)
        }
        setLoading(false)
        return
      }

      // Update user metadata with the selected role so the Navbar
      // and other components know which dashboard to show
      await supabase.auth.updateUser({
        data: { role },
      })

      // Redirect to the right dashboard
      const destination = redirectTo || (role === 'vendor' ? '/vendor' : '/buyer')
      router.push(destination)
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchRole = (newRole: Role) => {
    setRole(newRole)
    setPassword('')
    setError('')
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-center">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-800 text-white">Welcome Back</h1>
          <p className="text-white/70 text-sm mt-1">Sign in to your Zolarux account</p>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => switchRole('buyer')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-700 transition-all ${
              role === 'buyer'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShoppingBag size={16} />
            Buyer
          </button>
          <button
            onClick={() => switchRole('vendor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-700 transition-all ${
              role === 'vendor'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Store size={16} />
            Vendor
          </button>
        </div>

        <form onSubmit={handleSignIn} className="p-6">
          <div className="space-y-4">
            {role === 'vendor' && (
              <div className="bg-gray-950 rounded-xl p-3 flex items-start gap-2">
                <Store size={14} className="text-accent shrink-0 mt-0.5" />
                <p className="text-gray-300 text-xs leading-relaxed">
                  Sign in with the email you used in your vendor application.
                  Your account must be verified and activated.
                </p>
              </div>
            )}

            {/* Email */}
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
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <div className="text-right">
              <Link href="/reset-password" className="text-xs text-primary font-600 hover:underline">
                Forgot password? / First time with password?
              </Link>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
            {role === 'buyer' ? (
              <p className="text-sm text-gray-500">
                No account?{' '}
                <Link href="/register" className="text-primary font-700 hover:underline">
                  Create one free
                </Link>
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Not a vendor yet?{' '}
                  <Link href="/register/vendor" className="text-primary font-700 hover:underline">
                    Apply as a vendor
                  </Link>
                </p>
                <p className="text-sm text-gray-500">
                  Approved but not activated?{' '}
                  <Link href="/vendor/activate" className="text-primary font-700 hover:underline">
                    Activate account
                  </Link>
                </p>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}