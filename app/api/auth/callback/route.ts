import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReferralCode } from '@/lib/referral'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/buyer'
  const ref = searchParams.get('ref')

  // Prevent open redirect attacks — only allow relative paths
  const safeNext = (next.startsWith('/') && !next.startsWith('//'))
    ? next
    : '/buyer'

  const supabase = await createClient()

  if (code) {
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && session?.user) {
      const adminSupabase = createAdminClient()

      // 1. Ensure the buyer has a profile row in 'buyers' table (self-healing on OAuth sign-in)
      const { data: profile } = await adminSupabase
        .from('buyers')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!profile) {
        const newUserReferralCode = generateReferralCode()

        await adminSupabase.from('buyers').insert({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'Buyer',
          referral_code: newUserReferralCode,
          wallet_balance: 0,
          created_at: new Date().toISOString()
        })
      }

      // 2. Handle referral logic if referred via a code
      if (ref) {
        // Validate the code
        const { data: referrerVendor } = await adminSupabase
          .from('vendors')
          .select('vendor_id')
          .eq('referral_code', ref)
          .maybeSingle()

        let referrerId = referrerVendor?.vendor_id
        let referrerType = referrerId ? 'vendor' : null

        if (!referrerId) {
          const { data: referrerBuyer } = await adminSupabase
            .from('buyers')
            .select('id')
            .eq('referral_code', ref)
            .maybeSingle()
          referrerId = referrerBuyer?.id
          referrerType = referrerId ? 'buyer' : null
        }

        if (referrerId && referrerType) {
          // Check if a referral entry already exists
          const { data: existing } = await adminSupabase
            .from('referrals')
            .select('id')
            .eq('referred_user_id', session.user.id)
            .maybeSingle()

          if (!existing) {
            await adminSupabase.from('referrals').insert({
              referrer_id: referrerId,
              referrer_type: referrerType,
              referred_email: session.user.email || '',
              referred_user_id: session.user.id,
              referred_type: 'buyer',
              status: 'pending',
              reward_amount: 0,
              created_at: new Date().toISOString()
            })
          }
        }
      }

      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}