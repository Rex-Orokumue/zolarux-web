'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, ArrowRight, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, Field, Input, Button } from '@/components/ui'

type Step = 'phone' | 'otp'

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+234' + digits.slice(1)
  if (digits.startsWith('234')) return '+' + digits
  return '+234' + digits
}

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendOtp = async () => {
    setError('')
    if (!phone.trim()) return setError('Enter your phone number')
    setLoading(true)
    const { error: err } = await createClient().auth.signInWithOtp({ phone: formatPhone(phone) })
    if (err) setError(err.message)
    else setStep('otp')
    setLoading(false)
  }

  const verifyOtp = async () => {
    setError('')
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setLoading(true)
    const { error: err } = await createClient().auth.verifyOtp({
      phone: formatPhone(phone),
      token: otp,
      type: 'sms',
    })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/') // no /buyer area on this branch
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="overflow-hidden">
        <div className="bg-primary p-6 text-center text-on-primary">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-on-primary/15">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-display text-xl font-extrabold">Welcome back</h1>
          <p className="mt-1 font-body text-sm text-on-primary/75">Sign in to track your orders</p>
        </div>

        <div className="p-6">
          {step === 'phone' ? (
            <div className="space-y-4">
              <Field label="Phone number" htmlFor="login-phone">
                <div className="flex gap-2">
                  <span className="inline-flex shrink-0 items-center rounded-md border border-line bg-surface px-3 font-body text-sm font-semibold text-ink-soft">
                    +234
                  </span>
                  <Input
                    id="login-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                    placeholder="08012345678"
                  />
                </div>
              </Field>
              {error && <p className="font-body text-sm text-danger">{error}</p>}
              <Button className="w-full" onClick={sendOtp} loading={loading}>
                Send code <ArrowRight size={16} />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-pill bg-verified/12">
                  <Phone size={18} className="text-verified" />
                </div>
                <p className="font-body text-sm text-ink-soft">
                  Code sent to <strong className="text-ink">{phone}</strong>
                </p>
              </div>
              <Field label="6-digit code" htmlFor="login-otp">
                <Input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                  placeholder="000000"
                  className="text-center text-2xl font-bold tracking-[0.4em]"
                />
              </Field>
              {error && <p className="text-center font-body text-sm text-danger">{error}</p>}
              <Button className="w-full" onClick={verifyOtp} loading={loading} disabled={otp.length < 6}>
                Verify &amp; sign in
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setError('')
                }}
                className="w-full font-body text-sm text-ink-soft transition-micro hover:text-ink"
              >
                Change number
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
