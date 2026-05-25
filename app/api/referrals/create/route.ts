import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { referrer_id, referrer_type, referred_email, referred_user_id } = await req.json()

    if (!referrer_id || !referrer_type || !referred_email || !referred_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id,
        referrer_type,
        referred_email: referred_email.trim().toLowerCase(),
        referred_user_id,
        referred_type: 'buyer',
        status: 'pending',
        reward_amount: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Referral creation db error:', error)
      return NextResponse.json({ error: 'Failed to create referral record' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error('Referral creation endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
