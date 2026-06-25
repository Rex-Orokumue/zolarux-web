'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight, Shield, Store, ShoppingBag, AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react'

type Role = 'buyer' | 'vendor'

function LoginContent() {
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

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const next = redirectTo || (role === 'vendor' ? '/vendor' : '/buyer')
      const { error: oAuthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (oAuthErr) {
        setError(oAuthErr.message)
        setLoading(false)
      }
    } catch (e) {
      setError('Failed to initiate Google sign in.')
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

            {searchParams.get('registered') === 'true' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">Account created! Check your email for a verification link, then sign in below.</p>
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
                Forgot your password?
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}