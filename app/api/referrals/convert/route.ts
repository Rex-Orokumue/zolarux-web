import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getReferralReward, MIN_ORDER_AMOUNT } from '@/lib/referral'

/**
 * POST /api/referrals/convert
 *
 * Called internally when a buyer's first order reaches 'completed' status.
 * Checks eligibility, sets reward, updates wallet, flips referral to 'converted'.
 *
 * Body: { order_id, buyer_id, order_amount }
 *
 * This route is internal — called from your order status update logic,
 * NOT exposed as a public endpoint. Protect it with a service-role key
 * or by checking that the request comes from your own server.
 */
export async function POST(req: NextRequest) {
  try {
    const { order_id, buyer_id, order_amount } = await req.json()

    if (!order_id || !buyer_id || typeof order_amount !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use service-role client so we can update wallets freely
    const supabase = createAdminClient()

    // 1. Check minimum order amount
    if (order_amount < MIN_ORDER_AMOUNT) {
      return NextResponse.json(
        { skipped: true, reason: `Order amount ₦${order_amount} below minimum ₦${MIN_ORDER_AMOUNT}` },
        { status: 200 }
      )
    }

    // 2. Find a pending referral for this buyer
    const { data: referral, error: refErr } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', buyer_id)
      .eq('status', 'pending')
      .maybeSingle()

    if (refErr || !referral) {
      return NextResponse.json({ skipped: true, reason: 'No pending referral found' }, { status: 200 })
    }

    // 3. Check if the buyer already has a PREVIOUS completed order
    //    (this should only trigger on the FIRST completed order)
    const { count: completedCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', buyer_id)
      .eq('status', 'completed')

    // If more than 1 completed order exists, this isn't the first
    if ((completedCount ?? 0) > 1) {
      return NextResponse.json(
        { skipped: true, reason: 'Not the first completed order' },
        { status: 200 }
      )
    }

    // 4. Determine referred_type — did the referred user become a vendor or stay a buyer?
    //    Check vendors table first (they may have applied after signing up as buyer)
    const { data: vendorProfile } = await supabase
      .from('vendors')
      .select('vendor_id, wallet_balance')
      .eq('auth_user_id', buyer_id)
      .maybeSingle()

    const referredType: 'vendor' | 'buyer' = vendorProfile ? 'vendor' : 'buyer'

    // 5. Calculate reward
    const rewardAmount = getReferralReward(
      referral.referrer_type as 'vendor' | 'buyer',
      referredType
    )

    // 6. Credit the referrer's wallet
    //    Find referrer's current wallet balance
    let referrerWallet = 0
    let referrerTable  = ''
    let referrerIdCol  = ''
    let referrerIdVal  = referral.referrer_id

    if (referral.referrer_type === 'vendor') {
      const { data: v } = await supabase
        .from('vendors')
        .select('wallet_balance')
        .eq('vendor_id', referral.referrer_id)
        .single()
      referrerWallet = v?.wallet_balance ?? 0
      referrerTable  = 'vendors'
      referrerIdCol  = 'vendor_id'
    } else {
      const { data: b } = await supabase
        .from('buyers')
        .select('wallet_balance')
        .eq('id', referral.referrer_id)
        .single()
      referrerWallet = b?.wallet_balance ?? 0
      referrerTable  = 'buyers'
      referrerIdCol  = 'id'
    }

    // 7. Run all updates atomically (best-effort — Supabase doesn't have client-side transactions)
    const [walletUpdate, referralUpdate] = await Promise.all([
      supabase
        .from(referrerTable)
        .update({ wallet_balance: referrerWallet + rewardAmount })
        .eq(referrerIdCol, referrerIdVal),

      supabase
        .from('referrals')
        .update({
          status:        'converted',
          reward_amount: rewardAmount,
          referred_type: referredType,
          first_order_id: order_id,
          converted_at:  new Date().toISOString(),
        })
        .eq('id', referral.id),
    ])

    if (walletUpdate.error || referralUpdate.error) {
      console.error('Conversion errors:', walletUpdate.error, referralUpdate.error)
      return NextResponse.json({ error: 'Conversion failed' }, { status: 500 })
    }

    return NextResponse.json({
      success:       true,
      referral_id:   referral.id,
      referrer_id:   referral.referrer_id,
      referrer_type: referral.referrer_type,
      referred_type: referredType,
      reward_amount: rewardAmount,
    })

  } catch (err) {
    console.error('Referral convert error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}