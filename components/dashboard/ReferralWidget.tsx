'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gift, Copy, CheckCheck, Users, Clock, TrendingUp, Wallet, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { fetchReferralStats, buildReferralLink, ensureReferralCode, MIN_WITHDRAWAL_AMOUNT } from '@/lib/referral'
import type { ReferralStats } from '@/lib/referral'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ReferralWidgetProps {
  userId:   string
  userType: 'vendor' | 'buyer'
}

export default function ReferralWidget({ userId, userType }: ReferralWidgetProps) {
  const [stats, setStats]       = useState<ReferralStats | null>(null)
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Ensure they have a code (generates one if missing)
      await ensureReferralCode(userId, userType)
      const data = await fetchReferralStats(userId, userType)
      setStats(data)

      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [userId, userType])

  useEffect(() => { load() }, [load])

  const referralLink = stats?.code ? buildReferralLink(stats.code) : null

  const handleCopy = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = referralLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  // ── Reward table copy ────────────────────────────────────────────────────
  // Same reward regardless of referrer type — what matters is who you refer
  const rewardRows = [
    { label: 'You refer a buyer',  reward: '₦2,000' },
    { label: 'You refer a vendor', reward: '₦500' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Gift size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-display font-700 text-white text-sm">Referral Program</h2>
            <p className="text-white/70 text-xs">Earn cash for every referral</p>
          </div>
        </div>
        {/* Wallet balance chip */}
        {stats && (
          <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
            <Wallet size={11} className="text-white/80" />
            <span className="text-white text-xs font-700">{formatPrice(stats.walletBalance)}</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Referral link */}
            <div>
              <label className="block text-xs font-700 text-gray-500 mb-1.5 uppercase tracking-wide">
                Your Referral Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 min-w-0">
                  <p className="text-sm text-gray-700 font-mono truncate">
                    {referralLink ?? 'Generating…'}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!referralLink}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-700 text-sm transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
                  } disabled:opacity-50`}
                >
                  {copied ? (
                    <><CheckCheck size={14} /> Copied!</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Share this link. When someone signs up and completes their first order (min ₦10,000),
                you earn a reward instantly.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Total',     value: stats?.totalReferrals ?? 0, icon: Users,      color: 'text-primary bg-primary-light' },
                { label: 'Pending',   value: stats?.pending ?? 0,        icon: Clock,      color: 'text-amber-600 bg-amber-50' },
                { label: 'Converted', value: stats?.converted ?? 0,      icon: TrendingUp, color: 'text-green-600 bg-green-50' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${color}`}>
                    <Icon size={13} />
                  </div>
                  <p className="font-display font-800 text-gray-900 text-base">{value}</p>
                  <p className="text-gray-400 text-xs">{label}</p>
                </div>
              ))}
            </div>

            {/* Total earned */}
            {(stats?.totalEarned ?? 0) > 0 && (
              <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-600" />
                  <span className="text-green-800 text-sm font-700">Total Earned from Referrals</span>
                </div>
                <span className="font-display font-800 text-green-700">{formatPrice(stats!.totalEarned)}</span>
              </div>
            )}

            {/* Withdrawable Balance / Withdrawal Request */}
            {(stats?.walletBalance ?? 0) > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-amber-700" />
                    <span className="text-amber-800 text-sm font-700">Withdrawable Balance</span>
                  </div>
                  <span className="font-display font-800 text-amber-700">{formatPrice(stats!.walletBalance)}</span>
                </div>
                
                {stats!.walletBalance >= MIN_WITHDRAWAL_AMOUNT ? (
                  <a
                    href={`https://wa.me/2347063107314?text=${encodeURIComponent(
                      `Hi Zolarux Support,\n\nI would like to request a withdrawal of my referral earnings.\n\n*Referral Details:*\n- Account Type: ${userType === 'buyer' ? 'Buyer' : 'Vendor'}\n- Email: ${userEmail || 'My Account'}\n- User ID: ${userId}\n- Withdrawable Balance: ₦${stats!.walletBalance.toLocaleString()}\n\nPlease verify and process my payout. Thank you!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-display font-700 text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-95 text-center block"
                  >
                    <MessageCircle size={14} /> Request Withdrawal on WhatsApp
                  </a>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-400 font-display font-700 text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed text-center border border-gray-200"
                    >
                      <MessageCircle size={14} /> Request Withdrawal on WhatsApp
                    </button>
                    <p className="text-[10px] text-amber-700 text-center font-600">
                      Minimum withdrawal threshold is {formatPrice(MIN_WITHDRAWAL_AMOUNT)}. You need {formatPrice(MIN_WITHDRAWAL_AMOUNT - stats!.walletBalance)} more.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reward table — collapsible */}
            <div>
              <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1.5 text-xs text-gray-500 font-700 hover:text-primary transition-colors"
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {expanded ? 'Hide' : 'Show'} reward structure
              </button>

              {expanded && (
                <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 grid grid-cols-2">
                    <span className="text-xs font-700 text-gray-500 uppercase tracking-wide">Action</span>
                    <span className="text-xs font-700 text-gray-500 uppercase tracking-wide text-right">Your Reward</span>
                  </div>
                  {rewardRows.map((row, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 grid grid-cols-2 border-t border-gray-100"
                    >
                      <span className="text-sm text-gray-700">{row.label}</span>
                      <span className="text-sm font-700 text-primary text-right">{row.reward}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                    <p className="text-xs text-amber-700">
                      ⚡ Rewards are credited to your wallet instantly when the referred user's first order (min ₦10,000) is completed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}