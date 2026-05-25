import { createClient } from '@/lib/supabase/client'

// ─── Code generation ──────────────────────────────────────────────────────────

/**
 * Generates a unique 8-character alphanumeric referral code.
 * Format: ZLX + 5 random chars, e.g. ZLXK3T9A
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0/I/1 to avoid confusion
  let code = 'ZLX'
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * Ensures a vendor or buyer has a referral code.
 * If they don't have one yet, generates one and saves it.
 * Returns the code.
 */
export async function ensureReferralCode(
  userId: string,
  userType: 'vendor' | 'buyer'
): Promise<string | null> {
  const supabase = createClient()
  const table = userType === 'vendor' ? 'vendors' : 'buyers'
  const idCol  = userType === 'vendor' ? 'auth_user_id' : 'id'

  // 1. Check if they already have one (use maybeSingle so it doesn't throw if not found)
  const { data } = await supabase
    .from(table)
    .select('referral_code')
    .eq(idCol, userId)
    .maybeSingle()

  if (data?.referral_code) return data.referral_code

  const rowExists = !!data

  // Fetch auth user details if we need to insert a missing buyer profile row
  let email = ''
  let fullName = ''
  if (!rowExists && userType === 'buyer') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        email = user.email || ''
        fullName = user.user_metadata?.full_name || ''
      }
    } catch (e) {
      console.error('Failed to get auth user details:', e)
    }
  }

  // 2. Generate a unique one (retry on collision)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode()

    // Check uniqueness across BOTH tables
    const [{ data: v }, { data: b }] = await Promise.all([
      supabase.from('vendors').select('referral_code').eq('referral_code', code).maybeSingle(),
      supabase.from('buyers').select('referral_code').eq('referral_code', code).maybeSingle(),
    ])

    if (v || b) continue // collision — try again

    let error
    if (rowExists) {
      const res = await supabase
        .from(table)
        .update({ referral_code: code })
        .eq(idCol, userId)
      error = res.error
    } else if (userType === 'buyer') {
      const res = await supabase
        .from('buyers')
        .insert({
          id: userId,
          email: email,
          full_name: fullName,
          referral_code: code,
          wallet_balance: 0,
          created_at: new Date().toISOString()
        })
      error = res.error
    } else {
      // Vendor record doesn't exist; cannot auto-create vendors
      return null
    }

    if (!error) return code
  }

  return null
}

// ─── Reward lookup ────────────────────────────────────────────────────────────

/**
 * Returns the reward in naira for a referral pair.
 * Minimum order: ₦10,000 — checked at conversion time, not here.
 */
export function getReferralReward(
  referrerType: 'vendor' | 'buyer',
  referredType:  'vendor' | 'buyer'
): number {
  // Buyers bring the money — rewarded more
  if (referredType === 'buyer')  return 2000  // anyone referring a buyer earns ₦2,000
  if (referredType === 'vendor') return 500   // anyone referring a vendor earns ₦500
  return 0
}

// ─── Referral link helpers ────────────────────────────────────────────────────

export const MIN_ORDER_AMOUNT = 10000 // ₦10,000
export const MIN_WITHDRAWAL_AMOUNT = 5000 // ₦5,000

export function buildReferralLink(code: string): string {
  return `https://zolarux.com.ng/ref/${code}`
}

// ─── Referral stats (for dashboard widgets) ──────────────────────────────────

export interface ReferralStats {
  code:         string | null
  totalReferrals: number
  pending:      number
  converted:    number
  totalEarned:  number
  walletBalance: number
}

export async function fetchReferralStats(
  userId: string,
  userType: 'vendor' | 'buyer'
): Promise<ReferralStats> {
  const supabase   = createClient()
  const table      = userType === 'vendor' ? 'vendors' : 'buyers'
  const idCol      = userType === 'vendor' ? 'auth_user_id' : 'id'
  const referrerId = userType === 'vendor' ? 'vendor_id' : 'id'

  // Get referral_code, wallet_balance, and the actual id used in referrals table
  const { data: profile } = await supabase
    .from(table)
    .select(`referral_code, wallet_balance, ${referrerId}`)
    .eq(idCol, userId)
    .single()

  if (!profile) {
    return { code: null, totalReferrals: 0, pending: 0, converted: 0, totalEarned: 0, walletBalance: 0 }
  }

  const actualId = userType === 'vendor'
    ? (profile as any).vendor_id
    : (profile as any).id

  const { data: referrals } = await supabase
    .from('referrals')
    .select('status, reward_amount')
    .eq('referrer_id', actualId)

  const all       = referrals || []
  const pending   = all.filter(r => r.status === 'pending').length
  const converted = all.filter(r => r.status === 'converted').length
  const totalEarned = all
    .filter(r => r.status === 'converted')
    .reduce((sum, r) => sum + (r.reward_amount ?? 0), 0)

  return {
    code:           profile.referral_code ?? null,
    totalReferrals: all.length,
    pending,
    converted,
    totalEarned,
    walletBalance:  profile.wallet_balance ?? 0,
  }
}