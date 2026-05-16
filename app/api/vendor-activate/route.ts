import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const normalizedEmail = email.trim().toLowerCase()

    // Look up vendor application by email
    const { data: application, error: appError } = await supabase
      .from('vendor_applications')
      .select('reference, business_name, status')
      .eq('email', normalizedEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: 'No vendor application found with this email. Make sure you use the same email you applied with.' },
        { status: 404 }
      )
    }

    // Check the vendors table using the reference
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('vendor_id, business_name, status')
      .eq('vendor_id', application.reference)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor record not found. Please contact support on WhatsApp.' },
        { status: 404 }
      )
    }

    if (vendor.status === 'pending') {
      return NextResponse.json(
        { error: 'Your application is still under review. We will notify you on WhatsApp once approved.' },
        { status: 403 }
      )
    }

    if (vendor.status === 'rejected') {
      return NextResponse.json(
        { error: 'Your vendor application was not approved. Contact us on WhatsApp for more information.' },
        { status: 403 }
      )
    }

    if (vendor.status !== 'Verified' && vendor.status !== 'verified') {
      return NextResponse.json(
        { error: `Account status is "${vendor.status}". Contact support on WhatsApp.` },
        { status: 403 }
      )
    }

    // Send OTP via Supabase Auth REST API using service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const otpResponse = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ email: normalizedEmail }),
    })

    if (!otpResponse.ok) {
      const errText = await otpResponse.text()
      console.error('Supabase OTP error:', otpResponse.status, errText)
      return NextResponse.json(
        { error: `Failed to send activation code. Please try again in a moment.` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      business_name: vendor.business_name,
      vendor_id: vendor.vendor_id,
    })

  } catch (error: any) {
    console.error('Vendor activation error:', error?.message || error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
