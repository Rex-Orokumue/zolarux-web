import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')?.trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const [{ data: vendor }, { data: buyer }] = await Promise.all([
      supabase.from('vendors').select('vendor_id').eq('referral_code', code).maybeSingle(),
      supabase.from('buyers').select('id').eq('referral_code', code).maybeSingle(),
    ])

    return NextResponse.json({
      valid: !!(vendor || buyer),
      referrer_type: vendor ? 'vendor' : buyer ? 'buyer' : null,
      referrer_id: vendor?.vendor_id ?? buyer?.id ?? null
    })

  } catch (err) {
    console.error('Referral validation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
