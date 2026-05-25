import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { id, full_name, email, referral_code } = await req.json()

    if (!id || !email || !referral_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('buyers')
      .upsert({
        id,
        full_name: full_name || null,
        email: email.trim().toLowerCase(),
        referral_code,
        wallet_balance: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Buyer profile creation db error:', error)
      return NextResponse.json({ error: 'Failed to create buyer profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error('Buyer profile creation endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
