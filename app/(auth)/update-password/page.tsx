'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase automatically picks up the recovery token from the URL hash
    // and establishes a session. We just need to wait for it.
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    // Also check if already in a session (e.g., if event already fired)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setSessionReady(true)
    })
  }, [])

  const handleUpdatePassword = async () => {
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
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-3">
            Password Updated!
          </h2>
          <p className="text-gray-500 mb-2">
            Your password has been set successfully.
          </p>
          <p className="text-gray-400 text-sm">
            Redirecting to sign in...
          </p>
          <div className="mt-4 w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-800 text-white">Set New Password</h1>
          <p className="text-white/70 text-sm mt-1">Choose a password for your account</p>
        </div>

        <div className="p-6 space-y-4">
          {!sessionReady ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Verifying your reset link...</p>
              <p className="text-gray-400 text-xs mt-2">
                If this takes too long, the link may have expired.{' '}
                <a href="/reset-password" className="text-primary hover:underline">Request a new one</a>
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">New Password</label>
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
                <label className="block text-sm font-700 text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdatePassword()}
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
                onClick={handleUpdatePassword}
                disabled={loading || password.length < 6 || password !== confirmPassword}
                className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Set Password'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
